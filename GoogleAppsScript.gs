/** 90th Anniversary Souvenirs — Google Sheets backend.
 * 1. Create a Google Sheet, Extensions > Apps Script, paste this code.
 * 2. Set SHEET_ID and RECEIPTS_FOLDER_ID below.
 * 3. Deploy > New deployment > Web app > Execute as Me > Anyone.
 * 4. Copy the /exec URL into script.js as GOOGLE_SCRIPT_URL.
 */
const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const RECEIPTS_FOLDER_ID = 'PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE';
const PRIMARY_EMAIL = 'alm.lucio01@gmail.com';
const CC_EMAIL = 'gjennelann@gmail.com';
const SHEET_NAME = 'Orders';
const HEADERS = ['Submitted At','Order Date (PH)','Order Time (PH)','Order ID','Customer Name','Category','Zone / Phase','Products / Variants','Total Quantity','Total Amount (PHP)','Payment Method','Receipt Link','Order Status'];
const CYC_ZONES = Array.from({length:10},(_,i)=>'ZONE '+(i+1)).concat(['PHASE 7-1','PHASE 7-2','PHASE 7-3']);
const KKK_ZONES = ['ZONE 1-A','ZONE 1-B','ZONE 2-A','ZONE 2-B','ZONE 3-A','ZONE 3-B'];
const PRICES = {
  'Keychain — Keychain':100,'Notebook — Wired (Soft Cover)':400,
  'Notebook — Non-Wire (Hard Cover)':550,'Mug — Mug':200,
  'Ref Magnet — Ref Magnet':150
};
['S','M','L','XL','2XL','3XL'].forEach(size=>PRICES['Polo Shirt — Classic White Polo — '+size]=['2XL','3XL'].includes(size)?400:380);
['M','L','XL','2XL','3XL','4XL','5XL'].forEach(size=>PRICES['Polo Shirt — Ice Silk Polo — '+size]=['2XL','3XL','4XL','5XL'].includes(size)?500:480);

function doPost(e){
  const p=(e&&e.parameter)||{};
  let result={type:'TAON_ORDER_RESULT',requestId:String(p.requestId||''),success:false};
  const lock=LockService.getScriptLock();
  try{
    lock.waitLock(20000);
    const name=String(p.customer||'').trim();
    const category=String(p.category||'');
    const zone=String(p.zone||'');
    const payment=String(p.payment||'');
    if(!name||name.length>100)throw Error('Invalid customer name.');
    if(!(category==='CYC'?CYC_ZONES:category==='KKK'?KKK_ZONES:[]).includes(zone))throw Error('Invalid category or zone.');
    if(!['Cash','Pay via QR'].includes(payment))throw Error('Invalid payment method.');
    const items=JSON.parse(String(p.items||'[]'));
    if(!Array.isArray(items)||!items.length||items.length>40)throw Error('Invalid order items.');
    let quantity=0,total=0;
    const descriptions=[];
    items.forEach(item=>{
      const label=String(item.name||'');
      const qty=Number(item.qty);
      if(!Object.prototype.hasOwnProperty.call(PRICES,label)||!Number.isInteger(qty)||qty<1||qty>999)throw Error('Invalid item or quantity: '+label);
      const price=PRICES[label];quantity+=qty;total+=price*qty;
      descriptions.push(label+' x '+qty+' = PHP '+(price*qty));
    });
    if(quantity!==Number(p.quantity)||total!==Number(p.total))throw Error('Order totals did not match. Please refresh and retry.');
    const sheetFile=SpreadsheetApp.openById(SHEET_ID);
    const sheet=sheetFile.getSheetByName(SHEET_NAME)||sheetFile.insertSheet(SHEET_NAME);
    if(sheet.getLastRow()===0){sheet.appendRow(HEADERS)}else if(sheet.getRange(1,2).getValue()==='Order ID'){
      sheet.insertColumnsBefore(2,2);
      sheet.getRange(1,2,1,2).setValues([['Order Date (PH)','Order Time (PH)']]);
    }
    const requestId=String(p.requestId||'');
    if(!/^\d{10,}-[a-z0-9]{4,20}$/.test(requestId))throw Error('Invalid submission identifier.');
    // Duplicate protection if the customer retries the same submission.
    const ids=sheet.getLastRow()>1?sheet.getRange(2,4,sheet.getLastRow()-1,1).getValues().flat():[];
    if(ids.includes(requestId)){result.success=true;return respond(result)}
    let receiptUrl='';
    if(payment==='Pay via QR'){
      const base64=String(p.receiptData||'');
      const type=String(p.receiptType||'');
      const filename=String(p.receiptName||'receipt').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,90);
      if(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(type)||!base64||base64.length>4.3*1024*1024)throw Error('Valid receipt image (up to 3 MB) required.');
      const bytes=Utilities.base64Decode(base64);
      if(bytes.length>3*1024*1024)throw Error('Receipt is too large.');
      const folder=DriveApp.getFolderById(RECEIPTS_FOLDER_ID);
      const file=folder.createFile(Utilities.newBlob(bytes,type,requestId+'_'+filename));
      receiptUrl=file.getUrl(); // Private by default: accessible to Drive folder owners / permitted collaborators.
    }
    const submittedAt = new Date();
    const orderDatePH = Utilities.formatDate(submittedAt, 'Asia/Manila', 'yyyy-MM-dd');
    const orderTimePH = Utilities.formatDate(submittedAt, 'Asia/Manila', 'HH:mm:ss');
    const orderId='TAON-'+submittedAt.getTime();
    // Prevent spreadsheet formula injection in customer-entered text.
    const clean=value=>"'"+String(value).replace(/[\r\n]+/g,' ').slice(0,5000);
    sheet.appendRow([submittedAt,orderDatePH,orderTimePH,orderId,clean(name),category,zone,clean(descriptions.join(' | ')),quantity,total,payment,receiptUrl,'New']);
    SpreadsheetApp.flush();
    result.success=true;
    // Email is secondary to saving; email failures must not cause duplicate order retries.
    try{
      MailApp.sendEmail({to:PRIMARY_EMAIL,cc:CC_EMAIL,
        subject:'New 90th Anniversary Souvenirs Order — '+orderId,
        body:['New merchandise order', 'Order ID: '+orderId,'Order date (Philippines): '+orderDatePH,'Order time (Philippines): '+orderTimePH,'Name: '+name,'Category: '+category,'Zone: '+zone,
          'Items:',...descriptions,'Total quantity: '+quantity,'Total: PHP '+total,
          'Payment: '+payment,'Receipt: '+(receiptUrl||'Not required (Cash)'),
          'Google Sheet: '+sheetFile.getUrl()].join('\n')});
    }catch(emailErr){console.error('Order saved; email failed: '+emailErr)}
  }catch(err){result.error=String(err.message||err).slice(0,240);console.error(err)}
  finally{try{lock.releaseLock()}catch(_){}}
  return respond(result);
}
function respond(payload){
  // The website submits a regular form to a hidden iframe, avoiding browser CORS restrictions.
  const json=JSON.stringify(payload).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>window.top.postMessage('+json+',"*");<\/script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* SET THIS to the email address that should receive new orders. */
// Paste the deployed Google Apps Script Web App URL below.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4Gx3Cnjl-yMLcQ5KzTTvUIH1veZCd_m-miOMuKq8YWHDUx89_jmGs8MwPR9V4fy_l/exec';
const items = [
 {id:'keychain',name:'Keychain',image:'1.jpg',variants:[['Keychain',100]]},
 {id:'notebook',name:'Notebook',image:'4.jpg',variants:[['Wired (Soft Cover)',400],['Non-Wire (Hard Cover)',550]]},
 {id:'mug',name:'Mug',image:'3.jpg',variants:[['Mug',200]]},
 {id:'polo',name:'Polo Shirt',image:'5.jpg',variants:[['Classic White Polo — XS',380],['Classic White Polo — S',380],['Classic White Polo — M',380],['Classic White Polo — L',380],['Classic White Polo — XL',380],['Classic White Polo — 2XL',400],['Classic White Polo — 3XL',400],['Classic White Polo — 4XL',400],['Classic White Polo — 5XL',400],['Ice Silk Polo — XS',480],['Ice Silk Polo — S',480],['Ice Silk Polo — M',480],['Ice Silk Polo — L',480],['Ice Silk Polo — XL',480],['Ice Silk Polo — 2XL',500],['Ice Silk Polo — 3XL',500],['Ice Silk Polo — 4XL',500],['Ice Silk Polo — 5XL',500]]},
 {id:'magnet',name:'Ref Magnet',image:'2.jpg',variants:[['Ref Magnet',150]]}
];
// Polo image lists Classic S–3XL and Ice Silk M–5XL. Only offer documented sizes.
items.find(x=>x.id==='polo').variants=items.find(x=>x.id==='polo').variants.filter(v=>{const [type,size]=v[0].split(' — ');return type==='Classic White Polo'?['S','M','L','XL','2XL','3XL'].includes(size):['M','L','XL','2XL','3XL','4XL','5XL'].includes(size)});
const peso=n=>'₱'+n.toLocaleString('en-PH');
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('products').innerHTML=items.map(p=>`<article class="product"><img src="assets/${p.image}" alt="${safe(p.name)}"><div class="productbody"><h3>${safe(p.name)}</h3><div class="price">${p.variants.length===1?peso(p.variants[0][1]):'From '+peso(Math.min(...p.variants.map(v=>v[1])))}</div>${p.variants.map((v,i)=>`<div class="variant"><label for="${p.id}-${i}">${safe(v[0])}<small>${peso(v[1])} each</small></label><input class="qty" id="${p.id}-${i}" type="number" inputmode="numeric" min="0" max="999" step="1" value="0" data-id="${p.id}" data-variant="${i}" aria-label="Quantity of ${safe(v[0])}"></div>`).join('')}</div></article>`).join('');
function cart(){const result=[];document.querySelectorAll('.qty').forEach(el=>{const n=Number(el.value);if(Number.isInteger(n)&&n>0&&n<=999){const p=items.find(p=>p.id===el.dataset.id),v=p.variants[Number(el.dataset.variant)];result.push({name:p.name+' — '+v[0],qty:n,price:v[1],subtotal:n*v[1]})}});return result}
function totals(){const c=cart();return {c,count:c.reduce((s,v)=>s+v.qty,0),total:c.reduce((s,v)=>s+v.subtotal,0)}}
function updateCart(){const t=totals();$('cartTotal').textContent=peso(t.total);$('cartCount').textContent=t.count+' items'}
document.querySelectorAll('.qty').forEach(el=>el.addEventListener('input',updateCart));
function go(page){document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id==='page'+page));document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',Number(el.dataset.step)<=page));window.scrollTo({top:0,behavior:'instant'})}
const zoneOptions={CYC:[...Array.from({length:10},(_,i)=>`ZONE ${i+1}`),'PHASE 7-1','PHASE 7-2','PHASE 7-3'],KKK:['ZONE 1-A','ZONE 1-B','ZONE 2-A','ZONE 2-B','ZONE 3-A','ZONE 3-B']};
$('zone').addEventListener('change',()=>{const category=$('zone').value;const options=zoneOptions[category]||[];$('subzone').innerHTML='<option value="">'+(category?'Select your zone / phase':'Select a category first')+'</option>'+options.map(z=>`<option value="${z}">${z}</option>`).join('');$('subzone').disabled=!category;});
$('to2').onclick=()=>{if(!$('customer').value.trim()){alert('Please enter your full name.');$('customer').focus();return}if(!$('zone').value){alert('Please choose CYC or KKK.');$('zone').focus();return}if(!$('subzone').value){alert('Please choose your zone or phase.');$('subzone').focus();return}go(2)};
$('to3').onclick=()=>{const invalid=[...document.querySelectorAll('.qty')].find(el=>el.value!==''&&(!Number.isInteger(Number(el.value))||Number(el.value)<0||Number(el.value)>999));if(invalid){alert('Please enter a whole-number quantity between 0 and 999.');invalid.focus();return}const t=totals();if(!t.count){alert('Please choose at least one item.');return}$('grandTotal').textContent=peso(t.total);$('grandCount').textContent=t.count+' item'+(t.count===1?'':'s');$('summary').innerHTML=t.c.map(v=>`<div class="summaryrow"><span>${safe(v.name)} <small>× ${v.qty}</small></span><b>${peso(v.subtotal)}</b></div>`).join('');go(3)};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(Number(b.dataset.back)));
document.querySelectorAll('[name=payment]').forEach(el=>el.onchange=()=>{$('cashInfo').classList.toggle('hidden',el.value!=='Cash'||!el.checked);$('qrInfo').classList.toggle('hidden',document.querySelector('[name=payment]:checked')?.value!=='Pay via QR');$('receipt').required=document.querySelector('[name=payment]:checked')?.value==='Pay via QR'});
$('receipt').onchange=()=>{$('preview').textContent=$('receipt').files[0]?'Selected: '+$('receipt').files[0].name:''};
const submitButton=$('submitOrder');
let pendingOrderId=null;
let responseTimeout=null;
const resetSubmit=()=>{submitButton.disabled=false;submitButton.textContent='Submit Order ✓';};
window.addEventListener('message',event=>{
  if(!/^https:\/\/(script\.google\.com|script\.googleusercontent\.com|[^/]+\.googleusercontent\.com)$/.test(event.origin))return;
  const msg=event.data;
  if(!msg||msg.type!=='TAON_ORDER_RESULT'||msg.requestId!==pendingOrderId)return;
  clearTimeout(responseTimeout);pendingOrderId=null;
  if(msg.success){location.href='thank-you.html';}
  else{resetSubmit();alert('Order could not be saved: '+(msg.error||'Please try again.'));}
});
submitButton.onclick=async()=>{
 const pay=document.querySelector('[name=payment]:checked')?.value;
 if(!pay){alert('Please choose Cash or Pay via QR.');return}
 const file=$('receipt').files[0];
 if(pay==='Pay via QR'&&!file){alert('Please upload your payment receipt.');$('receipt').focus();return}
 if(file&&(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type)||file.size>3*1024*1024)){alert('Please use a JPG, PNG, WebP, or HEIC receipt smaller than 3 MB.');return}
 if(!GOOGLE_SCRIPT_URL.startsWith('https://script.google.com/macros/s/')){alert('Organizer setup required: paste the Google Apps Script Web App URL into script.js.');return}
 const t=totals();if(!t.count){alert('Your cart is empty.');return}
 submitButton.disabled=true;submitButton.textContent='Submitting…';
 try{
   const requestId=String(Date.now())+'-'+Math.random().toString(36).slice(2);
   let receiptData='',receiptName='',receiptType='';
   if(pay==='Pay via QR'){
     receiptName=file.name;receiptType=file.type;
     receiptData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Could not read receipt.'));reader.readAsDataURL(file)});
   }
   const form=$('delivery');form.action=GOOGLE_SCRIPT_URL;
   const fields={requestId,customer:$('customer').value.trim(),category:$('zone').value,zone:$('subzone').value,items:JSON.stringify(t.c),quantity:String(t.count),total:String(t.total),payment:pay,receiptName,receiptType,receiptData};
   Object.entries(fields).forEach(([key,value])=>{let input=form.elements.namedItem(key);if(!input){input=document.createElement('input');input.type='hidden';input.name=key;form.appendChild(input)}input.value=value});
   pendingOrderId=requestId;
   responseTimeout=setTimeout(()=>{if(pendingOrderId===requestId){pendingOrderId=null;resetSubmit();alert('No confirmation received. Please check with the organizer before submitting again to avoid duplicate orders.')}},45000);
   form.submit();
 }catch(err){pendingOrderId=null;clearTimeout(responseTimeout);resetSubmit();alert(err.message||'Unable to submit. Please try again.')}
};
$('newOrder').onclick=()=>{location.href='index.html'};
updateCart();

# 90th Anniversary Souvenirs — KKK National Project

GitHub Pages website with automatic Google Sheets order tracking, private receipt storage in Google Drive, and email notifications.

## One-time Google setup (required)

1. Sign in to the Google account that will own the order spreadsheet. Create a **blank Google Sheet**, e.g. `90th Anniversary Souvenirs Orders`.
2. Copy its **spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
3. In Google Drive, create a folder called `90th Anniversary Payment Receipts`. Copy the **folder ID** from `https://drive.google.com/drive/folders/FOLDER_ID`.
4. In your new Google Sheet, open **Extensions → Apps Script**. Delete the sample code, paste all contents of `GoogleAppsScript.gs`, and replace `PASTE_GOOGLE_SHEET_ID_HERE` and `PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE` with your IDs. Save.
5. Select **Deploy → New deployment → Select type: Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and approve the requested Google permissions. Copy the Web App URL ending in `/exec`.
6. In the website's `script.js`, replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the deployed URL (keep the quotes). Save.
7. Upload `index.html`, `thank-you.html`, `style.css`, `script.js`, and the entire `assets/` folder to the **root** of your GitHub Pages repository. Do **not** upload `GoogleAppsScript.gs` as website code (it belongs in the Apps Script editor).
8. Submit a small **Cash test order**. Verify a row appears in the `Orders` tab and the emails arrive at `alm.lucio01@gmail.com` and `gjennelann@gmail.com`. Then test QR with a non-sensitive sample receipt. Confirm the file appears in your Drive folder and its link is in the sheet.

## Sheet columns

Submitted At | Order ID | Customer Name | Category | Zone / Phase | Products / Variants | Total Quantity | Total Amount (PHP) | Payment Method | Receipt Link | Order Status

The `Orders` sheet and headers are created automatically on the first successful order. New orders have status `New`, which organizers may update manually.

## Important

- Google Apps Script deployment and Google permissions **must be completed** before real orders can be submitted. This ZIP cannot connect to your Google account by itself.
- The website sends the receipt image to your Apps Script, which saves it in your private Google Drive folder. The spreadsheet contains a Drive link. Give collaborators access to the folder separately if they need to view receipts.
- Only QR payments require a receipt. Maximum file size is **3 MB** to stay within Apps Script request limits. Cash does not require a receipt.
- Google Apps Script and MailApp have usage quotas. The public endpoint may receive unwanted submissions; monitor the sheet and consider a protected backend if volume is high.
- The email is sent **after** saving to Sheets. If email delivery fails, the order still exists in the sheet.
- If you edit `GoogleAppsScript.gs` after deployment, deploy a **new version** via Manage deployments so the live endpoint uses the new code.
- Verify actual payment in your banking app; an uploaded receipt alone does not prove funds arrived.
- The site does not charge cards or automatically confirm payments.

## Order date and time
Each submission now records **Submitted At**, **Order Date (PH)** (YYYY-MM-DD), and **Order Time (PH)** (24-hour HH:mm:ss), using the server time in Asia/Manila. Email notifications include both date and time. For existing Orders sheets, the script adds the two new columns automatically. **Redeploy Apps Script as a new version** (Deploy > Manage deployments > Edit > New version > Deploy) to apply this update; the GitHub website files do not need to change.

# 90th Anniversary Souvenirs — KKK National Project

# 90 TAON Merchandise Ordering Website

A static GitHub Pages website with customer details, product selection, automatic pricing, payment selection, receipt uploads, and thank-you page.

## Setup
1. Primary order email is configured as `alm.lucio01@gmail.com` in `script.js`. CC is configured as `gjennelann@gmail.com` using the FormSubmit `_cc` field in `index.html`.
2. Upload **all files and the `assets` folder** to the root of a GitHub repository. Keep the filenames and folders unchanged.
3. In GitHub, open **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**.
4. Open the Pages URL. Submit a **test order**. FormSubmit may send an activation email to the receiving address; the recipient must activate it before orders are delivered. Test both Cash and Pay via QR, including the attachment, and confirm delivery.
5. GCash, MariBank, and GoTyme QR images are included in `assets/`.

## Important
- GitHub Pages cannot receive or store orders by itself. This version uses FormSubmit (a third-party form-to-email service). Submissions, including receipt images, are sent to that service for email delivery. Check the provider's current attachment and file-size support before launch.
- No order database, payment verification, or inventory tracking is included. A QR receipt upload is **not** proof that a payment cleared; verify payments in your bank or wallet app.
- `thank-you.html` is the success redirect configured with FormSubmit. FormSubmit must accept the submission for redirect to occur.
- The supplied images include GCash, MariBank and GoTyme QR codes.
- Polo sizes follow the image's published size charts: Classic S–3XL and Ice Silk M–5XL. Classic 2XL+ ₱400; Ice Silk 2XL+ ₱500.
- `ORDER_EMAIL` is visible in the public website source. Use a dedicated order inbox if preferred.

## Zone selection
Step 1 requires a category (CYC or KKK) and then a zone/phase within that category. Both are included in the submitted order email.

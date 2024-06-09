import puppeteer from 'puppeteer';
import cloudinaryPackage from "cloudinary";

export async function convertToPDF(htmlContent, outputFile) {

    let htmlPage = '';

    htmlPage += `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>HTML invoice</title>
        
                <style>
                    .invoice-box {
                        max-width: 800px;
                        margin: auto;
                        padding: 30px;
                        border: 1px solid #eee;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                        font-size: 16px;
                        line-height: 24px;
                        font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                        color: #555;
                    }
        
                    .invoice-box table {
                        width: 100%;
                        line-height: inherit;
                        text-align: left;
                    }
        
                    .invoice-box table td {
                        padding: 5px;
                        vertical-align: top;
                    }
        
                    .invoice-box table tr td:nth-child(2) {
                        text-align: right;
                    }
        
                    .invoice-box table tr.top table td {
                        padding-bottom: 20px;
                    }
        
                    .invoice-box table tr.top table td.title {
                        font-size: 45px;
                        line-height: 45px;
                        color: #333;
                    }
        
                    .invoice-box table tr.information table td {
                        padding-bottom: 40px;
                    }
        
                    .invoice-box table tr.heading td {
                        background: #eee;
                        border-bottom: 1px solid #ddd;
                        font-weight: bold;
                    }
        
                    .invoice-box table tr.details td {
                        padding-bottom: 20px;
                    }
        
                    .invoice-box table tr.item td {
                        border-bottom: 1px solid #eee;
                    }
        
                    .invoice-box table tr.item.last td {
                        border-bottom: none;
                    }
        
                    .invoice-box table tr.total td:nth-child(2) {
                        border-top: 2px solid #eee;
                        font-weight: bold;
                    }
        
                    @media only screen and (max-width: 600px) {
                        .invoice-box table tr.top table td {
                            width: 100%;
                            display: block;
                            text-align: center;
                        }
        
                        .invoice-box table tr.information table td {
                            width: 100%;
                            display: block;
                            text-align: center;
                        }
                    }
        
                    /** RTL **/
                    .invoice-box.rtl {
                        direction: rtl;
                        font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                    }
        
                    .invoice-box.rtl table {
                        text-align: right;
                    }
        
                    .invoice-box.rtl table tr td:nth-child(2) {
                        text-align: left;
                    }
                </style>
            </head>
        
            <body>
                <div class="invoice-box rtl">
                    <table cellpadding="0" cellspacing="0">
                        <tr class="top">
                            <td colspan="2">
                                <table>
                                    <tr>
                                        <td class="title">
                                            <img
                                                src="https://res.cloudinary.com/dj9bn0knz/image/upload/v1717666526/wotwmfaepfmzu2wshiw4.png"
                                                style="width: 30%; max-width: 300px"
                                            />
                                        </td>
        
                                        <td>
                                            رقم الطلب: ${htmlContent.orderId}<br />
                                            تاريخ الشراء: ${htmlContent.CreatedBy}<br />
                                            تاريخ التوصيل: ${htmlContent.Due}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
        
                        <tr class="information">
                            <td colspan="2">
                                <table>
                                    <tr>
                                        <td>
                                            ${htmlContent.Address.Area}<br />
                                            Block ${htmlContent.Address.Block}, Street ${htmlContent.Address.Street}, House Number ${htmlContent.Address.HouseNumber}<br />
                                            ${htmlContent.Address.Governate}
                                        </td>
        
                                        <td>
                                            ${htmlContent.Vendor}<br />
                                            ${htmlContent.Name}<br />
                                            ${htmlContent.Phone}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
        
        
                        <tr class="heading">
                            <td>المنتج</td>
        
                            <td>السعر</td>
                        </tr>
        `;
    htmlContent.Products.map((row) => {
        htmlPage += `
            <tr class="item">
            <td>${row.name}</td>

         <td>${row.price} د.ك.</td>
        </tr>
        `;
    });
    htmlPage += `
     <tr class="total">
					    <td>التوصيل: 3 د.ك.</td>
				    	<td>المجموع:${htmlContent.Total} د.ك.</td>
				    </tr>
			    </table>
		    </div>
	    </body>
    </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlPage);

    const pdf = await page.pdf({ path: outputFile, format: 'A4' });

    await browser.close();

    return pdf;
}


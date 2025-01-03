/** @format */

import { Request } from "express";
import moment from "moment";
import fs from "fs";
import PDFDocument from 'pdfkit'

//Import Services
// import structureService from "@/resources/structure/services";
// import orderService from "@/resources/order/service"
// import salesUserService from "@/resources/salesUser/service"
// import companyService from "@/resources/company/service"
// import companyUserService from "@/resources/companyUser/services"
import awsService from "@/utils/gobalServices/aws.service"
import AWSSESService from "@/utils/gobalServices/sesAws"
import billingModel from "@/resources/Billing/model"

class pdfService {
  //   private doc = new PDFDocument();
  // private structureService = new structureService();
  // private orderService = new orderService();
  // private salesUserService = new salesUserService();
  // private companyService = new companyService();
  // private companyUserService = new companyUserService();
  private awsService = new awsService();
  private AWSSES = new AWSSESService();
  private billingModel = billingModel;

  createinvoice = (
    billingId: string | any,
    invoiceNo: string | any,
    branchId: string | any,
    userId: string | any,
    fullName: string | any,
    phoneNo: string | any,
    emailId: string | any,
    companyName: String | any,
    branchName: String | any,
    centreName: String | any,
    branchAddress: String | any,
    memberAddress: String | any,
    gstNo: String | any,
    link: String | any,
    note: String | any,
    date: string | any | any,
    cgst: string | any,
    sgst: string | any,
    igst: string | any,
    gstTotal: string | any,
    key: String | any,
    discount: string | any,
    amount: string | any, // actual amount
    discountAmt: string | any, // final discounted amount
    taxAmt: string | any, // tax amount
    total: string | any,
    finalAmount: string | any,
    shippingCharges: string | any,
    pendingAmount: string | any,
    writeOffAmount: string | any,
    writeOffDate: string | any,
    dueDate: string | any,
    paymentId: String | any,
    paymentStatus: string | any | any,
    invoiceStatus: string | any,
    logo: String | any,
    gstChargedOn: String | any,
    gstStatus: String | any,
    createDate: string | any,
    updatedAt: string | any,
    createdBy: String | any,
    updatedBy: String | any,
    createdByName: String | any,
    updatedByName: String | any,
    comment: String | any,
    manualRecpritNumber: String | any,
    billType: String | any,
    memberGSTNo: String | any,
    lastPaymentId: String | any,
    lastPaymentcomment: String | any,
    assignedTo: String | any,
    assignedToName: String | any,
    autoRenewal: string | any,
    isLatest: string | any,
    resale: string | any,
    itemList: any
  ) => {
    console.log("create bill service");

    return new Promise(async (resolve, reject) => {
      console.log("showTermsCondition---111");
      try {
        let logoData;
        try {
          // logoData = await convertImg(logo);
        } catch (error) {
          console.log(
            "error converting logo -------- invoice will be created without logo",
          );
        }
        console.log("billingId", billingId);

        let pendingStepCount = 2;
        // const userPdfloc = "./public/Invoice/";
        // mkdirp(userPdfloc).catch(err => {if (err) console.error("error creating directory. " + err)  });
        const pdfFile = "./public/Invoice/" + billingId + ".pdf";
        const fileName = billingId + ".pdf";
        const stepFinished = async () => {
          if (--pendingStepCount == 0) {
            console.log("pdfFile", pdfFile);
            console.log("--------in createinvoice---------");
            let imageStorage: any;
            // this.awsService
            //   .uploadPdfToAWS("Invoice", pdfFile ,fileName)
            //   .then((storedData) => {
            //     imageStorage = storedData;
            //     return this.billingModel.findOneAndUpdate(
            //       { billingId: billingId },
            //       { $set: { link: storedData } },
            //       { new: true },
            //     );
            //   })
            //   .then(() => {
            //     resolve(imageStorage);
            //   });
           const emailSend = await this.AWSSES.sendMail(emailId,"","","","Invoice","",true,billingId);
           console.log("emailSend",emailSend);
           
            resolve(billingId)
            // fs.readFile(pdfFile, (err, result) => {
            //   console.log("result", result);

            // })
          }
        };
        console.log("+++++++++++", pdfFile);

        let doc = new PDFDocument({ layout: "landscape" });
        const writeStream = fs.createWriteStream(pdfFile);
        writeStream.on("close", stepFinished);
        doc.pipe(writeStream);

        /** ------------Top Section------------ */
        doc.fontSize(24);
        doc.text("Tax Invoice Cum Receipt", 20, 20); // header
        try {
          if (logoData) doc.image(logoData, 50, 48, { width: 60, height: 60 });
          else {
            doc.fontSize(12);
            doc.font("Times-Roman");
            doc.text(companyName, 50, 48); // Gym name in large font if logo is not available
          }
        } catch (error) {
          console.error("error----------", error);
        }

        // Memebr details
        doc.fontSize(10);
        doc.text("Billed To", 50, 115);
        doc.font("Times-Roman");
        doc.text(fullName, 50);
        doc.text(emailId, 50);
        // if (gstNo) {
        //   doc.text(
        //     "Buyer GST No.: " + gstNo.toString().toUpperCase(),
        //     50,
        //   );
        // }
        if (manualRecpritNumber) {
          doc.text(
            "Manual Recprit No.: " +
            manualRecpritNumber.toString().toUpperCase(),
            50,
          );
        }
        doc.text(memberAddress, { width: 400, align: 'left' });
        if (memberAddress)
          doc.text(memberAddress.substring(0, 300), {
            width: 400,
            align: "left",
          });

        //gym details
        doc.text(companyName, 500, 50); // gym name
        if (phoneNo) doc.text(phoneNo, 500, 60);
        if (branchAddress) doc.text(branchAddress.substring(0, 120), 500, 70);
        if (emailId) doc.text(emailId, 500, 110);
        if (gstNo)
          doc.text("GST No.: " + gstNo.toString().toUpperCase(), 500, 120);
        else doc.text("GST No.: NA", 500, 120);
        doc.text("Invoice No.: " + invoiceNo, 500, 130);
        doc.text(
          "Invoice Date: " +
          moment(createDate).add(5.5, "hours").format("DD MMM YYYY"),
          500,
          140,
        );
        // doc.text("Created By: " + createdByName, 500, 150);
        /** ------------Top Section End------------ */

        /** ------------Item Section------------ */
        doc.lineWidth(0.5);
        doc
          .lineCap("butt")
          .moveTo(50, 175)
          .lineTo(doc.page.width - 50, 175)
          .stroke(); // horizontal line 1
        doc.font("Helvetica-Bold");
        doc.text("Product Name", 100, 180);
        doc.text("Shipping Charges", 250, 180);
        doc.text("Product Price", 345, 180);
        doc.text("Product QTY", 440, 180);
        doc.text("Discount", 530, 180);
        doc.text("TAX Amount", 590, 180);
        // doc.text("Taxable Amount", 620, 180);
        doc.text("Net Amount", 670, 180, { lineBreak: false });

        doc
          .lineCap("butt")
          .moveTo(50, 195)
          .lineTo(doc.page.width - 50, 195)
          .stroke(); // horizontal line 2
        let y = 200; // y axix update

        let totalAmount = itemList.reduce((acc: any, item: any) => acc + item.actualProductPrice, 0);
        let totalQty = itemList.reduce((acc: any, item: any) => acc + item.orderQty, 0)
        let totalDiscount = itemList.reduce((acc: any, item: any) => acc + item.discount, 0)
        let totalTax = itemList.reduce((acc: any, item: any) => acc + item.gstTotal, 0)

        function calOrderPrice(singleProduct: any): number {
          let price = (singleProduct.orderPrice - singleProduct.discount);
          return price;

        }

        // loop itemList 
        itemList.forEach((singleItem: any, i: any) => {
          y += i == 0 ? 0 : 15;
          doc.font("Times-Roman");
          doc.text(singleItem.productName, 60, y);
          y += 10;
          if (
            singleItem.startDate &&
            singleItem.startDate != "--" &&
            singleItem.endDate &&
            singleItem.endDate != "--"
          ) {
            doc.text(
              " ( Valid From - " +
              moment(singleItem.startDate)
                .add(5.5, "hours")
                .format("DD MMM YYYY") +
              " : Valid To - " +
              moment(singleItem.endDate)
                .add(5.5, "hours")
                .format("DD MMM YYYY") +
              ") ",
              60,
              y,
            );
          } else if (singleItem.startDate) {
            doc.text(
              " ( Valid From - " +
              moment(singleItem.startDate)
                .add(5.5, "hours")
                .format("DD MMM YYYY") +
              ") ",
              60,
              y,
            );
          }

          // doc.text(singleItem.productName, 100, y);
          doc.text(Number(singleItem.actualProductPrice).toFixed(2), 375, y);
          doc.text(Number(singleItem.orderQty).toFixed(2), 465, y);
          doc.text(Number(singleItem.discount).toFixed(2), 545, y);
          doc.text(Number(singleItem.gstTotal).toFixed(2), 600, y);
          doc.text(Number(calOrderPrice(singleItem)).toFixed(2), 680, y, {
            lineBreak: false,
          });
        });
        y -= 5; // y axix update

        doc
          .lineCap("butt")
          .moveTo(50, y + 30)
          .lineTo(doc.page.width - 50, y + 30)
          .stroke(); // horizontal line 3
        doc
          .lineCap("butt")
          .moveTo(50, y + 50)
          .lineTo(doc.page.width - 50, y + 50)
          .stroke(); // horizontal line 4
        doc
          .lineCap("butt")
          .moveTo(50, y + 75)
          .lineTo(doc.page.width - 50, y + 75)
          .stroke(); // horizontal line 5

        doc.font("Helvetica-Bold");
        doc.text(Number(shippingCharges).toFixed(2), 280, y + 35);
        doc.text(Number(totalAmount).toFixed(2), 375, y + 35);
        doc.text(Number(totalQty).toFixed(2), 465, y + 35);
        doc.text(Number(totalDiscount).toFixed(2), 545, y + 35);
        doc.text(Number(totalTax).toFixed(2), 600, y + 35);
        doc.text(Number(finalAmount).toFixed(2), 680, y + 35, { lineBreak: false });

        // doc.text("Amount in words : " + moneyInwords, 60, y + 57);
        if (gstStatus === "true") {
          doc.fontSize(8);
          doc.text(`CGST@${igst}% - ` + Number(cgst).toFixed(2), 550, y + 57);
          doc.text(`SGST@${igst}% - ` + Number(sgst).toFixed(2), 640, y + 57);
        }
        /** ------------Item Section End------------ */

        /** ------------Payment and terms Section------------ */
        // doc.font("Helvetica-Bold");
        // doc.text("Receipt No.", 90, y + 80);
        // doc.text("Payment Date", 200, y + 80);
        // doc.text("Payment Mode", 290, y + 80);
        // doc.text("Cheque/ Card/ Wallet", 390, y + 80);
        // doc.text("Bank Name", 530, y + 80);
        // doc.text("Paid Amount", 660, y + 80, { lineBreak: false });

        // doc.font("Times-Roman");
        let comment;
        y += 95; // y axix update
        // receiptList.forEach((singleItem: any, i: any) => {
        //   if (singleItem.comment) comment = singleItem.comment;
        //   y += i == 0 ? 0 : 14;
        //   doc.text(singleItem.paymentId.toString().toUpperCase(), 60, y);
        //   doc.text(
        //     moment(singleItem.transactionDate)
        //       .add(5.5, "hours")
        //       .format("DD MMM YYYY"),
        //     210,
        //     y,
        //   );
        //   doc.text(singleItem.paymentMode, 295, y);
        //   if (singleItem.cardName) doc.text(singleItem.cardName, 410, y);
        //   else if (singleItem.chequeNo) doc.text(singleItem.chequeNo, 410, y);
        //   else if (singleItem.walletName)
        //     doc.text(singleItem.walletName, 410, y);
        //   else doc.text(" - ", 430, y);
        //   if (singleItem.bankName) {
        //     if (singleItem.bankName.length > 30)
        //       doc.text(singleItem.bankName.substring(0, 30), 520, y);
        //     else doc.text(singleItem.bankName, 530, y);
        //   } else doc.text(" -- ", 560, y);
        //   doc.text(Number(singleItem.paidAmount).toFixed(2), 680, y, {
        //     lineBreak: false,
        //     align: "right",
        //   });
        // });
        // doc
        //   .lineCap("butt")
        //   .moveTo(50, y + 15)
        //   .lineTo(doc.page.width - 50, y + 15)
        //   .stroke(); // horizontal line 6

        // doc.font("Helvetica-Bold");
        if (pendingAmount) {
          y += 20;
          //   doc.text("Balance Due : " + pendingAmountInwords, 50, y);
          doc.text("Balance Due : " + Number(pendingAmount).toFixed(2), 610, y);
          if (dueDate) {
            doc.text(
              "Next Due Date : " +
              moment(dueDate).add(330, "minutes").format("DD MMM YYYY"),
              50,
            );
            y += 25;
          }
        } else y += 25;
        if (comment) {
          doc.text("Comment : " + comment, 50, y);
          y += 15;
        }
        // if (showTermsCondition && termsConditions) {
        //   y += 15;
        //   doc.font("Times-Roman");
        //   doc.text("Terms & Conditions", 50, y);
        //   doc.text(termsConditions, { width: 670, align: "left" });
        // }
        /** ------------Payment and terms Section End------------ */

        /** ------------Footer------------ */
        doc.fill('#808080');
        doc.font("Helvetica");
        doc
          .lineCap("butt")
          .dash(5, { space: 1 })
          .moveTo(50, doc.page.height - 40)
          .lineTo(150, doc.page.height - 40)
          .stroke();
        doc.text(`Customer Signature`, 55, doc.page.height - 35, {
          lineBreak: false,
        });
        doc
          .lineCap("butt")
          .dash(5, { space: 1 })
          .moveTo(200, doc.page.height - 40)
          .lineTo(300, doc.page.height - 40)
          .stroke();
        doc.text(`Authorized Signature`, 200, doc.page.height - 35, {
          lineBreak: false,
        });
        console.log("pdfFile-------------", pdfFile);

        try {
          //   if (showFytrackLogoOnInvoice != false) {
          //     doc.image("././logo.png", 620, doc.page.height - 60, {
          //       width: 70,
          //       height: 40,
          //     });
          //     doc.text(
          //       `Powered by Fytrack | www.fytrack.com`,
          //       580,
          //       doc.page.height - 35,
          //       { lineBreak: false },
          //     );
          //   }
        } catch (error) {
          console.error("error--", error);
        }
        /** ------------Footer End------------ */

        doc.end();
        stepFinished();
      } catch (error) {
        console.log("error----------", error);
        reject(error);
      }
    });
  };
}

export default pdfService;

// Import necessary modules and services
import billModel from "./model";
import { invoiceNoModel } from "./model";
import userModel from "../companyUser/model";
import iBill from "../../resources/Billing/interface";
import pdfService from "../../utils/gobalServices/pdf";
import awsService from "../../utils/gobalServices/aws.service";
import AWSSES from "@/utils/gobalServices/sesAws";

/**
 * Service class for handling billing operations.
 */
class BillingService {
  private billingModel = billModel;
  private invoiceNoModel = invoiceNoModel;
  private userModel = userModel;
  private pdfService = new pdfService();
  private awsService = new awsService();
  private ses = new AWSSES();

  /**
   * Create a new bill in the database.
   * @param body - The bill details to be created.
   * @returns The newly created bill.
   */
  public async create(body: iBill | any): Promise<iBill> {
    try {
      const invoiceNo = await this.invoiceNoModel.findOne({ name: "invoice" });
      let lastInvoiceNo = invoiceNo?.lastInvoiceNo
      if (!lastInvoiceNo) {
        lastInvoiceNo = `INV-${0}`
      } else {
        let newNo = parseInt(lastInvoiceNo.split('-')[1])
        newNo += 1;
        lastInvoiceNo = `INV-${newNo}`
      }
      body.invoiceNo = lastInvoiceNo;
      console.log("lastInvoiceNo", lastInvoiceNo);

      await this.invoiceNoModel.findOneAndUpdate({ name: 'invoice' }, { lastInvoiceNo: lastInvoiceNo }, { upsert: true, new: true });
      const bill = await this.billingModel.create(body);
      return bill;
    } catch (error: any) {
      console.error("Error creating bill:", error);
      throw new Error("Failed to create bill");
    }
  }

  public async findOneBill(orderId: any): Promise<iBill | any> {
    try {
      return await this.billingModel.findOne({ orderId: orderId });
    } catch (error: any) {
      console.error("Error findOneBill bill:", error);
      throw new Error("Failed to find Bill ");
    }
  }

  /**
   * Fetch billing data and count based on aggregation queries.
   * @param query - The aggregation query to fetch billing data.
   * @param countQuery - The aggregation query to count the total records.
   * @param month - The month for filtering bills (optional).
   * @param year - The year for filtering bills (optional).
   * @returns An Promise object containing billing data and the total count of records.
   */
  public async tableQuery(
    query: any[],
    countQuery: any[],
    month?: number,
    year?: number
  ): Promise<object> {
    try {
      const queryData = await this.billingModel.aggregate(query);
      const queryCount = await this.billingModel.aggregate(countQuery);
      let count = 0;

      // Check if count query results contain a valid count
      if (queryCount[0] && queryCount[0].count) {
        count = queryCount[0].count;
      }

      return { queryData, count };
    } catch (error: any) {
      console.error("Error fetching billing data:", error);
      throw new Error("Failed to fetch billing data");
    }
  }


  public async billCreation(id: string) {
    try {
      console.log("id",id);
      
      const bill: any = await this.billingModel.findOne({ orderId: id }).populate('orderId')
      
        await this.pdfService.createinvoice(
        bill.billingId,
        bill.invoiceNo,
        bill.branchId,
        bill.userId,
        bill.fullName,
        bill.phoneNo,
        bill.emailId,
        bill.companyName,
        bill.branchName,
        bill.centreName,
        bill.branchAddress,
        bill.memberAddress,
        bill.gstNo,
        bill.link,
        bill.note,
        bill.date,
        bill.cgst,
        bill.sgst,
        bill.igst,
        bill.gstTotal,
        bill.key,
        bill.discount,
        bill.amount,
        bill.discountAmt,
        bill.taxAmt,
        bill.total,
        bill.finalAmount,
        bill.shippingCharges,
        bill.pendingAmount,
        bill.writeOffAmount,
        bill.writeOffDate,
        bill.dueDate,
        bill.paymentId,
        bill.paymentStatus,
        bill.invoiceStatus,
        bill.logo,
        bill.gstChargedOn,
        bill.gstStatus,
        bill.createDate,
        bill.updatedAt,
        bill.createdBy,
        bill.updatedBy,
        bill.createdByName,
        bill.updatedByName,
        bill.comment,
        bill.manualRecpritNumber,
        bill.billType,
        bill.memberGSTNo,
        bill.lastPaymentId,
        bill.lastPaymentcomment,
        bill.assignedTo,
        bill.assignedToName,
        bill.autoRenewal,
        bill.isLatest,
        bill.resale,
        bill.orderId.itemList,
      )
return await this.ses.sendMail(bill.emailId,'','','','bill','',true,bill.invoiceNo)
      
      
    } catch (error) {
      console.log("bill", error);

    }
  }
}

export default BillingService;

import HttpException from "./http.exception";
import { randomBytes } from "crypto";

export const validateParams = (
  params: { [key: string]: any },
  requiredKeys: string[] = []
) => {
  if (!params) {
    throw new HttpException(400, `${requiredKeys.join(", ")} is required`);
  }
  for (const key of requiredKeys) {
    if (!params[key]) {
      throw new HttpException(400, `${key} is required`);
    }
  }
  return true;
};

export const errorResponse = (res: any, error: any) => {
  const errorPayload: any = {
    error: error.message || "Something went wrong",
  };
  if (error.data) {
    errorPayload.data = error.data;
  }
  res.status(error.status || 500).json(errorPayload);
};

export const getWeekDates = (weekNumber: any, year: any) => {
  const firstDayOfYear = new Date(year, 0, 1);  // January 1st of the given year
  const dayOfWeek = firstDayOfYear.getDay();    // Get the day of the week (0 - Sunday, 6 - Saturday)

  // Calculate the start of the desired week
  const dayOffset = (weekNumber - 1) * 7;       // Offset for the number of weeks
  const firstDayOfWeek = new Date(firstDayOfYear.getTime() + (dayOffset * 24 * 60 * 60 * 1000));

  // Adjust if the first day of the year is not Monday (Optional, if you want the week to start on Monday)
  const weekStartDay = firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1; // Adjust for Monday
  const weekStart = new Date(firstDayOfWeek.setDate(weekStartDay));

  // Calculate the end of the week (7 days later)
  const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));   // Add 6 days to get the week end

  return {
    start: weekStart.toISOString().slice(0, 10), // Return date in YYYY-MM-DD format
    end: weekEnd.toISOString().slice(0, 10)
  };
}

export const getMonthDate = (monthNum: any, year: any) => {
  // Calculate the year and month from the monthNum
  // const targetYear = year + Math.floor((monthNum - 1) / 12);
  // const targetMonth = (monthNum - 1) % 12; // JavaScript month index starts from 0

  // // Get the first day of the month
  // const monthStartDate = new Date(targetYear, targetMonth, 1);

  // // Get the last day of the month
  // const monthEndDate = new Date(targetYear, targetMonth + 1, 0); // 0th day of next month gives last day of current month

  // // Return the start and end dates in ISO format
  // return {
  //   start: monthStartDate.toISOString().split('T')[0],
  //   end: monthEndDate.toISOString().split('T')[0]
  // };
  const targetYear = year + Math.floor((monthNum - 1) / 12);
  const targetMonth = (monthNum - 1) % 12;

  // Get the date for the first day of the target month
  const monthStartDate = new Date(targetYear, targetMonth, 1);

  // Extract the year and month in "YYYY-MM" format
  const yearMonth = monthStartDate.toISOString().slice(0, 7);

  return yearMonth;
}

export const createOrderAndBillInfo = (
  orderStatus: any,
  status: any,
  cgst: any,
  sgst: any,
  igst: any,
  gstTotal: any,
  billingAddress: any,
  shippingAddress: any,
  actualAmount: any,
  shippingCharges: any,
  discountAmount: any,
  discount: any,
  orderedBy: any,
  courier_company_id: any,
  fullName: any,
  phoneNo: any,
  total: any,
  totalProductsPrice: any,
  emailId: any,
  company: any,
  createdBy: any,
  createdByName: any,
  udata: any,
  itemList: any,
  orderId?: any
) => {
  try {
    let createObj: any = {
      fullName: udata?.name,
      phoneNo: udata?.phoneNo,
      emailId: udata?.emailId,
      consumer: udata?.id,
      itemList: itemList,
      orderId: orderId
    };
    // createObj.reportingTo = udata?.reportingTo?._id;
    createObj.orderNo = randomBytes(20).toString("hex").substring(20); //non-serial id with max length of 20;
    if (billingAddress) createObj.billingAddress = billingAddress;
    if (shippingAddress) createObj.shippingAddress = shippingAddress;
    if (status) createObj.status = status;
    if (itemList) createObj.itemList = itemList;
    if (courier_company_id) createObj.courier_company_id = courier_company_id;
    if (actualAmount) createObj.actualAmount = actualAmount;
    if (shippingCharges) createObj.shippingCharges = shippingCharges;
    if (total) createObj.total = total;
    if (totalProductsPrice) createObj.totalProductsPrice = totalProductsPrice;
    if (discountAmount) {
      createObj.discountAmount = discountAmount;
    } else {
      createObj.discountAmount = 0;
    }
    if (discount) {
      createObj.discount = discount;
    } else {
      createObj.discount = 0;
    }
    createObj.orderedBy = udata?._id;
    createObj.orderedByName = udata?.name;


    // const getTotal = (totalType: string) => {
    //   let newTotal = itemList.reduce((acc: any, item: any) => {
    //     return (acc = Number(acc + item[totalType]));
    //   }, 0);
    //   return newTotal;
    // };



    // const taxCal = (gstType: string) => {
    //   const totalTax = itemList.reduce((acc: any, item: any) => {
    //     return (acc = Number(acc + item[gstType]));
    //   }, 0);
    //   return totalTax;
    // };
    // if (!udata?.gstNumber) throw Error("invalid gst number");

    for (let i = 0; i < itemList.length; i++) {
      let gstPer: any = 0;
      let productCouponDiscount: any = itemList[i]?.coupon
        ? itemList[i]?.coupon?.discount
        : 0;

      let id: any = itemList[i]?.productId;
      // gstPer = await this.productService.fetchSingleProduct(id);

      // console.log("gstRateInPercentage", gstPer);

      // if (udata.gstNumber.slice(0, 2) === "27")
      //   createObj.itemList[i].cgst =
      //     (Number(
      //       Number(itemList[i].actualProductPrice) *
      //         Number(itemList[i].orderQty) -
      //         Number(productCouponDiscount)
      //     ) *
      //       (Number(gstPer.gstRateInPercentage) / 2)) /
      //     100;
      // if (udata.gstNumber.slice(0, 2) === "27")
      //   createObj.itemList[i].sgst =
      //     (Number(
      //       Number(itemList[i].actualProductPrice) *
      //         Number(itemList[i].orderQty) -
      //         Number(productCouponDiscount)
      //     ) *
      //       (Number(gstPer.gstRateInPercentage) / 2)) /
      //     100;
      // if (udata.gstNumber.slice(0, 2) !== "27")
      //   createObj.itemList[i].igst =
      //     (Number(
      //       Number(itemList[i].actualProductPrice) *
      //         Number(itemList[i].orderQty) -
      //         Number(productCouponDiscount)
      //     ) *
      //       Number(gstPer.gstRateInPercentage)) /
      //     100;

      // if (createObj.itemList[i].igst) {
      //   createObj.itemList[i].gstTotal =
      //     Number(createObj.itemList[i].cgst) +
      //     Number(createObj.itemList[i].sgst) +
      //     Number(createObj.itemList[i].igst);
      // }
      // if (createObj.itemList[i].cgst || createObj.itemList[i].sgst) {
      //   createObj.itemList[i].gstTotal =
      //     Number(createObj.itemList[i].cgst) +
      //     Number(createObj.itemList[i].sgst);
      // }

      createObj.taxPercentage = `${gstPer?.gstRateInPercentage} %`;
    }

    // if (udata.gstNumber.slice(0, 2) === "27") createObj.cgst = taxCal("cgst");
    // if (udata.gstNumber.slice(0, 2) === "27") createObj.sgst = taxCal("sgst");
    // if (udata.gstNumber.slice(0, 2) !== "27") createObj.igst = taxCal("igst");

    // createObj.gstTotal = taxCal("gstTotal");
    // createObj.taxAmt = createObj.gstTotal;

    // createObj.discountAmt = itemList.reduce((acc: any, item: any) => {
    //   let productCouponDiscount = item?.coupon ? item?.coupon?.discount : 0;
    //   return (acc = acc + productCouponDiscount);
    // }, 0);

    // createObj.total = itemList.reduce((acc: any, item: any) => {
    //   let productCouponDiscount = item?.coupon ? item?.coupon?.discount : 0;
    //   return (acc =
    //     acc + (item.orderPrice - productCouponDiscount + item.gstTotal));
    // }, 0);


    createObj.cgst = itemList?.reduce((acc: any, item: any) => {
      return acc = + item?.cgst
    }, 0)


    createObj.sgst = itemList?.reduce((acc: any, item: any) => {
      return acc = + item?.sgst
    }, 0)

    createObj.igst = itemList?.reduce((acc: any, item: any) => {
      return acc = + item?.igst
    }, 0)

    createObj.gstTotal = itemList?.reduce((acc: any, item: any) => {
      return acc = + item?.gstTotal
    }, 0)


    createObj.actualAmount = + createObj?.total
    createObj.finalAmount = createObj.total + createObj?.gstTotal + createObj?.shippingCharges;
    createObj.paidAmount = createObj.finalAmount
    return createObj
  } catch (error) {
    console.log("createOrderAndBillInfo error", error);

  }
}

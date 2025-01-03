// import orderService from "../resources/order/service"

// class orderTest {

//     private orderService = new orderService();

//     constructor() {
//         this.initialiseTest();
//     }

//     private initialiseTest(): void {
//         this.regitation();
//         this.delete();
//         this.findAllOrder();
//         this.fetchSingleOrder();
//         this.update();
//     }
//     // create order
//     public regitation(): void {
//         try {
//             let body = {
            
//                     "orderQuantity" : "10",
//                     "discountAmount" : "50",
//                     "discount" : "50",
//                     "orderStatus" : "pending",
//                     "invoice" : "101",
//                     "createdBy" : "nilay",
//                     "updatedBy" : "nilay",
//                     "status" : "approval",
//                     "itemList" : [{
//                         "custmaizedImage" : "a",
//                         "actualProductPrice" : "100",
//                         "orderQty" : "1",
//                         "orderPrice" : "100",
//                         "discount" : "10",
//                         "gstChargedOn" : "0",
//                         "taxPercentage" : "0",
//                         "productCatogry" : "mobiles"
//                     }]

//             }
//             this.orderService.create(body).then(data => {
//                 console.log("orderService.create test success");
//             })
//         } catch (error) {
//             console.error(error)
//         }
        
//     }
//     // update order by _id
//     public async update() {
//         try {
//             let id = "63994f371ed544ede2c35258"
//             let body = {   "orderQuantity" : "10",
//             "discountAmount" : "50",
//             "discount" : "50",
//             "orderStatus" : "pending",
//             "invoice" : "101",
//             "createdBy" : "nilay",
//             "updatedBy" : "nilay",
//             "status" : "approval",
//             "itemList" : [{
//                 "custmaizedImage" : "a",
//                 "actualProductPrice" : "100",
//                 "orderQty" : "1",
//                 "orderPrice" : "100",
//                 "discount" : "10",
//                 "gstChargedOn" : "0",
//                 "taxPercentage" : "0",
//                 "productCatogry" : "mobiles"
//             }] }
//             const user =  this.orderService.update(id,body)
//             return user;
//         } catch (error) {
//             console.error(error);
//             throw new Error("Unable to update order");
//         }
//     }
//     // fetch all orders
//     public async findAllOrder(){
//         try {
//             // companyId to be add
//             const orders =  this.orderService.fetchAllOrder();
//             return orders;
//         } catch (error) {
//             throw new Error("Unable to fetch orders");
//         }
//     }
//     // fetch one order by _id
//     public async fetchSingleOrder(){
//         try {
//             let id = "63994f371ed544ede2c35258"
//             const orders =  this.orderService.fetchSingleOrder(id)
//             return orders;
//         } catch (error) {
//             console.log(error);
//             throw new Error("Unable to fetch orders");
//         }
//     }
//     // delete one order by _id
//     public async delete(){
//         try {
//             let id = "63994f371ed544ede2c35258"
//             const orders =  this.orderService.delete( id )
//             return orders;
//         } catch (error) {
//             console.log(error);
//             throw new Error("Unable to fetch orders");
//         }
//     }
// }


// export default orderTest;




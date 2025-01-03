import productsService from "../resources/product/services"

class productTest {

    private productsService = new productsService();

    constructor() {
        this.initialiseTest();
    }

    private initialiseTest(): void {
        // this.regitation()
        // this.update()
        // this.delete()
        // this.fetchSingleOrder()
        // this.findAllOrder()
    }
    // // create product
    // public regitation(): void {
    //     try {
    //         let body = {
    //             "productName" : "k984",
    //             "productCatogery" : "tv",
    //             "productInfo" : "xyzxyzxyzxyzxyzxz",
    //             "productSize" : "10",
    //             "productMainImage" : "xzy.com",
    //             "productImages" : ["xzy","xyz"],
    //             "quantity" : 25,
    //             "buyPrice" : 250,
    //             "sellPrice" : 290,
    //             "updatedAt" : "",
    //             "createdBy" : "harshal",
    //             "updatedBy" : "harshal"
    //         }
    //         this.productsService.createProduct(body).then(data => {
    //             console.log("productsService.create test success");
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }

    // }
    // update product by _id
    // public async update() {
    //     try {
    //         let id = "639c5a41faa9e6b3106ff717"
    //         let body = {
    //             "productName" : "k984",
    //             "productCatogery" : "tv",
    //             "productInfo" : "xyzxyzxyzxyzxyzxz",
    //             "productSize" : "10",
    //             "productMainImage" : "xzy.com",
    //             "productImages" : ["xzy","xyz"],
    //             "quantity" : 25,
    //             "buyPrice" : 250,
    //             "sellPrice" : 290,
    //             "updatedAt" : "",
    //             "createdBy" : "harshal",
    //             "updatedBy" : "harshal"
    //         }
    //         const user =  this.productsService.updateProduct(id,body)
    //         return user;
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error("Unable to update order");
    //     }
    // }
    // fetch all products
    // public async findAllOrder(){
    //     try {
    //         // companyId to be add
    //         const orders =  this.productsService.fetchAllProducts();
    //         return orders;
    //     } catch (error) {
    //         throw new Error("Unable to fetch orders");
    //     }
    // }
    // //fetch one product by _id
    // public async fetchSingleOrder(){
    //     try {
    //         let id = "639c5a41faa9e6b3106ff717"
    //         const orders =  this.productsService.fetchSingleProduct(id)
    //         return orders;
    //     } catch (error) {
    //         console.log(error);
    //         throw new Error("Unable to fetch orders");
    //     }
    // }
    // // delete product by _id
    // public async delete(){
    //     try {
    //         let id = "639c5a41faa9e6b3106ff717"
    //         const orders =  this.productsService.deleteProduct( id )
    //         return orders;
    //     } catch (error) {
    //         console.log(error);
    //         throw new Error("Unable to fetch orders");
    //     }
    // }

}


export default productTest;




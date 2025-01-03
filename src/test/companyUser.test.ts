import companyUserService from "../resources/companyUser/services"

class companyUser {

    private companyUserService = new companyUserService();

    constructor() {
        this.initialiseTest();
    }

    private initialiseTest(): void {
        // this.regitation();
        // this.update();
        this.fetch();
        // this.fetchAll();
    }
    // fetch all users
    // public fetchAll(): void {
    //     try {
            
    //         this.companyUserService.fetchAllUser().then(data => {
    //             console.log("companyUserService.fetch All  test success");
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }
        
    // }
    // fetch all users
    public fetch(): void {
        try {
            let userId = "63994e4d8d809067c10afc88"
            
            this.companyUserService.fetchSingleUser(userId).then(data => {
                console.log("companyUserService.fetchOne  test success");
            })
        } catch (error) {
            console.error(error)
        }

    }
    //update user by _id
    // public update(): void {
    //     try {
    //         let userId = "63994e4d8d809067c10afc88"
    //         let body = {
    //             "firstName": "xyz",
    //             "lastName": "1234657890",
    //             "emailId": "nilay@gmail.com",
    //             "phoneNo": "9876543210",
    //             "profilePic": "www.abd.com",
    //             "password": "123456",
    //             "role": "staff",
    //             "reportingToRole" : "xzy",
    //             "lastLogIn" : "asd",
    //             "lastUpdatedBy" : "asda",
    //             "createBy":"asd" ,
    //             "reportingTo" : ""
    //         }
    //         this.companyUserService.update(userId,body).then(data => {
    //             console.log("companyUserService.update test success");
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }

    // }
    // create user 
    // public regitation(): void {
    //     try {
    //         let body = {
    //             "firstName": "xyz",
    //             "lastName": "1234567890",
    //             "emailId": "nilay@gmail.com",
    //             "phoneNo": "9876543210",
    //             "profilePic": "www.abd.com",
    //             "password": "123456",
    //             "role": "staff",
    //             "reportingToRole" : "xzy",
    //             "lastLogIn" : "asd",
    //             "lastUpdatedBy" : "asda",
    //             "createBy":"asd" ,
    //             "reportingTo" : ""
    //         }
    //         this.companyUserService.register(body).then(data => {
    //             console.log("companyUserService.create test success");
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }

    // }
}


export default companyUser;





import companyService from "../resources/company/service"
import iCompany from "@/resources/company/interface"

class companyTest {
    private companyService = new companyService();
    public id = "";
    constructor() {
        this.initialiseTest();
    }
    private initialiseTest(): void {
        this.regitation();
        this.update();
        this.fetch();
        this.fetchOne();
        this.delete();
    }


// create company
    public regitation(): void {
        try {
            let body = {
                "name": "ayz",
                "phoneNo": "4251145231",
                "website": "www.abd.com",
                "defaultAddress": {
                    "address": "115 runawal plutuim",
                    "locality": "bavdhan",
                    "state": "Maharashtra",
                    "pincode": "440021"
                },
                "cgst": "9",
                "sgst": "9",
                "igst": "18",
                "taxPercentage": "18",
                "gstNumber": "SDKFSJKASN11202092903301",
                "roles": [
                    "staff",
                    "support"
                ]
            }
            // console.log(body);

            // this.companyService.create(body).then(data => {
            //     this.id = data._id
            //     console.log("companyService.create test success");
            //     return data
            // })
        } catch (error) {
            console.error(error)
        }

    }
    // fetch all companys
    public fetch(): void {
        try {
            this.companyService.findAllCompany().then(data => {
                console.log("companyService find all test success", data);
                // console.log(data);F
                // this.id =
            })
        } catch (error) {
            console.error(error)
        }

    }
    // fetch one company by _id
    public fetchOne(): void {
        try {
            
            this.companyService.findSingleCompany("63a17c15817d781d692f1371").then(data => {
                console.log(data);
                console.log("companyService findOne test success");
                // console.log(data);

            })
        } catch (error) {
            console.error(error)
        }

    }
    //delete one company by _id
    public delete(): void {
        try {
            let companyId = "63a17c15817d781d692f1371"

            this.companyService.deleteCompany(companyId).then(data => {
                console.log("companyService.delete test success");
                // console.log(data);
            })
        } catch (error) {
            console.error(error)
        }

    }
    //update company by _id
    public update(): void {
        try {
            let body = {
                "name": "abc",
                "phoneNo": "1234467890",
                "emailId": "nilay@gmail.com",
                "website": "www.abd.com",
                "companyAddress": {
                    "address": "115 runawal plutuim",
                    "locality": "bavdhan",
                    "state": "Maharashtra",
                    "pincode": "440021"
                },
                "taxPercentage": "18",
                "gstNumber": "SDKFSJKASN11202092903301",
                "panNumber": "SDKFSJ1111",
                "roles": [
                    "staff",
                    "support"
                ]
            }
            this.companyService.updateCompany("63a17c15817d781d692f1371", body).then(data => {
                console.log("companyService.update test success");
                // console.log(data);

            })
        } catch (error) {
            console.error(error)
        }

    }
}


export default companyTest;




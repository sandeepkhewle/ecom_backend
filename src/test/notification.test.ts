import notificationServices from "../resources/notification/services"

class notificationTest {

    private notificationServices = new notificationServices();

    constructor() {
        this.initialiseTest();
    }

    private initialiseTest(): void {
        this.regitation()
    }
    // create notification
    public regitation(): void {
        try {
            let body = {
                "notification" : "notification1",
                "notificationType" : "notification Type",
            }
            this.notificationServices.create(body).then(data => {
                console.log("notificationServices.create test success");
            })
        } catch (error) {
            console.error(error)
        }

    }

    // fetch all notification
    public fetchAll(): void {
        try {
            
            this.notificationServices.fetchAllhNotification().then(data => {
                console.log("notificationServices.fetch All  test success");
            })
        } catch (error) {
            console.error(error)
        }

    }
    // delete one notification by _id
    public delete(): void {
        try {
            let notificationId = "639f195a1164efdf8495d40a"
            
            this.notificationServices.deleteNotification(notificationId).then(data => {
                console.log("notificationServices.delete  test success");
            })
        } catch (error) {
            console.error(error)
        }

    }
    // fetch one notifiction by _id
    public fetch(): void {
        try {
            let notificationId = "639f195a1164efdf8495d40a"
            
            this.notificationServices.fetchSingleNotification(notificationId).then(data => {
                console.log("notificationServices.fetchOne  test success");
            })
        } catch (error) {
            console.error(error)
        }

    }
    // update notification by _id
    public update(): void {
        try {
            let notificationId = "639f195a1164efdf8495d40a"
            let body = {
                "notification" : "notification2",
                "notificationType" : "notification Type",
            }
            this.notificationServices.updateNotification(notificationId,body).then(data => {
                console.log("notificationServices.update test success");
            })
        } catch (error) {
            console.error(error)
        }

    }
}


export default notificationTest;




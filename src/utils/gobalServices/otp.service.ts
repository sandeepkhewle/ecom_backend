import AWSSES from "./sesAws";
import companyUserService from "@/resources/companyUser/services";
import salesUserService from "@/resources/salesUser/service";
import ConsumerService from "@/resources/consumer/services";

class otpService {
  private AWSSES = new AWSSES();
  // private companyUserService = new companyUserService();
  // private salesUserService = new salesUserService();
  // private consumerService = new ConsumerService();

  public async sendOtp(emailId: string) {
    try {
      const otp = this.generateOtp();
      const message = `Your One Time Password(OTP) is ${otp}`;
      const newEmailId = emailId;
      let userData;
      userData = await new ConsumerService().findByEmailAndUpdate(newEmailId, {
        otp,
        otpTime: new Date(),
      });

      if (!userData) {
        throw new Error("User not found");
        // userData = await new salesUserService().findByEmailAndUpdate(
        //   newEmailId,
        //   { otp, otpTime: new Date() }
        // );
      }

      if (userData.emailId) {
        await this.AWSSES.sendMail(
          userData.emailId,
          "",
          message,
          "",
          "OTP Verification",
          "",
          false
        );
        // await this.mailjetService.mailer(
        //   userData.emailId,
        //   "Otp",
        //   "",
        //   message,
        //   "",
        //   []
        // );
        return {
          status: 200,
          message: "OTP sent successfully",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  private generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  public async verifyOtp(emailId: string, otp: string, role: string, id: any) {
    try {
      const timeNow = new Date();
      const before10min = new Date(
        timeNow.setMinutes(timeNow.getMinutes() - 10)
      );
      if (!emailId) {
        throw new Error("Please enter a Email Id.");
      }

      let userData;
      switch (role) {
        case "admin":
          userData = await new companyUserService().findByEmailAndUpdate(
            emailId,
            { otpVerified: true }
          );
          break;
        case "consumer":
          userData = await new ConsumerService().findByEmailAndUpdate(emailId, {
            otpVerified: true,
          });
          break;
        case "sales-user":
          userData = await new salesUserService().findByEmailAndUpdate(
            emailId,
            {
              otpVerified: true,
            }
          );
          break;
        case "Trainer":
          userData = await new companyUserService().findByEmailAndUpdate(
            emailId,
            { otpVerified: true }
          );
          break;
        default:
          throw new Error("Invalid role");
      }

      if (userData) {
        if (userData.otp === otp && userData.otpTime >= before10min) {
          return {
            isValid: true,
            message: "OTP verified successfully",
            emailId: emailId,
            id: userData._id,
          };
        } else if (userData.otp !== otp) {
          throw new Error(
            "Wrong OTP, Please enter valid OTP or click resend OTP to receive new OTP."
          );
        } else {
          throw new Error(
            "Your OTP has been timeout, please click resend OTP to get new OTP."
          );
        }
      } else {
        throw new Error("Phone Number Doesn't Exist");
      }
    } catch (error) {
      throw error;
    }
  }
}

export default otpService;

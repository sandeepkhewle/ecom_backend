import consumerModel from "./model";
import iConsumer from "./interface";
import salesUserModel from "../salesUser/model";
import token from "../../utils/token";
import HttpException from "../../utils/http.exception";
import bcrypt from "bcrypt";
import { validateParams } from "@/utils/helpers";
import otpService from "@/utils/gobalServices/otp.service";

class ConsumerService {
  private consumerModel = consumerModel;
  private salesUserModel = salesUserModel;
  private otpService = new otpService();

  /**
   * Register a new consumer.
   * @param body - The consumer registration details.
   * @returns The created consumer.
   */
  public async register(body: any): Promise<any> {
    const {
      emailId,
      phoneNo,
      password,
      address,
      district,
      taluka,
      state,
      pincode,
    } = body;

    // Check if the user already exists by email or phone number.
    const userExists = await this.consumerModel.findOne({
      $or: [{ emailId }, { phoneNo }],
    });
    if (userExists) {
      throw new HttpException(501, "Email or phone number already exists");
    }

    // Hash the password and create the new user.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      ...body,
      password: hashedPassword,
      address: [{ address, district, taluka, state, pincode }],
    };

    return this.consumerModel.create(newUser);
  }

  /**
   * Update a consumer's details.
   * @param id - The ID of the consumer to update.
   * @param body - The updated consumer details.
   * @returns The updated consumer.
   */
  public async update(id: string, body: iConsumer): Promise<iConsumer | null> {
    const user = await this.consumerModel.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    return this.consumerModel.findByIdAndUpdate(id, body, { new: true });
  }

  /**
   * Update a consumer's password.
   * @param id - The ID of the consumer.
   * @param body - The updated password details.
   * @returns The updated consumer.
   */
  public async updatePassword(
    id: string,
    body: iConsumer
  ): Promise<iConsumer | null> {
    body.password = await bcrypt.hash(body.password, 10);
    return consumerModel.findByIdAndUpdate(id, body, { new: true });
  }

  /**
   * Find a consumer by email and update their details.
   * @param emailId - The email ID of the consumer.
   * @param body - The updated consumer details.
   * @returns The updated consumer.
   */
  public async findByEmailAndUpdate(
    emailId: string,
    body: iConsumer | any
  ): Promise<iConsumer | any> {
    try {
      console.log("emailId", emailId);
      const filter = { emailId: emailId };
      // not getting user
      const user = await this.consumerModel.findOneAndUpdate(
        filter,
        { ...body },
        { new: true }
      );
      if (!user) {
        console.log("No user found with emailId", emailId);
        // You can also try finding the user without updating to see if they exist
        const existingUser = await this.consumerModel.findOne({
          emailId: emailId,
        });
        console.log("Existing user:", existingUser);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /*
   * login with otp
   * @param data - The login details.
   * @returns The login response with token.
   */
  public async loginWithOtp(data: any): Promise<object | Error> {
    try {
      const user = await this.consumerModel.findOne({ emailId: data.emailId });
      if (!user)
        throw new HttpException(
          401,
          "Unable to find user with that email address"
        );
      const optvalid: any = await this.otpService.verifyOtp(
        data.emailId,
        data.otp,
        "consumer",
        user._id
      );
      if (optvalid && optvalid?.isValid === true) {
        console.log("Password match");

        const newToken = token.createToken(user, "1y");
        return {
          consumer_id: user._id,
          emailId: user.emailId,
          fullName: user.name || `${user.firstName} ${user.lastName}`,
          token: newToken,
        };
      } else throw new HttpException(401, "Wrong credentials");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch all consumers.
   * @returns An array of all consumers.
   */
  public async fetchAllUsers(): Promise<iConsumer[]> {
    return this.consumerModel.find();
  }

  /**
   * Fetch a single consumer by ID.
   * @param id - The ID of the consumer.
   * @returns The consumer details.
   */
  public async fetchSingleUser(id: string): Promise<iConsumer | null> {
    return this.consumerModel.findById(id);
  }

  /**
   * Execute a table query with aggregation.
   * @param query - The aggregation query.
   * @param countQuery - The count query.
   * @returns The query data and count.
   */
  public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
    const [queryData, queryCount] = await Promise.all([
      this.consumerModel.aggregate(query),
      this.consumerModel.aggregate(countQuery),
    ]);

    return {
      queryData,
      count: queryCount[0]?.count || 0,
    };
  }

  /**
   * Create a guest user.
   * @param data - The guest user details.
   * @returns The created guest user.
   */
  public async createGuestUser(data: any): Promise<iConsumer> {
    validateParams(data, [
      "name",
      "emailId",
      "phoneNo",
      "address",
      // "gstNumber",
    ]);

    const password =
      data.password || Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(password, 10);
    data.password = hashedPassword;
    data.address = [data.address];
    data.defaultAddress = data.address[0];
    data.isVerified = false;

    const query = { emailId: data.emailId };

    return this.consumerModel.findOneOrCreate({ query, data }, async (user) => {
      Object.assign(user, {
        phoneNo: data.phoneNo,
        address: [...user.address, data.address[0]],
        // gstNumber: data.gstNumber,
      });

      await user.save();
      return user;
    });
  }

  /**
   * get user by email.
   * @param emailId - The email ID of the user.
   * @returns The user details.
   */

  public async getUserByEmail(emailId: string): Promise<iConsumer | null> {
    return this.consumerModel.findOne({ emailId });
  }

  /**
   * Login a consumer or sales user.
   * @param data - The login details.
   * @returns The login response with token.
   */
  public async login(data: any): Promise<object | Error> {
    try {
      let user: any = {};
      if (data.pageId === "eHqRW2c9") {
        user = await this.salesUserModel.findOne({ emailId: data.emailId });
      } else {
        user = await this.consumerModel.findOne({ emailId: data.emailId });
      }
      // const user = await this.companyUserModel.findOne({ emailId: data.emailId });
      if (!user)
        throw new HttpException(
          401,
          "Unable to find user with that email address"
        );
      if (await user.isValidPassword(data.password)) {
        console.log("Password match");
        const newToken = token.createToken(user, "24h");
        return {
          consumer_id: user._id,
          salesId: user.salesId,
          company_id: user.company_id,
          emailId: user.emailId,
          fullName: user.name || `${user.firstName} ${user.lastName}`,
          role: user.role,
          access: user.access,
          editAccess: user.editAccess,
          token: newToken,
        };
      } else throw new HttpException(401, "Wrong credentials");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Increment specified counts for a consumer.
   * @param consumer_id - The ID of the consumer.
   * @param incObj - The object containing increment values.
   * @returns The updated consumer.
   */
  public async incrementCounts(
    consumer_id: string,
    incObj: object
  ): Promise<iConsumer | null> {
    return this.consumerModel.findByIdAndUpdate(
      consumer_id,
      { $inc: incObj },
      { new: true }
    );
  }

  /**
   * Find a company admin by company ID and role.
   * @param company_id - The ID of the company.
   * @param role - The role of the admin.
   * @returns The company admin details.
   */
  public async findCompanyAdmin(
    company_id: string,
    role: string
  ): Promise<iConsumer | null> {
    return this.consumerModel
      .findOne({ company_id, role })
      .populate("company_id");
  }
}

export default ConsumerService;

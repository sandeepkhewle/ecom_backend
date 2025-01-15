/** @format */

import { rejects } from "assert";
import * as AWS from "aws-sdk";
import fs from "fs";
import { resolve } from "path";
import deleteFileService from "./deleteFile.service";

// Set the AWS Region.
const REGION = "ap-south-1";
const AWS_SES_secretAccessKey= process.env.S3_ACCESS_KEY || ""
const AWS_SES_accessKeyId= process.env.S3_SECRET_KEY || ""

console.log("AWS_SES_secretAccessKey",AWS_SES_secretAccessKey,AWS_SES_accessKeyId);

AWS.config.update({
  credentials: {
    accessKeyId: AWS_SES_secretAccessKey,
    secretAccessKey: AWS_SES_accessKeyId,
  },
  // s3url: "https://s3.ap-south-1.amazonaws.com/openboxkoncepts",
  region: REGION,
});
let s3 = new AWS.S3({});

class awsService {
  private deleteFileService = new deleteFileService();
  private BUCKET = process.env;

  public uploadPdfToAWS(awsFolder: String, File: any , fileName : string): Promise<String> {
    return new Promise((resolve, reject) => {
      
      if (File) {
        // let fileName = file.originalname;
        fs.readFile(File, (err, file) => {
          if (err) reject(err);
          else {
            const params = {
              Bucket: "4ibiz-ecom", // pass your bucket name
              Key: `/${awsFolder}/${fileName}`, // get filename from file
              Body: file,
            };
            s3.upload(params, (s3Err: Error, dataStored: any) => {
              if (s3Err) reject(s3Err);
              console.log(
                `File uploaded successfully at ${dataStored}`,
              );
              this.deleteFileService.deleteFile(File).then(() => {
                resolve(dataStored.Location);
              });
            });
          }
        });
      } 
    });
  }
  public uploadFileToAWS(awsFolder: String, file: any): Promise<String> {
    return new Promise((resolve, reject) => {
      if (file) {
        let fileName = file.originalname;
        let filePath = `uploads/${fileName}`;
        fs.readFile(filePath, (err, file) => {
          if (err) reject(err);
          else {
            const params = {
              Bucket: "4ibiz-ecom/uploads", // pass your bucket name
              Key: `${fileName}`,
              Body: file,  
            };
            s3.upload(params, (s3Err: Error, dataStored: any) => {
              if (s3Err) {
                console.log("s3Err",s3Err);
                
                reject(s3Err); 
              }
              console.log(
                `File uploaded successfully at ${dataStored.Location}`,
              ); 
              this.deleteFileService.deleteFile(filePath).then(() => {
                resolve(dataStored.Location);
              });
            });
          }
        });
      }
    });
  }
}

export default awsService;

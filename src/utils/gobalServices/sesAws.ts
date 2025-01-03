import  { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import HttpException from '../http.exception';
// AWS SES configuration
const AWS_SES_secretAccessKey= process.env.AWS_SES_secretAccessKey || ""
const AWS_SES_accessKeyId= process.env.AWS_SES_accessKeyId || ""
const sesClient = new SESClient({  
    credentials: {
        accessKeyId: AWS_SES_accessKeyId,
        secretAccessKey: AWS_SES_secretAccessKey
    },
    region: "ap-south-1" }); // Replace with your desired AWS region
    
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
        SES: { ses: sesClient , aws : {SendRawEmailCommand} }
    });
    
    // Email content
 
    class AWSSES {
// Send email
public sendMail = async(toAddress: any, ccAddress: any, text: any, html: any, Subject: any, replyToAddress: any , sendFile : boolean , invoiceNo?:string):Promise<any> =>{
    try {
        // return new Promise((resolve, reject) => {
        console.log("credentials",AWS_SES_accessKeyId,AWS_SES_secretAccessKey);
        
            const mailOptions:any = {
                from: 'noreply@themixxo.com', // Sender address
                to: toAddress, // List of recipients
                subject: Subject,
                text: text,
                html: html
            };
        let attachments :any= []
        if(sendFile){
            attachments.push({
                filename : 'invoice.pdf',
                content: await fs.readFile(`./public/Invoice/${invoiceNo}.pdf`)
            })
            mailOptions['attachments'] = attachments
        }
    
        
        transporter.sendMail(mailOptions, async(error:any, info:any) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              if(sendFile) await fs.unlink(`./public/Invoice/${invoiceNo}.pdf`)
              return (info);
            }
          });
        // })
    } catch (error) {
        throw error
    }
}

}

export default AWSSES
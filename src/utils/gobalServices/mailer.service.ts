import mailjet from 'node-mailjet';

class mailjetService {
    private connectionMailjet = new mailjet({
        apiKey: process.env.MJ_APIKEY_PUBLIC || '68292d37d4af5d937e3ca58aeb83dd71',
        apiSecret: process.env.MJ_APIKEY_PRIVATE || '72b7d56bde97dc1ee06c91e6649c83c2'
    });
    private emailFrom = 'admin@openboxkoncepts.com'

    public mailer(to: string, subject: string, cc: string, text: string, html: string, attachments: Array<any>) {
        try {
            if (attachments && attachments.length > 0) {
                console.log("mail sent to ---- ", to);
                console.log("mail send attachments ---- ", attachments);
                let fileName = attachments[0].fileName;
                // console.log('fileName', fileName);

                let base64String = '"' + attachments[0].base64 + '"';
                const request = this.connectionMailjet.post("send", { 'version': 'v3.1' })
                    .request({
                        "Messages": [
                            {
                                "From": {
                                    "Email": this.emailFrom,
                                    // "Name": "trups" 
                                },
                                "To": [{
                                    "Email": to,
                                    // "Name": ""
                                }],
                                // "Cc": {
                                //     "Email": cc,
                                //     "Name": ""
                                // },
                                // "Bcc": [
                                //     {
                                //         "Email": Bcc,
                                //         "Name": ""
                                //     }
                                // ],
                                "Subject": subject,
                                "TextPart": text,
                                "HTMLPart": html,
                                "InlinedAttachments": [
                                    {
                                        "ContentType": "application/pdf",
                                        "Filename": fileName,
                                        "ContentID": "",
                                        "Base64Content": base64String
                                    }
                                ]
                            }
                        ]
                    })
                request.then((result: any) => {
                    // console.log(result.body)
                    return result.body
                }).catch((err:any) => {
                    console.log(err.statusCode)
                    throw err
                })

            } else {
                console.log('mailjetService----mailer----');

                const request = this.connectionMailjet.post("send", { 'version': 'v3.1' })
                    .request({
                        "Messages": [
                            {
                                "From": {
                                    "Email": this.emailFrom,
                                    "Name": "Fytrack Support"
                                },
                                "To": [{
                                    "Email": to,
                                    // "Name": ""
                                }],
                                // "Cc": [
                                //     {
                                //         "Email": cc,
                                //         "Name": ""
                                //     }
                                // ],
                                "Subject": subject,
                                "TextPart": text,
                                "HTMLPart": html
                            }
                        ]
                    })
                request.then((result:any) => {
                    console.log(result.body)
                    // console.log(result.body)
                    return result.body
                }).catch((err:any) => {
                    console.log(err)
                    // console.log(err.statusCode)
                    throw err
                })
            }
        } catch (error) {
            throw error
        }
    }

}

export default mailjetService;
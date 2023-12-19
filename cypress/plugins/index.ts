import * as nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: (arg0: string, arg1: {
  sendEmail({ from, to, bcc, cc, subject, body, htmlBody }: {
    from: any;
    to: any;
    bcc: any;
    cc: any;
    subject: any;
    body: any;
    htmlBody: any;
  }): Promise<SentMessageInfo>;
}) => void, _config: any) => {
  on("task", {
    sendEmail({from,to,bcc,cc,subject,body,htmlBody}) {
      const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
      });
      return transporter.sendMail({
        from: from,
        to: to,
        bcc: bcc,
        cc: cc,
        subject: subject,
        text: body,
        html: htmlBody,
      });
    }
  })
}

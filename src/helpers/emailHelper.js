import nodemailer from "nodemailer";
// email configuration and send email
const emailProcessor = async (emailBody) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    //  send mail with the defined transport object
    let info = await transporter.sendMail(emailBody);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};

export const verificationEmail = (emailData) => {
  const emailBody = {
    from: '"PK-ECOM 👻" <pradeepdhital124@gmail.com>', // sender address
    to: emailData.email, // list of receivers
    subject: "Email verification", // Subject line
    text: `Hi ${emailData.firstName} please follow the link to verify the email: ${emailData.url}`, // plain text body
    html: `<p> Hi ${emailData.firstName}</p>
    <br/>
    <br/>
    <p>Please follow the link to verify your email</p>
    <br/>
    <br/>
    <p> <a href="${emailData.url}">Verify email</a></p>
    <br/>
    <br/>
    <p> 
    Regards, <br/>
    PK-ECOM
    </p>`, // html body
  };
  emailProcessor(emailBody);
};
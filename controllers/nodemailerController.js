import nodemailer from "nodemailer";

/*
    Sends a verification email to the user.
    @param {Object} props  
*/

/*
const mailController = async (props) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PORT,
      },
    });

    const mailOptions = {
      from: `${process.env.MAIL_NAME} ${process.env.MAIL_ID}`,
      to: props.email,
      subject: props.subject,
      text: props.subject,
      html: props.body,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
    
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export default mailController;
*/

const mailController = async (props) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525, 
      secure: false, 
      auth: {
        user: "93bc0d16871509",
        pass : "9a371cf88fbafc",
      },
    });

    const mailOptions = {
      from: `Testing Name`,
      to: props.email,
      subject: props.subject,
      text: props.subject,
      html: props.body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent : " + info.response);
    return info;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default mailController;

//JUST KEEPING THIS HERE FOR FUTURE "CONFIRM REGISTRATION BY EMAIL" FEATURE
//--> need  to install and configure sendgrind package.

// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export const sendRegistrationEmail = async (body) => {
//   //console.log("recieved body:", body);
//   const msg = {
//     //normally recipient email will come from request.author.email;
//     // ⬇️ ⬇️ ⬇️ this is just for the testing purposes
//     to: `${body.email}`,
//     from: process.env.SENDER_EMAIL,
//     subject: "Potvrďte Váš email",
//     text: body.content,
//     html: `<h3>Hello ${body.name},</h3>
//     <p>finish the registration by clicking the activation link: </p>
//      <strong><a href=${body.link}>Overiť email</a></strong>
//      <p>Have a great day,</p>
//      <p>team -- </p>
//     `,
//   };

//   await sgMail.send(msg);
// };

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendRegistrationEmail = async (body) => {
  //console.log("recieved body:", body);
  const msg = {
    //normally recipient email will come from request.author.email;
    // ⬇️ ⬇️ ⬇️ this is just for the testing purposes
    to: `${body.email}`,
    from: process.env.SENDER_EMAIL,
    subject: "Potvrďte Váš email",
    text: body.content,
    html: `<h3>Dobrý deň ${body.name},</h3>
    <p>dokončite registráciu kliknutím na nasledujúci odkaz: </p>
     <strong><a href=${body.link}>Overiť email</a></strong> 
     <p>Pekný deň praje,</p>
     <p>tím Odkaz štátu</p>
     <div>------------------<strong>English</strong>------------------</div>
     <h3>Hello ${body.name},</h3>
    <p>finish the registration by clicking the activation link: </p>
     <strong><a href=${body.link}>Overiť email</a></strong> 
     <p>Have a great day,</p>
     <p>team Tell the Government</p>
    `,
  };

  await sgMail.send(msg);
};

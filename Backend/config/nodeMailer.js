import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host:"smtp-relay.brevo.com",
    port:"",
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMPT_PASS
    },
});


const sendEmail = async ({to,subject,body}) =>{
    const res = await transporter.sendMail({
        from:process.env.SENDER_EMAIL,
        to,
        subject,
        html: body,      
    })
    return res
}


export default sendEmail
const router = require('express').Router();
const User = require('../../models/User');

const crypto = require('crypto');
const nodemailer = require('nodemailer');






router.post('/resetPassword', (req, res)=>{
  // create token
  crypto.randomBytes(32, (err, buffer)=>{
    if(err) console.log(err);

    // convert hexadecimal buffer into string buffer
    const token = buffer.toString('hex');

    User.findOne({ 'local.email': req.body.email })
    .then(user=>{
      if(!user) return res.status(422).json({ msg: `User does not exist` });

      user.local.resetToken = token;
      user.local.resetTokenExpires = Date.now() + 3600000;

      user.save().then(result=>{
        // send email
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: `ManashSarmaTheEmperor@gmail.com`,
            pass: process.env.GMAIL_PASSWORD
          }
        });

        const mailOptions = {
          to: user.local.email,
          from: 'noreply@gmail.com',

          subject: `Password Reset`,
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process: \n\n
          ${ 'http://' + req.headers.host + '/reset/' + token } \n\n
          If you did not request this, please ignore this email and your password will remain unchanged. \n`
        }


        // sending the mail to the user's email
        smtpTransport.sendMail(mailOptions, (err)=>{
          console.log(`Mail with password reset link is sent`);
          res.json({ msg: `Check your email` })
        })

      })
    })
  })
})








module.exports = router;
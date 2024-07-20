var express = require('express');
var router = express.Router();
const usermodel=require("../models/userdata-model")
const contactmodel=require("../models/contactus-model")
const passport = require('passport')
const passportlocal=require('passport-local')
const nodemail=require("nodemailer")

const { body, validationResult } = require('express-validator');


passport.use(new passportlocal(usermodel.authenticate()))

router.get('/login', function(req, res) {
  const flashmessage =req.flash("message")
  res.render('login',{flashmessage})
});


router.post('/contact', async function(req, res) {
 try{ const newcontact = await contactmodel.create({
    name:req.body.name,
    email:req.body.email,
    conutry:req.body.conutry,
    phone:req.body.phone,
    company:req.body.Company,
    mobile:req.body.Mobile,
    city:req.body.city,
    state:req.body.state,
    postalCode:req.body.postalcode,
    subject:req.body.subject,
    message:req.body.message 
  })
  await newcontact.save()
  
  
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;
  
  
  const transporter = nodemail.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: `77c3e7001@smtp-brevo.com`,
        pass: `${process.env.PASSWORD}`
    }
})
  const mailOptions = {
    from:`${process.env.CLIENT_MAIL}`,
    to: email,
    subject: 'Thank you for contacting us!',
    text: `Dear ${name},\n\nThank you for reaching out to us. We have received your query and will get back to you shortly.\n\nRegards,\nUNIKO IPR Services`
   
  };
  const mailOptions2 = {
    from: `${process.env.CLIENT_MAIL}`,
    to: `${process.env.CLIENT_MAIL}`,
    subject: 'User Details',
    text: `User Name :- ${name},\n\n User Email:- ${email}.\n\n  User Message:- ${message}\nUNIKO IPR Services`
   
  };
  await transporter.sendMail(mailOptions);
  await transporter.sendMail(mailOptions2);
  res.redirect("/")}catch (err) {
    res.redirect("/")
  }
})


router.get('/services', async function(req, res) {
  if (req.isAuthenticated()) {
    var user= await usermodel.findOne({username:req.session.passport.user})
    res.render('services',{user,req});
  }
  else{
    res.render('services',{req})
  }
  });


router.get('/' , async function(req, res) {
if (req.isAuthenticated()) {
  var user= await usermodel.findOne({username:req.session.passport.user})
  res.render('index',{user,req});
}
else{
  res.render('index',{req})
}
});
router.get('/profile', async function(req, res) {
  var user= await usermodel.findOne({username:req.session.passport.user})
  res.render('profile',{user});
});
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

router.post('/register', async function(req, res) {
try{
  const user= await usermodel.findOne({email:req.body.email});
  if (user) {
    req.flash("message","User already registered")
    res.redirect("/login")

  }
  else{
  const userdata=new usermodel({
  name:req.body.name,
  username:req.body.username,
  email:req.body.email
  })
usermodel.register(userdata,req.body.password)
.then(function(){
  passport.authenticate("local")(req,res,function(){
    res.redirect('/')
  })
})}
}catch(err){
  res.redirect("/login")
  console.log(err.message)
}
})

router.post('/login', passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/login",
  failureFlash:true,
}),function(req, res) {})





module.exports = router;

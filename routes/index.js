var express = require('express');
var router = express.Router();
const usermodel=require("../models/userdata-model")
const contactmodel=require("../models/contactus-model")
const passport = require('passport')
const passportlocal=require('passport-local')
const nodemail=require("nodemailer")

passport.use(new passportlocal(usermodel.authenticate()))

router.get('/login', function(req, res) {
  res.render('login');
});


router.post('/contact', async function(req, res) {
  const newcontact = await contactmodel.create({
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
  
  
  const transporter = nodemail.createTransport({
    service: 'gmail',
    auth: {
      user: 'praduman.228@gmail.com',
      pass: 'awys dwnf ejxq dpvy'
    }
  });
  const mailOptions = {
    from: 'praduman.228@gmail.com',
    to: email,
    subject: 'Thank you for contacting us!',
    text: `Dear ${name},\n\nThank you for reaching out to us. We have received your query and will get back to you shortly.\n\nRegards,\nUNIKO IPR Services`
   
  };
  await transporter.sendMail(mailOptions);
  res.redirect("/")
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



router.get('/blog',isLoggedIn,async function(req, res) {
  const users= await usermodel.findOne({username:req.session.passport.user})
  const posts=await postmodel.find().populate("user")
  posts.forEach(post => {
    if (post.user) {
        console.log(post.user.name);
    }
});
  
  res.render('blog',{users, posts,});
})

router.get('/edit', function(req, res) {
  res.render('edit');
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
router.post('/post', async function(req, res) {
  var user= await usermodel.findOne({username:req.session.passport.user})
  var post=await postmodel.create({
    blogtext: req.body.blogtext,
    user:user._id
  })
 
  user.posts.push(post._id)
  await user.save()
  res.redirect('/blog')

  })
router.post('/register', function(req, res) {
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
})
})

router.post('/login', passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/login",
  failureFlash:true
}),function(req, res) {})


function isLoggedIn(req, res, next) {
  
  if (req.isAuthenticated()) {

    return next();
  }
  res.redirect('/login');
}



module.exports = router;

const mongoose=require("mongoose")


const contactSchema=mongoose.Schema({
   name:String,
   email:String,
   conutry:String,
   phone:Number,
   company:String,
   mobile:Number,
   city:String,
   state:String,
   postalCode:Number,
   subject:String,
   message:String       
})


module.exports=mongoose.model("contact",contactSchema);

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://bharaniraja21_db_user:yagROitZKPOC2Q4A@cluster0.np2mfat.mongodb.net/bulkmail").then(function(){
    console.log("Db connected")
}).catch(function(){
    console.log("connection failed")
})


app.post("/sendmail",function(req,res){
var msg = req.body.msg
var emaillist = req.body.emaillist
        
const credentials = mongoose.model("credentials",{},"credentials")
credentials.find().then(function(data){
  const transporter = nodemailer.createTransport({
  service:"gmail", 
  auth: {
    user: data[0].toJSON().name,
    pass: data[0].toJSON().pass,
  },
})


new Promise(async function(response, reject){
        try{
                for(var i=1;i<emaillist.length;i++)
                {
                    await transporter.sendMail(
                        {
                            from:"bharaniraja21@gmail.com",
                            to:emaillist[i],
                            subject:"Message fom BulkMail",
                            text:msg
                        }
                )
                    console.log("Email sent succesfully :"+emaillist[i])
                }
                response("Success")
        }
        catch(error){
            reject("Failed")
        }
        }).then(function(){
            res.send(true)
        }).catch(function(){
            res.send(false)
        })

    }).catch(function(error){
        console.log("error")
        console.log(error)
    })
       
})




app.listen(5002,function(){
    console.log("server started")
})



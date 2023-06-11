const express=require('express')
const path=require('path')
const $=5502
const hbs=require('nodemailer-express-handlebars')
const nodemailer=require('nodemailer')
const app=express()
const cors=require('cors')
app.use(express.json())
app.use(cors())
app.post('/SendEmailToUser',async(req,res)=>{
    const {name,email}=req.body
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'testeurtester278@gmail.com',
            pass:'cvjzkqgfgynrrjjy'
        }
    })
    
    const handelbarOptions={
        viewEngine:{
            extName:'.handlebars',
            partialsDir:path.resolve('./views'),
            defaultLayout:false
        },
        viewPath:path.resolve('./views'),
        extName:'.handlebars'
    }
    transporter.use('compile',hbs(handelbarOptions))
    
    const mailOptions={
        from:'testeurtester278@gmail.com',
        to:email,
        subject:'Welcome To TigerChat',
        template:'email',
        context:{
            name:'Youssef Dalouji',
            nameUser:name
        }
    }
    transporter.sendMail(mailOptions,(error,succes)=>{
        if(succes){
            res.status(200).json([{operation:1}])
            return true;
        }
        res.status(400).json([{operation:0}])
    })
})



app.listen($,(error)=>{
    if(!error){
        console.log('Serveur Lance au Port '+$)
        return true;
    }
    console.log("Error Lance serveur au port "+$)
})

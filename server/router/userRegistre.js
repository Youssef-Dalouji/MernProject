const express=require('express')
const router=express.Router()
require('dotenv/config')
const bcryptjs=require('bcryptjs')
const jwt=require("jsonwebtoken")
const {modelUserInfo}=require('../models/schemaUserInfo')
const amqp = require('amqplib')
require('dotenv/config')
router.post('/',async (req,res)=>{
    let channel, connection;
    const queueName = "dashborad";
    const Message = 'UR';
    async function connectToRabbitMQ() {
        try{
            await new Promise((resolve) => setTimeout(resolve, 5000));
        const amqpServer =process.env.RABBITMQ;
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        } catch (err) {
            console.error('Failed to connect to RabbitMQ server:', err);
          }
     }
    
    await connectToRabbitMQ().then(() => {
        channel.sendToQueue(queueName,
            Buffer.from(Message)
        );
    });
    
    setTimeout(() => {
        connection.close();
    }, 1000)
    const {idUser,name,email,password}=await req.body
    const token=await jwt.sign({id:idUser},process.env.JWT_SEC)
    const salt=await bcryptjs.genSalt(7)
    const newPassword= await bcryptjs.hash(password,salt)
    const newData=await {idUser:idUser,name:name,email:email,password:newPassword,token:token}
    try{
        const registre= await new modelUserInfo(newData)
        registre.save((err,data)=>{
            if(!err){
                res.status(201).json([{operation:1}])
            }
        })
    }catch(err){
        res.status(400).json([{message:err}])
    }
})
module.exports=router
const express=require('express')
const router=express.Router()
const bcryptjs=require('bcryptjs')
const {modelUserInfo}=require('../models/schemaUserInfo')
const amqp = require('amqplib')
require('dotenv/config')
//Routes

router.post('/',async (req,res)=>{
    let channel, connection;
    const queueName = "dashborad";
    async function connectToRabbitMQ() {
        const amqpServer = process.env.RABBITMQ
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName);
                 }    
    const {email,password}=req.body
    try{
        const data=await modelUserInfo.findOne({email:email})
        if(data){
            const resultat=bcryptjs.compareSync(password,data.password)
            if(resultat){
                await connectToRabbitMQ().then(() => {
                    channel.sendToQueue(queueName,
                        Buffer.from('AUO')
                    );
                });
                
                setTimeout(() => {
                    connection.close();
                }, 1000)
                    res.status(200).json([{token:data.token,idUser:data.idUser,name:data.name}])
            }else{
                res.status(404).json([{operation:0}])
            }
        }
        else{
            res.status(404).json([{operation:0}])
        }
    }catch(err){
        res.status(400).json([{operation:0}])
    }

})
module.exports=router
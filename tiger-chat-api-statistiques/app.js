const express=require('express')
const cors =require('cors')
const { ConnectDB } = require('./models/connect')
const app=express()
require('dotenv/config')
// Middleware Technique
const dashborad=require('./router/dashborad')
app.use(express.json())
app.use(cors())
//Middleware Router
app.use('/dashborad-info-TC',dashborad)
// Connect with database
ConnectDB()
//Running Serveur
app.listen(process.env.PORT,(err)=>{
    if(!err){
        console.log("Serveur Lance en port "+process.env.PORT)
    }else{
        console.log("Problem Lancement de serveur Error : "+err)
    }
})

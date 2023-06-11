const mongoose=require('mongoose')
const schemaDashborad=mongoose.Schema({
    infoDashborad:{
        type:String,
        required:true,
        default:'info'
    },
    UsersOnline:{
        type:Number,
        required:true
    },
    UsersOffline:{
        type:Number,
        required:true
    },
    TotalRoomsCreated:{
        type:Number,
        required:true
    },
    TotalRoomsOnline:{
        type:Number,
        required:true
    },
    TotalRoomsDeleted:{
        type:Number,
        required:true
    },
    TotalMessages:{
        type:Number,
        required:true
    },
},{
    timestamps:true,
    collection:'Dashborad'
})
const modelDashborad=mongoose.model('Dashborad',schemaDashborad,'Dashborad')
module.exports={modelDashborad}
const express = require("express");
const router = express.Router();
const { modelDashborad } = require("../models/schemaDashborad");
const { middlewareProtect } = require("./middlewareProtect");
const amqp = require("amqplib");
require('dotenv/config')
//Routes

router.get("/", async (req, res) => {
  var statistiques = { MUO: 0, AUO: 0, TRC: 0, TRD: 0, TM: 0, TRO: 0 };
  let channel, connection;
  try {
    const findDashborad = await modelDashborad.findOne({
      infoDashborad: "info",
    });
    if (findDashborad) {
        const queueName = "dashborad";
      async function connectToRabbitMQ() {
        const amqpServer =process.env.RABBITMQ;
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName);
      }

      await connectToRabbitMQ().then(() => {
        return channel.consume(queueName, (data) => {
          switch (data.content.toString()) {
            case "AUO":
              statistiques.AUO += 1;
              if (findDashborad.UsersOffline != 0) {
                statistiques.MUO += -1;
              }
              break;
            case "UR":
                statistiques.MUO += 1;
              break;
            case "TRC":
              statistiques.TRC += 1;
              statistiques.TRO += 1;
              break;
            case "TRD":
              statistiques.TRD += 1;
              if (findDashborad.TotalRoomsOnline != 0) {
                statistiques.TRO += -1;
              }
              break;
            case "TM":
              statistiques.TM += 1;
              break;
            case "MUO":
              statistiques.MUO += 1;
              if (findDashborad.UsersOnline != 0) {
                statistiques.AUO += -1;
              }
              break;

            default:
              break;
          }
          channel.ack(data);
        });
      });
      setTimeout(() => {
        connection.close();
      }, 1000);
      const updateRoomUsers = await modelDashborad.updateOne(
        { infoDashborad: "info" },
        {
          $set: {
            UsersOnline: findDashborad.UsersOnline + statistiques.AUO,
            UsersOffline: findDashborad.UsersOffline + statistiques.MUO,
            TotalRoomsCreated:
              findDashborad.TotalRoomsCreated + statistiques.TRC,
            TotalRoomsOnline: findDashborad.TotalRoomsOnline + statistiques.TRO,
            TotalRoomsDeleted:
              findDashborad.TotalRoomsDeleted + statistiques.TRD,
            TotalMessages: findDashborad.TotalMessages + statistiques.TM,
          },
        }
      );
      if (updateRoomUsers) {
        res.status(201).json([{ operation: 1 }]);
      } else {
        res.status(201).json([{ operation: 0 }]);
      }
    } else {
        const queueName = "dashborad";
      async function connectToRabbitMQ() {
        const amqpServer =process.env.RABBITMQ;
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName);
      }

      await connectToRabbitMQ().then(() => {
        return channel.consume(queueName, (data) => {
          switch (data.content.toString()) {
            case "AUO":
              statistiques.AUO += 1;
              break;
            case "TRC":
              statistiques.TRC += 1;
              statistiques.TRO += 1;
              break;
            case "UR":
                statistiques.MUO += 1;
              break;
            case "TRD":
              statistiques.TRD += 1;
              break;
            case "TM":
              statistiques.TM += 1;
              break;
            case "MUO":
              statistiques.MUO += 1;
              statistiques.AUO += -1;
              break;

            default:
              break;
          }
          channel.ack(data);
        });
      });
      setTimeout(() => {
        connection.close();
      }, 1000);
      await modelDashborad.create(
        {
          UsersOnline: statistiques.AUO,
          UsersOffline: statistiques.MUO,
          TotalRoomsCreated: statistiques.TRC,
          TotalRoomsOnline: statistiques.TRC,
          TotalRoomsDeleted: 0,
          TotalMessages: statistiques.TM,
        },
        (err, data) => {
          if (data) return res.status(201).json([{ operation: 1 }]);
          res.status(200).json([{ operation: 0 }]);
        }
      );
    }
  } catch (err) {
    res.status(401).json([{ operation: 0, message: err }]);
  }
});

router.get('/getData',middlewareProtect,async(req,res)=>{
    try{
        await modelDashborad.find({},(err,data)=>{
            if(!err)return res.status(200).json([{operation:1,data:data}])
            return res.status(400).json([{opertaion:0}])
        }).clone()
    }catch(e){
        return res.status(500).json([{opertaion:0}])
    }
})
module.exports = router;

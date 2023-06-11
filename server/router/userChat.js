const express = require("express");
const router = express.Router();
require("dotenv/config");
const { modelUserChat } = require("../models/schemaUserChat");
const { middlewareProtect } = require("./middlewareProtect");
const { modelRoomChat } = require("../models/schemaRoomChat");
const amqp = require("amqplib");
const axios = require('axios');
require('dotenv/config')
//Routes
router.post("/create", middlewareProtect, async (req, res) => {
  let channel, connection;
  const queueName = "dashborad";
  const Message = "TM";
  async function connectToRabbitMQ() {
    const amqpServer =process.env.RABBITMQ;
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName);
  }

  await connectToRabbitMQ().then(() => {
    channel.sendToQueue(queueName, Buffer.from(Message));
  });

  setTimeout(() => {
    connection.close();
  }, 1000);
  const { idUser } = req.user;
  const { message, idRoom, name } = req.body;
  const collectData = [];
  try {
    await modelRoomChat
      .findOne({ idRoom: idRoom }, (err, data) => {
        if (data) {
          collectData.push(
            {
              idUser: idUser,
              name: name,
              type: "E",
              message: message,
              idRoom: idRoom,
            },
            {
              idUser: idUser,
              name: name,
              type: "R",
              message: message,
              idRoom: idRoom,
            }
          );
          modelUserChat.insertMany(collectData, (err, good) => {
            if (good) {
              res
                .status(200)
                .json([{ operation: 1, message: "Successfully Request" }]);
            } else {
              res.status(200).json([{ operation: 0, message: err }]);
            }
          });
        } else {
          res.status(400).json([{ operation: 0, message: err }]);
        }
      })
      .clone();
  } catch (err) {
    res.status(500).json([{ operation: 0, message: err }]);
  }
});
router.post("/get", middlewareProtect, async (req, res) => {
  const { idUser } = req.user;
  const { idRoom } = req.body;
  try {
    await modelUserChat
      .find(
        {
          $or: [
            { idUser: idUser, type: "E", idRoom: idRoom },
            { idUser: { $ne: idUser }, type: "R", idRoom: idRoom },
          ],
        },
        (err, succes) => {
          if (!err)
            return res.status(201).json([{ operation: 1, data: succes }]);
          res.status(404).json([{ operation: 0, content: err }]);
        }
      )
      .sort({ date: 1 })
      .clone();
  } catch (err) {
    res.status(404).json([{ operation: 0, content: err }]);
  }
});
router.delete("/remove", middlewareProtect, async (req, res) => {
  const idRoom = req.headers.idroom;
  try {
    await modelUserChat
      .deleteMany({ idRoom: idRoom }, (err, sucess) => {
        if (!err)
          return res.status(200).json([{ operation: 1, message: sucess }]);
        res.status(204).json([{ operation: 0, message: err }]);
      })
      .clone();
  } catch (err) {
    res.status(204).json([{ operation: 0, message: err }]);
  }
});
router.post("/queryPingConnect", middlewareProtect, async (req, res) => {
    let channelplus, connectionplus;
  const { idRoom } = req.body;
  const { idUser } = req.user;
  let state = false;
  let newListUsers = [];
  let usersConnect = 0;
  const queueName = "dashborad";
  async function connectToRabbitMQ() {
      const amqpServer =process.env.RABBITMQ;
      connectionplus = await amqp.connect(amqpServer);
      channelplus = await connectionplus.createChannel();
      await channelplus.assertQueue(queueName);
  }
  res.on("close", () => {
    state = true;
     connectToRabbitMQ().then(() => {
        channelplus.sendToQueue(
        queueName,
        Buffer.from('MUO')
        );
    });
  });
  let keyNumbre = setInterval(() => {
    if (state === true) {
      try {
        modelRoomChat
          .findOne({ idRoom: idRoom }, (err, data) => {
            if (data) {
              if (data.idRoom == idRoom) {
                data.users.forEach((item) => {
                  if (item.idUser == idUser) {
                    let newObjectUser = {
                      name: item.name,
                      idUser: idUser,
                      connectState: false,
                    };
                    newListUsers.push(newObjectUser);
                  } else {
                    newListUsers.push(item);
                  }
                }); 
                modelRoomChat.updateOne(
                  { idRoom: idRoom },
                  { $set: { users: newListUsers } },
                  (err, sucess) => {
                    if (sucess) {
                      modelRoomChat.findOne({ idRoom: idRoom }, (err, data) => {
                        if (data) {
                          data.users.forEach((item) => {
                            if (item.connectState == true) {
                              usersConnect += 1;
                            }
                          });
                          if (usersConnect == 0) {
                            modelRoomChat.deleteMany(
                              { idRoom: idRoom },
                              (err, success) => {
                                if (success) {
                                     connectToRabbitMQ().then(() => {
                                        channelplus.sendToQueue(
                                        queueName,
                                        Buffer.from('TRD')
                                        );
                                    });
                                    setTimeout(() => {
                                        connectionplus.close();
                                      }, 1000);
                                      axios.get('http://localhost:5501/dashborad-info-TC');
                                  modelUserChat.deleteMany(
                                    { idRoom: idRoom },
                                    (err, success) => {
                                      if (success) {
                                        res
                                          .status(200)
                                          .json([{ operation: 1 }]);
                                      } else {
                                        res
                                          .status(401)
                                          .json([{ operation: 0 }]);
                                      }
                                    }
                                  );
                                } else {
                                  res.status(401).json([{ operation: 0 }]);
                                }
                              }
                            );
                          } else {
                            res.status(200).json([{ operation: 1 }]);
                          }
                        } else {
                          res
                            .status(400)
                            .json([
                              {
                                operation: 0,
                                statu: "Error Find Data Operation " + err,
                              },
                            ]);
                        }
                      });
                      res
                        .status(200)
                        .json([{ operation: 1, statu: "Valid Operation U:" }]);
                    } else {
                      res
                        .status(400)
                        .json([
                          {
                            operation: 0,
                            statu: "Invalid Operation U: " + err,
                          },
                        ]);
                    }
                  }
                );
              } else {
                res
                  .status(400)
                  .json([
                    { operation: 0, statu: "Invalid Operation U: " + err },
                  ]);
              }
            } else {
              res
                .status(400)
                .json([{ operation: 0, statu: "Error Operation " + err }]);
            }
          })
          .clone();
      } catch (err) {
        res.status(400).json([{ operation: 0, statu: "Error " + err }]);
      }
      clearInterval(keyNumbre);
    }
  }, 5000);
});
module.exports = router;

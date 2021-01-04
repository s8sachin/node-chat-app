const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');

const {generateMessage, generateLocationMessage, generateVideoPartyEvent} = require('./utils/message');
const {isRealString} = require('./utils/validations');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;

const defaultCb = () => {};

var app = express();
var server = http.createServer(app);
var io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
var users = new Users();

app.use(cors());

app.use(express.static(publicPath));
io.on('connection', (socket) => {
  console.log("New user connected");
  // socket.join('room1')
  // socket.to('room1').emit('newMessage', generateMessage('Admin', "Welcome to chat app."));

  socket.on('join', (params, callback = defaultCb) => {
    console.log(params, 'XXX')
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and room name are required');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', "Welcome to chat app."));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage("Admin", `${params.name} connected to chat.`));
    callback();
  });

  socket.on('createMessage', (message, callback = defaultCb) =>{
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)){
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createVideoPartyEvent', (message, callback = defaultCb) =>{
    var user = users.getUser(socket.id);
    if (user && message){
      console.log(user, message, 'MESSAGE')
      io.to(user.room).emit('newVideoPartyEvent', generateVideoPartyEvent(user.name, message));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user){
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, `${coords.latitude}`, `${coords.longitude}`));
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    console.log('User left')
    if (user){
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
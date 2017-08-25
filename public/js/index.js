var socket = io();
socket.on('connect', function() {
  console.log('Connected to server');

  socket.emit('createMessage', {
    from: 'sach',
    text: "this works"
  });
});

socket.on('disconnect', function(){
  console.log('Disconnected from server');
});

socket.on('newEmail', function(email) {
  console.log('new email', email);
})

socket.on('newMessage', function(message){
  console.log('newMessage', message);
})
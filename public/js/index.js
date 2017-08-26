var socket = io();
socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function(){
  console.log('Disconnected from server');
});

socket.on('newEmail', function(email) {
  console.log('new email', email);
})

socket.on('newMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text, 
    from: message.from,
    createdAt: formattedTime
  });
  $('#messages').append(html);
});

socket.on('newLocationMessage', function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    createdAt: formattedTime,
    url: message.url
  });
  $('#messages').append(html);
});

$('#message-form').on('submit', function(e){
  var messageTextbox = $('[name=message]');
  e.preventDefault();
  socket.emit('createMessage', {
    from: 'user',
    text: messageTextbox.val()
  }, function(){
    messageTextbox.val("");
  });
});

var locationButton = $('#send-location');
locationButton.on('click', function(){
  if (!navigator.geolocation){
    return alert('Geolocation not supported by your browser');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');
  navigator.geolocation.getCurrentPosition(function(position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  }, function(){
    alert("Unable to fetch location.")
  })
})
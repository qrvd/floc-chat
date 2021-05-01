const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.emit('chat message', "[Please wait until you are connected...]")
  const state = {};
  socket.once('cohort_id', cohort => {
    state.cohort = cohort;
    socket.join(state.cohort);
    io.in(state.cohort).emit('chat message', "A new user has connected.");
    socket.emit('chat message', "[You have been connected to cohort " + `${cohort}.]`)
  })
  socket.on('chat message', msg => {
    if (!!state.cohort) {
      io.in(state.cohort).emit('chat message', msg);
    } else {
      socket.emit('chat message', "[Message could not be sent.]")
    }
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


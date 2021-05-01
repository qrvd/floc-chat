const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const sanitizeHtml = require('sanitize-html');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const roomData = {};

io.on('connection', (socket) => {
  socket.emit('chat message', "[Please wait until you are connected...]")
  const state = {};
  socket.once('cohort_id', cohort => {
    state.cohort = cohort;
    socket.join(state.cohort);
    if (!!roomData[cohort]) {
      roomData[cohort].numUsers += 1
    } else {
      roomData[cohort] = { numUsers: 1 };
    }
    io.in(state.cohort).emit('chat message', `[A new user has joined.]`);
    socket.emit('chat message', "[You have been connected to the chat room for cohort " + `${cohort}.]`);
    socket.emit('chat message', `[There are ${roomData[cohort].numUsers} users in this chat room.]`);
  })
  socket.on('chat message', msg => {
    if (!!state.cohort) {
      io.in(state.cohort).emit('chat message', sanitizeHtml(msg));
    } else {
      socket.emit('chat message', "[Message could not be sent.]")
    }
  });

  socket.on('disconnect', () => {
    if (!state.cohort) return
    roomData[state.cohort].numUsers -= 1
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


const express = require('express');
const moment = require('moment');
const app = express();
const path = require('path');
const http = require('https');
const server = http.createServer(app);
// //https for WebRtc
// const https = require('https');
// const fs = require('fs');

// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync("cert.pem")
// };
// const server = https.createServer(options, app);
const socketIO = require('socket.io');
const io = socketIO(server);
const mongoose = require('mongoose'); // Mongoose 추가

const cors = require('cors');
// 모든 도메인에서의 접근을 허용
app.use(cors());

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://superb3739:superbuddy379300@superbuddy.iev3r.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB 연결 오류:', error);
});

db.once('open', () => {
  console.log('MongoDB 연결 성공');
});

// 채팅 메시지 모델 정의
const chatSchema = new mongoose.Schema({
  name: String,
  msg: String,
  time: String,
  room: String,
});

// 'mydatabase' 데이터베이스에서 Chat 모델 사용
const Chat = db.useDb('mydatabase').model('chats1', chatSchema);

app.use(express.static(path.join(__dirname, 'src')));

// '/' 경로로 접속 시 join.html을 보내주도록 설정
app.get('/intro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'intropage.html'));
});
app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'teamCreate.html'));
});
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'chats.html'));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});

// 어떤 방에 어떤 유저가 들어있는지
let users = {};
// socket.id기준으로 어떤 방에 들어있는지
let socketRoom = {};

// 방의 최대 인원수
const MAXIMUM = 9;

io.on('connection', (socket) => {
  socket.on('chatting', (data) => {
    const { name, msg, room } = data;
    io.emit('chatting', {
      name,
      msg,
      time: moment(new Date()).format('h:mm A'),
      room,
    });

    const chatMessage = new Chat({ name, msg, time: moment(new Date()).format('h:mm A'), room });

    chatMessage.save()
      .then(() => {
        console.log('채팅 메시지 저장 성공');
      })
      .catch((error) => {
        console.error('채팅 메시지 저장 오류:', error);
      });
  });

  // 채팅 메시지를 가져와서 클라이언트로 전송
  socket.on('requestHistory', (room) => {
    Chat.find({room})
      .then((messages) => {
        socket.emit('chattingHistory', messages);
      })
      .catch((error) => {
        console.error('채팅 메시지 조회 오류:', error);
      });
  });

  console.log(socket.id, "connection");
  socket.on("join_room", (data) => {
    // 방이 기존에 생성되어 있다면
    if (users[data.room]) {
      // 현재 입장하려는 방에 있는 인원수
      const currentRoomLength = users[data.room].length;
      if (currentRoomLength === MAXIMUM) {
        // 인원수가 꽉 찼다면 돌아갑니다.
        socket.to(socket.id).emit("room_full");
        return;
      }
        // 여분의 자리가 있다면 해당 방 배열에 추가해줍니다.
        users[data.room] = [...users[data.room], { id: socket.id }];
      } else {
        // 방이 존재하지 않다면 값을 생성하고 추가해줍시다.
        users[data.room] = [{ id: socket.id }];
      }
      socketRoom[socket.id] = data.room;
  
      // 입장
      socket.join(data.room);
  
      // 입장하기 전 해당 방의 다른 유저들이 있는지 확인하고
      // 다른 유저가 있었다면 offer-answer을 위해 알려줍니다.
      const others = users[data.room].filter((user) => user.id !== socket.id);
      if (others.length) {
        io.sockets.to(socket.id).emit("all_users", others);
      }
    });
    socket.on("offer", (sdp, roomName) => {
      // offer를 전달받고 다른 유저들에게 전달해 줍니다.
      socket.to(roomName).emit("getOffer", sdp);
    });
  
    socket.on("answer", (sdp, roomName) => {
      // answer를 전달받고 방의 다른 유저들에게 전달해 줍니다.
      socket.to(roomName).emit("getAnswer", sdp);
    });
  
    socket.on("candidate", (candidate, roomName) => {
      // candidate를 전달받고 방의 다른 유저들에게 전달해 줍니다.
      socket.to(roomName).emit("getCandidate", candidate);
    });

    socket.on("disconnect", () => {
      // 방을 나가게 된다면 socketRoom과 users의 정보에서 해당 유저를 지워줍니다.
      const roomID = socketRoom[socket.id];
  
      if (users[roomID]) {
        users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
        if (users[roomID].length === 0) {
          delete users[roomID];
          return;
        }
      }
      delete socketRoom[socket.id];
      socket.broadcast.to(users[roomID]).emit("user_exit", { id: socket.id });
    });
  

  // // 클라이언트가 방에 입장한 경우
  // socket.on('join', (data) => {
  //   const { nickname, room } = data;
    
  //   // 방 이름에 해당하는 방에 입장
  //   socket.join(room);

  //   // 새로운 사용자의 입장을 해당 방에 속한 사용자들에게 알림
  //   socket.to(room).emit('userJoined', { nickname, room });
  // });
});

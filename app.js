const express = require('express');
const moment = require('moment');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
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
});

// 'mydatabase' 데이터베이스에서 Chat 모델 사용
const Chat = db.useDb('mydatabase').model('Chat', chatSchema);

app.use(express.static(path.join(__dirname, 'src')));

// '/' 경로로 접속 시 join.html을 보내주도록 설정
app.get('/intro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'intropage.html'));
});
app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'teamCreate.html'));
});
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});

io.on('connection', (socket) => {
  socket.on('chatting', (data) => {
    const { name, msg } = data;
    io.emit('chatting', {
      name,
      msg,
      time: moment(new Date()).format('h:mm A'),
    });

    const chatMessage = new Chat({ name, msg, time: moment(new Date()).format('h:mm A') });

    chatMessage.save()
      .then(() => {
        console.log('채팅 메시지 저장 성공');
      })
      .catch((error) => {
        console.error('채팅 메시지 저장 오류:', error);
      });
  });

  // 채팅 메시지를 가져와서 클라이언트로 전송
  socket.on('requestHistory', () => {
    Chat.find({})
      .then((messages) => {
        socket.emit('chattingHistory', messages);
      })
      .catch((error) => {
        console.error('채팅 메시지 조회 오류:', error);
      });
  });

  // 클라이언트가 방에 입장한 경우
  socket.on('join', (data) => {
    const { nickname, room } = data;
    
    // 방 이름에 해당하는 방에 입장
    socket.join(room);

    // 새로운 사용자의 입장을 해당 방에 속한 사용자들에게 알림
    socket.to(room).emit('userJoined', { nickname, room });
  });
});

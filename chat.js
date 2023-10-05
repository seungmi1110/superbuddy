const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// MongoDB 연결
const url = 'mongodb+srv://superb3739:superbuddy379300@superbuddy.iev3r.mongodb.net/';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');

    // MongoDB 스키마 정의
    const ChatSchema = new mongoose.Schema({
      username: String, // 채팅을 보낸 사용자 이름
      message: String,  // 채팅 메시지 내용
      timestamp: { type: Date, default: Date.now } // 채팅이 생성된 시간
    });

    // MongoDB 모델 생성
    const Chat = mongoose.model('Chat', ChatSchema);

    // Express 정적 파일 서비스
    app.use(express.static('public'));

    // 웹 소켓 연결 및 이벤트 리스너 설정
    io.on('connection', (socket) => {
      console.log('사용자가 연결되었습니다.'); // 사용자 연결 로그

      // 클라이언트로부터 받은 채팅 메시지를 저장
      socket.on('chat message', (msg) => {
        const chat = new Chat(msg);
        chat.save((err) => {
          if (err) return console.error(err);
          console.log('메시지가 저장되었습니다.'); // 메시지 저장 로그
          io.emit('chat message', msg); // 모든 클라이언트에게 메시지 전송
        });
      });

      // 연결 해제 시 처리
      socket.on('disconnect', () => {
        console.log('사용자가 연결 해제되었습니다.'); // 사용자 연결 해제 로그
      });
    });

    // 웹 서버 시작
    const PORT = process.env.PORT || 8081;
    server.listen(PORT, () => {
      console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 연결 중 오류가 발생했습니다:', err);
  });

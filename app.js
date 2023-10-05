// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost/chatapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 채팅 메시지 모델 설정
const ChatMessage = mongoose.model('ChatMessage', {
    sender: String,
    message: String,
});

// 라우트 설정
app.post('/send', (req, res) => {
    const { sender, message } = req.body;

    const chatMessage = new ChatMessage({ sender, message });

    chatMessage.save((err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Message sent successfully');
        }
    });
});

app.get('/messages', (req, res) => {
    ChatMessage.find({}, (err, messages) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(messages);
        }
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const Chat = (function(){
  const myName = "blue";

  // init 함수
  function init() {
      // enter 키 이벤트
      $(document).on('keydown', 'div.input-div textarea', function(e){
          if(e.keyCode == 13 && !e.shiftKey) {
              e.preventDefault();
              const message = $(this).val();

              // 메시지 전송
              sendMessage(message);
              // 입력창 clear
              clearTextarea();
          }
      });
  }

  // 메세지 태그 생성
  function createMessageTag(LR_className, senderName, message) {
      // 형식 가져오기
      let chatLi = $('div.chat.format ul li').clone();

      // 값 채우기
      chatLi.addClass(LR_className);
      chatLi.find('.sender span').text(senderName);
      chatLi.find('.message span').text(message);

      return chatLi;
  }

  // 메세지 태그 append
  function appendMessageTag(LR_className, senderName, message) {
      const chatLi = createMessageTag(LR_className, senderName, message);

      $('div.chat:not(.format) ul').append(chatLi);

      // 스크롤바 아래 고정
      $('div.chat').scrollTop($('div.chat').prop('scrollHeight'));
  }

  // 메세지 전송
  function sendMessage(message) {
      // 서버에 전송하는 코드로 후에 대체
      const data = {
          "senderName"    : "blue",
          "message"        : message
      };

      // 통신하는 기능이 없으므로 여기서 receive
      resive(data);
  }

  // 메세지 입력박스 내용 지우기
  function clearTextarea() {
      $('div.input-div textarea').val('');
  }

  // 메세지 수신
  function resive(data) {
      const LR = (data.senderName != myName)? "left" : "right";
      appendMessageTag("right", data.senderName, data.message);
  }

  return {
      'init': init
  };
})();

$(function(){
  Chat.init();
});

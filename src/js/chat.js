'use strict';

// URL에서 방 이름 가져오기
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room') || 'default-room';
const nickname = urlParams.get('nickname') || 'Guest'; // 대화명 기본값 설정

// DOM 요소 가져오기
const chatList = document.querySelector('.chatting-list');
const chatInput = document.querySelector('.chatting-input');
const sendButton = document.querySelector('.send-button');

// 소켓 연결 시 방 이름 및 대화명 전달
const socket = io({ query: { room, nickname } });

// Enter 키 눌렀을 때 메시지 전송
chatInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    send();
  }
});

// 전송 버튼 클릭 시 메시지 전송
sendButton.addEventListener('click', send);

// 채팅 메시지 받기
socket.on('chatting', function (data) {
  const { name, msg, time } = data;
  const item = new LiModel(name, msg, time);
  item.makeLi();
});

// 채팅 메시지 보내기 함수
function send() {
  const param = {
    name: nickname,
    msg: chatInput.value,
    room: room,
  };
  socket.emit('chatting', param);
  chatInput.value = '';
}

// 채팅 메시지를 리스트에 추가하는 클래스
function LiModel(name, msg, time) {
  this.name = name;
  this.msg = msg;
  this.time = time;

  this.makeLi = () => {
    const li = document.createElement('li');
    li.classList.add(nickname === this.name ? 'sent' : 'received');
    const dom = `
      <span class="profile">
        <span class="user">${this.name}</span>
        <img class="image" src="https://placeimg.com/50/50/any" alt="any" />
      </span>
      <span class="message">${this.msg}</span>
      <span class="time">${this.time}</span>
    `;

    li.innerHTML = dom;
    chatList.appendChild(li);
  };
}

// 메시지창 자동 스크롤
const displayContainer = document.querySelector('.display-container');

socket.on('chatting', (data) => {
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
});

// 서버로부터 채팅 내용 요청
socket.emit('requestHistory');

// 서버로부터 채팅 내용 수신
socket.on('chattingHistory', (messages) => {
  messages.forEach((message) => {
    const { name, msg, time } = message;
    const item = new LiModel(name, msg, time);
    item.makeLi();
  });
});

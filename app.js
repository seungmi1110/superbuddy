import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment from 'moment';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const db = mongoose.connection; // db 변수 정의

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://superb3739:superbuddy379300@superbuddy.iev3r.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// app.js 부분
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

// const Chat = db.useDb('mydatabase').model('chats1', chatSchema);
const Chat = mongoose.model('chats1', chatSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'src')));
app.use(cors());

app.get('/intro', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'intropage.html'));
});

app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'teamCreate.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'chats.html'));
});

// const httpsOptions = {
//   key: fs.readFileSync('/etc/letsencrypt/live/super-buddy3739.site/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/super-buddy3739.site/cert.pem'),
//   ca: fs.readFileSync('/etc/letsencrypt/live/ssuper-buddy3739.site/chain.pem')
// };


// const httpsServer = https.createServer(options, app);

const httpIO = new SocketIOServer(server);
// const httpsIO = new SocketIOServer(httpsServer);


// 어떤 방에 어떤 유저가 들어있는지
let users = {};
// socket.id기준으로 어떤 방에 들어있는지
let socketRoom = {};

// 방의 최대 인원수
const MAXIMUM = 9;

httpIO.on('connection', (socket) => {
  socket.on('chatting', (data) => {
    const { name, msg, room } = data;
    httpIO.emit('chatting', {
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
  // socket.on('join', (data) => {
  //   const { nickname, room } = data;
  //   socket.join(room);
  //   socket.to(room).emit('userJoined', { nickname, room });
  });
});

// httpsIO.on('connection', (socket) => {
//   socket.on('chatting', (data) => {
//     const { name, msg } = data;
//     httpsIO.emit('chatting', {
//       name,
//       msg,
//       time: moment(new Date()).format('h:mm A'),
//     });

//     const chatMessage = new Chat({ name, msg, time: moment(new Date()).format('h:mm A') });

//     chatMessage.save()
//       .then(() => {
//         console.log('채팅 메시지 저장 성공');
//       })
//       .catch((error) => {
//         console.error('채팅 메시지 저장 오류:', error);
//       });
//   });

//   socket.on('requestHistory', () => {
//     Chat.find({})
//       .then((messages) => {
//         socket.emit('chattingHistory', messages);
//       })
//       .catch((error) => {
//         console.error('채팅 메시지 조회 오류:', error);
//       });
//   });

//   socket.on('join', (data) => {
//     const { nickname, room } = data;
//     socket.join(room);
//     socket.to(room).emit('userJoined', { nickname, room });
//   });
// });

// httpsServer.listen(HTTPS_PORT, () => {
//   console.log(`HTTPS server running on port ${HTTPS_PORT}`);
// });

console.log('HTTPS 서버 listen 전에 실행되는 코드');



// index.js 파일 부분
import { User } from './models/User.js';
// const User = require('./models/User.js');
// import { User } from './models/User.js';
// import User from './models/User.js';
// const user = new User({ name: 'John', email: 'john@example.com', username: 'john_doe' });
import staticServer from 'serve-static';
app.set("view engine", "ejs");

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import flash from 'express-flash';
import passportLocalMongoose from 'passport-local-mongoose';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash()); // express-flash 미들웨어를 사용합니다.

//db에서  받아오기 login
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));

passport.use(new LocalStrategy({
  usernameField: 'email'
}, async function(username, password, done) {
  try {
    const user = await User.findOne({ email: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    const authenticated = await user.authenticate(password);
    if (!authenticated) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "node js mongodb",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//여기까지---1차
app.get("/subscribe", isLoggedIn, function (req, res) {
  res.render('subscribe');
});
app.get("/chats", isLoggedIn, function (req, res) {
  // 현재 로그인한 사용자 정보를 가져옵니다.
  res.sendFile(__dirname+ '/src/chats.html'); // 사용자 정보를 뷰로 전달합니다.
  // dirname+ '/src/chats.html'+ 'channelId=' + channelId
});
//add2ed code
app.get("/",  function (req, res) {
  // 현재 로그인한 사용자 정보를 가져옵니다.
  res.sendFile(__dirname+ '/html/intro.html'); // 사용자 정보를 뷰로 전달합니다.
});
app.get("/userintro", isLoggedIn, function (req, res) {
  // 현재 로그인한 사용자 정보를 가져옵니다.
  res.sendFile(__dirname+ '/src/user_intropage.html'); // 사용자 정보를 뷰로 전달합니다.
});
app.get("/teamcreate", isLoggedIn,function (req, res) {

  res.sendFile(__dirname+ '/src/teamCreate.html'); // 사용자 정보를 뷰로 전달합니다.
});
app.use('/src', express.static('src'));
// app.use('/src', express.staticServer('src'));
// Showing secret page
app.get("/mypage", isLoggedIn, function (req, res) {
  res.render('mypage', { user: req.user });
});

// Showing register form
app.get("/register", function (req, res) {
  res.render('register', {
  title: 'Registration Page',
  name: '',
  email: '',
  password: ''    
})
});
// Handling user signup
app.post("/register", function (req, res) {
  var email = req.body.email
  var password = req.body.password
  var username = req.body.username;
  User.register(new User({username: username,email: email }),
          password, function (err, user) {
      
      if (err) {
          console.log(err);
          
          return res.render("register");
      }

      res.redirect('/login');
  });
});

//Showing login form
app.get("/login", function (req, res) {
  res.render('login', {
     title: 'Login',
     email: '',
     password: '',
     messages: req.flash('error')
 })
});
//Handling user login
app.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log('로그인 실패: ' + info.message); // 로그인 실패 시 메시지 출력
      return res.redirect("/login"); // 실패 시 리디렉션
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      
      return res.redirect("/teamcreate"); // 로그인 성공 시 리디렉션
    });
  })(req, res, next);
});

//Handling user logout
app.get("/logout", function (req, res) {
  req.logOut(err => {
    if (err) {
      return next(err);
    } else {
      console.log('로그아웃됨.');

      
      res.redirect('/');
    }
  });
});

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) return next();
//   else{ console.log('err');}
//   res.redirect("/login");
// }
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('로그인되지 않았습니다.');
    res.redirect("/login");
  }
}

app.listen(8084, function () {
  console.log("Server Has Started!");
});
// app.listen(PORT, () => {
//   console.log("Server Has Started!");
// });
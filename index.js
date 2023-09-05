const express = require('express')
const app = express() //새로운 앱 생성
const port = 8080
const bodyParser = require('body-parser');
const path = require('path');
const { User } = require("./models/User");
static = require('serve-static');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//db에서  받아오기 login

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
//여기까지---1차


const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://superb3739:superbuddy379300@superbuddy.iev3r.mongodb.net/', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.log(err);
});

app.listen(port, function() {
  console.log('console.log(`Example app listening on port ${port}')
})

//add2ed code

app.use('/',static(path.join(__dirname,'html')));

app.get('/login', function(요청, 응답){
  응답.render('login.ejs');
  

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.log("fail");
      return next(err);
    }
    if (!user) {
      console.log("fail"); // 실패 시에 로그 출력
      console.log('user detect failed')
      return res.redirect('/fail');
      
    }
    console.log("success"); // 성공 시에 로그 출력
    req.logIn(user, function(err) {
      if (err) {
        console.log("fail");
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});



});




passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) return done(err);
    if (!user) {
      console.log('No user found with this email')
      return done(null, false, { message: 'No user found with this email' });}

    // 비밀번호 비교
    user.comparePassword(password, (err, isMatch) => {
      if (err) return done(err);
      if (!isMatch) {
        console.log('Incorrect password')
        
        return done(null, false, { message: 'Incorrect password' });}

      return done(null, user);
    });
  });
}));


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/', // 로그인 성공 시 리다이렉트 경로
  failureRedirect: '/fail', // 로그인 실패 시 리다이렉트 경로
}));

app.get('/fail', (req, res) => {
  res.send('Login failed!');
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('You are logged in');
  } else {
    res.send('You are not logged in');
  }
});





////endcopyu





app.post('/register', (req, res) => {   
  // 클라이언트에서 전달되는 데이터에서 중복을 방지하는 로직 추가
  const { email } = req.body;

  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return res.json({ success: false, err });
    }
    
    if (existingUser) {
      return res.json({ success: false, err: "Email already exists" });
    }

    // 중복이 아니라면 새로운 유저 생성 및 저장
    const user = new User(req.body);
    user.save((err, userInfo) => {
      if (err) {
        return res.json({ success: false, err });
      }
      return res.status(200).json({ success: true });
    });
  });
});

const express = require('express')
const app = express() //새로운 앱 생성
const port = 8080
const bodyParser = require('body-parser');
const path = require('path');
const User = require("./models/User");
static = require('serve-static');
app.set("view engine", "ejs");

const flash = require('express-flash');
var passportLocalMongoose = require("passport-local-mongoose");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash()); // express-flash 미들웨어를 사용합니다.

//db에서  받아오기 login

const passport = require('passport');
var LocalStrategy = require("passport-local");
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
passport.use(new LocalStrategy({
  usernameField: 'email'
}, function(username, password, done) {
  User.findOne({ email: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Incorrect username.' }); }

    // passport-local-mongoose가 제공하는 함수를 사용하여 비밀번호를 비교합니다.
    user.authenticate(password, function(err, authenticated, error) {
      if (err) { return done(err); }
      if (!authenticated) { return done(null, false, { message: 'Incorrect password.' }); }
      return done(null, user);
    });
  });
}));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user);
  });
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


const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://superb3739:superbuddy379300@superbuddy.iev3r.mongodb.net/', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.log(err);
});



//add2ed code
app.get("/",  function (req, res) {
  // 현재 로그인한 사용자 정보를 가져옵니다.
  res.sendFile(__dirname+ '/html/intro.html'); // 사용자 정보를 뷰로 전달합니다.
});

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
      
      return res.redirect("/mypage"); // 로그인 성공 시 리디렉션
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
      res.redirect('/login');
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else{ console.log('err');}
  res.redirect("/login");
}


app.listen(port, function () {
  console.log("Server Has Started!");
});
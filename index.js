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
  
// 로그인 요청 시 authenticate함수를 이용
// local방식으로 아이디, 비밀번호 검사
/* before
app.post('/login', passport.authenticate('local', {
  // 로그인 실패 시 /fail 경로로 페이지 이동
  consolelog("fail"),
  failureRedirect : '/fail'
  
}), function(요청, 응답){
  console.log("success");
  // 로그인 성공 시 루트 경로로 페이지 이동
  응답.redirect('/')
});*/

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("fail"); // 실패 시에 로그 출력
      return res.redirect('/fail');
    }
    console.log("success"); // 성공 시에 로그 출력
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});



});


//added 3
// LocalStrategy 방식으로 아이디, 비밀번호 인증하는 코드
// strategy가 인증하는 방법을 의미하는 단어
passport.use(
  new LocalStrategy(
    {
      // form태그에 id와 pw라는 name을 가진 항목이 각각 아이디와 비밀번호라고 정의
      usernameField: "email",
      passwordField: "password",
      // 로그인 후 session 정보 저장할건지? 세션 정보 저장해야 다시 로그인 안해도 됨
      session: true,
      // 아이디, 비밀번호 말고 다른것도 인증해야하면 아래 코드를 True로 바꾸면 됨
      passReqToCallback: false,
      // 현재 아이디랑 비밀번호를 검증하는 코드
    },
    function (입력한아이디, 입력한비번, done) {
      console.log(입력한아이디, 입력한비번);
      // 데이터베이스에서 아이디 확인
      db.collection("users").findOne(
        { email: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);
          // 일치하는 아이디가 없으면(db에 아이디[결과]가 없으면 아래 코드 실행
          // done에는 파라미터 3개 넣을 수 있음
          // 첫번째 파라미터에는 서버 에러
          // 두번째 파라미터에는 성공 시 얻을 수 있는 사용자 데이터(만약 실패시 false)
          // 세번째 파라미터에는 에러 메시지
          if (!결과)
            return done(null, false, { message: "존재하지않는 아이디요" });
          // 일치하는 아이디가 있으면 비밀번호를 검사
          if (입력한비번 == 결과.password) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);


//fail 창
app.get('/fail', function(요청, 응답){
  응답.render('fail.ejs');
});
//------------------




// 로그인 유지 위해서는 세션 등록이 필요함
passport.serializeUser(function (user, done) {
  // id를 이용해서 세션을 저장시키는 코드(로그인 성공 시 실행됨)
  done(null, user.email);
});








////endcopyu



/*
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)//5000때 실행
})
*/

/*
app.post('/register',(req,res)=>{   
  //회원가입할 때 필요한 정보들을 client에서 가져오면,
  //그 정보들을 DB에 넣어준다.
  const user = new User(req.body);
  //user모델에 정보가 저장됨
  //실패 시, 실패한 정보를 보내줌
  user.save((err, userInfo) => {
      if(err) return res.json({success: false, err})
      return res.status(200).json({
          success: true
      })
  }) 
})
*/

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

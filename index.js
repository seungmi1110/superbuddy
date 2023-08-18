const express = require('express')
const app = express() //새로운 앱 생성
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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

app.get('/', function(req, res) {
  res.send('Hello World!')
})

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

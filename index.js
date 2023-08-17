const express = require('express')
const app = express() //새로운 앱 생성
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://superb3739:superbuddy379300!@@superbuddy.ko3a0qa.mongodb.net/', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.log(err);
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)//5000때 실행
})
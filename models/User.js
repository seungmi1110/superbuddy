const mongoose = require("mongoose"); //require을 해주는 순간 model method가 호출(schema가 등록)되어서 DB작업 시 Schema에 맞게 검사

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  }, // 유저의 이름
  email: {
    type: String,
    trim: true, // 중간의 space를 없애줌
    unique: 1, // 같은 이메일을 쓰지 못하게 unique 추가
  }, // 유저의 이메일
  password: {
    type: String,
    minlength: 5,
  }, //유저의 비밀번호
  lastname: {
    type: String,
    maxlength: 50,
  }, //유저의 lastname
  role: {
    type: Number, // 1: 관리자, 0: 일반유저 등의 형식으로 관리
    default: 0,
  }, // 유저의 역할(관리자, 일반유저 ...)
  image: String,
  token: {
    type: String,
  }, // 유효성 관리
  tokenExp: {
    type: Number,
  }, // 토큰의 유효기간
});

const User = mongoose.model("User", userSchema); //mongoose.model을 호출 할 때 Schema가 등록

module.exports = { User };
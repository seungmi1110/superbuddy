// var mongoose = require('mongoose');
// var passportLocalMongoose = require("passport-local-mongoose");

// var userSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     username: String,
//     registrationDate: { type: Date, default: Date.now }
//     // password 필드는 더 이상 직접 저장되지 않습니다.
// });

// userSchema.plugin(passportLocalMongoose);

// var User = mongoose.model('User', userSchema);

// module.exports = User;

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    registrationDate: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

export { User };

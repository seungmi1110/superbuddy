import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    registrationDate: { type: Date, default: Date.now },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }] // Board 스키마를 참조하는 배열 필드를 추가합니다.
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

export { User };

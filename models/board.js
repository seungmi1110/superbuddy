import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toHexString(),
        unique: true,
        comment: "게시판 고유번호",
    },
    subject: {
        type: String,
        maxLength: 300,
        required: true,
        comment: "게시판 제목",
    },
    author: {
        type: String,
        maxLength: 100,
        required: true,
        comment: "작성자",
    },
    content: {
        type: String,
        maxLength: 1000,
        required: true,
        comment: "게시판 내용",
    },
    watch: {
        type: Number,
        default: 0,
        required: true,
        comment: "조회수",
    }
}, {
    timestamps: true,
});

const Board = mongoose.model('Board', boardSchema);

export { Board };

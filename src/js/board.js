import express from 'express';

import { isLoggedIn } from '../../app.js';

import { Board } from '../../models/board.js';

const router = express.Router();


router.post('/create', isLoggedIn, async(req, res, next) => {
    const { subject, content, username } = req.body;
    try {
        const exSubject = await Board.findOne({ subject });
        if(exSubject) {
            return res.status(400).json({ error: 'Subject already exists' });
        }
        await Board.create({
            subject,
            content,
            author: req.body.username,
        });
        return res.redirect('/board');
    } catch(err) {
        console.error(err);
        return next(err);
    }
});
router.post('/update', isLoggedIn, async(req, res, next) => {
    const { subject, content } = req.body;
    try {
        await Board.update({
            subject: subject,
            content: content,
        }, {
            where: {id: req.body.bid}
        });
        return res.redirect('/board');
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

router.post('/delete', isLoggedIn, async(req, res, next) => {
    let bid = req.body.bid;
    try {
        await Board.destroy({
            where: {
                id: bid,
            }
        });
        return res.redirect('/board');
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

export default router;

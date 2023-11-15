const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('../app.js');

import { Board } from './models/board.js';

router.set('view engine', 'ejs');
router.post('/create', isLoggedIn, async(req, res, next) => {
    const { subject, content, nick } = req.body;
    try {
        const exSubject = await Board.findOne({ where: { subject }});
        if(exSubject) {
            return res.redirect('/create?error=exist');
        }
        await Board.create({
            subject,
            content,
            author: nick,
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

module.exports = router;
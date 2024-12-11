import { Router } from 'express';
const router = Router();

import { commentData, userData, postData } from '../data/index.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

router
    .route('/:userId')
    .get(async (req, res) => {
        try{
            let id = req.params.userId;
            id = validation.checkId(id);

            if (req.session.user) {
                if (req.session.user._id === id) {
                    return res.render("user_me", {user: req.session.user});
                }
            } else {
                const user = await userData.getUserById(id);
                return res.render("user", {user: user});
            }
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/:userId/comments')
    .get(async (req, res) => {
        try{
            let id = req.params.userId;
            id = validation.checkId(id);
            const user = await userData.getUserById(id);
            return res.render("user_comments", {user: user});
        } catch (e) {
            return res.status(404).render("404", {linkRoute: "/", linkDesc: "Return to the homepage"});
        }
    });

router
    .route('/:userId/likes')
    .get(async (req, res) => {
        try{
            let id = req.params.userId;
            id = validation.checkId(id);
            const user = await userData.getUserById(id);
            return res.render("user_liked", {user: user});
        } catch (e) {
            return res.status(404).render("404", {linkRoute: "/", linkDesc: "Return to the homepage"});
        }
    });

router
    .route('/:userId/dislikes')
    .get(async (req, res) => {
        try{
            let id = req.params.userId;
            id = validation.checkId(id);
            const user = await userData.getUserById(id);
            return res.render("user_disliked", {user: user});
        } catch (e) {
            return res.status(404).render("404", {linkRoute: "/", linkDesc: "Return to the homepage"});
        }
    });

router
    .route('/:userId/favorites')
    .get(async (req, res) => {
        try{
            let id = req.params.userId;
            id = validation.checkId(id);
            const user = await userData.getUserById(id);
            return res.render("user_favorites", {user: user});
        } catch (e) {
            return res.status(404).render("404", {linkRoute: "/", linkDesc: "Return to the homepage"});
        }
    });

// authenticated in middleware
router
    .route('/:userId/edit')
    .get(async (req, res) => {
        let id = req.params.userId;
        res.render("user_edit", {user: req.session.user});
    })
    .post(async (req, res) => {
        try {
            let id = validation.checkId(req.params.userId);
            let fields = req.body;

            let user = await userData.updateUser(id, fields);
            req.session.user = user;

            // TODO: possibly redirect with an alert message?
            res.redirect(`/users/${id}`);
        } catch (e) {
            return res.status(400).render("user_edit", {error: e});
        }
    });

router
    .route('/me')
    .get(async (req, res) => {
        if (req.session.user) {
            let id = req.session.user._id;
            return res.redirect(`/users/${id}`);
        } else {
            return res.redirect("/login");
        }
    });

export default router;

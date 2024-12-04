import { Router } from 'express';
const router = Router();

import { commentData, userData, postData } from '../data/index.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

router
    .route('/:userId')
    .get(async (req, res) => {
        try{
            // TODO: display page
            let id = req.params.userId;
            id = validation.checkId(id);
            const user = await userData.getUserById(id);
            return res.json(user);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/signup')
    .get(async (req, res) => {
        // TODO: display page
        return res.status(404).json({error: "Not implemented"});
    })
    .post(async (req, res) => {
        // TODO: hash password
        let username = validation.checkString(req.body.username, "username");
        let password = validation.checkString(req.body.password, "password");

        try{
            const user = await userData.addUser(username, password);
            return res.json(user);
        } catch (e) {
            return res.status(400).json({error: e});
        }
    });

router
    .route('/login')
    .get(async (req, res) => {
        // TODO: display page
        return res.status(404).json({error: "Not implemented"});
    })
    .post(async (req, res) => {
        // TODO: login
    });

router
    .route('/:userId/comments')
    .get(async (req, res) => {
        try{
            // TODO: display page
            let id = req.params.userId;
            id = validation.checkId(id);
            const comments = await userData.getCommentsByUserId(id);
            return res.json(comments);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/:userId/likes')
    .get(async (req, res) => {
        try {
            // TODO: display page
            let id = req.params.userId;
            id = validation.checkId(id);
            const posts = await userData.getLikedPostsByUserId(id);
            return res.json(posts);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/:userId/dislikes')
    .get(async (req, res) => {
        try {
            // TODO: display page
            let id = req.params.userId;
            id = validation.checkId(id);
            const posts = await userData.getDislikedPostsByUserId(id);
            return res.json(posts);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/:userId/favorites')
    .get(async (req, res) => {
        try {
            // TODO: display page
            let id = req.params.userId;
            id = validation.checkId(id);
            const posts = await userData.getFavoritePostsByUserId(id);
            return res.json(posts);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

router
    .route('/:userId/edit')
    .get(async (req, res) => {
        // TODO: display page, authentication
        return res.status(404).json({error: "Not implemented"});
    })
    .post(async (req, res) => {
        try {
            // TODO: authentication
            let id = validation.checkId(req.params.userId);
            let data = await userData.updateUser(id, req.body);
            return res.json(data);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    });

export default router;

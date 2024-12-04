import { Router } from 'express';
const router = Router();

import { userData } from '../data/index.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

router
    .route('/:userId')
    .get(async (req, res) => {
        let id = req.params.userId;
        id = validation.checkId(id);

        try{
            // TODO: display page
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

export default router;

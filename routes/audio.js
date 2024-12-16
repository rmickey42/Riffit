import { Router } from "express";
const router = Router();
import { audioData } from "../data/index.js";
import validation from "../validation.js";

// Route to get audio file by id
router.route('/:id').get(async (req, res) => {
    let audioId;
    try {
        audioId = validation.checkId(req.params.id, "Audio ID");
    } catch (e) {
        return res.status(400).json({ error: e });
    }

    try{
        const buffer = await audioData.getAudioById(audioId);
        return res.set('Content-Type', 'audio/mpeg').send(buffer);
    }catch(e){
        return res.status(404).json({error: e});
    }
});

export default router;
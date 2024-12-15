import { Router } from "express";
const router = Router();
import { audioData } from "../data/index.js";
import validation from "../validation.js";

// Route to get audio file by id
router.get('/:id.mp3', async (req, res) => {
    const audioId = req.params.id;

    const audio = await audioData.getAudioById(audioId);
});

export default router;
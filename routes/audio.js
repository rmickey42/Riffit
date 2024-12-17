import { Router } from "express";
const router = Router();
import { audioData } from "../data/index.js";
import validation from "../validation.js";

// Route to get audio file by id
router.get('/:id', async (req, res) => {
    const audioId = req.params.id;
    if (!audioId) {
        return res.status(400).json({ error: "No audio ID provided" });
    }
    if (!validation.checkId(audioId, "audio ID")) {
        return res.status(400).json({ error: "Invalid audio ID" });
    }
    
    try{
        const audio = await audioData.getAudioById(audioId);
        return res.set('Content-Type', 'audio/mpeg').send(audio);
    }catch(e){
        return res.status(404).json({error: e});
    }
});

export default router;
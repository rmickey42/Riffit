import { audio } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

const MAX_AUDIO_BYTES = 5000000; // 5MB

const exportedMethods = {
    async getAudioById(id) {
        id = validation.checkId(id, "Audio ID");
        const audioCollection = await audio();
        const audioData = await audioCollection.findOne({ _id: new ObjectId(id) });
        if (!audioData) throw "Error: Audio not found";

        return audioData.content.buffer;
    },

    async addAudio(file) {
        if (!file) {
            throw "No audio file provided";
        }
        if (file.mimetype !== "audio/mpeg") {
            throw "Audio must be a MP3/MPEG file";
        }
        if (file.size > MAX_AUDIO_BYTES) {
            throw "Audio file too large";
        }     

        const audioCollection = await audio();
        const newAudio = {
            content: file.buffer,
        };

        const newInsertInformation = await audioCollection.insertOne(newAudio);
        const newId = newInsertInformation.insertedId;
        if (newInsertInformation.insertedCount === 0) {
            throw 500;
        }
        return newId;
    },

    async removeAudio(id) {
        id = validation.checkId(id, "Audio ID");

        const audioCollection = await audio();
        const deletionInfo = await audioCollection.findOneAndDelete({
            _id: new ObjectId(id),
        });

        if (!deletionInfo) throw `Could not delete audio with id of ${id}`;
        return { ...deletionInfo, deleted: true };
    }
};

export default exportedMethods;
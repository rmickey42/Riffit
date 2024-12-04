import { Router } from "express";
const router = Router();
import { postData } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/:id")
  .get(async (req, res) => {
    //check inputs that produce 400 status
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try getting the post by ID
    try {
      const post = await postData.getPostById(req.params.id);
      return res.json(post);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .delete(async (req, res) => {
    //check the id
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to delete post
    try {
      let deletedPost = await postData.removePost(req.params.id);
      return res.json(deletedPost);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/:id/edit").patch(async (req, res) => {
  const requestBody = req.body;
  //check to make sure there is something in req.body
  if (!requestBody || Object.keys(requestBody).length === 0) {
    return res
      .status(400)
      .json({ error: "There are no fields in the request body" });
  }
  //check the inputs that will return 400 is fail
  try {
    req.params.id = validation.checkId(req.params.id, "Post ID");
    if (requestBody.title)
      requestBody.title = validation.checkString(requestBody.title, "Title");
    if (updatedData.notation) {
      updatedData.notation = validation.checkString(
        updatedData.notation,
        "Notation"
      );
    }
    if (updatedData.key) {
      updatedData.key = validation.checkString(updatedData.key, "Key");
    }
    if (updatedData.instrument) {
      updatedData.instrument = validation.checkString(
        updatedData.instrument,
        "Instrument"
      );
    }
    if (requestBody.tags)
      requestBody.tags = validation.checkStringArray(requestBody.tags, "Tags");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  //try to perform update
  try {
    const updatedPost = await postData.updatePostPatch(
      req.params.id,
      requestBody
    );
    return res.json(updatedPost);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
});

export default router;

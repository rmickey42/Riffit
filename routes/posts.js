import { Router } from "express";
const router = Router();
import { postData } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/:id")
  .get(async (req, res) => {
    //check inputs
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res.status(404).render("404", { linkRoute: "/posts/search", linkDesc: "Return to search page" });
    }
    //try getting the post by ID
    try {
      const post = await postData.getPostById(req.params.id);
      return res.render("post", { post: post });
    } catch (e) {
      return res.status(404).render("404", { linkRoute: "/posts/search", linkDesc: "Return to search page" });
    }
  })
  .delete(async (req, res) => {
    // TODO: auth, views
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
  // TODO: auth, views
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
    return res.status(400).render("post_edit", { error: e });
  }
  //try to perform update
  try {
    const updatedPost = await postData.updatePostPatch(
      req.params.id,
      requestBody
    );
    return res.json(updatedPost);
  } catch (e) {
    return res.status(400).render("post_edit", { error: "Internal Server Error" });
  }
});

router
  .route("/search")
  .get(async (req, res) => {
    try {
      console.log("Search Page")
      return res.render("search", { Title: "Search" });
    } catch (e) {
      return res.status(500).json({ error: e });
    }

  }).post(async (req, res) => {
    let tags = [];
    const tagCount = parseInt(req.body.tagCount);
    for (let i = 0; i < req.body.tagCount; i++) {
      tags.push(req.body["tag-input-" + (i + 1)]);
    }

    let sorting = req.body.sorting;

    if (!sorting) {
      sorting = "newest";
    }

    if (!Array.isArray(tags)) {
      return res.status(400).render("search", { error: "Tags must be an array" });
    }

    if (tags.length === 0) {
      return res.status(400).render("search", { error: "Tags must not be empty" });
    }

    try {
      const posts = await postData.getPostsByTags(tags);
      if (posts.length === 0) {
        return res.status(404).render("search", { error: "No Results" });
      } else {
        return res.render("search", { posts: posts });
      }
    } catch (e) {
      return res.status(500).render("search", { error: "Internal Server Error" });
    }
  });

export default router;

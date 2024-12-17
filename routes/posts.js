import { Router } from "express";
const router = Router();
import { postData, audioData, commentData } from "../data/index.js";
import validation from "../validation.js";
import multer from "multer";

router
  .route("/search")
  .get(async (req, res) => {
    return res.render("search", { session: req.session.user, Title: "Search" });
  }).post(async (req, res) => {
    let tags = validation.checkTags(req.body.tags);
    let sorting = req.body.sorting;

    if (!sorting) {
      sorting = "newest";
    }

    try {
      const posts = await postData.getPostsByTags(tags, sorting);
      if (posts.length === 0) {
        return res.status(404).render("search", { session: req.session.user,  Title: "Search", error: "No Results" });
      } else {
        return res.render("search", { session: req.session.user,  Title: "Search", posts: posts });
      }
    } catch (e) {
      return res.status(500).render("search", { session: req.session.user,  Title: "Search", error: "Internal Server Error" });
    }
  });

const upload = multer();

router.route("/new").get(async (req, res) => {
  return res.render("post_new", { session: req.session.user,  Title: "New Post" });
}).post(upload.single("audio"), async (req, res) => {
  const requestBody = req.body;

  //check to make sure there is something in req.body
  if (!requestBody || Object.keys(requestBody).length === 0) {
    return res.status(400).render("post_new", { session: req.session.user,  Title: "New Post", error: "No Data Provided" });
  }

  //check the inputs that will return 400 is fail
  try {
    requestBody.title = validation.checkString(requestBody.title, "Title");
    if (requestBody.notation) {
      requestBody.notation = validation.checkString(
        requestBody.notation,
        "Notation"
      );
    }
    if (requestBody.key) {
      requestBody.key = validation.checkString(requestBody.key, "Key");
    }
    if (requestBody.instrument) {
      requestBody.instrument = validation.checkString(
        requestBody.instrument,
        "Instrument"
      );
    }
    
    if (requestBody.tags) {
      requestBody.tags = validation.checkTags(requestBody.tags, "Tags");
    }
  } catch (e) {
    return res.status(400).render("post_new", { session: req.session.user, Title: "New Post", error: e });
  }

  // audio file upload; audio data interface will handle validation
  let audioId = null;
  try {
    audioId = await audioData.addAudio(req.file);
  } catch (e) {
    if (e === 500) {
      return res.status(500).render("post_new", { session: req.session.user, Title: "New Post", error: "Internal Server Error: Audio could not be uploaded" });
    } else {
      return res.status(400).render("post_new", { session: req.session.user, Title: "New Post", error: e });
    }
  }
  

  //try to perform update
  try {
    const newPost = await postData.addPost(
      requestBody.title,
      req.session.user._id,
      audioId.toString(),
      requestBody.notation,
      requestBody.key,
      requestBody.instrument,
      requestBody.tags
    );
    return res.redirect(`/posts/${newPost._id}`);
  } catch (e) {
    return res.status(500).render("post_new", { session: req.session.user, Title: "New Post", error: "Internal Server Error: Post could not be created" });
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    //check inputs
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res.status(400).render("error", { session: req.session.user, 
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "400 Bad Request",
        errorDesc: "Invalid ID!",
        Title: "400 Bad Request",
      });
    }
    //try getting the post by ID
    try {
      const post = await postData.getPostById(req.params.id);
      return res.render("single_post", { session: req.session.user, post: post });
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user, 
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  })
  .delete(async (req, res) => { // auth completed; not tested
    // validation
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res.status(400).render("error", { session: req.session.user, 
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "400 Bad Request",
        errorDesc: "Invalid ID!",
        Title: "400 Bad Request",
      });
    }

    //try to delete post
    try {
      let deletedPost = await postData.removePost(req.params.id);
      return res.redirect("/users/me")
    } catch (e) {
      return res.status(500).render("error", { session: req.session.user, 
        linkRoute: "/users/me",
        linkDesc: "Return to your profile",
        errorName: "500 Internal Server Error",
        errorDesc: "Unable to delete post",
        Title: "500 Internal Server Error",
      });
    }
  });

// auth in middleware
router.route("/:id/edit")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id, "Post ID");
    } catch (e) {
      return res.status(400).render("error", { session: req.session.user, 
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "400 Bad Request",
        errorDesc: "Invalid ID!",
        Title: "400 Bad Request",
      });
    }
    try {
      const post = await postData.getPostById(req.params.id);
      return res.render("post_edit", { post: post, Title: "Edit Post" });
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user, 
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  })
  .post(async (req, res) => {
    const requestBody = req.body;
    let post = null;
    try {
      post = await postData.getPostById(req.params.id);
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user, 
        linkRoute: "/users/me",
        linkDesc: "Return to your profile",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }

    //check to make sure there is something in req.body
    if (!requestBody || Object.keys(requestBody).length === 0) {
      return res.status(400).render("post_edit", { session: req.session.user, Title: "Edit Post", post: post, error: "No Data Provided" });
    }

    let updatedData = {};
    //check the inputs that will return 400 is fail
    try {
      req.params.id = validation.checkId(req.params.id, "Post ID");
      if (requestBody.title)
        updatedData.title = validation.checkString(requestBody.title, "Title");
      if (requestBody.notation) {
        updatedData.notation = validation.checkString(
          requestBody.notation,
          "Notation"
        );
      }
      if (requestBody.key) {
        updatedData.key = validation.checkString(requestBody.key, "Key");
      }
      if (requestBody.instrument) {
        updatedData.instrument = validation.checkString(
          requestBody.instrument,
          "Instrument"
        );
      }
      if (requestBody.tags) {
        updatedData.tags = validation.checkTags(requestBody.tags);
      }
    } catch (e) {
      return res.status(400).render("post_edit", { session: req.session.user, Title: "Edit Post", post: post, error: e });
    }

    //try to perform update
    try {
      const updatedPost = await postData.updatePost(
        req.params.id,
        updatedData
      );
      return res.redirect(`/posts/${updatedPost._id}`);
    } catch (e) {
      return res.status(500).render("post_edit", { session: req.session.user, Title: "Edit Post", post: post, error: "Internal Server Error" });
    }
  });

router.route("/:id/like").post(async (req, res) => {
  let postId = req.params.id;
  try {
    postId = validation.checkId(postId, "Post ID");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  // check if attempting to reverse like
  let reverse = req.body.reverse;
  if (reverse === "true" || reverse === true) reverse = true;
  else reverse = false;

  try {
    const post = await postData.postLike(postId, req.session.user._id, !reverse);
    req.session.user = await userData.getUserById(req.session.user._id);
    return res.json({success: true});
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});
router.route("/:id/dislike").post(async (req, res) => {
  let postId = req.params.id;
  try {
    postId = validation.checkId(postId, "Post ID");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  // check if attempting to reverse dislike
  let reverse = req.body.reverse;
  if (reverse === "true" || reverse === true) reverse = true;
  else reverse = false;

  try {
    const post = await postData.postDislike(postId, req.session.user._id, !reverse);
    req.session.user = await userData.getUserById(req.session.user._id);
    return res.json({success: true});
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});
router.route("/:id/favorite").post(async (req, res) => {
  let postId = req.params.id;
  try {
    postId = validation.checkId(postId, "Post ID");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  // check if attempting to reverse favorite
  let reverse = req.body.reverse;
  if (reverse === "true" || reverse === true) reverse = true;
  else reverse = false;

  try {
    const post = await postData.postFavorite(postId, req.session.user._id, !reverse);
    req.session.user = await userData.getUserById(req.session.user._id);
    return res.json({success: true});
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router.route("/:id/comments")
.get(async (req, res) => {
  let postId = req.params.id;
  try {
    postId = validation.checkId(postId, "Post ID");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const comments = await commentData.getCommentsByPostId(postId);
    return res.status(200).json(comments);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
})
.post(async (req, res) => {
  let postId = req.params.id;
  let comment = req.body.comment;
  try {
    postId = validation.checkId(postId, "Post ID");
    comment = validation.checkString(comment, "Comment");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  
  try {
    const post = await commentData.addComment(comment, req.session.user._id, postId);
    req.session.user = await userData.getUserById(req.session.user._id);
    return res.status(200).json({success: true});
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

export default router;

import { Router } from "express";
const router = Router();

import { commentData, userData, postData } from "../data/index.js";
import validation from "../validation.js";
import multer from "multer";

router
  .route("/me")
  .get(async (req, res) => {
    if (req.session.user) {
      let id = req.session.user._id;
      return res.redirect(`/users/${id}`);
    } else {
      return res.redirect("/login");
    }
  });

router
  .route("/:userId")
  .get(async (req, res) => {
    try {
      let id = validation.checkId(req.params.userId, "User Id");
      const user = await userData.getUserById(id);
      const profileOwner = req.session.user && req.session.user._id === id;
      const posts = await postData.getPostsByUserId(id, 0);
      return res.render("user", {
        session: req.session.user,
        user: user,
        Title: user.username,
        profileOwner: profileOwner,
        posts: posts
      });
    } catch (e) {
      console.log(e)
      return res.status(404).render("error", {
        session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found"
      });
    }
  });

router.route("/:userId/comments").get(async (req, res) => {
  try {
    let id = req.params.userId;
    id = validation.checkId(id, "User Id");
    const user = await userData.getUserById(id);
    const comments = await commentData.getCommentsByIds(user.comments);
    return res.render("user_comments", {
      session: req.session.user,
      user: user,
      comments: comments,
      Title: `${user.username}'s Comments`
    });
  } catch (e) {
    return res.status(404).render("error", {
      session: req.session.user,
      linkRoute: "/",
      linkDesc: "Return to the homepage",
      errorName: "404 Not Found",
      errorDesc: "This page doesn't exist!",
      Title: "404 Not Found"
    });
  }
});

router
  .route("/:userId/likes")
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id, "User Id");
      const user = await userData.getUserById(id);
      const posts = await postData.getPostsByIds(user.likedPosts);
      return res.render("user_liked", { session: req.session.user,
        user: user,
        posts: posts,
        Title: `${user.username}'s Likes`,
      });
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  });

router
  .route("/:userId/dislikes")
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id, "User Id");
      const user = await userData.getUserById(id);
      const posts = await postData.getPostsByIds(user.dislikedPosts);
      return res.render("user_disliked", { session: req.session.user,
        user: user,
        posts: posts,
        Title: `${user.username}'s Dislikes`,
      });
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  });

router
  .route("/:userId/favorites")
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id, "User Id");
      const user = await userData.getUserById(id);
      const posts = await postData.getPostsByIds(user.favoritePosts);
      return res.render("user_favorites", { session: req.session.user,
        user: user,
        posts: posts,
        Title: `${user.username}'s Favorites`,
      });
    } catch (e) {
      return res.status(404).render("error", { session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  });

const upload = multer();

router
  .route("/:userId/edit")
  .get(async (req, res) => {
    try {
      let id = validation.checkId(req.params.userId, "User Id");
      const user = await userData.getUserById(id);
      const defaultPic = "/public/img/defaultPfp.jpeg";
      return res.render("user_edit", {
        session: req.session.user,
        user: user,
        Title: "Edit Profile",
        defaultPic: defaultPic
      });
    } catch (e) {
      return res.status(404).render("error", {
        session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  })
  .post(upload.any(), async (req, res) => {
    try {
      let id = validation.checkId(req.params.userId, "User Id");

      let { bio, instruments, genres } = req.body;

      let userInfo = { bio, instruments, genres };

      if (req.body.deletePicture === "true") {
        userInfo.picture = "DELETE";
      } else if (req.files && req.files.length > 0) {
        let picture = req.files[0];
        validation.checkProfilePicture(picture)
        
        userInfo.picture = picture;
      }

      if (bio !== undefined) {
        if (bio.trim() === "") {
          userInfo.bio = "";
        } else {
          bio = validation.checkStrType(bio, "Bio");
          userInfo.bio = bio;
        }
      }

      if (instruments !== undefined) {
        if (instruments.trim() === "") {
          userInfo.instruments = [];
        } else {
          instruments = validation.checkStringArray(
            instruments.split(","),
            "Instruments"
          );
          userInfo.instruments = instruments;
        }
      }

      if (genres !== undefined) {
        if (genres.trim() === "") {
          userInfo.genres = [];
        } else {
          genres = validation.checkStringArray(genres.split(","), "Genres");
          userInfo.genres = genres;
        }
      }

      let updatedUser = await userData.updateUser(id, userInfo);
      req.session.user = updatedUser;

      return res.redirect(`/users/${id}`);
    } catch (e) {
      return res
        .status(400)
        .render("user_edit", { error: e, Title: "Edit Profile", session: req.session.user});
    }
  });

router.route("/:userId/picture").get(async (req, res) => {
  try {
    let id = validation.checkId(req.params.userId, "User Id");
    let user = await userData.getUserById(id);
    if (user.picture === "/public/img/defaultPfp.jpeg") {
      let picturePath = "public/img/defaultPfp.jpeg";
      return res.sendFile(picturePath, { root: "." });
    } else {
      return res.contentType("image/jpeg").send(user.picture.buffer);
    }
  } catch (e) {
    return res.status(404).json("404 Not Found");
  }
});

export default router;

import { Router } from "express";
const router = Router();

import { commentData, userData, postData } from "../data/index.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import multer from "multer";

router
  .route("/me") //working
  .get(async (req, res) => {
    if (req.session.user) {
      let id = req.session.user._id;
      return res.redirect(`/users/${id}`);
    } else {
      return res.redirect("/login");
    }
  });

router
  .route("/:userId") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);

      const user = await userData.getUserById(id);

      const profileOwner = req.session.user && req.session.user._id === id;

      return res.render("user", {
        user: user,
        Title: user.username,
        profileOwner: profileOwner
      });
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/:userId/comments").get(async (req, res) => {
  try {
    let id = req.params.userId;
    id = validation.checkId(id);
    const user = await userData.getUserById(id);
    return res.render("user_comments", {
      user: user,
      Title: `${user.username}'s Comments`,
    });
  } catch (e) {
    return res.status(404).render("404", {
      linkRoute: "/",
      linkDesc: "Return to the homepage",
      errorName: "404 Not Found",
      errorDesc: "This page doesn't exist!"
    });
  }
});

router
  .route("/:userId/likes") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_liked", {
        user: user,
        Title: `${user.username}'s Likes`,
      });
    } catch (e) {
      return res.status(404).render("404", {
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  });

router
  .route("/:userId/dislikes") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_disliked", {
        user: user,
        Title: `${user.username}'s Dislikes`,
      });
    } catch (e) {
      return res.status(404).render("404", {
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
  });

router
  .route("/:userId/favorites") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_favorites", {
        user: user,
        Title: `${user.username}'s Favorites`,
      });
    } catch (e) {
      return res.status(404).render("404", {
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
  .route("/:userId/edit") // test profile pic
  .get(async (req, res) => {
    let id = req.params.userId;
    const user = await userData.getUserById(id);
    return res.render("user_edit", { user: user, Title: "Edit Profile" });
  })
  .post(upload.any(), async (req, res) => {
    let id = req.params.userId;
    try {
      id = validation.checkId(id);
    } catch (e) {
      return res.status(404).render("error", {
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "404 Not Found",
        errorDesc: "This page doesn't exist!",
        Title: "404 Not Found",
      });
    }
    try {
      let { bio, instruments, genres } = req.body;
      bio = validation.checkString(bio, "Bio");
      instruments = validation.checkStringArray(
        instruments.split(","),
        "Instruments"
      );
      genres = validation.checkStringArray(genres.split(","), "Genres");
      let picture = req.files.profilePicture;

      let userInfo = { bio, instruments, genres, picture };

      if (!picture) delete userInfo.picture;
      else if (picture.mimetype !== 'image/jpeg') throw "Invalid image type for profile picture: " + picture.mimetype;

      let updatedUser = await userData.updateUser(id, userInfo);
      req.session.user = updatedUser;

      return res.redirect(`/users/${id}`);
    } catch (e) {
      return res
        .status(400)
        .render("user_edit", { error: e, Title: "Edit Profile" });
    }
  });

export default router;

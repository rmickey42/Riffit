import { Router } from "express";
const router = Router();

import { commentData, userData, postData } from "../data/index.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import multer from "multer";
import session from "express-session";

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
      let id = validation.checkId(req.params.userId, "User Id");

      const user = await userData.getUserById(id);

      const profileOwner = req.session.user && req.session.user._id === id;

      const posts = await postData.getPostsByUserId(id);

      return res.render("user", {
        session: req.session.user,
        user: user,
        Title: user.username,
        profileOwner: profileOwner,
        posts: posts,
      });
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/:userId/comments").get(async (req, res) => {
  try {
    let id = req.params.userId;
    id = validation.checkId(id, "user Id");
    const user = await userData.getUserById(id);
    return res.render("user_comments", {
      session: req.session.user,
      user: user,
      Title: `${user.username}'s Comments`,
    });
  } catch (e) {
    return res.status(404).render("404", {
      session: req.session.user,
      linkRoute: "/",
      linkDesc: "Return to the homepage",
      errorName: "404 Not Found",
      errorDesc: "This page doesn't exist!",
    });
  }
});

router
  .route("/:userId/likes") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id, "user Id");
      const user = await userData.getUserById(id);
      return res.render("user_liked", {
        session: req.session.user,
        user: user,
        Title: `${user.username}'s Likes`,
      });
    } catch (e) {
      return res.status(404).render("404", {
        session: req.session.user,
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
      id = validation.checkId(id, "user Id");
      const user = await userData.getUserById(id);
      return res.render("user_disliked", {
        session: req.session.user,
        user: user,
        Title: `${user.username}'s Dislikes`,
      });
    } catch (e) {
      return res.status(404).render("404", {
        session: req.session.user,
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
      id = validation.checkId(id, "user Id");
      const user = await userData.getUserById(id);
      return res.render("user_favorites", {
        session: req.session.user,
        user: user,
        Title: `${user.username}'s Favorites`,
      });
    } catch (e) {
      return res.status(404).render("404", {
        session: req.session.user,
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
    try {
      let id = validation.checkId(req.params.userId, "User Id");
      const user = await userData.getUserById(id);
      const defaultPic = "/public/img/defaultPfp.jpeg";
      return res.render("user_edit", {
        session: req.session.user,
        user: user,
        Title: "Edit Profile",
        defaultPic: defaultPic,
      });
    } catch (e) {
      return res.status(404).render("error", {
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

        if (picture.mimetype !== "image/jpeg") {
          throw "Invalid image type for profile picture: " + picture.mimetype;
        }
        if (picture.size > validation.MAX_PFP_SIZE) {
          throw "Profile picture is too large! Must be a JPEG image < 1MB";
        }
        userInfo.picture = picture;
      }

      if (bio !== undefined) {
        if (bio.trim() === "") {
          userInfo.bio = "";
        } else {
          bio = validation.checkString(bio, "Bio");
          userInfo.bio = bio;
        }
      }

      if (instruments) {
        instruments = validation.checkStringArray(
          instruments.split(","),
          "Instruments"
        );
        userInfo.instruments = instruments;
      }

      if (genres) {
        genres = validation.checkStringArray(genres.split(","), "Genres");
        userInfo.genres = genres;
      }

      let updatedUser = await userData.updateUser(id, userInfo);
      req.session.user = updatedUser;

      return res.redirect(`/users/${id}`);
    } catch (e) {
      return res
        .status(400)
        .render("user_edit", { error: e, Title: "Edit Profile" });
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

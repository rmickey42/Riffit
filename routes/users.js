import { Router } from "express";
const router = Router();

import { commentData, userData, postData } from "../data/index.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

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

      const currentUser = req.session.user && req.session.user._id === id;

      if (currentUser) {
        return res.render("user", {
          user: req.session.user,
          Title: req.session.user.username,
          profileOwner: true
        });
      } else {
        return res.render("user", { user: user, Title: user.username });
      }
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/:userId/comments").get(async (req, res) => {
  try {
    let id = req.params.userId;
    id = validation.checkId(id);
    const user = await userData.getUserById(id);
    return res.render("user_comments", { user: user, Title: `${user.username}'s Comments` });
  } catch (e) {
    return res
      .status(404)
      .render("404", { linkRoute: "/", linkDesc: "Return to the homepage", Title: "404 Not Found"});
  }
});

router
  .route("/:userId/likes") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_liked", { user: user, Title: `${user.username}'s Likes` });
    } catch (e) {
      return res
        .status(404)
        .render("404", { linkRoute: "/", linkDesc: "Return to the homepage", Title: "404 Not Found" });
    }
  });

router
  .route("/:userId/dislikes") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_disliked", { user: user, Title: `${user.username}'s Dislikes` });
    } catch (e) {
      return res
        .status(404)
        .render("404", { linkRoute: "/", linkDesc: "Return to the homepage", Title: "404 Not Found" });
    }
  });

router
  .route("/:userId/favorites") //working
  .get(async (req, res) => {
    try {
      let id = req.params.userId;
      id = validation.checkId(id);
      const user = await userData.getUserById(id);
      return res.render("user_favorites", { user: user, Title: `${user.username}'s Favorites` });
    } catch (e) {
      return res
        .status(404)
        .render("404", { linkRoute: "/", linkDesc: "Return to the homepage", Title: "404 Not Found" });
    }
  });

// authenticated in middleware
router
  .route("/:userId/edit") //working, nothing in userId/edit
  .get(async (req, res) => {
    let id = req.params.userId;
    const user = await userData.getUserById(id);
    return res.render("user_edit", { user: user, Title: "Edit Profile" });
  })
  .post(async (req, res) => {
    try {
      let id = validation.checkId(req.params.userId);
      let { bio, instruments, genres } = req.body;

      console.log("BIO: " + bio);
      console.log("Ins: " + instruments);
      console.log("GENRES: " + genres);

      if (typeof bio !== "string") throw "Bio must be a string.";

      instruments = validation.checkStringArray(
        instruments.split(","),
        "Instruments"
      );
      genres = validation.checkStringArray(genres.split(","), "Genres");

      let userInfo = { bio, instruments, genres };

      let user = await userData.updateUser(id, userInfo);
      req.session.user = user;

      // TODO: possibly redirect with an alert message?
      return res.redirect(`/users/${id}`);
    } catch (e) {
      return res.status(400).render("user_edit", { error: e });
    }
  });

export default router;

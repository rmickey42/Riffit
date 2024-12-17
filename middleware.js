import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import validation from "./validation.js";
import methodOverride from "method-override";

import postsData from "./data/posts.js";

const AUTH_SECRET = "AuThSeCrEt12345";

const authUserMiddleware = async (req, res, next) => {
  try {
    let id = validation.checkId(req.params.userId, "User ID");
    if (req.session.user) {
      if (req.session.user._id === id) {
        next();
      } else if (req.session.user) {
        return res.status(401).render("error", { session: req.session.user,
          linkRoute: "/user/me",
          linkDesc: "Return to your profile",
          errorName: "Unauthorized Access",
          errorDesc: "You do not have permission to view this page.",
        });
      }
    } else {
      return res
        .status(401)
        .render("error", { session: req.session.user,
          linkRoute: "/login",
          linkDesc: "Login",
          errorName: "Unauthorized Access",
          errorDesc: "You do not have permission to view this page.",
        });
    }
  } catch (e) {
    return res
      .status(404)
      .render("error", { session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "Page Doesn't Exist",
        errorDesc: "This page doesn't exist!"
      });
  }
};

const authPostMiddleware = async (req, res, next) => {
  try {
    let postId = validation.checkId(req.params.id, "Post ID");
    let post = await postsData.getPostById(postId);
    let id = post.userId;
    if (req.session.user) {
      if (req.session.user._id === id) {
        next();
      } else {
        return res.status(401).render("error", { session: req.session.user,
          linkRoute: "/user/me",
          linkDesc: "Return to your profile",
          errorName: "Unauthorized Access",
          errorDesc: "You do not have permission to view this page.",
        });
      }
    } else {
      return res
        .status(401)
        .render("error", { session: req.session.user,
          linkRoute: "/login",
          linkDesc: "Login",
          errorName: "Unauthorized Access",
          errorDesc: "You do not have permission to view this page.",
        });
    }
  } catch (e) {
    return res
      .status(404)
      .render("error", { session: req.session.user,
        linkRoute: "/",
        linkDesc: "Return to the homepage",
        errorName: "Page Doesn't Exist",
        errorDesc: "This page doesn't exist!"
      });
  }
};

const signedInMiddleware = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.redirect("/login");
  }
};


const constructorMethod = (app) => {
  // setup handlebars
  const handlebars = exphbs.create({
    defaultLayout: "main",
    layoutsDir: "./views/layouts",
    partialsDir: "./views/partials",
    helpers: {
      inList (options) { 
        const { list, value } = options.hash;
        if(list.includes(value)) return options.fn(this);
        else return "";
      }
    }
  });
  app.engine(
    "handlebars",
    exphbs.engine({
      defaultLayout: "main",
      helpers: { equals: (a, b) => a === b },
    })
  );
  app.set("view engine", "handlebars");

  app.use(express.json()); // json encoding for POSTs
  app.use(express.urlencoded()); // url encoding for API

  app.use(
    session({
      name: "AuthenticationState",
      secret: AUTH_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );

  app.use("/public", express.static("public"));

  app.use(methodOverride("_method"));

  // Middleware: records timestamp of every request - shows if user is authenticated or not
  app.use((req, res, next) => {
    let authenticationStatus;

    if (req.session.user) authenticationStatus = "Authenticated";
    else authenticationStatus = "Non-Authenticated";

    console.log(
      `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} ${req.session.user ? "Authenticated" : "Non-Authenticated"
      }`
    );

    req.authenticationStatus = authenticationStatus;
    next();
  });

  //  Middleware: checks to make sure user is logged in (authenticated) and brings them to search [homepage]
  //  otherwise, they are directed to login page. Here they can choose to sign up if necessary.

  app.use("/", (req, res, next) => {
    if (req.path === "/") {
      if (req.authenticationStatus === "Authenticated") {
        return res.redirect("/users/me");
      } else {
        return res.redirect("/login");
      }
    }
    next();
  });

  // Middleware: user authentication
  app.use("/users/:userId/edit", authUserMiddleware);
  app.use("/posts/:id/edit", authPostMiddleware);
  app.use("/posts/new", signedInMiddleware);
  app.use("/posts/:id/favorite", signedInMiddleware);
  app.use("/posts/:id/dislike", signedInMiddleware);
  app.use("/posts/:id/like", signedInMiddleware);
  app.delete("/posts/:id", authPostMiddleware);
};

export default constructorMethod;

import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import validation from "./validation.js";

const constructorMethod = (app) => {
  // setup handlebars
  const handlebars = exphbs.create({
    defaultLayout: "main",
    layoutsDir: "./views/layouts",
    partialsDir: "./views/partials",
  });
  app.engine("handlebars", handlebars.engine);
  app.set("view engine", "handlebars");

  app.use(express.json()); // json encoding for POSTs
  app.use(express.urlencoded()); // url encoding for API

  app.use(
    session({
      name: "AuthenticationState",
      secret: "AuThSeCrEt12345",
      saveUninitialized: false,
      resave: false,
    })
  );

  app.use("/public", express.static("public"));

  // Middleware: records timestamp of every request - shows if user is authenticated or not
  app.use((req, res, next) => {
    let authenticationStatus;

    if (req.session.user) authenticationStatus = "Authenticated";
    else authenticationStatus = "Non-Authenticated";

    console.log(
      `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} ${
        req.session.user ? "Authenticated" : "Non-Authenticated"
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
        // redirect to search. Homepage?
        return res.redirect("/users/me");
      } else {
        return res.redirect("/login");
      }
    }
    next();
  });

  app.use("/:userId/edit", (req, res, next) => {
    try {
      let id = validation.checkId(req.params.userId);
      if (req.session.user) {
        if (req.session.user._id === id) {
          next();
        } else {
          return res.status(401).render("401", {
            linkRoute: "/user/me",
            linkDesc: "Return to your profile",
          });
        }

        return res.status(401).render("401", {
          linkRoute: "/user/me",
          linkDesc: "Return to your profile",
        });
      } else {
        return res
          .status(401)
          .render("401", { linkRoute: "/login", linkDesc: "Login" });
      }
    } catch (e) {
      return res
        .status(404)
        .render("404", { linkRoute: "/", linkDesc: "Return to the homepage" });
    }
  });
};

export default constructorMethod;

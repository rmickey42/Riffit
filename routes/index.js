

const constructorMethod = (app) => {
  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

export default constructorMethod;
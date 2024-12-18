import postRoutes from './posts.js';
import userRoutes from './users.js';
import audioRoutes from './audio.js'
import postData from '../data/posts.js';
import {router as auth_routes} from './auth_routes.js';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  app.use('/posts', postRoutes);
  app.use('/users', userRoutes);
  app.use("/audio", audioRoutes)
  app.use(auth_routes);

  app.use('/home', async (req, res) => {
    try {
      const posts = await postData.getPostsByTags([], 1, 'most_popular');
      if (posts.length === 0) {
        return res.status(404).render("home", { session: req.session.user,  Title: "Home", error: "No Results" });
      } else {
        return res.render("home", { session: req.session.user,  Title: "Home", posts: posts });
      }
    } catch (e) {
      return res.status(500).render("Home", { session: req.session.user,  Title: "Home", error: "Internal Server Error" });
    }
  });

  app.use('/public', staticDir('public'));

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" }); //All other URLS should return a 404
  });
};

export default constructorMethod;
import postRoutes from './posts.js';
import userRoutes from './users.js';
import {router as auth_routes} from './auth_routes.js';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  app.use('/posts', postRoutes);
  app.use('/users', userRoutes);
  app.use(auth_routes);

  app.use('/public', staticDir('public'));

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" }); //All other URLS should return a 404
  });
};

export default constructorMethod;
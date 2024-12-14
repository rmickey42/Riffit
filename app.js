import express from "express";
import configRoutes from "./routes/index.js";
import configMiddleware from "./middleware.js"

const app = express();

configMiddleware(app);
configRoutes(app);

app.listen(3000, ()=>{
    console.log('Your routes will be running on http://localhost:3000');
});

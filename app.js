import express from "express";
import configRoutes from "./routes/index.js";
import configMiddleware from "./middleware.js"

const app = express();

configMiddleware(app);
configRoutes(app);

app.listen(80, ()=>{
    console.log(`Server listening on http://localhost/`)
});

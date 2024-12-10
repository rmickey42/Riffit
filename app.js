import express from "express";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";



const app = express();


// setup handlebars
const handlebars = exphbs.create({
	defaultLayout: "main",
	layoutsDir: "./views/layouts"
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");



app.use(express.json()); // json encoding for POSTs
app.use(express.urlencoded()); // url encoding for API


app.use(session({
    name: "AuthenticationState",
    secret: "AuThSeCrEt12345",
    saveUninitialized: false,
    resave: false
}))

configRoutes(app)

app.listen(80, ()=>{
    console.log(`Server listening on http://localhost/`)
})

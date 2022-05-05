const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "10mb", type: "application/json" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const db = require("./app/models");
const Role = db.role;

function initial() {
  Role.create({
    id: 1,
    name: "user",
  });
  Role.create({
    id: 2,
    name: "moderator",
  });
  Role.create({
    id: 3,
    name: "admin",
  });
}

// force sync role model everytime
Role.sync({ force: true })
  .then(() => {
    console.log("sync role model.");
    initial();
  })
  .catch((err) => {
    console.log(err);
  });

// sync relations
db.sequelize.sync();

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
console.log(process.env.DB);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

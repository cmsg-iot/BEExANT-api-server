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
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const db = require("./app/models");
const Role = db.role;
const User = db.user;
const File = db.file;
const FileTag = db.fileTag;

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
// db.sequelize.sync();

// sync each model
Role.sync({ force: true })
  .then(() => {
    console.log("sync role model.");
    initial();
  })
  .catch((err) => {
    console.log(err);
  });

User.sync();
File.sync();
FileTag.sync();

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
console.log(process.env.DB);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

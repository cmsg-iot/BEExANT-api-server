const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            console.log("/--------SignUp Success--------/");
            console.log(
              `User: ${req.body.username}\nHost: ${req.headers.host}\nAgent: ${
                req.headers["user-agent"]
              }\nTime: ${new Date(Date.now())}\nRole: ${
                req.body.roles
              }\nMessage: User was registered successfully!`
            );
            console.log("/-----------------------------/\n");
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          console.log("/--------SignUp Success--------/");
          console.log(
            `User: ${req.body.username}\nHost: ${req.headers.host}\nAgent: ${
              req.headers["user-agent"]
            }\nTime: ${new Date(
              Date.now()
            )}\nRole: user\nMessage: User was registered successfully!`
          );
          console.log("/-----------------------------/\n");
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch((err) => {
      console.log("/--------SignUp Failed--------/");
      console.log(
        `User: ${req.body.username}\nHost: ${req.headers.host}\nAgent: ${
          req.headers["user-agent"]
        }\nTime: ${new Date(Date.now())}\nMessage: ${err.message}`
      );
      console.log("/-----------------------------/\n");
      res.status(400).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 1800, // 30 minutes
      });

      var authorities = [];
      user.getRoles().then(async (roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        res.cookie("authcookie", token, {
          maxAge: 1800 * 1000,
          httpOnly: true,
          sameSite: "lax",
        });
        console.log("/--------Login Success--------/");
        console.log(
          `User: ${req.body.username}\nHost: ${req.headers.host}\nAgent: ${
            req.headers["user-agent"]
          }\nTime: ${new Date(Date.now())}\nMessage: login success!`
        );
        console.log("/-----------------------------/\n");
        res.status(200).send("login success");
      });
    })
    .catch((err) => {
      console.log("/--------Login Failed--------/");
      console.log(
        `User: ${req.body.username}\nHost: ${req.headers.host}\nAgent: ${
          req.headers["user-agent"]
        }\nTime: ${new Date(Date.now())}\nMessage: ${err.message}`
      );
      console.log("/-----------------------------/\n");
      res.status(400).send({ message: err.message });
    });
};

exports.setcookie = (req, res) => {
  console.log(req.cookies.authcookie);
  User.update(
    {
      token: req.cookies.authcookie,
      updatedAt: new Date(),
    },
    { where: { username: req.body.username } }
  );
};

exports.logout = (req, res) => {
  User.update(
    {
      token: "",
      updatedAt: new Date(),
    },
    { where: { token: req.cookies.authcookie } }
  ).catch((err) => {
    res.status(500).send({ message: err.message });
  });
  res.cookie("authcookie", "", {
    expires: new Date(Date.now() + 3 * 1000),
    httpOnly: true,
  });

  console.log("/--------Logout Success--------/");
  console.log(
    `Host: ${req.headers.host}\nAgent: ${
      req.headers["user-agent"]
    }\nTime: ${new Date(Date.now())}\nMessage: logout success!`
  );
  console.log("/-----------------------------/\n");
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

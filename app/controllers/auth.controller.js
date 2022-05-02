const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

function LogHandler(log) {
  let title = `/--------${log.title}--------/`;
  let result = "";
  for (const key in log) {
    if (Object.hasOwnProperty.call(log, key)) {
      if (key !== "title") {
        const element = log[key];
        result += `${key}: ${element}\n`;
      }
    }
  }
  console.log(`${title}\n\n${result}`);
}

exports.signup = (req, res) => {
  if (!(req.body.username && req.body.email && req.body.password)) {
    res
      .status(400)
      .send({ message: "UserName, Email, Password are required!" });
    return;
  }
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
            LogHandler({
              title: "SignUp Success",
              User: req.body.username,
              Host: req.headers.host,
              Agent: req.headers["user-agent"],
              Time: new Date(Date.now()),
              Role: req.body.roles,
              message: "User was registered successfully!",
            });
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          LogHandler({
            title: "SignUp Success",
            User: req.body.username,
            Host: req.headers.host,
            Agent: req.headers["user-agent"],
            Time: new Date(Date.now()),
            Role: "user",
            message: "User was registered successfully!",
          });
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch((err) => {
      LogHandler({
        title: "SignUp Failed",
        User: req.body.username,
        Host: req.headers.host,
        Agent: req.headers["user-agent"],
        Time: new Date(Date.now()),
        message: err.message,
      });
      res.status(400).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  if (!req.body.username) {
    res.status(400).send({ message: "UserName is required!" });
    return;
  }
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

        LogHandler({
          title: "Login Success",
          User: req.body.username,
          Host: req.headers.host,
          Agent: req.headers["user-agent"],
          Time: new Date(Date.now()),
          message: "Login Success!",
        });

        res.status(200).send("login success");
      });
    })
    .catch((err) => {
      LogHandler({
        title: "Login Failed",
        User: req.body.username,
        Host: req.headers.host,
        Agent: req.headers["user-agent"],
        Time: new Date(Date.now()),
        message: err.message,
      });
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

  LogHandler({
    title: "Logout Success",
    Host: req.headers.host,
    Agent: req.headers["user-agent"],
    Time: new Date(Date.now()),
    message: "Logout Success!",
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

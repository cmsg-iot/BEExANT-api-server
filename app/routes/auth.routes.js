const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token,X-Requested-With, Origin, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Headers", "Set-Cookie");
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateUsername, verifySignUp.checkRolesExisted],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/setcookie", [authJwt.verifyToken], controller.setcookie);
  app.get("/api/auth/logout", [authJwt.verifyToken], controller.logout);
};

const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/file/tag", [authJwt.verifyToken], controller.createFileTag);
  app.post("/api/file", [authJwt.verifyToken], controller.createFile);
};

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

  // Get all tags by user
  app.get(
    "/api/file/tag",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.getFileTags
  );

  // Get file list by user and tag
  app.get(
    "/api/file/list",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.getFileList
  );

  // Get file data by user and tag
  app.get(
    "/api/file",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.getFile
  );

  // Create new tag by user
  app.post(
    "/api/file/tag",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.createFileTag
  );

  // Create new file by user and tag
  app.post("/api/file", [authJwt.verifyToken], controller.createFile);
};

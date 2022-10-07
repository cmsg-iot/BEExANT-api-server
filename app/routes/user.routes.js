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

  // Verify if user login
  app.get("/api/user", [authJwt.verifyToken], controller.isUserLogin);

  // Get user info
  app.get("/api/user/info", [authJwt.verifyToken], controller.getUserInfo);

  // Get all tags by user
  app.get(
    "/api/file/tag",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.getFileTags
  );

  // Get file list by user and tag
  app.post(
    "/api/file/list",
    [authJwt.verifyToken, controller.checkUserExist],
    controller.getFileList
  );

  // Get file data by user and tag
  app.post(
    "/api/file/data",
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

  // Remove tag and uder files
  app.delete("/api/tag", [authJwt.verifyToken], controller.removeTagFiles);

  // Remove files by tag
  app.delete("/api/files", [authJwt.verifyToken], controller.removeFilesByTag);

  // Remove file by tag and fileName
  app.delete("/api/file", [authJwt.verifyToken], controller.removeFile);

  // Remove current user account
  app.delete("/api/user", [authJwt.verifyToken], controller.removeUser);
};

const db = require("../models");
const User = db.user;
const File = db.file;
const FileTag = db.fileTag;

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

exports.checkUserExist = (req, res, next) => {
  User.findOne({
    where: {
      id: req.userId,
    },
  }).then((user) => {
    if (!user) {
      res.cookie("authcookie", "", {
        expires: new Date(Date.now() + 3 * 1000),
        httpOnly: true,
      });
      LogHandler({
        title: "User Not Exist",
        userId: req.userId,
      });
      res.status(400).send("User not exist.");
      return;
    }
    next();
  });
};

exports.createFileTag = (req, res) => {
  FileTag.findOne({
    where: {
      tag: req.body.tag,
      userId: req.userId,
    },
  }).then((result) => {
    if (result) {
      LogHandler({
        title: "File Tag Create Failed",
        userId: req.userId,
        tag: req.body.tag,
        message: "File tag was used.",
      });
      res.status(400).send("File tag was used.");
      return;
    }
    FileTag.create({
      tag: req.body.tag,
      userId: req.userId,
    })
      .then((user) => {
        LogHandler({
          title: "File Tag Create Success",
          userId: req.userId,
          tagId: user.dataValues.id,
          tag: req.body.tag,
          createdAt: user.dataValues.createdAt,
        });
        res.status(200).send("File tag created successfully!");
      })
      .catch((error) => {
        LogHandler({
          title: "File Tag Create Failed",
          userId: req.userId,
          tag: req.body.tag,
          message: error,
        });
        res.status(400).send({ message: error });
      });
  });
};

exports.createFile = (req, res) => {
  // check if the tag are existed
  FileTag.findOne({
    where: {
      id: req.body.tagId,
      userId: req.userId,
    },
  })
    .then((user) => {
      if (!user) {
        LogHandler({
          title: "File Create Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
          fileSize: req.body.fileData.length,
          message: "Tag not found.",
        });
        res.status(404).send({ message: "Tag not found." });
        return;
      }

      // check the file name of user is unique
      File.findOne({
        where: {
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
        },
      }).then((result) => {
        if (result) {
          LogHandler({
            title: "File Create Failed",
            userId: req.userId,
            tagId: req.body.tagId,
            fileName: req.body.fileName,
            fileSize: req.body.fileData.length,
            message: "File Name was used.",
          });
          res.status(400).send("File Name was used.");
          return;
        }

        // create new one with userId and tagId
        File.create({
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
          fileData: req.body.fileData,
        })
          .then((user) => {
            LogHandler({
              title: "File Create Success",
              userId: req.userId,
              tagId: req.body.tagId,
              fileName: req.body.fileName,
              fileSize: req.body.fileData.length,
              createdAt: user.dataValues.createdAt,
            });
            res.status(200).send("File created successfully!");
          })
          .catch((err) => {
            LogHandler({
              title: "File Create Failed",
              userId: req.userId,
              tagId: req.body.tagId,
              fileName: req.body.fileName,
              fileSize: req.body.fileData.length,
              message: err,
            });
            res.status(400).send({ message: err.errors[0].message });
          });
      });
    })
    .catch((err) => {
      LogHandler({
        title: "File Create Failed",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
        fileSize: req.body.fileData.length,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.getFileTags = (req, res) => {
  FileTag.findAll({
    where: {
      userId: req.userId,
    },
    order: [["tag", "ASC"]],
  })
    .then((user) => {
      if (user.length === 0) {
        LogHandler({
          title: "Get FileTags Failed",
          userId: req.userId,
          message: "Not found any tag, please create one.",
        });
        res.status(400).send("Not found any tag, please create one.");
        return;
      }
      let tags = [];
      user.map((v) => {
        tags.push({ id: v.id, tag: v.tag });
      });

      LogHandler({
        title: "Get FileTags Success",
        userId: req.userId,
        tagLen: tags.length,
      });
      res.status(200).send(tags);
    })
    .catch((err) => {
      LogHandler({
        title: "Get FileTags Failed",
        userId: req.userId,
        message: err,
      });
      res.status(400).send(err);
    });
};

exports.getFileList = (req, res) => {
  File.findAll({
    where: {
      userId: req.userId,
      tagId: req.body.tagId,
    },
    order: [["createdAt", "ASC"]],
  })
    .then((user) => {
      if (user.length === 0) {
        LogHandler({
          title: "Get FileList Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          message:
            "Not found any file in this tag, please create new one, or check your tag.",
        });
        res
          .status(400)
          .send(
            "Not found any file in this tag, please create new one, or check your tag."
          );
        return;
      }
      let files = [];
      user.map((v) => {
        files.push({
          fileName: v.fileName,
          createdAt: v.createdAt,
        });
      });
      LogHandler({
        title: "Get FileList Success",
        userId: req.userId,
        tagId: req.body.tagId,
        listLen: files.length,
      });
      res.status(200).send(files);
    })
    .catch((err) => {
      LogHandler({
        title: "Get FileList Failed",
        userId: req.userId,
        message: err,
      });
      res.status(400).send(err);
    });
};

exports.getFile = (req, res) => {
  File.findOne({
    where: {
      userId: req.userId,
      tagId: req.body.tagId,
      fileName: req.body.fileName,
    },
  })
    .then((file) => {
      if (!file) {
        LogHandler({
          title: "Get File Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
          message: "File not found.",
        });
        res.status(400).send("File not found.");
        return;
      }
      LogHandler({
        title: "Get File Success",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
      });
      res.status(200).send(file.fileData);
    })
    .catch((err) => {
      LogHandler({
        title: "Get File Failed",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
        message: err,
      });
      res.status(400).send(err);
    });
};

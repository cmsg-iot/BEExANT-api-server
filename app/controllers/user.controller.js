const db = require("../models");
const User = db.user;
const File = db.file;
const FileTag = db.fileTag;

function LogHandler(req, log) {
  let title = `/--------${log.title}--------/`;
  let result = "";
  let info = {
    Host: req.headers.host,
    Agent: req.headers["user-agent"],
    Time: new Date(Date.now()),
  };
  for (const key in info) {
    if (Object.hasOwnProperty.call(info, key)) {
      if (key !== "title") {
        const element = info[key];
        result += `${key}: ${element}\n`;
      }
    }
  }
  result += "\n";
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

exports.isUserLogin = (req, res) => {
  res.status(200).send({ message: "User login!" });
};

exports.getUserInfo = (req, res) => {
  User.findOne({
    where: {
      id: req.userId,
    },
  }).then((user) => {
    if (!user) {
      res.status(400).send({ message: "User not found!" });
      return;
    }

    res.status(200).send({ username: user.dataValues.username });
  });
};

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
      LogHandler(req, {
        title: "User Not Exist",
        userId: req.userId,
      });
      res.status(400).send({ message: "User not exist." });
      return;
    }
    next();
  });
};

exports.createFileTag = (req, res) => {
  if (!req.body.tag) {
    res.status(400).send({ message: "File tag is required!" });
    return;
  }
  FileTag.findOne({
    where: {
      tag: req.body.tag,
      userId: req.userId,
    },
  }).then((result) => {
    if (result) {
      LogHandler(req, {
        title: "File Tag Create Failed",
        userId: req.userId,
        tag: req.body.tag,
        message: "File tag was used.",
      });
      res.status(400).send({ message: "File tag was used." });
      return;
    }
    FileTag.create({
      tag: req.body.tag,
      userId: req.userId,
    })
      .then((user) => {
        LogHandler(req, {
          title: "File Tag Create Success",
          userId: req.userId,
          tagId: user.dataValues.id,
          tag: req.body.tag,
          createdAt: user.dataValues.createdAt,
        });
        res.status(200).send({ message: "File tag created successfully!" });
      })
      .catch((error) => {
        LogHandler(req, {
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
  if (
    !(
      req.body.tagId &&
      req.body.fileName &&
      req.body.fileName &&
      req.body.fileData
    )
  ) {
    res
      .status(400)
      .send({ message: "Tag Id, file Name, file Data are required!" });
    return;
  }
  // check if the tag are existed
  FileTag.findOne({
    where: {
      id: req.body.tagId,
      userId: req.userId,
    },
  })
    .then((user) => {
      if (!user) {
        LogHandler(req, {
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
          LogHandler(req, {
            title: "File Create Failed",
            userId: req.userId,
            tagId: req.body.tagId,
            fileName: req.body.fileName,
            fileSize: req.body.fileData.length,
            message: "File Name was used.",
          });
          res.status(400).send({ message: "File Name was used." });
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
            LogHandler(req, {
              title: "File Create Success",
              userId: req.userId,
              tagId: req.body.tagId,
              fileName: req.body.fileName,
              fileSize: req.body.fileData.length,
              createdAt: user.dataValues.createdAt,
            });
            res.status(200).send({ message: "File created successfully!" });
          })
          .catch((err) => {
            LogHandler(req, {
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
      LogHandler(req, {
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
      let tags = [];
      if (user.length > 0) {
        user.map((v) => {
          tags.push({ id: v.id, tag: v.tag });
        });
      }
      LogHandler(req, {
        title: "Get FileTags Success",
        userId: req.userId,
        tagLen: tags.length,
      });
      res.status(200).send(tags);
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Get FileTags Failed",
        userId: req.userId,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.getFileList = (req, res) => {
  if (!req.body.tagId) {
    res.status(400).send({ message: "Tag Id is required!" });
    return;
  }
  File.findAll({
    where: {
      userId: req.userId,
      tagId: req.body.tagId,
    },
    order: [["createdAt", "ASC"]],
  })
    .then((user) => {
      let files = [];
      if (user.length > 0) {
        user.map((v) => {
          files.push({
            fileName: v.fileName,
            createdAt: v.createdAt,
          });
        });
      }
      LogHandler(req, {
        title: "Get FileList Success",
        userId: req.userId,
        tagId: req.body.tagId,
        listLen: files.length,
      });
      res.status(200).send(files);
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Get FileList Failed",
        userId: req.userId,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.getFile = (req, res) => {
  if (!(req.body.tagId && req.body.fileName)) {
    res.status(400).send({ message: "Tag Id, file Name are required!" });
    return;
  }
  File.findOne({
    where: {
      userId: req.userId,
      tagId: req.body.tagId,
      fileName: req.body.fileName,
    },
  })
    .then((file) => {
      if (!file) {
        LogHandler(req, {
          title: "Get File Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
          message: "File not found.",
        });
        res.status(400).send({ message: "File not found." });
        return;
      }
      LogHandler(req, {
        title: "Get File Success",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
      });
      res.status(200).send({ data: file.fileData });
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Get File Failed",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.removeTagFiles = (req, res) => {
  if (!req.body.tagId) {
    res.status(400).send({ message: "Tag Id is required!" });
    return;
  }
  FileTag.destroy({
    where: {
      userId: req.userId,
      id: req.body.tagId,
    },
    cascade: true,
  })
    .then((result) => {
      if (!result) {
        LogHandler(req, {
          title: "Remove Tag Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          message: "Taget tag is not exist!",
        });
        res.status(400).send({ message: "Taget Tag not found!" });
        return;
      }
      LogHandler(req, {
        title: "Remove Tag Success",
        userId: req.userId,
        tagId: req.body.tagId,
        message: "Removed the tag and uder files!",
      });
      res.status(200).send({ message: "Removed the tag and uder files!" });
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Remove Tag Failed",
        userId: req.userId,
        tagId: req.body.tagId,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.removeFile = (req, res) => {
  File.destroy({
    where: {
      userId: req.userId,
      tagId: req.body.tagId,
      fileName: req.body.fileName,
    },
    cascade: true,
  })
    .then((result) => {
      if (!result) {
        LogHandler(req, {
          title: "Remove File Failed",
          userId: req.userId,
          tagId: req.body.tagId,
          fileName: req.body.fileName,
          message: "Target File not found!",
        });
        res.status(400).send({ message: "Target File not found!" });
        return;
      }

      LogHandler(req, {
        title: "Remove File Success",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
        message: "Removed the file!",
      });
      res.status(200).send({ message: "Removed the file!" });
      return;
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Remove File Failed",
        userId: req.userId,
        tagId: req.body.tagId,
        fileName: req.body.fileName,
        message: err,
      });
      res.status(400).send({ message: err });
    });
};

exports.removeUser = (req, res) => {
  User.findOne({
    where: {
      id: req.userId,
    },
  })
    .then((user) => {
      User.destroy({
        where: {
          id: req.userId,
        },
        cascade: true,
      }).then((result) => {
        if (!result) {
          res.status(400).send({ message: "User not found!" });
          return;
        }

        res.cookie("authcookie", "", {
          expires: new Date(Date.now() + 3 * 1000),
          httpOnly: true,
        });

        LogHandler(req, {
          user: user.dataValues.username,
          title: "Remove User Account Success",
          userId: req.userId,
          message: "Remove user success!",
        });
        res.status(200).send({ message: "Remove user success!" });
      });
    })
    .catch((err) => {
      LogHandler(req, {
        title: "Remove User Account Failed",
        userId: req.userId,
        message: err,
      });
    });
};

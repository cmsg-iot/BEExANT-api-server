const db = require("../models");
const File = db.file;
const FileTag = db.fileTag;

exports.createFileTag = (req, res) => {
  FileTag.findOne({
    where: {
      tag: req.body.tag,
      userId: req.userId,
    },
  }).then((result) => {
    if (result) {
      console.log("/--------File Tag Create Failed--------/");
      console.log(
        `userId: ${req.userId}\ntag: ${req.body.tag}\nmessage: File tag was used.`
      );
      console.log("/------------------------------------/\n");
      res.status(400).send("File tag was used.");
      return;
    }
    FileTag.create({
      tag: req.body.tag,
      userId: req.userId,
    })
      .then((user) => {
        console.log("/--------File Tag Create Success--------/");
        console.log(
          `userId: ${req.userId}\ntagId: ${user.dataValues.id}\ntag: ${req.body.tag}\ncreatedAt: ${user.dataValues.createdAt}`
        );
        console.log("/-------------------------------------/\n");
        res.status(200).send("File tag created successfully!");
      })
      .catch((error) => {
        console.log("/--------File Tag Create Failed--------/");
        console.log(
          `userId: ${req.userId}\ntag: ${req.body.tag}\nmessage: ${error.errors[0].message}`
        );
        console.log("/------------------------------------/\n");
        res.status(400).send({ message: error.errors[0].message });
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
        console.log("/--------File Create Failed--------/");
        console.log(
          `userId: ${req.userId}\ntagId: ${req.body.tagId}\nfileName: ${req.body.fileName}\nfileSize: ${req.body.fileData.length}\nmessage: tag not found.`
        );
        console.log("/-------------------------------------/\n");
        res.status(404).send({ message: "tag not found." });
        return;
      }

      // check the file name of user is unique
      File.findOne({
        where: {
          userId: req.userId,
          fileName: req.body.fileName,
        },
      }).then((result) => {
        if (result) {
          console.log("/--------File Create Failed--------/");
          console.log(
            `userId: ${req.userId}\ntagId: ${req.body.tagId}\nfileName: ${req.body.fileName}\nfileSize: ${req.body.fileData.length}\nmessage: File Name was used.`
          );
          console.log("/-------------------------------------/\n");
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
            console.log("/--------File Create Success--------/");
            console.log(
              `userId: ${req.userId}\ntagId: ${req.body.tagId}\nfileName: ${req.body.fileName}\nfileSize: ${req.body.fileData.length}\ncreatedAt: ${user.dataValues.createdAt}`
            );
            console.log("/-------------------------------------/\n");
            res.status(200).send("File created successfully!");
          })
          .catch((err) => {
            console.log("/--------File Create Failed--------/");
            console.log(
              `userId: ${req.userId}\ntagId: ${req.body.tagId}\nfileName: ${req.body.fileName}\nfileSize: ${req.body.fileData.length}\nmessage: ${err}`
            );
            console.log("/-------------------------------------/\n");
            res.status(400).send({ message: err.errors[0].message });
          });
      });
    })
    .catch((err) => {
      console.log("/--------File Create Failed--------/");
      console.log(
        `userId: ${req.userId}\ntagId: ${req.body.tagId}\nfileName: ${req.body.fileName}\nfileSize: ${req.body.fileData.length}\nmessage: ${err}`
      );
      console.log("/-------------------------------------/\n");
      res.status(400).send({ message: err });
    });
};

exports.getFileTags = (req, res) => {};

exports.getFileList = (req, res) => {};

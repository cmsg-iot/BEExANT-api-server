module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define("files", {
    userId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    tagId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: { model: "file_tags", key: "id" },
      onDelete: "CASCADE",
    },
    fileName: {
      type: Sequelize.STRING,
    },
    fileData: {
      type: Sequelize.BLOB,
    },
  });
  return File;
};

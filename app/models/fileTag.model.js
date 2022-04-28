module.exports = (sequelize, Sequelize) => {
  const FileTag = sequelize.define("file_tags", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    userId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    tag: {
      type: Sequelize.STRING,
    },
  });
  return FileTag;
};

export default (sequelize, DataTypes) => {
  const UserRole = sequelize.define('user_role',
    {
      user_id: { type: DataTypes.STRING },
      role_id: { type: DataTypes.STRING }
    },
    {
      underscored: true
    }
  );

  UserRole.associate = (models) => {
    UserRole.belongsTo(models.User, {
      foreignKey: 'user_id'
    });

    UserRole.belongsTo(models.Role, {
      foreignKey: 'role_id'
    });
  };

  return UserRole;
};

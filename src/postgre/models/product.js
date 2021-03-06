import shortid from 'shortid';

export default (sequelize, DataTypes) => {
  const Product = sequelize.define('product',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: shortid.generate()
      },

      name: { type: DataTypes.STRING },

      image: { type: DataTypes.STRING },

      price: { type: DataTypes.FLOAT },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      underscored: true
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Vendor);
  };

  return Product;
};

/**
 * Sequelize Metadata Helpers
 */

const getTableName = (model) => {
  if (model && model.getTableName) {
    const tableName = model.getTableName();

    if (typeof tableName === 'object' && tableName.tableName) {
      return tableName.tableName;
    }

    return tableName;
  }

  return null;
};

const getField = (model, attribute) => {
  if (model && model.rawAttributes && model.rawAttributes[attribute]) {
    return model.rawAttributes[attribute].field || attribute;
  }

  return attribute;
};

module.exports = {
  getTableName,
  getField,
};

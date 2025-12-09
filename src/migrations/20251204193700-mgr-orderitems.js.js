'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orderitems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      orderId: { type: Sequelize.BIGINT, allowNull: false },
      bookId: { type: Sequelize.INTEGER, allowNull: true },
      bookname: { type: Sequelize.STRING, allowNull: true },
      image: { type: Sequelize.STRING, allowNull: true },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      unitPrice: { type: Sequelize.DECIMAL(12,2), allowNull: true },
      subtotal: { type: Sequelize.DECIMAL(12,2), allowNull: true },
      createdAt: { allowNull: true, type: Sequelize.DATE },
      updatedAt: { allowNull: true, type: Sequelize.DATE }
    });
    // Add index on orderId if it doesn't already exist
    try {
      const existing = await queryInterface.showIndex('orderitems');
      const hasOrderIndex = (existing || []).some(ix => {
        const cols = ix.fields ? ix.fields.map(f => f.attribute || f.name || f.column) : [];
        return cols.indexOf('orderId') !== -1 || ix.name === 'orderitems_order_id' || ix.name === 'idx_orderitems_orderId';
      });
      if (!hasOrderIndex) {
        await queryInterface.addIndex('orderitems', ['orderId'], { name: 'idx_orderitems_orderId' });
      }
    } catch (e) {
      try { await queryInterface.addIndex('orderitems', ['orderId'], { name: 'idx_orderitems_orderId' }); } catch(err){ /* ignore */ }
    }

    // Add foreign key constraint if not present
    try {
      const fks = await queryInterface.getForeignKeyReferencesForTable('orderitems');
      const hasFk = (fks || []).some(f => (f && (f.columnName === 'orderId' || f.column_name === 'orderId') && (f.referencedTableName === 'orders' || f.referenced_table_name === 'orders')));
      if (!hasFk) {
        await queryInterface.addConstraint('orderitems', {
          fields: ['orderId'],
          type: 'foreign key',
          name: 'fk_orderitems_order',
          references: { table: 'orders', field: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    } catch (e) {
      try {
        await queryInterface.addConstraint('orderitems', {
          fields: ['orderId'],
          type: 'foreign key',
          name: 'fk_orderitems_order',
          references: { table: 'orders', field: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      } catch(err) { /* ignore */ }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orderitems');
  }
};

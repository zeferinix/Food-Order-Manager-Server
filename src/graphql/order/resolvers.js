import { GraphQLError } from 'graphql';
import DataLoader from 'dataloader';

export const Query = {
  Order: (_, { id }, { pgPool }) =>
    pgPool.Order.findOne({ where: { id: id }})
};

export const Mutation = {
  addOrder: async (_, { input }, { pgPool }) => {
    let transaction = await pgPool.Transaction.findOne({ where: { id: input.transaction_id }});

    if (!transaction) { throw new GraphQLError(`Transaction ID <${input.transaction_id}> does not exist`); }

    let order = await pgPool.Order.create({
      transaction_id: input.transaction_id,
      user_id: input.user_id,
      comment: input.comment
    });

    if (!order) { throw new GraphQLError('Order not created', order); }

    let orderItems = await pgPool.OrderItem.bulkCreate(input.orderItems);

    if (!orderItems) { throw new GraphQLError('No Order Items created', orderItems); }

    return order;
  },

  cancelOrder: async (_, { id }, { pgPool }) => {
    let order = await pgPool.Order.findOne({ where: { id: id }});

    if (!order) { throw new GraphQLError(`Order ID <${id}> does not exist`); }

    return order.updateAttributes({ isCancelled: true });
  }
};

export const Order = {
  User: (order, _, { dataloaders }) =>
    dataloaders.userById.load(order.user_id),

  OrderItems: (order, _, { dataloaders }) =>
    dataloaders.orderItemsByOrderId.load(order.id),

  Transaction: (order, _, { dataloaders }) =>
    dataloaders.transactionById.load(order.transaction_id)
};

const getOrdersById = pgPool => ids =>
  Promise.resolve(
    ids.map(id => pgPool.Order.findOne({ where: { id: id }}))
  );

const getOrdersByUserIds = pgPool => ids =>
  Promise.resolve(
    ids.map(id => pgPool.Order.findAll({ where: { user_id: id }}))
  );

const getOrdersByTransactionIds = pgPool => ids =>
  Promise.resolve(
    ids.map(id => pgPool.Order.findAll({ where: { transaction_id: id }}))
  );

export const dataloaders = pgPool => ({
  orderById: new DataLoader(getOrdersById(pgPool)),
  ordersByUserId: new DataLoader(getOrdersByUserIds(pgPool)),
  ordersByTransactionId: new DataLoader(getOrdersByTransactionIds(pgPool))
});

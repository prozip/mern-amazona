import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';
import RSA from '../my_rsa.js';

const orderRouter = express.Router();

const encryptRSA = (plaintext_msg) => {
  var encoded_message = RSA.encode(plaintext_msg);
  var encrypted_message = RSA.encrypt(encoded_message, process.env.RSA_N, process.env.RSA_E);
  return encrypted_message.toString()
}
const decryptRSA = (encrypted_message) => {
  var decrypted_message = RSA.decrypt(encrypted_message, process.env.RSA_D, process.env.RSA_N);
  var decoded_message = RSA.decode(decrypted_message);
  return decoded_message.toString()
}

const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => {
      if (k !== 'location') {
        return [k, fn(v, k, i)]
      }
      return [k, v]
    })
  )

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    orders.map((order) => {
      order.shippingAddress = objectMap(order.shippingAddress, v => decryptRSA(v))
      order.paymentMethod = decryptRSA(order.paymentMethod),
      order.itemsPrice = decryptRSA(order.itemsPrice),
      order.shippingPrice = decryptRSA(order.shippingPrice),
      order.taxPrice = decryptRSA(order.taxPrice),
      order.totalPrice = decryptRSA(order.totalPrice),
      order.user.name = decryptRSA(order.user.name)
    })
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body.shippingAddress);
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: objectMap(req.body.shippingAddress, v => encryptRSA(v)),
      paymentMethod: encryptRSA(req.body.paymentMethod.toString()),
      itemsPrice: encryptRSA(req.body.itemsPrice.toString()),
      shippingPrice: encryptRSA(req.body.shippingPrice.toString()),
      taxPrice: encryptRSA(req.body.taxPrice.toString()),
      totalPrice: encryptRSA(req.body.totalPrice.toString()),
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.shippingAddress = objectMap(order.shippingAddress, v => decryptRSA(v))
      order.paymentMethod = decryptRSA(order.paymentMethod),
        order.itemsPrice = decryptRSA(order.itemsPrice),
        order.shippingPrice = decryptRSA(order.shippingPrice),
        order.taxPrice = decryptRSA(order.taxPrice),
        order.totalPrice = decryptRSA(order.totalPrice),
        res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter;

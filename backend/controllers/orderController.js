const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    let itemsPrice = 0;
    const orderItems = [];
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) return res.status(404).json({ message: `Product ${it.product} not found` });
      if (product.stock < it.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += price * it.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price,
        quantity: it.quantity,
      });
    }

    const shippingPrice = itemsPrice > 5000 ? 0 : 100;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      transactionUuid: `SS-${Date.now()}-${req.user._id.toString().slice(-5)}`,
    });

    // Decrement stock
    for (const it of orderItems) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const validOrderStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    const { orderStatus, paymentStatus } = req.body;

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (order.orderStatus === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    if (order.orderStatus !== 'delivered') order.deliveredAt = undefined;

    await order.save();
    const updatedOrder = await Order.findById(order._id).populate('user', 'name email');
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

import { Router } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = Router();

const getUser = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authorization.slice(7), process.env.JWT_SECRET || "development-secret");
  } catch {
    return null;
  }
};

router.get("/mine", async (req, res, next) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: "Please sign in to view your orders." });
    const orders = await Order.find({ user: user.sub }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found." });
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found." });
    const user = getUser(req);
    if (order.user && (!user || String(order.user) !== String(user.sub))) {
      return res.status(403).json({ message: "You cannot view this order." });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found." });
    const user = getUser(req);
    if (!user) return res.status(401).json({ message: "Please sign in to update this order." });
    const order = await Order.findOne({ _id: req.params.id, user: user.sub });
    if (!order) return res.status(404).json({ message: "Order not found." });
    const nextStatus = order.status === "confirmed" ? "shipped" : order.status === "shipped" ? "delivered" : null;
    if (!nextStatus) return res.status(409).json({ message: "This order has already been delivered." });
    order.status = nextStatus;
    await order.save();
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { items, customer } = req.body;
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ message: "Please sign in or create an account before placing an order." });
  }
  const paymentMethod = ["cod", "card", "upi"].includes(req.body.paymentMethod) ? req.body.paymentMethod : "cod";
  if (paymentMethod !== "cod" && req.body.paymentStatus === "failed") {
    return res.status(402).json({ message: "Payment failed. Please retry or choose another payment method." });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    return res.status(400).json({ message: "Your cart must contain between 1 and 30 items." });
  }
  if (
    !customer ||
    typeof customer.name !== "string" ||
    typeof customer.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    typeof customer.address !== "string" ||
    !customer.name.trim() ||
    !customer.address.trim()
  ) {
    return res.status(400).json({ message: "Please provide a name, valid email, and delivery address." });
  }

  const quantities = new Map();
  for (const item of items) {
    if (!item || !mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      return res.status(400).json({ message: "One or more cart items are invalid." });
    }
    const quantity = (quantities.get(item.productId) || 0) + item.quantity;
    if (quantity > 20) return res.status(400).json({ message: "You can order at most 20 of each product." });
    quantities.set(item.productId, quantity);
  }

  const reserved = [];
  let order;
  try {
    const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean();
    if (products.length !== quantities.size) {
      const error = new Error("A product in your cart is no longer available.");
      error.status = 409;
      throw error;
    }

    const orderItems = [];
    for (const product of products) {
      const quantity = quantities.get(String(product._id));
      const reservation = await Product.updateOne(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
      if (reservation.modifiedCount !== 1) {
        const error = new Error(`${product.name} does not have enough stock.`);
        error.status = 409;
        throw error;
      }
      reserved.push({ _id: product._id, quantity });
      orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity });
    }

    const subtotal = Number(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    const shipping = subtotal >= 6000 ? 0 : 499;
    order = await Order.create({
      user: user?.sub,
      items: orderItems,
      customer,
      subtotal,
      shipping,
      total: Number((subtotal + shipping).toFixed(2)),
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : req.body.paymentStatus === "failed" ? "failed" : "paid"
    });
  } catch (error) {
    if (reserved.length) {
      try {
        await Product.bulkWrite(reserved.map(({ _id, quantity }) => ({
          updateOne: { filter: { _id }, update: { $inc: { stock: quantity } } }
        })));
      } catch (rollbackError) {
        console.error("Could not restore stock after failed order:", rollbackError);
        return next(new Error("The order failed and stock could not be restored. Please contact support."));
      }
    }
    return next(error);
  }
  res.status(201).json({ order: { id: order._id, total: order.total, status: order.status } });
});

export default router;

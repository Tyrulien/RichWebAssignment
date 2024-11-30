// app/api/confirmOrder/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken } from '../../../utils/auth';
import nodemailer from 'nodemailer';

export async function POST(req) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  const dbName = 'app';

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    await client.connect();
    const db = client.db(dbName);
    const cartCollection = db.collection('shopping_cart');
    const productsCollection = db.collection('products');
    const ordersCollection = db.collection('orders');
    const usersCollection = db.collection('users');

    const cartItems = await cartCollection.find({ userId }).toArray();
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const products = await Promise.all(
      cartItems.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        if (!product) {
          throw new Error('Product not found');
        }
        return {
          productId: item.productId,
          title: product.title,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const totalCost = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const order = {
      orderId: generateOrderId(),
      products,
      totalCost,
      customerEmail: user.email,
      orderDate: new Date(),
    };

    await ordersCollection.insertOne(order);
    await cartCollection.deleteMany({ userId });

    try {
      await sendConfirmationEmail(user.email, order);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Decide if you want to fail the entire operation or proceed
    }

    return NextResponse.json({ message: 'Order confirmed' });
  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

function generateOrderId() {
  return 'ORD-' + Date.now();
}

async function sendConfirmationEmail(email, order) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Confirmation',
    text: `Thank you for your order!\n\nOrder ID: ${order.orderId}\nTotal Cost: $${order.totalCost.toFixed(
      2
    )}\n\nWe will notify you when your order is shipped.`,
  };

  await transporter.sendMail(mailOptions);
}

// app/api/register/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { email, password, address, phone } = await req.json();

    if (!email || !password || !address || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    const dbName = 'app';

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      address,
      phone,
      role: 'customer',
    };
    await usersCollection.insertOne(newUser);

    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

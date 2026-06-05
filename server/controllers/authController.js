const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { seedDemoLeads } = require('../models/Lead');

const JWT_SECRET = process.env.JWT_SECRET || 'leadbridge_jwt_secret_key_2026';

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const inserted = await db.insert(users).values({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    }).returning();

    const user = inserted[0];

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('[signUp]', err.message);
    next(err);
  }
};

// ─── POST /api/auth/signin ────────────────────────────────────────────────────
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const rows = await db.select().from(users).where(eq(users.email, normalizedEmail));
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('[signIn]', err.message);
    next(err);
  }
};

// ─── POST /api/auth/demo ─────────────────────────────────────────────────────
const demoLogin = async (req, res, next) => {
  try {
    const DEMO_EMAIL = 'demo@leadbridge.app';
    const DEMO_NAME  = 'Demo User';
    const DEMO_PASS  = 'leadbridge_demo_2026';

    // Find or create the demo account
    let rows = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
    let user = rows[0];

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEMO_PASS, salt);
      const inserted = await db.insert(users).values({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: hashedPassword,
      }).returning();
      user = inserted[0];
    }

    // Seed 20 demo leads if the account is fresh
    await seedDemoLeads(user.id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Demo account ready',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[demoLogin]', err.message);
    next(err);
  }
};

module.exports = {
  signUp,
  signIn,
  demoLogin,
};


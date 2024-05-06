const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getMarketScreenerLink } = require('./services/googleService');
const { scrapeMarketScreenerData } = require('./services/marketscreenerService');
const User = require('./models/userModel');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://vp:klmklm24@cluster0.ijoz1wp.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/search', authMiddleware, async (req, res) => {
  const ticker = req.query.ticker;

  if (!ticker) {
    return res.status(400).send('Please provide a stock ticker (e.g., /search?ticker=MSFT)');
  }

  try {
    const marketScreenerLink = await getMarketScreenerLink(ticker);
    const scrapedData = await scrapeMarketScreenerData(marketScreenerLink);

    if (scrapedData) {
      res.json({ ...scrapedData, link: marketScreenerLink });
    } else {
      res.status(404).send('Scraped data not found');
    }
  } catch (error) {
    if (error.message === 'MarketScreener Link Not Found') {
      res.status(404).send('MarketScreener link not found');
    } else {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Received login request for username:', username);

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key');
    console.log('Login successful for user:', username);
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
});
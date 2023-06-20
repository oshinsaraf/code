const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

// Create an instance of Express
const app = express();

// Set up session middleware
app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Set up MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/UserDetails', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for the user details
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  address: String,
});

// Create a model for the user details
const User = mongoose.model('User', userSchema);

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Define the routes

// Home route to display the registration form
app.get('/', (req, res) => {
  let errorMessage = req.session.error;
  let formData = req.session.formData;
  req.session.error = null;
  req.session.formData = null;
  res.send(`
    <h1>Registration Form</h1>
    ${errorMessage ? `<p style="color: red;">${errorMessage}</p>` : ''}
    <form action="/register" method="POST">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" value="${formData ? formData.username : ''}" required><br><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" value="${formData ? formData.email : ''}" required><br><br>
      <label for="phone">Phone Number:</label>
      <input type="text" id="phone" name="phone" value="${formData ? formData.phone : ''}" required><br><br>
      <label for="address">Address:</label>
      <input type="text" id="address" name="address" value="${formData ? formData.address : ''}" required><br><br>
      <button type="submit">Register</button>
    </form>
  `);
});

// Registration form submission route
app.post('/register', async (req, res) => {
  const { username, email, phone, address } = req.body;

  // Perform basic validation
  if (!username || !email || !phone || !address) {
    req.session.error = 'All fields are required';
    req.session.formData = req.body;
    res.redirect('/');
    return;
  }

  // Create a new user document
  const newUser = new User({
    username,
    email,
    phone,
    address,
  });

  try {
    // Save the new user to the database
    await newUser.save();
    res.redirect('/registration-success');
  } catch (error) {
    req.session.error = 'Error saving user data';
    req.session.formData = req.body;
    res.redirect('/');
  }
});

// Route to display the registration success message
app.get('/registration-success', (req, res) => {
  res.send('<h1>User data inserted successfully</h1>');
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

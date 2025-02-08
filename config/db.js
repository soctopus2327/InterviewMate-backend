import mongoose from 'mongoose';


export const connectDB = async () => {
    try{
        const  conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected:', conn.connection.host);    
    } catch (error){
        console.error("Error:", error.message);
        process.exit(1);
    }
}


// app.post('/api/signup', async (req, res) => {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password) {
//     return res.status(400).json({ success: false, message: 'Please provide all fields' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new User({ username, email, password: hashedPassword });

//   try {
//     await newUser.save();
//     res.status(201).json({ success: true, data: newUser });
//   } catch (error) {
//     console.error('Error creating user:', error.message);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// });

// // Login endpoint
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ success: false, message: 'Please provide both email and password' });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Invalid credentials' });
//     }

//     req.session.user = { id: user._id, username: user.username, email: user.email };
//     res.json({ success: true, message: 'Login successful', user: { username: user.username, email: user.email } });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get user details if logged in
// app.get('/api/user', (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ success: false, message: 'User not logged in' });
//   }

//   res.json({ success: true, user: req.session.user });
// });

// // Logout endpoint
// app.post('/api/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ success: false, message: 'Failed to logout' });
//     }
//     res.json({ success: true, message: 'Logged out successfully' });
//   });
// });

// app.get('/api/users/current', async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id); // Assuming you have some form of user authentication (session or JWT)
//     if (!user) {
//       return res.status(401).json({ error: 'User not logged in' });
//     }
//     res.json(user); // Send the logged-in user's info
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ error: 'Server error while fetching user data' });
//   }
// });

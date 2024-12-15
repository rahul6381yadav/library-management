require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const readRoutes=require('./routes/readerRoutes')
const app = express();
connectDB();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reader', readRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

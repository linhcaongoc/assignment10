/*
Author: Cao Ngoc Linh
Script for server
*/

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// connect to mongodb
mongoose.set('strictQuery', false);
const mongoDB = "mongodb://127.0.0.1/";

// Wait for database to connect, logging an error if there is a problem 
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}

// create schema
const Schema = mongoose.Schema;
const itemSchema = new Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String
});
const userSchema = new Schema({
    username: String,
    password: String,
    listings: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    purchases: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
});

// create model
const Item = mongoose.model('Item', itemSchema);
const User = mongoose.model('User', userSchema);

// middleware to parse JSON in request body
app.use(bodyParser.json());
app.use(express.static('public_html'));
// express-session middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000 }, // 1 hours
    })
);

// handle POST requests to /login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        // User not found
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the provided password with the stored password
        if (password === user.password) {
            req.session.user = user; // Save user data in the session
            res.json({ message: 'Logged in successfully', user });
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /get/users
app.get('/get/users', async (req, res) => {
    // find all users in mongodb and return as JSON
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /get/items
app.get('/get/items', async (req, res) => {
    // find all items in mongodb and return as JSON
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /get/listings/USERNAME
app.get('/get/listings/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }).populate('listings');
        res.json(user.listings);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /get/purchases/USERNAME
app.get('/get/purchases/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }).populate('purchases');
        res.json(user.purchases);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /search/users/KEYWORD
app.get('/search/users/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    try {
        const users = await User.find({ username: { $regex: keyword, $options: 'i' } });
        res.json(users);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle GET requests to /search/items/KEYWORD
app.get('/search/items/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    try {
        const items = await Item.find({ description: { $regex: keyword, $options: 'i' } });
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle POST requests to /add/user
app.post('/add/user', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    try {
        await user.save({});
        res.send('User added successfully');
    } catch (err) {
        res.status(500).send(err);
    }
});

// handle POST requests to /add/item/USERNAME
app.post('/add/item/:username', async (req, res) => {
    const { title, description, image, price, stat } = req.body;
    const username = req.params.username;
    const item = new Item({ title, description, image, price, stat });
    try {
        const savedItem = await item.save({});
        await User.findOneAndUpdate(
            { username },
            { $push: { listings: savedItem._id } },
        );
        res.send('Item added successfully');
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/purchase/:itemId/:username', async (req, res) => {
    const itemId = req.params.itemId;
    const username = req.params.username;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.stat === 'SOLD') {
            return res.status(400).json({ error: 'Item is not available for purchase' });
        }

        // Update item status to 'SOLD'
        item.stat = 'SOLD';
        await item.save();

        // Add the item to the user's purchases
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.purchases.push(item);
        await user.save();

        // Send a success response
        res.status(200).json({ message: 'Item successfully purchased' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// start server
app.listen(port, () => console.log(`Server listening on port ${port}`));
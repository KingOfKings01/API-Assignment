import dotenv from "dotenv"
import express from 'express'
import mongoose from 'mongoose'
import cors from "cors"
import bodyParser from "body-parser"

import session from 'express-session'
import passport from 'passport'
import passportLocalMongoose from 'passport-local-mongoose'



import { Product } from "./productsSchema.js"
import { Order } from "./orderSchema.js"


const app = express()
dotenv.config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

const mongooseConnect = (req, res, next) => {
    mongoose.connect("mongodb+srv://aasifkhan9605:"+ process.env.PASSWORD +"@assignment.ll1ug3g.mongodb.net/", { useNewUrlParser: true })
    next()
}

app.use(mongooseConnect)


const userSchema = new mongoose.Schema({
    // emailOrPhone: String,
    username: String,
    password: String
})

//! adding password data in mongoDB
userSchema.plugin(passportLocalMongoose)

const User = await new mongoose.model("User", userSchema)

//! Saving user authentication stats in cooke's
passport.use(User.createStrategy())

//! serialize and deserialize password
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(cors({
    origin: [process.env.FRONTEND_URL],  // Adjust to match your app's domain
    //? origin: 'http://localhost:5173'
    methods: ["GET","POST"],
    credentials: true, // Include this option if you're sending cookies or other credentials
  }));




app.post("/register", async (req, res) => {

    User.register({ username: req.body.emailOrPhone }, req.body.password, (err, user) => {
        if (err) {
            console.err(err)
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            passport.authenticate("local")(req, res, () => {
                res.json({ success: true })
            })
        }
    })

    res.json({ success: true, username: req.body.emailOrPhone })

})

app.post("/login", (req, res) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        // Handle authentication error
        return res.status(401).json({ error: 'Authentication failed' });
      }
      if (!user) {
        // Authentication failed (invalid credentials)
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // If authentication is successful, log the user in
      req.logIn(user, (err) => {
        if (err) {
          return res.status(401).json({ error: 'Authentication failed' });
        }
        return res.json({ success: true, user: user});
    });
})(req, res);
});

app.post("/addProduct", async (req, res) => {
    try {
        const requestData = req.body; // Assuming you're sending data in the request body

        const product = await Product.create(req.body);

        return res.status(200).json( product );
    } catch (error) {
        console.error("Error handling the request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//! Retrieve all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve products' });
  }
});

// Create a new order
app.post('/order', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create order' });
  }
});

// Retrieve all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve orders' });
  }
});

// order by id
app.get('/ordersByUserId/:userId', async (req, res) => {
  const userId = req.params.userId; // Get the user ID from the request parameters

  try {
    const orders = await Order.find({ userId: userId })
    .populate('products');
    return res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve orders' });
  }
});




app.listen(process.env.PORT, () => {
    console.log("Server started on port:", process.env.PORT)
})
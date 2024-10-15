const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const morgan = require('morgan')
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");
const collection = require("./model/user");
const mongoose = require('mongoose')
const session = require("express-session");
const multer=require('multer')
const nocache=require("nocache")
const Razorpay = require('razorpay');

// const passport = require('passport'); 
// const cookieSession = require('cookie-session'); 
// require('./passport'); 
  

const oneday = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:oneday}
  })
);

mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("Mongodb is connected")
}).catch(()=>{ 
  console.log("Mongodb is not connected")
})

// app.use(cookieSession({ 
//   name: 'google-auth-session', 
//   keys: ['key1', 'key2'] 
// })); 
// app.use(passport.initialize()); 
// app.use(passport.session()); 

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache())

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.set('images',path.join(__dirname,'images'))
app.use("/images", express.static(path.resolve(__dirname, "images")));

app.use(express.static("public"));

app.use("/", userRouter);
app.use("/admin", adminRouter);

// app.use('/admin',admin)

const PORT = process.env.PORT || 3000;

// errorrrr hand

app.use((req, res, next) => {
  next(createError(404)); 
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error/error');
 });


app.listen(PORT, () => {
  console.log("server is running 3000");
})
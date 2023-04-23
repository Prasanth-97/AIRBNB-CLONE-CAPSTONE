const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const Place = require("./models/place.js");
const jwt  = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");
const Booking = require("./models/booking.js");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq4cdsuvbwu9vdsv';
const bucket = "prasanth-booking-app";
const mime = require("mime-types");

require('dotenv').config();
app.use("/uploads",express.static(__dirname +"/uploads"));
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials : true,
  origin : "http://localhost:5173",
}));

// mongoose.connect(process.env.MONGO_URL);
// const PORT = process.env.PORT;

async function uploadToS3 (path,originalFilename,mimetype){
  const client = new S3Client({
    region : "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const parts = originalFilename.split(".");
  const ext = parts[parts.length -1];
  const newFilename = Date.now()+ "." +ext;
      await client.send(new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: "public-read", 
    }));
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

function getUserDataFromReq(req){
  return new Promise((resolve,reject)=>{
    jwt.verify(req.cookies.token,jwtSecret,{},(err,userData)=>{
      if(err) throw err;
      resolve(userData);
    })
  })
}

app.get("/test", function (request, response) {
  mongoose.connect(process.env.MONGO_URL);
  response.json({"test" : "ok" });
});

app.post("/register",async (request,response)=>{
  mongoose.connect(process.env.MONGO_URL);
   const {name,email,password}  = request.body;
  try{
    const userDoc =  await User.create({
      name,
      email,
      password : bcrypt.hashSync(password,bcryptSalt)
    })
     response.json(userDoc);
  }
  catch(error){
    response.status(422).json(error);
  }
});

app.post("/login", async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id,
        name : userDoc.name
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token',token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get("/profile",(req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  // if(token){
  //   jwt.verify(token,jwtSecret,{},async(err,User)=> {
  //     if(err) throw err;
  //     // const userDoc = await User.findOne({});

  //     res.json(User);
  //   })
  // }
  //  else{
  //   res.json(null);
  //  }
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});

app.post("/logout",(req,res) => {
  res.cookie("token","").json(true);
});

app.post('/upload-by-link', async (req,res) => {
  const {link} = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  await imageDownloader.image({
    url: link,
    dest: '/tmp/' +newName,
  });
  const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
  res.json(url);
});


app.post('/places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,price,
      title,address,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    });
    res.json(placeDoc);
  });
});


app.get("/user-places",(req,res)=>{
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  jwt.verify(token,jwtSecret,{},async(err,userData)=>{
    const{id} = userData;
    res.json(await Place.find({owner : id}));
  });
});

app.get("/places/:id",async(req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {id} = req.params;
  res.json(await Place.findById(id));
});

app.put("/places",async(req,res)=>{
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const{id,title,address,addedPhotos,description
  ,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body;
  jwt.verify(token,jwtSecret,{},async(err,userData)=>{
    if(err) throw err;
    const placeDoc = await Place.findById(id);
    if(userData.id === placeDoc.owner.toString()){
      placeDoc.set({
        title,address,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,price,
      })
     await placeDoc.save();
      res.json("ok");
    }
  });
})

app.get("/places",async(req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find());
})

app.post("/bookings",async(req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const{place,checkIn,checkOut,numberOfGuests,
  name,phone,price,} = req.body;
  Booking.create({
    place,checkIn,checkOut,numberOfGuests,
  name,phone,price,
  user : userData.id
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  })
});

app.get("/bookings",async(req,res) => {
  mongoose.connect(process.env.MONGO_URL);
 const userData = await getUserDataFromReq(req);
 res.json(await Booking.find({user : userData.id}).populate("place"));
});

app.listen(4000, () => console.log(`The server started in: 4000 ✨✨`));

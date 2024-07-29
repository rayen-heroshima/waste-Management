const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

mongoose.connect("mongodb://localhost:27017/System")
.then(() => {
    console.log("MongoDB connected successfully");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});
const FeedbackSchema = new mongoose.Schema({
    Description: String,
    RootCauseAnalyse: String,
    actionCorrective: String,
    reponse: String,
    deadLine: Date,
    critereDefecacite: String,
    etat: { type: Number, default: 0 },
  }, { timestamps: true });
// Schemas and Models
const userSchema = new mongoose.Schema({
    name: String,
    pname: String,
    email: { type: String, unique: true }, // Ensure email is unique
    password: String,
    phone: Number,
    user_type: String,
});

const wasteSchema = new mongoose.Schema({
    Weight: String,
    Poste: String,
    Type: String,
    user_id:String
},{ timestamps: true });
const FeedBack=mongoose.model("FeedBack",FeedbackSchema)
const User = mongoose.model("User", userSchema);
const Waste = mongoose.model("Waste", wasteSchema);
app.post("/FeedBack", async (req, res, next) => {
    try {
      const newFeedBack = new FeedBack(req.body);
      await newFeedBack.save();
      res.status(201).send("registered successfully");
    } catch (error) {
      res.json({ message: error.message });
    }
  });
app.delete("/deleteUser/:id",async(req,res,next)=>{
    const {id} =req.params
    try {
        const isDelete = await User.findByIdAndDelete(id);
        res.send("delete is done").status(200)
    } catch (error) {
        res.json({mmessage:error.message})
        
    }
    
})
app.get("/solveFeedBack/:id",async(req,res,next)=>{
    try {
        const{id}=req.params;
        const currentFeedBack = await FeedBack.findById(id);
        currentFeedBack.etat=1
        currentFeedBack.save()
        res.send('done')
    } catch (error) {
        res.json({message:error.message})
    }
})
app.get("/getAllFeedBack",async(req,res,next)=>{
    try{
        FeedBackData = await FeedBack.find({etat:0});
        res.json(FeedBackData)

    }catch(error){
        res.json({message:error.message})

    }
})
app.get("/getUserData",async (req,res,next)=>{
     try {
        userData = await User.find();
        res.json(userData).status(200)
        
     } catch (error) {
        res.json({message:error.message})
     }
})
app.get("/getAllWast",async(req,res,next)=>{
    try {
        wasteData = await Waste.find();
        res.json(wasteData).status(200)
    } catch (error) {
        res.json({message:error.message})
    }
})
// Routes
app.post("/sendData", async (req, res) => {
    try {
        const {weight,post,type,user_id}=req.body;
        console.log(weight)
        console.log(post)
        console.log(type)
        console.log("Received data:", req.body);
        const newWaste = new Waste({Weight:weight,Poste:post,Type:type,user_id:user_id});
        await newWaste.save();
        console.log("Waste data saved successfully");
        res.status(201).send("Data saved successfully");
    } catch (error) {
        console.error("Error saving data:", error.message);
        res.status(500).send("Failed to save data");
    }
});
app.delete("/deleteOperation/:id", async (req,res,next)=>{
    const {id}= req.params
    try {
       const deleteOperation = await Waste.findByIdAndDelete(id) ;
       res.json({message:"done"})
    } catch (error) {
        res.json({message:error.message})
    }
})
app.post("/update/:id",async(req,res,next)=>{
    try {
        const {id} =req.params
        const {weight,post,type,user_id}=req.body;
        console.log(weight)
        console.log(post)
        console.log(type)
        console.log("Received data:", req.body);
        const newWaste = await Waste.findByIdAndUpdate(id,{Weight:weight,Poste:post,Type:type,user_id:user_id,updatedAt: Date.now()},{ new: true });
        await newWaste.save();
        console.log("Waste data saved successfully");
        res.status(201).send("Data saved successfully");
    } catch (error) {
        console.error("Error saving data:", error.message);
        res.status(500).send("Failed to save data");
    }

})
app.get("/getData/:id",async(req,res,next)=>{
    const{id}=req.params
    try {
       
        const data = await Waste.findById({_id:id});
        res.json(data)
    
    } catch (error) {
        res.status(404).json({message:error.message})
    }
})
app.get("/WasteByUser/:id",async (req,res,next)=>{
    const {id} = req.params;
    try {
        const data = await Waste.find({user_id:id});
        res.json(data)
    } catch (error) {
        res.json({message:error.message})
    }


})
app.get("/rapport", async (req, res, next) => {
    try {
      const weights = await Waste.find({}, { _id: 0, Weight: 1 });
      const types = await Waste.find({}, { _id: 0, Type: 1 });
      const postes = await Waste.find({}, { _id: 0, Poste: 1 });
  
      const dataWeight = weights.map(item => item.Weight);
      const dataType = types.map(item => item.Type);
      const dataPoste = postes.map(item => item.Poste);
  
      const data = {
        dataWeight: dataWeight,
        dataType: dataType,
        dataPoste: dataPoste
      };
  
      console.log(data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

app.post("/signUp", async (req, res) => {
    try {
        const { name, pname, email, password, phone, user_type } = req.body;
        console.log("Received signup request:", req.body);
        const newUser = new User({ name, pname, email, password, phone, user_type });
        await newUser.save();
        console.log("User registered successfully");
        res.status(201).send("Registration successful");
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).send("Registration failed");
    }
});

app.post("/logIn", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.password === password) {
            res.status(200).json(existingUser);
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).send("Login failed");
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

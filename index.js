const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");

// const routes = require("./routes/users");
const app = express();
const Usermodel = require("./model/User");
const Recipemodel = require("./model/Recipes");


app.use(express.json());
app.use(cors());


mongoose.connect("mongodb+srv://gaganraghav143:qqehjhc9tMgcBYsI@recipe.df1yolk.mongodb.net/?retryWrites=true&w=majority")
        .then(()=>console.log("connected to database"))
        .catch(()=>console.log("could not connect to database"));

app.get("/" , async(req,res) => {
    try {
        const result = await Recipemodel.find({});
        res.status(200).json(result);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

app.post("/" , async(req,res) => {

    const recipe = new Recipemodel(req.body);

    try {
        await recipe.save();
        res.json(recipe);
           
        }
    catch(err)
    {
        res.json(err);
    }
});


app.put("/" , async(req,res) => {


    try {
    const recipe = await Recipemodel.findById(req.body.recipeID);
    const user = await Usermodel.findById(req.body.userID);
    user.savedRecipes.push(recipe);
    await user.save();

    res.json({savedRecipes : user.savedRecipes});
        }
    catch(err)
    {
        res.json(err);
    }
});
app.get("/savedRecipes/ids/:userID", async(req,res)=> {


    try{
        const user = await Usermodel.findById(req.params.userID);
        res.json({savedRecipes: user?.savedRecipes});


    }
    catch(err)
    {
        res.json(err);
    }
});

app.get("/savedRecipes/:userID", async(req,res)=> {


    try{
        const user = await Usermodel.findById(req.params.userID);
        const savedRecipes = await Recipemodel.find({
            _id : { $in: user.savedRecipes},
        });
        res.json({savedRecipes});
    }
    catch(err)
    {
        res.json(err);
    }
});



app.post("/register" , async(req,res)=>{
    const {username,password} = req.body;
    // const newUser = new Usermodel(username);
    const user = await Usermodel.findOne({username});
    
    if(user)
    {
        return res.json({message:"user already exists!"});
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new Usermodel({username, password:hashedPassword});

    await newUser.save();
    res.json({message:"user registered successfully!"});

});   

app.post("/login" , async(req,res)=> {
    const {username,password} = req.body;
    const user = await Usermodel.findOne({username});

    if(!user)
    {
        return res.json({message:"user Doesn't exists!"});
    }

    const isPasswordValid =  await bcrypt.compare(password , user.password);

    if(!isPasswordValid)
    {
        return res.json({message:"Username or Password is Incorrect!"});
    }

    const token = jwt.sign({id: user._id} , "secret");
    res.json({token , userID: user._id});

});





app.listen(3001, ()=> console.log("server started!"));

const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const usermodel = require("../model/User.js");

const router = express.Router();

router.post("/register" , async(req,res)=>{
        const username = req.body;

        const user = await usermodel.findOne({username});

        res.json(user);

});

module.exports = router;
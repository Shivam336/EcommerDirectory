/*

https://medium.com/@ShiyaLuo/parsing-forms-with-multiple-submit-buttons-in-node-js-with-express-4-4e5cf46d0bd7#:~:text=The%20index%20page%20is%20very,the%20request%20correspondingly%20in%20express.


*/

const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const app=express();
app.set("view engine","ejs");
app.set("views",__dirname+"/views");
app.use(bodyParser.urlencoded({extended:true}));
const port=3000;

app.get("/",(req,res)=>{
    res.render("login");
})

app.listen(port,()=>{
    console.log("=>Server is running at 3000");
})

app.post("/login",(req,res)=>{
    res.render("login");
})




app.post("/signup",(req,res)=>{
    res.render("signup");
})

app.post("/admincreate",(req,res)=>{
    res.render("admincreate");
})




//Database related stuff

//Making Connection with Server
mongoose.connect("mongodb://localhost:27017/ecommerce",{useNewUrlParser:true},(error)=>{
    if(!error)
   {
       console.log("Database Connection is successful");
   }
   else
   {
       console.log("Error connecting to database");   
   }
});


const connection = mongoose.connection;

//Creating Schema for Database
let userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:"Required"
        },
        password:{
            type:String
        },
        credit:{
            type:String
        }
    }
);

let productSchema = new mongoose.Schema(
    {
        product_id:{
            type:String,
            required:"Required"
        },
        product_name:{
            type:String,
            required:"Required"
        },
        product_company:{
            type:String,
            required:"Required"
        },
        product_quantity:{
            type:Number,
            required:"Required"
        },
        product_price:{
            type:Number,
            required:"Required"
        }

    }
)

//Creating Document in Database
let loginmodel = mongoose.model("users",userSchema)
let productmodel = mongoose.model("products",productSchema)

//SignUp data

app.post("/loggedin", (req, res) => {
    var myData = new loginmodel(req.body);
    myData.save().then(item => {
    res.send("item saved to database");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

//To check-data for login
let uname="";
let pword="";
let userId="";
let ccredit="";
app.post("/dashboard",(req,res)=>{
    let username=req.body.username;
    let password=req.body.password;

    if(username=="123" && password=="123")
    {
        res.render("admin",{uname:"123"});
    }
    else
    {
        if(username=="" && password=="")
        {
            alert("Please Enter both the fields");
        }
        else{
            loginmodel.findOne({username:req.body.username,password:req.body.password},(err,data)=>{
                if(err)
                {
                    console.log("Data can not be readed")
                }
                else
                {
                    
                    userId=data._id;
                     uname=data.username;
                     pword=data.password;
                     ccredit=data.credit;
                     
                     res.render("customer",{uname:uname});
                    
                }
            });
           
        }
    }
})

//To add items

app.post("/admincreate_request",(req,res)=>{
    var myData = new productmodel(req.body);
    myData.save().then(item => {
    res.send("item saved to database");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
})

//To read all products

app.post("/adminreadall", (req, res) => {
    productmodel.find((err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("adminreadall",{details:data});
        }
    }
    );
});

app.post("/readalluser",(req,res)=>{
    loginmodel.find((err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("readalluser",{userdetails:data});
        }
    }
    );
})

app.post("/buy",(req,res)=>{
    productmodel.find((err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("buy",{uname:uname,credit:ccredit,details:data});
        }
    })
})

let id=0;
app.post("/buyItem",(req,res)=>{
    let purchase_quantity = req.body.buy_quantity;
    let buy_id=req.body.buy_id;
    productmodel.findOne({product_id:buy_id},(err,data)=>{
        if(err)
        {
            console.log("Data can not be readed")
        }
        else
        {
            id=data._id;
            let quant=data.product_quantity;
            final_quantity=quant-purchase_quantity;
            let finalcredit=ccredit-data.product_price;
            productmodel.findByIdAndUpdate(id,{product_quantity:final_quantity},(err,data)=>{
                if(err)
                {
                    console.log(err);
                }
                else{
                    //res.send("Updated Successfully");
                    productmodel.find((err,data)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                            res.render("buy",{uname:uname,credit:finalcredit,details:data});
                            loginmodel.findByIdAndUpdate(userId,{credit:finalcredit},(err,data)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{
                                    console.log("Credit Score updated");
                                }
                            });
                        }
                    })
                }
            });
        }
    });
})

app.post("/updateyourinfo",(req,res)=>{
           res.render("updateyourinfo",{uname:uname,pword:pword,ccredit:ccredit});
})

app.post("/updatedetailscustomer",(req,res)=>{
    console.log("=>: "+req.body.username);
    let value = req.body.username.String;
    console.log(typeof(value));
    loginmodel.findByIdAndUpdate(userId,{username:req.body.username,password:req.body.password,credit:req.body.credit},(err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("login");
        }
    });
});

app.post("/adminupdate",(req,res)=>{
    productmodel.find((err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("adminupdate",{details:data});
        }
})
});

app.post("/editItemAdmin",(req,res)=>{
    let objectId = req.body.object_id;
    productmodel.findByIdAndUpdate(objectId,{product_name:req.body.product_name,product_company:req.body.product_company,product_quantity:req.body.product_quantity,product_price:req.body.product_price},(err,data)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            productmodel.find((err,data)=>{
                if(err)
                {
                    console.log(err);
                }
                else{
                    res.render("adminupdate",{details:data});
                }
        })
        }
    });
})

app.post("/deleteItemAdmin",(req,res)=>{
    productmodel.remove({_id:req.body.object_id},(err,data)=>{
        if(err)
        {
            console.log("Delete failed");
        }
        else{
            productmodel.find((err,data)=>{
                if(err)
                {
                    console.log(err);
                }
                else{
                    res.render("adminupdate",{details:data});
                }
        })
        }
    });
})

app.post("/deleteUserAccount",(req,res)=>{
    loginmodel.findByIdAndRemove({_id:userId},(err,data)=>{
        if(err)
        {
            console.log("Delete failed");
        }
        else{
             res.render("login");
        }
                
        })    
});
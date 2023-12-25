require("dotenv").config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const moongoose = require("mongoose");
const AuthController = require("./controllers/Authcontrollers")
const authenticationMiddleware = require("./Authmiddleware");  // Import authentication middleware.





app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())


app.get("/", (res, req, next)=> {
    res.send("Welcome to the home page")
});



                            // Auth Routes
app.post('/signup', AuthController.signup);
app.post('/login', AuthController.login);
app.post('/registerseller',authenticationMiddleware, AuthController.RegisterAsSeller);
app.post('/registerAdmin',authenticationMiddleware, AuthController.RegisterAsAdmin);
app.post('/loginAsAdmin',authenticationMiddleware, AuthController.loginAsAdmin);
app.patch('/change-password', AuthController.ChangePassword);
app.post('/forgot-password', AuthController.forgotPassword);
app.post('/:id',authenticationMiddleware, AuthController.findbyid);
app.delete("/deleteuser", AuthController.deleteuser);


                     // MENU ROUTES
    
app.post('/Add-Product', menuController.Addproduct);
app.patch('/:id/update-product', menuController.updateproductbyId);
app.get('/list-products', menuController.listproducts);
app.get('/getProductPrice/:productName',menuController.searchproduct);
app.delete('/:id/deleteproduct', menuController.deleteproduct);
app.post('/Addtocart', menuController.addToCart);
app.get('/:email/getcart', menuController.getCart);

                     


//mongodb+srv://adesinatoheeb179:0fVnu2MB3ks1w6FH@cluster0.fc7g7rl.mongodb.net/?retryWrites=true&w=majority

// connection made to mongodb database
moongoose.connect("mongodb+srv://adesinatoheeb179:0fVnu2MB3ks1w6FH@cluster0.fc7g7rl.mongodb.net/?retryWrites=true&w=majority")
.then((done)=> {
    console.log("Database connection was successful")

    // Routes set-up
    //app.use("/Auth", authRoutes)
    //app.use("/menu", Menuroutes)


    // Start the server when the connection is successful
    app.listen(process.env.Port, () => {
        console.log(`Listening for requests on ${process.env.Port} `)
    })

})
.catch((err) => {
    console.log("an error occured during connection", err)
})

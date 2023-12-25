const bcrypt = require("bcrypt");
const SellersModel = require("../models/SellersModel");
const MenuModel = require("../models/MenuModel")
const CartItem = require("../models/CartModel")



const  AddProduct = async (req, res, next) => {
    let data = data.body;
    let companyName = data.companyName;
    let product = data.product;
    let price = data.price;
    let password = data.password;
    let remainder = data.remainder;
    let email = data.email;

    const user = await SellersModel.findOne({email})
    if(!user) {
        res.status(400).json({message: "Sorry, this email has not been registered as a seller. Either check your email or signup as a seller"})
    } 
    const VerifyPassword = await bcrypt.compare(password, user.password) 

    if(VerifyPassword) {
        const MenuData = {
            product,
            price,
            remainder,
            companyName,
            user: user.id,
        };
        const AddedMenu = MenuModel.create(MenuData)
        .then((done) => {
            res.status(200).json({
                Message: "Product details has been uploaded successfully", 
                Details: AddedMenu})
        })
        .catch((err) => {
            res.status(500).json({Error: "Unknown error occured", err})
        });

    }else {
        res.status(401).json({Message: "Your password is incorrect. Please check again."})
    }
};



function updateproductbyId(req, res, next) {
    let id = req.params.id;
    let email= req.body.email

    let updatedMenu = req.body;
  const verifyseller = sellers.findOne({id})
  if(!verifyseller){
    return res.status(404).json({message:"Seller not found, please check your details or sign in as one."})
  }
  else{
    MenuModel.findById(id)
        .then((done) => {
            if (!done) {
                res.status(404).json({ message: "Menu not found" });
            } else {
                MenuModel.updateOne({ _id: id }, updatedMenu)
                    .then(() => {
                        res.status(200).json({ message: "Menu updated successfully",NewMenu:updatedMenu });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Failed to update menu",err });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
  }
    
};


function deleteproduct(req,res,next){
        let data = req.body
        let  product = data.product
        let price = data.price
        let id = req.params.id
       const identifyseller = sellers.findById({id})
       if(!identifyseller){
        return res.status(500).json({message : "Seller not found"})
       }
       else{
        MenuModel.deleteOne({ product })
            .then((done) => {
                res.status(200).json({
                    message: `Product ${product} deleted succesfully`,
                    done,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Failed to delete product.", err,
                });
            });
       }
        
    };

    const AddToCart = async (req, res, next) => {
        try {
        const data = req.body
        const product = data.product;
        const email = data.email;
        const quantity = data.quantity;
      
          const menuProduct = await MenuModel.findOne({ product });
          if (!menuProduct) {
            return res.status(404).json({ message: 'Product not found' });
          }
            cartItem = new CartItem({
              email,
              product,
              quantity: parseInt(quantity, 10),
              price: menuProduct.price * quantity,
            });
      
          await cartItem.save();
          res.status(200).json({ message: 'Item added to cart successfully', cartItem });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error adding item to cart' });
        }
      };


            
const getCart = async (req, res, next) => {
    try {
      const email = req.params.email;
  
    
      const cartItems = await cartItems.find({ email });
  
      if (!cartItems || cartItems.length === 0) {
        return res.status(404).json({ message: 'Cart is empty ' });
      }



const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);
  
      res.status(200).json({ cartItems,totalAmount});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching cart items' });
    }
  };

  const searchproduct = async (req, res, next) => {
    try {
      const { productName } = req.params;

      const foundProduct = await MenuModel.findOne({ product: productName }, { price: 1 });
  
      if (foundProduct) {
        res.json({ product: productName, price: foundProduct.price, remaining:foundProduct.remaining, company_name:foundProduct.company_name});
      } else {
        res.status(404).json({ message: `Product ${productName} not found` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const listproducts = async (req, res, next) => {
    try {
        const productsList = await MenuModel.find().select('product price remaining company_name');
        res.status(200).json({ productsList});
    } catch (err) {
        res.status(500).json({ message: "Unknown error occurred", err });
    }
};
  





module.exports = {
    AddProduct, 
    updateproductbyId,
    deleteproduct,
    AddToCart,
    getCart,
    searchproduct,
    listproducts
};


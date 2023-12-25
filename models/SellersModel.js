const mongoose = require('mongoose');

const sellersSchema = new mongoose.Schema({
  email: { type: String, required: true }, 
  name: { type: String, required: true }, 
  company: { type: String, required: true },
  password:{type:String,required: true},
});

const SellersModel = mongoose.model('sellers', sellersSchema);

module.exports = SellersModel;


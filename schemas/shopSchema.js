const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shopItemSchema = new Schema({
    name: {type: String},
    level: {type: Number},
    cost: {type: Number},
    effect: {type: Number}
});


const ShopItem = mongoose.model("Shop", shopItemSchema);
module.exports = ShopItem;
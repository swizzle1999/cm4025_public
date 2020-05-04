const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const packSchema = new Schema({
    code: {type: String, unique: true},
    ptcgoCode: {type: String},
    name: {type: String},
    series: {type: String},
    totalCards: {type: Number},
    standardLegal: {type: Boolean},
    expandedLegal: {type: Boolean},
    releaseDate: {type: String},
    symbolUrl: {type: String},
    mySymbolUrl: {type: String},
    logoUrl: {type: String},
    myLogoUrl: {type: String},
    updatedAt: {type: String},
    cost: {type: Number},
    rarityOdds: {},
    propertiesAreSet: {type: Boolean, default: false},
    level: {type: Number, default: 1},
    cards: [],
}, {
    timestamps: true,
});

const Pack = mongoose.model("Pack", packSchema);

module.exports = Pack;
const mongoose = require("mongoose");

const schema = mongoose.Schema({
    title: { type: String, require: true, max: 100 },
    price: { type: Number, require: true },
    thumbnail: { type: String, require: true, max: 100 },
});

const Producto = mongoose.model("productos", schema);

module.exports = Producto;

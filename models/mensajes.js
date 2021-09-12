const mongoose = require("mongoose");

const schema = mongoose.Schema({
    author: {
        id: { type: String, require: true, max: 100 },
        nombre: { type: String, require: true, max: 100 },
        apellido: { type: String, require: true, max: 100 },
        edad: { type: Number, require: true },
        alias: { type: String, require: true, max: 100 },
        avatar: { type: String, require: true },
    },
    text: { type: String, max: 400 },
});

const Mensajes = mongoose.model("mensajes", schema);

module.exports = Mensajes;

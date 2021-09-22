const Mensajes = require("../models/mensajes");
const MongoCRUD = require("../repository/crud");

class MensajesController extends MongoCRUD {
    constructor() {
        super(Mensajes);
    }
}

module.exports = new MensajesController();

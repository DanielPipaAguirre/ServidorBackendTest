const Productos = require("../models/productos");
const MongoCRUD = require("../repository/crud");
const faker = require("../models/faker");

class ProductosController extends MongoCRUD {
    constructor() {
        super(Productos);
    }

    generar(cant = 10) {
        let productos = [];
        if (!Number(cant)) return [];
        for (let i = 0; i < cant; i++) {
            productos.push(faker.generar());
        }

        return productos;
    }
}

module.exports = new ProductosController();

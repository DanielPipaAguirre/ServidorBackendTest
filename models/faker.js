const faker = require("faker");

class ProductosFaker {
    constructor() {}

    generar() {
        return {
            title: faker.commerce.product(),
            price: faker.commerce.price(),
            thumbnail: faker.internet.avatar()
        };
    }
}

module.exports = new ProductosFaker();

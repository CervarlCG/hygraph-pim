"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_1 = require("./routes/webhooks/products");
exports.default = () => {
    // add your custom routes here
    return [(0, products_1.getWebhooksRouter)()];
};

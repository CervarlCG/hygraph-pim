"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = async (req, res) => {
    const product = req.body;
    const hygraphService = req.scope.resolve("hygraphService");
    if (product.operation !== "update") {
        res.status(400).send("Invalid operation");
        return;
    }
    await hygraphService.handleUpdateProduct(product.data);
    res.status(200).send();
};

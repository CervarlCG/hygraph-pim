"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebhooksRouter = void 0;
const express_1 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const medusa_1 = require("@medusajs/medusa");
const update_handler_1 = __importDefault(require("./update-handler"));
const webhooksRouter = (0, express_1.Router)();
function getWebhooksRouter() {
    webhooksRouter.post("/webhooks/products", body_parser_1.default.json(), (0, medusa_1.wrapHandler)(update_handler_1.default));
    webhooksRouter.get("webhooks/test", (req, res) => res.send({ success: true }));
    return webhooksRouter;
}
exports.getWebhooksRouter = getWebhooksRouter;

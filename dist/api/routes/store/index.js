"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreRouter = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const custom_route_handler_1 = __importDefault(require("./custom-route-handler"));
const medusa_1 = require("@medusajs/medusa");
const storeRouter = (0, express_1.Router)();
function getStoreRouter(storeCorsOptions) {
    storeRouter.use((0, cors_1.default)(storeCorsOptions), body_parser_1.default.json());
    storeRouter.post("/store/my-custom-path", (0, medusa_1.wrapHandler)(custom_route_handler_1.default));
    return storeRouter;
}
exports.getStoreRouter = getStoreRouter;

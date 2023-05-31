import { Router } from "express";
import { getWebhooksRouter } from "./routes/webhooks/products";

export default (): Router | Router[] => {
  // add your custom routes here
  return [getWebhooksRouter()];
};

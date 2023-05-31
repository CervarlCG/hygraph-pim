import { Router } from "express";
import bodyParser from "body-parser";
import { wrapHandler } from "@medusajs/medusa";
import updateHandler from "./update-handler";

const webhooksRouter = Router();
export function getWebhooksRouter(): Router {
  webhooksRouter.post(
    "/webhooks/products",
    bodyParser.json(),
    wrapHandler(updateHandler)
  );

  return webhooksRouter;
}

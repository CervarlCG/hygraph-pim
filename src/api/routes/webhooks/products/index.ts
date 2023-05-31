import { Request, Response, Router } from "express";
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

  webhooksRouter.get("webhooks/test", (req: Request, res: Response) =>
    res.send({ success: true })
  );

  return webhooksRouter;
}

import { HygraphProduct } from "common/interfaces/hygraph-product";
import { Request, Response } from "express";
import HygraphService from "services/hygraphService";

export default async (req: Request, res: Response): Promise<void> => {
  const product: HygraphProduct.Payload = req.body;
  const hygraphService: HygraphService = req.scope.resolve("hygraphService");

  if (product.operation !== "update") {
    res.status(400).send("Invalid operation");
    return;
  }

  await hygraphService.handleUpdateProduct(product.data);
  res.status(200).send();
};

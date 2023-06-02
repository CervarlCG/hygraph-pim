import {
  ProductService,
  ProductVariantService,
  ShippingProfileService,
} from "@medusajs/medusa";
import { ICacheService } from "@medusajs/types";

export interface HygraphServiceOptions {
  apiUrl: string;
  apiAuthorization: string;
}

export interface HygraphServiceContainer {
  productService: ProductService;
  productVariantService: ProductVariantService;
  shippingProfileService: ShippingProfileService;
  cacheService: ICacheService;
}

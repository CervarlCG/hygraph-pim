import {
  MoneyAmount,
  ProductService,
  ProductVariantService,
  ShippingProfileService,
  Product,
  ProductOption,
  TransactionBaseService,
} from "@medusajs/medusa";
import { ICacheService } from "@medusajs/types";
import { HygraphProduct } from "common/interfaces/hygraph-product";

export default class HygraphService extends TransactionBaseService {
  productService: ProductService;
  productVariantService: ProductVariantService;
  shippingProfileService: ShippingProfileService;
  cacheService: ICacheService;
  baseCacheIdentifier = "hygraph_pim";

  constructor({
    productService,
    productVariantService,
    shippingProfileService,
    cacheService,
  }: {
    productService: ProductService;
    productVariantService: ProductVariantService;
    shippingProfileService: ShippingProfileService;
    cacheService: ICacheService;
  }) {
    super({ productService, productVariantService, shippingProfileService });

    this.productService = productService;
    this.productVariantService = productVariantService;
    this.shippingProfileService = shippingProfileService;
    this.cacheService = cacheService;
  }

  async canBlockAction(action: string, key: string) {
    const cacheKey = `${this.baseCacheIdentifier}_${action}_${key}`;
    if ((await this.cacheService.get(cacheKey)) === "yes") throw new Error();
    await this.cacheService.set(key, "yes", 10);
  }

  async unblockAction(action: string, key: string) {
    const cacheKey = `${this.baseCacheIdentifier}_${action}_${key}`;
    await this.cacheService.invalidate(cacheKey);
  }

  /**
   * Handle product updated event on Hygraph
   * @param hygraphProduct The product payload
   */
  async handleUpdateProduct(hygraphProduct: HygraphProduct.Data) {
    return new Promise((resolve, reject) => {
      this.canBlockAction("update", hygraphProduct.id)
        .then(() => this.retrieveProduct(hygraphProduct))
        .then((product) => this.updateAdminProduct(product, hygraphProduct))
        .then((product) =>
          this.updateAdminProductVariations(product, hygraphProduct.variations)
        )
        .then(() => this.unblockAction("update", hygraphProduct.id))
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Retrieve a product by url or create it if not exists
   * @param hygraphProduct The product data
   * @returns The Product Object
   */
  async retrieveProduct(hygraphProduct: HygraphProduct.Data) {
    try {
      return await this.getProductByHandle(hygraphProduct.url || "");
    } catch {}

    return await this.createProduct(hygraphProduct);
  }

  async getProductByHandle(handle: string) {
    return this.productService.retrieveByHandle(handle, {
      relations: ["options"],
    });
  }

  /**
   * Create a product
   * @param hygraphProduct The product data
   * @returns The Product Object
   */
  async createProduct(hygraphProduct: HygraphProduct.Data) {
    const product = await this.productService.create({
      title: hygraphProduct.title,
      subtitle: hygraphProduct.subtitle,
      handle: hygraphProduct.url,
      options: [],
      profile_id:
        (await this.shippingProfileService.retrieveDefault())?.id || "",
      metadata: {
        hygraphId: hygraphProduct.id,
      },
    });
    product.options = [];
    return product;
  }

  /**
   * Update a product to sync its fields
   * @param product Product Object
   * @param hygraphProduct The product data
   */
  async updateAdminProduct(
    product: Product,
    hygraphProduct: HygraphProduct.Data
  ) {
    return await this.updateProductOptions(product, hygraphProduct);
  }

  /**
   * Add and remove optiosn based to hygraph update
   * @param product The product object
   * @param hygraphProduct The updated product
   * @returns The product after update options
   */
  async updateProductOptions(
    product: Product,
    hygraphProduct: HygraphProduct.Data
  ) {
    const medusaOptions =
      product.options?.reduce(
        (acc, current) => ({ ...acc, [current.title]: current }),
        []
      ) || [];
    const hygraphOptions: string[] = hygraphProduct.productOptions.reduce(
      (acc, opt) => [...acc, opt.optionName],
      []
    );

    const medusaOptionsToDelete = product.options.filter(
      (opt) => !hygraphOptions.includes(opt.title)
    );

    const medusaOptionsToAdd = hygraphOptions.filter(
      (opt) => !medusaOptions[opt]
    );

    for (const option of medusaOptionsToDelete) {
      await this.productService.deleteOption(product.id, option.id);
    }

    for (const option of medusaOptionsToAdd) {
      await this.productService.addOption(product.id, option);
    }

    // Add options doesn't retrieve the product with the options properties set
    return await this.getProductByHandle(product.handle);
  }

  /**
   * Update product variants to sync its fields
   * @param product Product Object
   * @param hygraphProduct The product data
   */
  async updateAdminProductVariations(
    product: Product,
    hygraphVariations: HygraphProduct.Variation[]
  ) {
    const variationsMap = new Map();
    const variantionsToDelete = [];
    const allowedSku = hygraphVariations.map((v) => v.sku);
    const productOptions = this.getFormattedProductOptions(product.options);
    const productVariations = await this.productService.retrieveVariants(
      product.id,
      { relations: ["options"] }
    );

    for (const productVariation of productVariations) {
      variationsMap.set(productVariation.sku, productVariation);
      if (!allowedSku.includes(productVariation.sku))
        variantionsToDelete.push(productVariation.id);
    }

    for (const hygraphVariation of hygraphVariations) {
      const props = {
        title: hygraphVariation.customTitle || hygraphVariation.sku,
        sku: hygraphVariation.sku,
        prices: this.parseProductVariationPricing(hygraphVariation.prices),
        options: hygraphVariation.variationOptions
          .map((opt) => ({
            option_id: productOptions[opt.name],
            value: opt.value,
          }))
          .filter((opt) => !!opt.option_id),
      };

      const variation = variationsMap.get(hygraphVariation.sku);

      if (!variation)
        await this.productVariantService.create(product.id, {
          ...props,
          inventory_quantity: 0,
        });
      else await this.productVariantService.update(variation.id, props);
    }

    if (variantionsToDelete.length)
      await this.productVariantService.delete(variantionsToDelete);
  }

  /**
   * Convert the json variation prices to a native MoneyAmount object
   * @param prices The product prices
   * @returns An array of MoneyAmount instances
   */
  parseProductVariationPricing(prices: HygraphProduct.Price[]): MoneyAmount[] {
    return prices.map((price) => {
      const money = new MoneyAmount();
      money.min_quantity = price.minQuantity;
      money.max_quantity = price.maxQuantity;
      money.currency_code = "usd";
      money.amount = price.price;
      return money;
    });
  }

  /**
   * Convert variation options array to object
   * @param options Variation options
   * @returns Variations options object
   */
  getFormattedProductOptions(options: ProductOption[]) {
    return options.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.title]: opt.id,
      }),
      {}
    );
  }
}

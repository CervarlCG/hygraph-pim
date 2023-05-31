"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const medusa_1 = require("@medusajs/medusa");
const medusa_interfaces_1 = require("medusa-interfaces");
class HygraphService extends medusa_interfaces_1.BaseService {
    productService;
    productVariantService;
    shippingProfileService;
    constructor({ productService, productVariantService, shippingProfileService, }) {
        super();
        this.productService = productService;
        this.productVariantService = productVariantService;
        this.shippingProfileService = shippingProfileService;
    }
    /**
     * Handle product updated event on Hygraph
     * @param hygraphProduct The product payload
     */
    async handleUpdateProduct(hygraphProduct) {
        let product = await this.retrieveProduct(hygraphProduct);
        product = await this.updateAdminProduct(product, hygraphProduct);
        await this.updateAdminProductVariations(product, hygraphProduct.variations);
    }
    /**
     * Retrieve a product by url or create it if not exists
     * @param hygraphProduct The product data
     * @returns The Product Object
     */
    async retrieveProduct(hygraphProduct) {
        try {
            return await this.productService.retrieveByHandle(hygraphProduct.url || "");
        }
        catch { }
        return await this.createProduct(hygraphProduct);
    }
    /**
     * Create a product
     * @param hygraphProduct The product data
     * @returns The Product Object
     */
    async createProduct(hygraphProduct) {
        return await this.productService.create({
            title: hygraphProduct.title,
            subtitle: hygraphProduct.subtitle,
            handle: hygraphProduct.url,
            options: [],
            profile_id: (await this.shippingProfileService.retrieveDefault())?.id || "",
            metadata: {
                cms: "hygraph",
                hygraphId: hygraphProduct.id,
            },
        });
    }
    /**
     * Update a product to sync its fields
     * @param product Product Object
     * @param hygraphProduct The product data
     */
    async updateAdminProduct(product, hygraphProduct) {
        const options = hygraphProduct.productOptions.map((option) => ({
            title: option.optionName,
        }));
        return this.productService.update(product.id, { options });
    }
    /**
     * Update product variants to sync its fields
     * @param product Product Object
     * @param hygraphProduct The product data
     */
    async updateAdminProductVariations(product, hygraphVariations) {
        const variations = await this.productService.retrieveVariants(product.id);
        const options = this.getFormattedProductOptions(product.options);
        const toDelete = [];
        for (const variation of variations) {
            const hygraphVariation = hygraphVariations.find((v) => v.sku === variation.sku);
            if (!hygraphVariation) {
                toDelete.push(variation.id);
                continue;
            }
            await this.productVariantService.update(variation.id, {
                title: hygraphVariation.customTitle || null,
                prices: this.parseProductVariationPricing(hygraphVariation.prices),
                options: hygraphVariation.variationOptions
                    .map((opt) => ({ option_id: options[opt.name], value: opt.value }))
                    .filter((opt) => !!opt.option_id),
            });
        }
        if (toDelete.length)
            await this.productVariantService.delete(toDelete);
    }
    /**
     * Convert the json variation prices to a native MoneyAmount object
     * @param prices The product prices
     * @returns An array of MoneyAmount instances
     */
    parseProductVariationPricing(prices) {
        return prices.map((price) => {
            const money = new medusa_1.MoneyAmount();
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
    getFormattedProductOptions(options) {
        return options.reduce((acc, opt) => ({
            ...acc,
            [opt.title]: opt.id,
        }), {});
    }
}
exports.default = HygraphService;

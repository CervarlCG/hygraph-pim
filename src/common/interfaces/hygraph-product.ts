export namespace HygraphProduct {
  export interface Payload {
    operation: string;
    data: Data;
  }

  export interface Data {
    __typename: string;
    createdAt: string;
    createdBy: CreatedBy;
    id: string;
    productOptions: ProductOption[];
    publishedAt: any;
    publishedBy: any;
    scheduledIn: any[];
    sku: string;
    stage: string;
    subtitle: string;
    thumbnail: Thumbnail;
    title: string;
    updatedAt: string;
    updatedBy: UpdatedBy;
    url: any;
    variations: Variation[];
  }

  export interface CreatedBy {
    __typename: string;
    id: string;
  }

  export interface ProductOption {
    __typename: string;
    id: string;
    optionName: string;
    stage: string;
  }

  export interface Thumbnail {
    __typename: string;
    id: string;
  }

  export interface UpdatedBy {
    __typename: string;
    id: string;
  }

  export interface Variation {
    __typename: string;
    customTitle: any;
    id: string;
    sku: string;
    prices: Price[];
    stage: string;
    variationOptions: VariationOption[];
  }

  export interface Price {
    __typename: string;
    id: string;
    maxQuantity?: number;
    minQuantity: number;
    price: number;
    stage: string;
  }

  export interface VariationOption {
    __typename: string;
    id: string;
    name: string;
    stage: string;
    value: string;
  }
}

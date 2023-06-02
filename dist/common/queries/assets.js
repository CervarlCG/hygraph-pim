"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_ASSET = void 0;
const graphql_request_1 = require("graphql-request");
exports.GET_ASSET = (0, graphql_request_1.gql) `
  query getAsset($id: ID) {
    asset(where: { id: $id }) {
      url
    }
  }
`;

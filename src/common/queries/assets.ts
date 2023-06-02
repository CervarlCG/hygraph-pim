import { gql } from "graphql-request";

export const GET_ASSET = gql`
  query getAsset($id: ID) {
    asset(where: { id: $id }) {
      url
    }
  }
`;

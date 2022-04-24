import React from "react";
import { Map, Marker } from "pigeon-maps";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloProvider,
  gql,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client";

import fetch from "isomorphic-fetch";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import isNode from "is-node";
import ws from "ws";

const wsLink = new WebSocketLink({
  uri: "wss://opentak.herokuapp.com/v1/graphql",
  options: {
    reconnect: true,
  },
  webSocketImpl: isNode ? ws : null,
});

const httpLink = createHttpLink({
  uri: "https://opentak.herokuapp.com/v1/graphql",
  fetch,
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

const IndexPage = () => {
  const [userId, setUserId] = React.useState(null);
  const { data, loading, error } = useSubscription(
    gql`
      subscription MyQuery($user_id: uuid!) {
        user_location(
          order_by: { created_at: desc }
          limit: 1
          where: { user_id: { _eq: $user_id } }
        ) {
          longitude
          latitude
          created_at
        }
      }
    `,
    { variables: { user_id: userId } }
  );
  const [addNewUserLocation] = useMutation(gql`
    mutation MyMutation(
      $latitude: float8!
      $longitude: float8!
      $user_id: uuid!
    ) {
      insert_user_location(
        objects: {
          user_id: $user_id
          longitude: $longitude
          latitude: $latitude
        }
      ) {
        returning {
          created_at
        }
      }
    }
  `);

  React.useEffect(() => {
    navigator.geolocation.watchPosition((position) => {
      if (userId) {
        addNewUserLocation({
          variables: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            user_id: userId,
          },
        });
      }
    });
  }, []);

  return (
    <div>
      <p>{data?.user_location[0].latitude}</p>
      <p>{data?.user_location[0].longitude}</p>
      <input
        type="text"
        onChange={(e) => {
          setUserId(e.target.value);
        }}
      />
      <br />
      <br />
      {data?.user_location[0].latitude && data?.user_location[0].longitude && (
        <Map
          height={300}
          defaultCenter={[
            data?.user_location[0].latitude,
            data?.user_location[0].longitude,
          ]}
          defaultZoom={15}
        >
          <Marker
            width={50}
            anchor={[
              data?.user_location[0].latitude,
              data?.user_location[0].longitude,
            ]}
          />
        </Map>
      )}
    </div>
  );
};

const BasePage = (props) => (
  <ApolloProvider client={client}>
    <IndexPage {...props} />
  </ApolloProvider>
);

export default BasePage;

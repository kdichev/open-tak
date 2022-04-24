import React from "react";
import { Map, Marker } from "pigeon-maps";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
  useMutation,
} from "@apollo/client";

const client = new ApolloClient({
  uri: "https://opentak.herokuapp.com/v1/graphql",
  cache: new InMemoryCache(),
});

const IndexPage = () => {
  const [userId, setUserId] = React.useState(null);
  const { data, loading, error } = useQuery(
    gql`
      query MyQuery($user_id: uuid!) {
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

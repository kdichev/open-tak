import React from "react";
import { useCurrentPosition } from "react-use-geolocation";
import { Map, Marker } from "pigeon-maps";

const IndexPage = () => {
  const [position, error] = useCurrentPosition();

  if (!position && !error) {
    return <p>Waiting...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }
  return (
    <div>
      <p>Latitude: {position.coords.latitude}</p>
      <p>Longitude: {position.coords.longitude}</p>
      <Map
        height={300}
        defaultCenter={[position.coords.latitude, position.coords.longitude]}
        defaultZoom={11}
      >
        <Marker
          width={50}
          anchor={[position.coords.latitude, position.coords.longitude]}
        />
      </Map>
    </div>
  );
};

export default IndexPage;

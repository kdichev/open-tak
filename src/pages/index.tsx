import React from "react";
import { Map, Marker } from "pigeon-maps";

const IndexPage = () => {
  const [coords, setcoords] = React.useState({});
  React.useEffect(() => {
    navigator.geolocation.watchPosition((position) => {
      console.log(position.coords.latitude);
      console.log(position.coords.longitude);
      setcoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  return (
    <div>
      <p>{coords.latitude}</p>
      <p>{coords.longitude}</p>
      {coords.latitude && coords.longitude && (
        <Map
          height={300}
          defaultCenter={[coords.latitude, coords.longitude]}
          defaultZoom={11}
        >
          <Marker width={50} anchor={[coords.latitude, coords.longitude]} />
        </Map>
      )}
    </div>
  );
};

export default IndexPage;

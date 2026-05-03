mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [77.209, 28.6139], // starting position [lng, lat]
  zoom: 9,
});

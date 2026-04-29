mapboxgl.accessToken = MAP_TOKEN;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [77.209, 28.6139], 
  zoom: 9,
});

// console.log(coordinates);

const marker = new mapboxgl.Marker()
  .setLngLat([77.209, 28.6139])
  .addTo(map);
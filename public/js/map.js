mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: coordinates,  // ✅ dynamic
  zoom: 9,
});

// marker bhi add kar
new mapboxgl.Marker()
  .setLngLat(coordinates)
  .addTo(map);
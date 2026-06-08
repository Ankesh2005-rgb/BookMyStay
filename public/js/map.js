if (typeof mapboxgl !== "undefined" && typeof mapToken !== "undefined" && Array.isArray(coordinates)) {
  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
} else {
  console.log("Map init skipped:", { mapboxgl, mapToken, coordinates });
}
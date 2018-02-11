mapboxgl.accessToken = 'pk.eyJ1IjoibW9waW5maXNoIiwiYSI6ImNqZGZreGVuajBhNjIyd29idXI3ZHFxNm4ifQ._edxUwp0j5sAl7FsK9oyrA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mopinfish/cjdig1o651oxc2rmksb7qh0qb', // stylesheet location
    center: [139.767052, 35.681167], // starting position [lng, lat]
    zoom: 13 // starting zoom
});
map.on('load', () => {
  map.on('click', 'terminal', (e) => {
    const feature = e.features[0]
        , properties = feature.properties
        , message = "<strong>" + properties.terminal_name + "</strong><br>"
                  + "事業者: " + properties.company_name
        ;

    new mapboxgl.Popup()
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(message)
      .addTo(map);
  });
});

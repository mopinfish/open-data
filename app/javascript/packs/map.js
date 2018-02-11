mapboxgl.accessToken = 'pk.eyJ1IjoibW9waW5maXNoIiwiYSI6ImNqZGZreGVuajBhNjIyd29idXI3ZHFxNm4ifQ._edxUwp0j5sAl7FsK9oyrA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-74.50, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

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
        , message = "<strong>" + properties.terminal_name + "</strong><br><br>"
                  + "事業者: " + properties.company_name + "<br>"
                  + "段差が解消されているバースの数: " + properties.berth_number_with_steps_eliminated + "<br>"
                  + "エレベーターの設置数: " + properties.elevator_number + "<br>"
                  + "エスカレーターの設置数: " + properties.escalator_number + "<br>"
                  + "傾斜路の設置箇所数: " + properties.ramp_number + "<br>"
                  + "視聴覚障害者用誘導ブロックの有無: " + properties.brence_of_block_for_audiovisual_handicapped + "<br>"
                  + "案内設備の有無: " + properties.presence_of_guidance_facility + "<br>"
                  + "障害者対応型便所の有無: " + properties.presence_of_toilet_for_handicapped + "<br>"
                  + "障害者対応券売機の有無: " + properties.presence_of_ticket_vending_machine_for_handicapped + "<br>"
        ;

    new mapboxgl.Popup()
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(message)
      .addTo(map);
  });
});

<template>
<div>
  <div id='map' style='width: 800px; height: 600px;'>
  </div>
  <div>
    <ul id='bus'>
      <li v-for='busStop in busStops'>
        {{ busStop['geo:long'] }}
      </li>
    </ul>
  </div>
</div>

</template>

<script>
  import axios from 'axios';

  export default {
    data: function () {
      return {
        busInfos: [],
        map: null
      }
    },
    mounted() {
      this.loadMap();
      this.fetchBusStops();
    },
    methods: {
      loadMap: function () {
        mapboxgl.accessToken = 'pk.eyJ1Ijoib2dhbnlhbiIsImEiOiJjamRpNHFjbjQxNzRsMnFuOXNjYnFvY3ozIn0.CelyeP1hYHkcf6-QH1KsmA';
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/oganyan/cjdi9hvzm0ggh2tnvdda7oac6',
          center: [139.6, 35.7],
          zoom: 12,
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.map.on('click', 'places', function (e) {
          new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(this);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        this.map.on('mouseenter', 'places', function () {
          this.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'places', function () {
          this.getCanvas().style.cursor = '';
        });
      },
      fetchBusStops: function () {
        axios.get('https://api-tokyochallenge.odpt.org/api/v4/odpt:BusstopPole?acl:consumerKey=7e73ec8599cf081fb1d03a51e34c571871b8a206fc607649562f3bacc0897f8d').then((response) => {
          for(var i = 0; i < response.data.length; i++) {
            this.busInfos.push({
              'long': response.data[i]['geo:long'],
              'lat': response.data[i]['geo:lat'],
              'title': response.data[i]['dc:title'],
              'owl:sameAs': response.data[i]['owl:sameAs']
            });
          }
          this.addBusStops(this.busInfos);
        }, (error) => {
          console.log(error);
        });

        axios.get('https://api-tokyochallenge.odpt.org/api/v4/odpt:Bus&acl:consumerKey=7e73ec8599cf081fb1d03a51e34c571871b8a206fc607649562f3bacc0897f8d').then((response) => {
          for(var i = 0; i < response.data.length; i++) {
            this.busLocations.push({
              'long': response.data[i]['geo:long'],
              'lat': response.data[i]['geo:lat'],
              'title': response.data[i]['dc:title'],
              'owl:sameAs': response.data[i]['owl:sameAs']
            });
          }
          this.addBusStops(this.busInfos);
        }, (error) => {
          console.log(error);
        });
      },
      addBusStops: function (busInfos) {
        var features = []
        for(var i = 0; i < busInfos.length; ++i) {
          let feature = {
            'type': 'Feature',
            'properties': {
              "description": "<p>" + busInfos[i]['title'] + "</p>",
              'icon': 'theatre'
            },
            'geometry': {
              'type': 'Point',
              'coordinates': [busInfos[i]['long'], busInfos[i]['lat']]
            }
          }
          features.push(feature)
        }

        this.map.addLayer({
          'id': 'places',
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': features
            }
          },
          'layout': {
            'icon-image': '{icon}-15',
            'icon-allow-overlap': true
          }
        });
      }
    }
  }
</script>

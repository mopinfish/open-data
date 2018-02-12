<template>
<div>
  <div>
    <select v-model='selected'>
      <option v-for='option in options' v-bind:value='option'>
        {{ option }}
      </option>
    </select>
  </div>

  <div id='map' style='width: 800px; height: 600px;'>
  </div>
</div>

</template>

<script>
  import BusAPI from '../models/BusAPI.js';
  import Bus from '../models/Bus.js';
  import BusPole from '../models/BusPole.js';
  import BusRoute from '../models/BusRoute.js';

  export default {
    data: function () {
      return {
        busPoles: [],
        busRoutes: [],
        options: [],
        selected: '',
        map: null,
      }
    },
    watch: {
      selected: function (busRouteId) {
        let busRoute = this.busRoutes.find(x => x.busRouteId == busRouteId)
        this.addBusRoutes(busRoute.routes)
        this.addBusStops(busRoute.routes)

        BusAPI.getBusByOperator('odpt.Operator:Toei').then((response) => {
          let busInfos = response.data;
          let pole = busInfos.map(x => new Bus(x))
                             .find(x => x.busRoute == busRouteId);
          this.addCurrentBus(pole);
        }).catch((error) => {
          console.log(error);
        });
      },
    },
    mounted() {
      this.loadMap();
      this.fetchBusStops();
    },
    methods: {
      loadMap: function () {
        const mapToken = localStorage.getItem('map_token');
        mapboxgl.accessToken = mapToken;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mopinfish/cjdig1o651oxc2rmksb7qh0qb', // stylesheet location
          center: [139.767052, 35.681167], // starting position [lng, lat]
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
        let busRoutePatternPromise = BusAPI.getBusRoutePatternsByOperator('odpt.Operator:Toei');
        let busPolePromise = BusAPI.getBusPolesByOperator('odpt.Operator:Toei');

        Promise.all([busRoutePatternPromise, busPolePromise]).then((responses) => {
          let busRoutePatterns = responses[0].data;
          let busPoles = responses[1].data;

          this.busPoles = busPoles.map(x => new BusPole(x));
          this.busRoutes = busRoutePatterns.map(x => new BusRoute(x, this.busPoles));
          this.options = this.busRoutes.map(x => x.busRouteId);
        }).catch((error) => {
          console.log(error);
        });
      },
      addCurrentBus: function (pole) {
        let features = [{
          'type': 'Feature',
          'properties': {
            'description': '<p>' + pole.name + '</p>',
            'icon': 'theatre'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [pole.longitude, pole.latitude]
          }
        }];

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
      },
      addBusStops: function (routes) {
        let filterdRoutes = routes.filter(x => x !== undefined)
        let features = filterdRoutes.map(pole => ({
          'type': 'Feature',
          'properties': {
            'description': '<p>' + pole.name + '</p>',
            'icon': 'theatre'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [pole.longitude, pole.latitude]
          }
        }));

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
      },
      addBusRoutes: function (routes) {
        let filterdRoutes = routes.filter(x => x !== undefined)
        let coords = filterdRoutes.map(x => [x.longitude, x.latitude]);

        this.map.addLayer({
          'id': 'route',
          'type': 'line',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': coords
              }
            }
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#888',
            'line-width': 8
          }
        });
      }
    }
  }
</script>

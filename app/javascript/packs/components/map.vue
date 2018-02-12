<template>
<div style="width: 100%; height: 100%;">

  <div class="input-field col s12">
    <select v-model='selected'>
      <option value="" disabled selected>路線を選択してください</option>
      <option v-for='option in busRoutes' v-bind:value='option.busRouteId'>
        {{ option.title }}
      </option>
    </select>
  </div>

  <div id='map' style='height: 540px;'>
  </div>

  <div class="preloader-background">
    <div class="preloader-wrapper big active">
      <div class="spinner-layer spinner-green-only">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
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
        selected: '',
        map: null,
        routeLayerCount: 0,
        busstopLayerCount: 0,
        busLayerCount: 0,
      }
    },
    watch: {
      selected: function (busRouteId) {
        let busRoute = this.busRoutes.find(x => x.busRouteId == busRouteId)
        this.addBusRoutes(busRoute.routes)
        this.addBusStops(busRoute.routes)
        this.adjustMap(busRoute.routes);
        this.fetchCurrentBus();

        setInterval(this.fetchCurrentBus, 10000);
      },
    },
    mounted() {
      this.loadMap();
      this.fetchBusStops();

      // セレクトボックスをmaterializeで初期化
      $('select').material_select();
      // select要素が変更されてもイベントをキャッチできるように、documentに対してイベントハンドラを登録
      $(document).on('change', 'select',  (evt) => {
        // evt.target(select要素)のvalueをselectedに代入することでV-Model経由で選択した値を反映する
        this.selected = evt.target.value;
      });
    },
    updated: function () {
      this.$nextTick(function () {
        // ビュー全体が再レンダリングされた後にのみ実行されるコード
        $('select').material_select();
      })
    },
    methods: {
      loadMap: function () {
        const mapToken = 'pk.eyJ1IjoibW9waW5maXNoIiwiYSI6ImNqZGZreGVuajBhNjIyd29idXI3ZHFxNm4ifQ._edxUwp0j5sAl7FsK9oyrA';
        mapboxgl.accessToken = mapToken;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mopinfish/cjdig1o651oxc2rmksb7qh0qb', // stylesheet location
          center: [139.767052, 35.681167], // starting position [lng, lat]
          zoom: 14,
        });
        // Add zoom and rotation controls to the map.
        this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        // Add full-screen control
        this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.map.on('click', 'places', function (e) {
          new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(this);
        });

        // add event handler on bus terminal popup infomation.
        this.map.on('click', 'terminal', (e) => {
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
            .addTo(this.map);
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
          this.hidePreloader();
        }).catch((error) => {
          console.log(error);
        });
      },
      fetchCurrentBus: function () {
        BusAPI.getBusByOperator('odpt.Operator:Toei').then((response) => {
          let busInfos = response.data;
          let bus = busInfos.map(x => new Bus(x))
                            .find(x => x.busRoute == this.selected);
          let pole = this.busPoles.find(x => x.busPoleId == bus.fromBusstopPole)
          this.addCurrentBus(pole);
        }).catch((error) => {
          console.log(error);
        });
      },
      adjustMap: function (routes) {
        let filterdRoutes = routes.filter(x => x !== undefined)
        let coordsLongitude = filterdRoutes.map(x => x.longitude);
        let coordsLatitude = filterdRoutes.map(x => x.latitude);

        let centerLongitude = coordsLongitude.reduce((x, y) => x + y) / coordsLongitude.length
        let centerLatitude = coordsLatitude.reduce((x, y) => x + y) / coordsLatitude.length

        this.map.setCenter([centerLongitude, centerLatitude])
      },
      addCurrentBus: function (pole) {
        let features = [{
          'type': 'Feature',
          'properties': {
            'description': '<p>' + pole.name + '</p>',
            'icon': 'bus'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [pole.longitude, pole.latitude]
          }
        }];

        if (this.map.getLayer('currentBus' + this.busLayerCount))
          this.map.removeLayer('currentBus' + this.busLayerCount);
        this.busLayerCount++;
        this.map.addLayer({
          'id': 'currentBus'+ this.busLayerCount,
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': features
            }
          },
          'layout': {
            'icon-image': '{icon}-11',
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
            'icon': 'circle'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [pole.longitude, pole.latitude]
          }
        }));

        if (this.map.getLayer('busStops' + this.busstopLayerCount))
          this.map.removeLayer('busStops' + this.busstopLayerCount);
        this.busstopLayerCount++;
        this.map.addLayer({
          'id': 'busStops' + this.busstopLayerCount,
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': features
            }
          },
          'layout': {
            'icon-image': '{icon}-11',
            'icon-allow-overlap': true
          },
          'paint': {
            'icon-color': '#49ee51'
          }
        });
      },
      addBusRoutes: function (routes) {
        let filterdRoutes = routes.filter(x => x !== undefined)
        let coords = filterdRoutes.map(x => [x.longitude, x.latitude]);

        if (this.map.getLayer('busRoute' + this.routeLayerCount))
          this.map.removeLayer('busRoute' + this.routeLayerCount);
        this.routeLayerCount++;
        this.map.addLayer({
          'id': 'busRoute' + this.routeLayerCount,
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
      },
      hidePreloader: function () {
          $('.preloader-background').fadeOut('slow');
          $('.preloader-wrapper').fadeOut();
      }
    }
  }
</script>

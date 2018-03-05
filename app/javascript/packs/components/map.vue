<template>
<div style="width: 100%; height: 100%; padding:0 10px;">

  <p v-if="selectedPlace">
    {{ selectedPlace }} 付近の路線
  </p>
  <div class="input-field col s12">
    <select v-model='selected'>
      <option value="" disabled selected>路線を選択してください</option>
      <option v-for='option in nearestBusRoutes' v-bind:value='option.busRouteId'>
        {{ option.title }} ({{ selectedPlace }} 行)
      </option>
    </select>
  </div>

  <div id='map' style='height: 480px;'>
  </div>
  <div style='text-align: right; font-size: 80%; color: gray;'>
    <div v-if="busstopUpdatedDate">
      バス停情報最終更新: {{ busstopUpdatedDate | convertDate }}
    </div>
    <div v-if="busUpdatedDate">
      バス情報最終更新: {{ busUpdatedDate | convertDate }}
    </div>
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
        nearestBusPoles: [],
        nearestBusRoutes: [],
        nearestBusPoleLists: [],
        busstopUpdatedDate: null,
        busUpdatedDate: null,
        selectedPlace: ''
      }
    },
    watch: {
      selected: function (busRouteId) {
        let busRoute = this.busRoutes.find(x => x.busRouteId == busRouteId)
        this.addBusRoutes(busRoute.routes)
        this.addBusStops(busRoute.routes)
        this.fetchCurrentBus();

        setInterval(this.fetchCurrentBus, 15000);
      },
    },
    filters: {
      convertDate: function (date) {
        if (!date) return '';
        return date.toLocaleString();
      }
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
        // Add geolocate control to the map.
        this.map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }));

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

        // add event handler on olympic places.
        this.map.on('click', 'olympic', (e) => {
          const feature = e.features[0]
              , properties = feature.properties
          ;

          this.filterBusRoutes(feature.properties.id);
          this.selectedPlace = feature.properties.olympic2020place
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
        let nearestBusStopsPromise = BusAPI.getNearestBusStops()

        Promise.all([busRoutePatternPromise, busPolePromise]).then((responses) => {
          let busRoutePatterns = responses[0].data;
          let busPoles = responses[1].data;

          this.busstopUpdatedDate = new Date(busPoles[0]['dc:date']);

          this.busPoles = busPoles.map(x => new BusPole(x));
          this.busRoutes = this.nearestBusRoutes = busRoutePatterns.map(x => new BusRoute(x, this.busPoles));
          this.hidePreloader();
          return nearestBusStopsPromise;
        }).then((response) => {
          this.nearestBusPoleLists = response.data.nearestOlympics.map(x => x.nearest.map(y => y.poleId));
        }).catch((error) => {
          console.log(error);
        });
      },
      fetchCurrentBus: function () {
        BusAPI.getBusByOperator('odpt.Operator:Toei').then((response) => {
          let busInfos = response.data;
          let bus = busInfos.map(x => new Bus(x))
                            .find(x => x.busRoute == this.selected);
          let pole = this.busPoles.find(x => x.busPoleId == bus.fromBusstopPole);

          this.addCurrentBus(pole, bus);
          this.busUpdatedDate = new Date(busInfos[0]['dc:date']);
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
      filterBusRoutes: function (id) {
        let nearestBusPoleIds = this.nearestBusPoleLists[id - 1]

        this.nearestBusRoutes = []
        for (let busRoute of this.busRoutes) {
          if (nearestBusPoleIds.filter(x => busRoute.onRouteByBusPoleId(x)).length > 0) {
            this.nearestBusRoutes.push(busRoute)
          }
        }

        this.nearestBusPoles = this.busPoles.filter(x => nearestBusPoleIds.indexOf(x.busPoleId) >= 0)
      },
      addCurrentBus: function (pole, bus) {
        let time = new Date(bus.fromBusstopPoleTime);
        let timeStr = time.getHours() + "時" + time.getMinutes() + "分" + time.getSeconds() + "秒";
        let features = [{
          'type': 'Feature',
          'properties': {
            'description': "<strong>運行情報</strong><br>"
              + "<p>" + pole.name + "を" + timeStr + "に出発しました</p>"
            ,'icon': 'bus'
          },
          'geometry': {
            'type': 'Point'
            ,'coordinates': [pole.longitude, pole.latitude]
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
            'icon-image': '{icon}-green-11',
            'icon-size': 2.5,
            'icon-allow-overlap': true
          }
        });

        this.map.on('click', 'currentBus' + this.busLayerCount, (e) => {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(this.map);
        });

      },
      addBusStops: function (routes) {
        let filterdRoutes = routes.filter(x => x !== undefined)
        let features = filterdRoutes.map(pole => ({
          'type': 'Feature',
          'properties': {
            'description': '<p>' + pole.name + '</p>',
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
          'type': 'circle',
          'source': {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': features
            }
          },
          'paint': {
            'circle-radius': 6,
            'circle-color': '#448aff'
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
            'line-color': '#82b1ff',
            'line-width': 5
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

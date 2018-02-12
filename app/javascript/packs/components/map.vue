<template>
<div>
  <div class="input-field col s12">
    <select v-model='selected'>
      <option value="" disabled selected>Choose your option</option>
      <option v-for='option in options' v-bind:value='option'>
        {{ option }}
      </option>
    </select>
    <label>aaaaaalize Disabled</label>
    <span>selected : {{selected}}</span>
  </div>
<!--
  <div class="input-field col s12">
    <div class="select-wrapper">
      <span class="caret">$B"'(B</span>
      <input type="text" class="select-dropdown" readonly="true" data-activates="select-options-f8b87f79-2266-1315-1f9e-8d59a833e67d" value="Choose your option">
        <ul id="select-options-f8b87f79-2266-1315-1f9e-8d59a833e67d" class="dropdown-content select-dropdown ">
          <li class="disabled "><span>Choose your option</span></li>
          <li v-for='option in options'><span>{{ option }}</span></li>
        </ul> -->
        <!-- <select v-model='selected'"> !-->
<!--        <select data-select-id="f8b87f79-2266-1315-1f9e-8d59a833e67d" class="initialized">
          <option value="" disabled="disabled" selected="selected">Choose your option</option>
          <option v-for='option in options' v-bind:value='option'>{{ option }}</option>
        </select>
    </div>
  <label>sddsrialize Select</label>
  </div>
-->
  <div class="input-field col s12">
    <select>
      <option value="" disabled selected>Choose your option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <label>bbbberialize Select</label>
  </div>

  <div id='map' style='width: 800px; height: 600px;'>
  </div>
</div>

</template>

<script>
  import axios from 'axios';

  export default {
    data: function () {
      return {
        busroutePatterns: [],
        busstopPoles: [],
        options: [],
        busInfos: [],
        selected: '',
        map: null
      }
    },
    watch: {
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
        const token = localStorage.getItem('token');
        axios.get('https://api-tokyochallenge.odpt.org/api/v4/odpt:BusroutePattern?odpt:operator=odpt.Operator:KantoBus&acl:consumerKey=' + token).then((response) => {
          for(var i = 0; i < response.data.length; i++) {
            this.busroutePatterns.push(response.data[i]);
          }
          axios.get('https://api-tokyochallenge.odpt.org/api/v4/odpt:BusstopPole?odpt:operator=odpt.Operator:KantoBus&acl:consumerKey=' + token).then((response) => {
            for(var i = 0; i < response.data.length; i++) {
              this.busstopPoles.push(response.data[i]);
            }

            for(var i = 0; i < this.busroutePatterns.length; i++) {
              var routes = []
              for(var j = 0; j < this.busroutePatterns[i]['odpt:busstopPoleOrder'].length; j++) {
                var location = [0, 0]
                for(var k = 0; k < this.busstopPoles.length; k++) {
                  if (this.busstopPoles[k]['owl:sameAs'] == this.busroutePatterns[i]['odpt:busstopPoleOrder'][j]['odpt:busstopPole']) {
                    location[0] = this.busstopPoles[k]['geo:long']
                    location[1] = this.busstopPoles[k]['geo:lat']
                  }
                }
                routes.push(location)
              }
              this.busInfos.push({
                'name': this.busroutePatterns[i]['odpt:busroute'],
                'routes': routes
              })
              this.options.push(this.busroutePatterns[i]['odpt:busroute'])
            }
            console.log('ADD')
            setTimeout(this.setSelect, 2000);
          }, (error) => {
            console.log(error);
          });
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
              // 'description': '<p>' + busInfos[i]['title'] + '</p>',
              'icon': 'theatre'
            },
            'geometry': {
              'type': 'Point',
              'coordinates': [busInfos[i][0], busInfos[i][1]]
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
      },
      addBusRoutes: function (coords) {
        let id = this.map.addLayer({
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
      },
      setSelect: function () {
        $(document).ready(function() {
          $('select').material_select();
        });
      }
    }
  }
</script>

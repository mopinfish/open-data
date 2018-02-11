<template>
  <div>
  <div id='map' style='width: 800px; height: 600px;'>
  </div>
  <div>
    <ul id="bus">
      <li v-for="busStop in busStops">
        {{ busStop }}
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
        busStops: []
      }
    },
    mounted() {
      this.loadMap();
      this.fetchBusStops();
    },
    methods: {
      loadMap: function () {
          mapboxgl.accessToken = '';
          var map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v10',
          center: [139.6, 35.6],
          zoom: 9
        });
      },
      fetchBusStops: function () {
        axios.get('https://api-tokyochallenge.odpt.org/api/v4/odpt:BusstopPole?acl:consumerKey=').then((response) => {
          for(var i = 0; i < response.data.length; i++) {
            this.busStops.push(response.data[i]);
          }
        }, (error) => {
          console.log(error);
        });
      },
    }
  }
</script>

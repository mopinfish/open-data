<template>
  <div>
    <ul id="example">
      <li v-for="busStop in busStops">
        {{ busStop }}
      </li>
    </ul>
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
      this.fetchBusStops();
    },
    methods: {
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

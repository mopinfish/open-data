import Vue from 'vue/dist/vue.esm.js'
import VueRouter from 'vue-router'
import About from '../components/about.vue'
import Contact from '../components/contact.vue'
import Map from '../components/map.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
  { path: '/', component: Map },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
  { path: '/bus_map', component: Map }
  ],
})

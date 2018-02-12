import axios from 'axios';

export default class {
  static URL_BASE = '/api/v4';

  static getBusPolesByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:BusstopPole'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator)
  }

  static getBusRoutePatternsByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:BusroutePattern'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator)
  }

  static getBusByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:Bus'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator)
  }
}

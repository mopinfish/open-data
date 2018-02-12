import axios from 'axios';

export default class {
  static URL_BASE = 'https://api-tokyochallenge.odpt.org/api/v4';

  static getBusPolesByOperator(operator) {
    let token = localStorage.getItem('token');
    let resource = '/odpt:BusstopPole'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }

  static getBusRoutePatternsByOperator(operator) {
    let token = localStorage.getItem('token');
    let resource = '/odpt:BusroutePattern'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }

  static getBusByOperator(operator) {
    let token = localStorage.getItem('token');
    let resource = '/odpt:Bus'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }
}

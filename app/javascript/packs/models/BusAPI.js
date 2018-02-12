import axios from 'axios';

export default class {
  static URL_BASE = 'https://api-tokyochallenge.odpt.org/api/v4';
  static ACCESS_TOKEN = '10b75365528b32fce90ec5024a35fa9797a045568821225f779aeaf054d114fb';

  static getBusPolesByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:BusstopPole'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }

  static getBusRoutePatternsByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:BusroutePattern'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }

  static getBusByOperator(operator) {
    let token = this.ACCESS_TOKEN;
    let resource = '/odpt:Bus'
    let query = 'odpt:operator'
    return axios.get(this.URL_BASE + resource + '?' + query + '=' + operator + '&' + 'acl:consumerKey=' + token)
  }
}

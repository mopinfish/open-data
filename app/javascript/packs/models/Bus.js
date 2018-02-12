export default class {
  constructor(data) {
    this.busId = data['owl:sameAs']
    this.busRoute = data['odpt:busroute']
    this.busRoutePattern = data['odpt:busroutePattern']
    this.toBusstopPole = data['odpt:toBusstopPole']
    this.fromBusstopPole = data['odpt:fromBusstopPole']
    this.fromBusstopPoleTime = data['odpt:fromBusstopPoleTime']
  }
}

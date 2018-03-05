export default class {
  constructor(data, poleList) {
    this.busRouteId = data['odpt:busroute']
    this.title = data['dc:title']
    this.routes = data['odpt:busstopPoleOrder'].map(
      poles => poleList.find(
        pole => pole.busPoleId == poles['odpt:busstopPole']
      )
    );
  }

  onRouteByBusPoleId(poleId) {
    return this.routes.filter(x => x !== undefined).map(x => x.busPoleId).indexOf(poleId) >= 0
  }
}

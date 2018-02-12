export default class {
  constructor(data, poleList) {
    this.busRouteId = data['odpt:busroute']
    this.routes = data['odpt:busstopPoleOrder'].map(
      poles => poleList.find(
        pole => pole.busPoleId == poles['odpt:busstopPole']
      )
    );
  }
}

export default class {
  constructor(data) {
    this.busPoleId = data['owl:sameAs']
    this.name = data['dc:title']
    this.latitude = data['geo:lat']
    this.longitude = data['geo:long']
    this.operator = data['odpt:operator']
    this.poleNumber = data['odpt:busstopPoleNumber']
  }
}

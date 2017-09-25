import DataCollection from 'data-collection';

export default class LookbackLogger {
  constructor() {
    this.dataCollection = new DataCollection();
  }

  addData(value) {
    this.dataCollection.insert({
      value: value,
      date: new Date()
    });
  }

  getLast(ms) {
    var now = new Date();
    return this.dataCollection.query().filter({
      date__lte: now,
      date__gte: new Date(now.getTime() - ms)
    }).avg('value');
  }
}

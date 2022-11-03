export default class InputContext {
  constructor() {
    this.currentTriggerId = null;
  }

  onTrigger(id) {
    this.currentTriggerId = id;
  }

  getCurrentTriggerId() {
    return this.currentTriggerId;
  }

  clearTriggers() {
    this.currentTriggerId = null;
  }
}

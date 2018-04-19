
// we use module.exports instead of export default to make this compatible with
// node.js
module.exports = class CustomMarshaler {
  constructor({
    globalProperties,
    blockedProperties,
    objectList,
  }) {
    this.globalProperties = globalProperties || {};
    this.blockedProperties = blockedProperties || [];
    this.objectList = objectList || [];
  }

  // If this is on our list of "custom marshal" objects - or if it a property
  // on one of those objects (other than a function), return true
  shouldCustomMarshalObject(nativeVar, nativeParentObj) {
    for (var i = 0; i < this.objectList.length; i++) {
      var marshalObj = this.objectList[i];
      if ((nativeVar instanceof marshalObj.instance &&
           (typeof marshalObj.requiredMethod === 'undefined' ||
            nativeVar[marshalObj.requiredMethod] !== undefined)) ||
          (typeof nativeVar !== 'function' &&
           nativeParentObj instanceof marshalObj.instance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * When marshaling methods on "custom marshal" objects, we may need to augment
   * the marshaling options. This returns those options.
   */
  getCustomMarshalMethodOptions(nativeParentObj) {
    for (var i = 0; i < this.objectList.length; i++) {
      var marshalObj = this.objectList[i];
      if (nativeParentObj instanceof marshalObj.instance) {
        if (typeof marshalObj.requiredMethod === 'undefined' ||
            nativeParentObj[marshalObj.requiredMethod] !== undefined) {
          return marshalObj.methodOpts || {};
        } else {
          return {};
        }
      }
    }
    return {};
  }

  /**
   * Create a new "custom marshal" interpreter object that corresponds to a native
   * object.
   * @param {Interpreter} interpreter Interpreter instance
   * @param {Object} nativeObj Object to wrap
   * @param {Object} nativeParentObj Parent of object to wrap
   * @return {!Object} New interpreter object.
   */
  createCustomMarshalObject(interpreter, nativeObj, nativeParentObj) {
    var obj = interpreter.createObject();
    obj.data = nativeObj;
    obj.isCustomMarshal = true;
    obj.type = typeof nativeObj;
    obj.toBoolean = function () {return Boolean(this.data);};
    obj.toNumber = function () {return Number(this.data);};
    obj.toString = function () {return String(this.data);};
    obj.valueOf = function () {return this.data;};
    return obj;
  }

};

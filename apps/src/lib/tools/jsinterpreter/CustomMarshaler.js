
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
  getCustomMarshalMethodOptions(nativeParentObj, _, nativeVar) {
    for (var i = 0; i < this.objectList.length; i++) {
      var marshalObj = this.objectList[i];
      if (nativeParentObj instanceof marshalObj.instance || nativeVar === marshalObj.instance) {
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
  createCustomMarshalObject(nativeObj, nativeParentObj) {
    var obj = {
      data: nativeObj,
      isPrimitive: false,
      isCustomMarshal: true,
      type: typeof nativeObj,
      proto: nativeParentObj, // TODO (cpirich): replace with interpreter object?
      toBoolean: function () {return Boolean(this.data);},
      toNumber: function () {return Number(this.data);},
      toString: function () {return String(this.data);},
      valueOf: function () {return this.data;}
    };
    return obj;
  }

};

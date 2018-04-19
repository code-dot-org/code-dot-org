
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
    this.marshaledMap = new Map();
  }

  // Get the objectListData if this is on our list of "custom marshal" objects -
  // or if it a property on one of those objects (other than a function)
  getObjectListData(nativeVar, nativeParentObj) {
    for (var i = 0; i < this.objectList.length; i++) {
      var marshalObj = this.objectList[i];
      if ((nativeVar instanceof marshalObj.instance &&
           (typeof marshalObj.requiredMethod === 'undefined' ||
            nativeVar[marshalObj.requiredMethod] !== undefined)) ||
          (typeof nativeVar !== 'function' &&
           nativeParentObj instanceof marshalObj.instance)) {
        return marshalObj;
      }
    }
    return null;
  }

  // If we have objectListData, return true
  shouldCustomMarshalObject(nativeVar, nativeParentObj) {
    return !!this.getObjectListData(nativeVar, nativeParentObj);
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
    var obj = this.marshaledMap.get(nativeObj);
    if (obj) {
      return obj;
    }
    obj = interpreter.createObject();
    obj.data = nativeObj;
    obj.isCustomMarshal = true;
    obj.type = typeof nativeObj;
    obj.toBoolean = function () {return Boolean(this.data);};
    obj.toNumber = function () {return Number(this.data);};
    obj.toString = function () {return String(this.data);};
    obj.valueOf = function () {return this.data;};
    if (typeof nativeObj === 'object') {
      const objectListData = this.getObjectListData(nativeObj, nativeParentObj) || {};
      if (objectListData.ensureIdenticalMarshalInstances) {
        //
        // this.marshaledMap will retain the association between this nativeObj
        // and the corresponding "obj" we created here, such that future calls
        // to this function will return the exact same custom marshal object.
        //
        this.marshaledMap.set(nativeObj, obj);
      }
    }
    return obj;
  }

};

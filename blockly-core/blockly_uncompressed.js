var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_DEFINES;
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && opt_object !== undefined) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if(!COMPILED) {
    if(goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name]
    }
  }
  goog.exportPath_(name, value)
};
goog.DEBUG = true;
goog.define("goog.LOCALE", "en");
goog.define("goog.TRUSTED_SITE", true);
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
goog.forwardDeclare = function(name) {
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && goog.isDefAndNotNull(goog.getObjectByName(name))
  };
  goog.implicitNamespaces_ = {}
}
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.define("goog.ENABLE_DEBUG_LOADER", true);
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
if(goog.DEPENDENCIES_ENABLED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if(doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if(isDeps) {
          return false
        }else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && (typeof value.splice != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")))) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call"))) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.hasUid = function(obj) {
  return!!obj[goog.UID_PROPERTY_]
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.getMsgWithFallback = function(a, b) {
  return a
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args)
  }
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(goog.DEBUG) {
    if(!caller) {
      throw Error("arguments.caller not defined.  goog.base() expects not " + "to be running in strict mode. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
  }
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("Blockly.ImageDimensionCache");
Blockly.ImageDimensionCache.imageDimensions_ = {};
Blockly.ImageDimensionCache.IMAGE_LOADING_WIDTH = 40;
Blockly.ImageDimensionCache.IMAGE_LOADING_HEIGHT = 40;
Blockly.ImageDimensionCache.getCachedDimensionsOrDefaultAndUpdate = function(imageUrl, onDimensionUpdate) {
  var cachedDimensions = Blockly.ImageDimensionCache.getCachedDimensions(imageUrl);
  if(cachedDimensions) {
    return cachedDimensions
  }else {
    Blockly.ImageDimensionCache.getDimensionsAsync(imageUrl, onDimensionUpdate);
    return{width:Blockly.ImageDimensionCache.IMAGE_LOADING_WIDTH, height:Blockly.ImageDimensionCache.IMAGE_LOADING_HEIGHT}
  }
};
Blockly.ImageDimensionCache.getCachedDimensions = function(imageUrl) {
  return Blockly.ImageDimensionCache.imageDimensions_[imageUrl]
};
Blockly.ImageDimensionCache.storeDimensions = function(imageUrl, width, height) {
  Blockly.ImageDimensionCache.imageDimensions_[imageUrl] = {width:width, height:height}
};
Blockly.ImageDimensionCache.getDimensionsAsync = function(url, callback) {
  var img = new Image;
  img.onload = function() {
    Blockly.ImageDimensionCache.storeDimensions(url, img.width, img.height);
    callback(img.width, img.height)
  };
  img.src = url
};
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase()
};
goog.string.subs = function(str, var_args) {
  var splitParts = str.split("%s");
  var returnString = "";
  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while(subsArguments.length && splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift()
  }
  return returnString + splitParts.join("%s")
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && (ch >= " " && ch <= "~") || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str))
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;").replace(goog.string.singleQuoteRe_, "&#39;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    if(str.indexOf("'") != -1) {
      str = str.replace(goog.string.singleQuoteRe_, "&#39;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /"/g;
goog.string.singleQuoteRe_ = /'/g;
goog.string.allRe_ = /[&<>"']/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if(goog.string.contains(str, "&")) {
    return goog.string.unescapeEntitiesUsingDom_(str, document)
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div;
  if(opt_document) {
    div = opt_document.createElement("div")
  }else {
    div = document.createElement("div")
  }
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && (index < s.length && stringLength > 0)) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || (goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]))
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.isLowerCamelCase = function(str) {
  return/^[a-z]+([A-Z][a-z]*)*$/.test(str)
};
goog.string.isUpperCamelCase = function(str) {
  return/^([A-Z][a-z]*)+$/.test(str)
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  })
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase()
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase()
  })
};
goog.string.parseInt = function(value) {
  if(isFinite(value)) {
    value = String(value)
  }
  if(goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10)
  }
  return NaN
};
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];
  while(limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--
  }
  if(parts.length) {
    returnVal.push(parts.join(separator))
  }
  return returnVal
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.define("goog.userAgent.ASSUME_IE", false);
goog.define("goog.userAgent.ASSUME_GECKO", false);
goog.define("goog.userAgent.ASSUME_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_MOBILE_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_OPERA", false);
goog.define("goog.userAgent.ASSUME_ANY_VERSION", false);
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || (goog.userAgent.ASSUME_GECKO || (goog.userAgent.ASSUME_MOBILE_WEBKIT || (goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA)));
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = goog.string.startsWith(ua, "Opera");
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && (goog.string.contains(ua, "MSIE") || goog.string.contains(ua, "Trident"));
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && goog.string.contains(ua, "WebKit");
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && goog.string.contains(ua, "Mobile");
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && (!goog.userAgent.detectedWebkit_ && (!goog.userAgent.detectedIe_ && navigator.product == "Gecko"))
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.define("goog.userAgent.ASSUME_MAC", false);
goog.define("goog.userAgent.ASSUME_WINDOWS", false);
goog.define("goog.userAgent.ASSUME_LINUX", false);
goog.define("goog.userAgent.ASSUME_X11", false);
goog.define("goog.userAgent.ASSUME_ANDROID", false);
goog.define("goog.userAgent.ASSUME_IPHONE", false);
goog.define("goog.userAgent.ASSUME_IPAD", false);
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || (goog.userAgent.ASSUME_WINDOWS || (goog.userAgent.ASSUME_LINUX || (goog.userAgent.ASSUME_X11 || (goog.userAgent.ASSUME_ANDROID || (goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD)))));
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11");
  var ua = goog.userAgent.getUserAgentString();
  goog.userAgent.detectedAndroid_ = !!ua && goog.string.contains(ua, "Android");
  goog.userAgent.detectedIPhone_ = !!ua && goog.string.contains(ua, "iPhone");
  goog.userAgent.detectedIPad_ = !!ua && goog.string.contains(ua, "iPad")
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || (goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0))
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  if(!doc || !goog.userAgent.IE) {
    return undefined
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5)
}();
goog.provide("Blockly.BlockSvg");
goog.require("goog.userAgent");
Blockly.BlockSvg = function(block) {
  this.block_ = block;
  var options = {"block-id":block.id};
  this.svgGroup_ = Blockly.createSvgElement("g", options, null);
  this.initChildren()
};
Blockly.BlockSvg.prototype.initChildren = function() {
  this.svgPathDark_ = Blockly.createSvgElement("path", {"class":"blocklyPathDark", "transform":"translate(1, 1)", "fill-rule":"evenodd"}, this.svgGroup_);
  this.svgPath_ = Blockly.createSvgElement("path", {"class":"blocklyPath", "fill-rule":"evenodd"}, this.svgGroup_);
  var pattern = this.block_.getFillPattern();
  if(pattern) {
    this.svgPathFill_ = Blockly.createSvgElement("path", {"class":"blocklyPath"}, this.svgGroup_)
  }
  this.svgPathLight_ = Blockly.createSvgElement("path", {"class":"blocklyPathLight"}, this.svgGroup_);
  this.svgPath_.tooltip = this.block_;
  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  this.updateMovable()
};
Blockly.BlockSvg.INLINE = -1;
Blockly.BlockSvg.DISABLED_COLOUR = "#808080";
Blockly.BlockSvg.prototype.init = function() {
  var block = this.block_;
  this.updateColour();
  for(var x = 0, input;input = block.inputList[x];x++) {
    input.init()
  }
  if(block.mutator) {
    block.mutator.createIcon()
  }
};
Blockly.BlockSvg.prototype.updateMovable = function() {
  if(this.block_.isMovable()) {
    Blockly.addClass_(this.svgGroup_, "blocklyDraggable");
    Blockly.removeClass_(this.svgGroup_, "blocklyUndraggable")
  }else {
    Blockly.removeClass_(this.svgGroup_, "blocklyDraggable");
    Blockly.addClass_(this.svgGroup_, "blocklyUndraggable")
  }
  this.updateColour()
};
Blockly.BlockSvg.prototype.updateGrayOutCSS = function() {
  if(this.shouldBeGrayedOut()) {
    Blockly.addClass_(this.svgGroup_, "blocklyUndeletable");
    Blockly.removeClass_(this.svgGroup_, "blocklyDeletable")
  }else {
    Blockly.addClass_(this.svgGroup_, "blocklyDeletable");
    Blockly.removeClass_(this.svgGroup_, "blocklyUndeletable")
  }
  this.updateColour()
};
Blockly.BlockSvg.prototype.getRootElement = function() {
  return this.svgGroup_
};
var BS = Blockly.BlockSvg;
BS.SEP_SPACE_X = 10;
BS.SEP_SPACE_Y = 10;
BS.INLINE_PADDING_Y = 5;
BS.MIN_BLOCK_Y = 25;
BS.TAB_HEIGHT = 20;
BS.TAB_WIDTH = 8;
BS.NOTCH_WIDTH = 30;
BS.CORNER_RADIUS = 8;
BS.TITLE_HEIGHT = 18;
BS.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) * (BS.CORNER_RADIUS - 1) + 1;
BS.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) * (BS.CORNER_RADIUS + 1) - 1;
BS.NOTCH_PATH_WIDTH = 15;
BS.NOTCH_PATH_LEFT = "l 6,4 3,0 6,-4";
BS.NOTCH_PATH_LEFT_HIGHLIGHT = "l 6.5,4 2,0 6.5,-4";
BS.NOTCH_PATH_RIGHT = "l -6,4 -3,0 -6,-4";
BS.JAGGED_TEETH = "l 8,0 0,4 8,4 -16,8 8,4";
BS.JAGGED_TEETH_HEIGHT = 20;
BS.TAB_PATH_DOWN = "v 5 c 0,10 -" + BS.TAB_WIDTH + ",-8 -" + BS.TAB_WIDTH + ",7.5 s " + BS.TAB_WIDTH + ",-2.5 " + BS.TAB_WIDTH + ",7.5";
BS.TAB_PATH_DOWN_HIGHLIGHT_RTL = "v 6.5 m -" + BS.TAB_WIDTH * 0.98 + ",2.5 q -" + BS.TAB_WIDTH * 0.05 + ",10 " + BS.TAB_WIDTH * 0.27 + ",10 m " + BS.TAB_WIDTH * 0.71 + ",-2.5 v 1.5";
BS.TOP_LEFT_CORNER_START = "m 0," + BS.CORNER_RADIUS;
BS.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL = "m " + BS.DISTANCE_45_INSIDE + "," + BS.DISTANCE_45_INSIDE;
BS.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR = "m 1," + (BS.CORNER_RADIUS - 1);
BS.TOP_LEFT_CORNER = "A " + BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS + " 0 0,1 " + BS.CORNER_RADIUS + ",0";
BS.TOP_LEFT_CORNER_HIGHLIGHT = "A " + (BS.CORNER_RADIUS - 1) + "," + (BS.CORNER_RADIUS - 1) + " 0 0,1 " + BS.CORNER_RADIUS + ",1";
BS.INNER_TOP_LEFT_CORNER = BS.NOTCH_PATH_RIGHT + " h -" + (BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH - BS.CORNER_RADIUS) + " a " + BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS + " 0 0,0 -" + BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS;
BS.INNER_BOTTOM_LEFT_CORNER = "a " + BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS + " 0 0,0 " + BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS;
BS.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL = "a " + (BS.CORNER_RADIUS + 1) + "," + (BS.CORNER_RADIUS + 1) + " 0 0,0 " + (-BS.DISTANCE_45_OUTSIDE - 1) + "," + (BS.CORNER_RADIUS - BS.DISTANCE_45_OUTSIDE);
BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL = "a " + (BS.CORNER_RADIUS + 1) + "," + (BS.CORNER_RADIUS + 1) + " 0 0,0 " + (BS.CORNER_RADIUS + 1) + "," + (BS.CORNER_RADIUS + 1);
BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR = "a " + (BS.CORNER_RADIUS + 1) + "," + (BS.CORNER_RADIUS + 1) + " 0 0,0 " + (BS.CORNER_RADIUS - BS.DISTANCE_45_OUTSIDE) + "," + (BS.DISTANCE_45_OUTSIDE + 1);
function brokenControlPointWorkaround() {
  return Blockly.BROKEN_CONTROL_POINTS ? "c 0,5 0,-5 0,0" : ""
}
function oppositeIfRTL(val) {
  return Blockly.RTL ? -val : val
}
Blockly.BlockSvg.prototype.dispose = function() {
  goog.dom.removeNode(this.svgGroup_);
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  this.block_ = null
};
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  Blockly.playAudio("delete");
  var xy = Blockly.getSvgXY_(this.svgGroup_);
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute("transform", "translate(" + clone.translateX_ + "," + clone.translateY_ + ")");
  Blockly.svg.appendChild(clone);
  if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
    clone.style.display = "inline";
    clone.bBox_ = {x:clone.getBBox().x, y:clone.getBBox().y, width:clone.scrollWidth, height:clone.scrollHeight}
  }else {
    clone.bBox_ = clone.getBBox()
  }
  clone.startDate_ = new Date;
  Blockly.BlockSvg.disposeUiStep_(clone)
};
Blockly.BlockSvg.disposeUiStep_ = function(clone) {
  var ms = new Date - clone.startDate_;
  var percent = ms / 150;
  if(percent > 1) {
    goog.dom.removeNode(clone)
  }else {
    var x = clone.translateX_ + oppositeIfRTL(clone.bBox_.width / 2 * percent);
    var y = clone.translateY_ + clone.bBox_.height * percent;
    var translate = x + ", " + y;
    var scale = 1 - percent;
    clone.setAttribute("transform", "translate(" + translate + ")" + " scale(" + scale + ")");
    var closure = function() {
      Blockly.BlockSvg.disposeUiStep_(clone)
    };
    window.setTimeout(closure, 10)
  }
};
Blockly.BlockSvg.prototype.connectionUiEffect = function() {
  Blockly.playAudio("click");
  var xy = Blockly.getSvgXY_(this.svgGroup_);
  if(this.block_.outputConnection) {
    xy.x += oppositeIfRTL(-3);
    xy.y += 13
  }else {
    if(this.block_.previousConnection) {
      xy.x += oppositeIfRTL(23);
      xy.y += 3
    }
  }
  var ripple = Blockly.createSvgElement("circle", {"cx":xy.x, "cy":xy.y, "r":0, "fill":"none", "stroke":"#888", "stroke-width":10}, Blockly.svg);
  ripple.startDate_ = new Date;
  Blockly.BlockSvg.connectionUiStep_(ripple)
};
Blockly.BlockSvg.connectionUiStep_ = function(ripple) {
  var ms = new Date - ripple.startDate_;
  var percent = ms / 150;
  if(percent > 1) {
    goog.dom.removeNode(ripple)
  }else {
    ripple.setAttribute("r", percent * 25);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockSvg.connectionUiStep_(ripple)
    };
    window.setTimeout(closure, 10)
  }
};
Blockly.BlockSvg.prototype.updateColour = function() {
  if(this.block_.disabled) {
    return
  }
  var hexColour;
  if(this.shouldBeGrayedOut()) {
    hexColour = BS.DISABLED_COLOUR
  }else {
    hexColour = this.block_.getHexColour()
  }
  this.updateToColour_(hexColour)
};
Blockly.BlockSvg.prototype.updateToColour_ = function(hexColour) {
  var rgb = goog.color.hexToRgb(hexColour);
  var rgbLight = goog.color.lighten(rgb, 0.3);
  var rgbDark = goog.color.darken(rgb, 0.4);
  this.svgPathLight_.setAttribute("stroke", goog.color.rgbArrayToHex(rgbLight));
  this.svgPathDark_.setAttribute("fill", goog.color.rgbArrayToHex(rgbDark));
  this.svgPath_.setAttribute("fill", hexColour);
  var pattern = this.block_.getFillPattern();
  if(pattern) {
    this.svgPathFill_.setAttribute("fill", "url(#" + pattern + ")")
  }
};
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if(this.block_.disabled || this.block_.getInheritedDisabled()) {
    Blockly.addClass_(this.svgGroup_, "blocklyDisabled");
    this.svgPath_.setAttribute("fill", "url(#blocklyDisabledPattern)")
  }else {
    Blockly.removeClass_(this.svgGroup_, "blocklyDisabled");
    this.updateColour()
  }
  var children = this.block_.getChildren();
  for(var x = 0, child;child = children[x];x++) {
    child.svg_.updateDisabled()
  }
};
Blockly.BlockSvg.prototype.shouldBeGrayedOut = function() {
  return Blockly.grayOutUndeletableBlocks && (!this.block_.isDeletable() && (!Blockly.readOnly && this.block_.type !== "when_run"))
};
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.addClass_(this.svgGroup_, "blocklySelected");
  this.svgGroup_.parentNode.appendChild(this.svgGroup_)
};
Blockly.BlockSvg.prototype.addSelectNoMove = function() {
  Blockly.addClass_(this.svgGroup_, "blocklySelected")
};
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.removeClass_(this.svgGroup_, "blocklySelected")
};
Blockly.BlockSvg.prototype.addDragging = function() {
  Blockly.addClass_(this.svgGroup_, "blocklyDragging")
};
Blockly.BlockSvg.prototype.removeDragging = function() {
  Blockly.removeClass_(this.svgGroup_, "blocklyDragging")
};
Blockly.BlockSvg.prototype.addSpotlight = function() {
  Blockly.addClass_(this.svgGroup_, "blocklySpotlight")
};
Blockly.BlockSvg.prototype.removeSpotlight = function() {
  Blockly.removeClass_(this.svgGroup_, "blocklySpotlight")
};
Blockly.BlockSvg.prototype.render = function() {
  this.block_.rendered = true;
  var cursorX = oppositeIfRTL(BS.SEP_SPACE_X);
  var icons = this.block_.getIcons();
  for(var x = 0;x < icons.length;x++) {
    cursorX = icons[x].renderIcon(cursorX)
  }
  cursorX -= oppositeIfRTL(BS.SEP_SPACE_X);
  var inputRows = this.renderCompute_(cursorX);
  this.renderDraw_(cursorX, inputRows);
  var parentBlock = this.block_.getParent();
  if(parentBlock) {
    parentBlock.render()
  }else {
    Blockly.fireUiEvent(window, "resize")
  }
};
Blockly.BlockSvg.prototype.renderTitles_ = function(titleList, x, y) {
  var startX = x;
  for(var t = 0, title;title = titleList[t];t++) {
    var titleSize = title.getSize();
    var translateX = x;
    if(Blockly.RTL) {
      translateX = -(x + titleSize.width)
    }
    title.getRootElement().setAttribute("transform", "translate(" + translateX + ", " + (y + title.getBufferY()) + ")");
    if(titleSize.width) {
      x += titleSize.width + BS.SEP_SPACE_X
    }
  }
  return x - startX
};
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.block_.inputList;
  var inputRows = [];
  inputRows.rightEdge = iconWidth + BS.SEP_SPACE_X * 2;
  if(this.block_.previousConnection || this.block_.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, BS.NOTCH_WIDTH + BS.SEP_SPACE_X)
  }
  var titleValueWidth = 0;
  var titleStatementWidth = 0;
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var currentRow;
  for(var i = 0, input;input = inputList[i];i++) {
    if(!input.isVisible()) {
      continue
    }
    if(i === 0 || !input.isInline()) {
      currentRow = [];
      currentRow.type = input.type;
      currentRow.height = 0;
      inputRows.push(currentRow)
    }
    if(currentRow.length > 0 || input.isInline()) {
      currentRow.type = BS.INLINE
    }
    if(currentRow.length === 0 && input.type === Blockly.FUNCTIONAL_INPUT) {
      currentRow.type = BS.INLINE
    }
    currentRow.push(input);
    var renderSize = inputRenderSize(input);
    input.renderHeight = renderSize.height;
    input.renderWidth = renderSize.width;
    currentRow.height = Math.max(currentRow.height, input.renderHeight);
    var titleSize = inputTitleRenderSize(input, i === 0 ? iconWidth : 0);
    input.titleWidth = titleSize.width;
    currentRow.height = Math.max(currentRow.height, titleSize.height);
    if(currentRow.type != BS.INLINE) {
      if(currentRow.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        titleStatementWidth = Math.max(titleStatementWidth, input.titleWidth)
      }else {
        if(currentRow.type === Blockly.INPUT_VALUE || currentRow.type === Blockly.FUNCTIONAL_INPUT) {
          hasValue = true
        }else {
          if(currentRow.type === Blockly.DUMMY_INPUT) {
            hasDummy = true
          }
        }
        titleValueWidth = Math.max(titleValueWidth, input.titleWidth)
      }
    }
  }
  thickenInlineRows(inputRows);
  inputRows.statementEdge = 2 * BS.SEP_SPACE_X + titleStatementWidth;
  if(hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, inputRows.statementEdge + BS.NOTCH_WIDTH)
  }
  if(hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, titleValueWidth + BS.SEP_SPACE_X * 2 + BS.TAB_WIDTH)
  }else {
    if(hasDummy) {
      inputRows.rightEdge = Math.max(inputRows.rightEdge, titleValueWidth + BS.SEP_SPACE_X * 2)
    }
  }
  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  inputRows.rightEdgeWithoutInline = inputRows.rightEdge;
  for(i = 0;currentRow = inputRows[i];i++) {
    if(currentRow.type === BS.INLINE) {
      inputRows.rightEdge = Math.max(inputRows.rightEdge, widthInlineRow(currentRow))
    }
  }
  return inputRows
};
function thickenInlineRows(inputRows) {
  var row;
  for(var y = 0;row = inputRows[y];y++) {
    row.thicker = false;
    if(row.type === BS.INLINE) {
      for(var z = 0, input;input = row[z];z++) {
        if(input.type === Blockly.INPUT_VALUE || input.type === Blockly.FUNCTIONAL_INPUT) {
          row.height += 2 * BS.INLINE_PADDING_Y;
          row.thicker = true;
          break
        }
      }
    }
  }
}
function inputRenderSize(input) {
  var renderHeight = BS.MIN_BLOCK_Y;
  var renderWidth = BS.TAB_WIDTH + BS.SEP_SPACE_X;
  if(input.type === Blockly.FUNCTIONAL_INPUT) {
    renderWidth = BS.NOTCH_WIDTH + BS.SEP_SPACE_X
  }
  if(input.connection && input.connection.targetConnection) {
    var linkedBlock = input.connection.targetBlock();
    var bBox = linkedBlock.getHeightWidth();
    renderHeight = Math.max(renderHeight, bBox.height);
    renderWidth = Math.max(renderWidth, bBox.width)
  }
  return{width:renderWidth, height:renderHeight}
}
function inputTitleRenderSize(input, iconWidth) {
  var width = oppositeIfRTL(iconWidth);
  var height = 0;
  var titleSize;
  for(var j = 0, title;title = input.titleRow[j];j++) {
    titleSize = title.getSize();
    if(titleSize.width) {
      width += titleSize.width + (j > 0 ? BS.SEP_SPACE_X : 0)
    }
    height = Math.max(height, titleSize.height)
  }
  return{width:width, height:height}
}
function widthInlineRow(row) {
  var width = BS.SEP_SPACE_X;
  for(var i = 0, input;input = row[i];i++) {
    width += input.renderWidth + BS.SEP_SPACE_X
  }
  return width
}
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  if(this.block_.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true
  }else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    if(this.block_.previousConnection) {
      var prevBlock = this.block_.previousConnection.targetBlock();
      if(prevBlock && (prevBlock.nextConnection && prevBlock.nextConnection.targetConnection == this.block_.previousConnection)) {
        this.squareTopLeftCorner_ = true
      }
    }
    if(this.block_.nextConnection) {
      var nextBlock = this.block_.nextConnection.targetBlock();
      if(nextBlock && (nextBlock.previousConnection && nextBlock.previousConnection.targetConnection == this.block_.nextConnection)) {
        this.squareBottomLeftCorner_ = true
      }
    }
  }
  if(this.block_.previousConnection && this.block_.previousConnection.type === Blockly.FUNCTIONAL_OUTPUT) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true
  }
  for(var i = 0;i < this.block_.inputList.length;i++) {
    if(this.block_.inputList[i].type === Blockly.FUNCTIONAL_INPUT) {
      this.squareTopLeftCorner_ = true;
      this.squareBottomLeftCorner_ = true
    }
  }
  var connectionsXY = this.block_.getRelativeToSurfaceXY();
  var renderInfo = {core:[], inline:[], highlight:[], highlightInline:[], curX:iconWidth, curY:0};
  this.renderDrawTop_(renderInfo, inputRows.rightEdge, connectionsXY);
  this.renderDrawRight_(renderInfo, connectionsXY, inputRows, iconWidth);
  this.renderDrawBottom_(renderInfo, connectionsXY);
  this.renderDrawLeft_(renderInfo);
  var pathString = renderInfo.core.join(" ") + "\n" + renderInfo.inline.join(" ");
  this.svgPath_.setAttribute("d", pathString);
  if(this.svgPathFill_) {
    this.svgPathFill_.setAttribute("d", pathString)
  }
  this.svgPathDark_.setAttribute("d", pathString);
  pathString = renderInfo.highlight.join(" ") + "\n" + renderInfo.highlightInline.join(" ");
  this.svgPathLight_.setAttribute("d", pathString);
  if(Blockly.RTL) {
    this.svgPath_.setAttribute("transform", "scale(-1 1)");
    this.svgPathLight_.setAttribute("transform", "scale(-1 1)");
    this.svgPathDark_.setAttribute("transform", "translate(1,1) scale(-1 1)")
  }
};
Blockly.BlockSvg.prototype.renderDrawTop_ = function(renderInfo, rightEdge, connectionsXY) {
  if(this.squareTopLeftCorner_) {
    renderInfo.core.push("m 0,0");
    renderInfo.highlight.push("m 1,1")
  }else {
    renderInfo.core.push(BS.TOP_LEFT_CORNER_START);
    renderInfo.highlight.push(Blockly.RTL ? BS.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL : BS.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    renderInfo.core.push(BS.TOP_LEFT_CORNER);
    renderInfo.highlight.push(BS.TOP_LEFT_CORNER_HIGHLIGHT)
  }
  renderInfo.core.push(brokenControlPointWorkaround());
  if(this.block_.previousConnection) {
    renderInfo.core.push("H", BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH);
    renderInfo.highlight.push("H", BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH);
    renderInfo.core.push(BS.NOTCH_PATH_LEFT);
    renderInfo.highlight.push(BS.NOTCH_PATH_LEFT_HIGHLIGHT);
    var connectionX = connectionsXY.x + oppositeIfRTL(BS.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.block_.previousConnection.moveTo(connectionX, connectionY)
  }
  renderInfo.core.push("H", rightEdge);
  renderInfo.highlight.push("H", rightEdge + (Blockly.RTL ? -1 : 0));
  renderInfo.curX = rightEdge
};
Blockly.BlockSvg.prototype.renderDrawRight_ = function(renderInfo, connectionsXY, inputRows, iconWidth) {
  var connectionX, connectionY;
  for(var i = 0, row;row = inputRows[i];i++) {
    renderInfo.curX = BS.SEP_SPACE_X;
    if(i === 0) {
      renderInfo.curX += oppositeIfRTL(iconWidth)
    }
    renderInfo.highlight.push("M", inputRows.rightEdge - 1 + "," + (renderInfo.curY + 1));
    if(this.block_.isCollapsed()) {
      this.renderDrawRightCollapsed_(renderInfo, row)
    }else {
      if(row.type === BS.INLINE) {
        this.renderDrawRightInline_(renderInfo, inputRows, i, connectionsXY)
      }else {
        if(row.type === Blockly.INPUT_VALUE) {
          this.renderDrawRightInputValue_(renderInfo, inputRows, i, connectionsXY)
        }else {
          if(row.type === Blockly.DUMMY_INPUT) {
            this.renderDrawRightDummyInput_(renderInfo, inputRows, i)
          }else {
            if(row.type === Blockly.NEXT_STATEMENT) {
              this.renderDrawRightNextStatement_(renderInfo, inputRows, i, connectionsXY)
            }
          }
        }
      }
    }
    renderInfo.curY += row.height
  }
  if(!inputRows.length) {
    renderInfo.curY = BS.MIN_BLOCK_Y;
    renderInfo.core.push("V", renderInfo.curY);
    if(Blockly.RTL) {
      renderInfo.highlight.push("V", renderInfo.curY - 1)
    }
  }
};
Blockly.BlockSvg.prototype.renderDrawRightCollapsed_ = function(renderInfo, row) {
  var input = row[0];
  var titleX = renderInfo.curX;
  var titleY = renderInfo.curY + BS.TITLE_HEIGHT;
  renderInfo.curX += this.renderTitles_(input.titleRow, titleX, titleY);
  renderInfo.core.push(BS.JAGGED_TEETH);
  if(Blockly.RTL) {
    renderInfo.highlight.push("l 8,0 0,3.8 7,3.2 m -14.5,9 l 8,4")
  }else {
    renderInfo.highlight.push("h 8")
  }
  var remainder = row.height - BS.JAGGED_TEETH_HEIGHT;
  renderInfo.core.push("v", remainder);
  if(Blockly.RTL) {
    renderInfo.highlight.push("v", remainder - 2)
  }
};
Blockly.BlockSvg.prototype.renderDrawRightInputValue_ = function(renderInfo, inputRows, rowIndex, connectionsXY) {
  var row = inputRows[rowIndex];
  var input = row[0];
  var titleX = renderInfo.curX;
  var titleY = renderInfo.curY + BS.TITLE_HEIGHT;
  if(input.align != Blockly.ALIGN_LEFT) {
    var titleRightX = inputRows.rightEdge - input.titleWidth - BS.TAB_WIDTH - 2 * BS.SEP_SPACE_X;
    if(input.align === Blockly.ALIGN_RIGHT) {
      titleX += titleRightX
    }else {
      if(input.align === Blockly.ALIGN_CENTRE) {
        titleX += (titleRightX + titleX) / 2
      }
    }
  }
  renderInfo.curX += this.renderTitles_(input.titleRow, titleX, titleY);
  renderInfo.core.push(BS.TAB_PATH_DOWN);
  renderInfo.core.push("v", row.height - BS.TAB_HEIGHT);
  if(Blockly.RTL) {
    renderInfo.highlight.push(BS.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    renderInfo.highlight.push("v", row.height - BS.TAB_HEIGHT)
  }else {
    renderInfo.highlight.push("M", inputRows.rightEdge - 4.2 + "," + (renderInfo.curY + BS.TAB_HEIGHT - 0.4));
    renderInfo.highlight.push("l", BS.TAB_WIDTH * 0.42 + ",-1.8")
  }
  connectionX = connectionsXY.x + oppositeIfRTL(inputRows.rightEdge + 1);
  connectionY = connectionsXY.y + renderInfo.curY;
  input.connection.moveTo(connectionX, connectionY);
  if(input.connection.targetConnection) {
    input.connection.tighten_()
  }
};
Blockly.BlockSvg.prototype.renderDrawRightDummyInput_ = function(renderInfo, inputRows, rowIndex) {
  var row = inputRows[rowIndex];
  var input = row[0];
  var titleX = renderInfo.curX;
  var titleY = renderInfo.curY + BS.TITLE_HEIGHT;
  if(input.align === Blockly.ALIGN_RIGHT) {
    var titleRightX = inputRows.rightEdge - input.titleWidth - 2 * BS.SEP_SPACE_X;
    if(inputRows.hasValue) {
      titleRightX -= BS.TAB_WIDTH
    }
    titleX += titleRightX
  }
  if(input.align === Blockly.ALIGN_CENTRE) {
    titleX = (inputRows.rightEdge - input.titleWidth) / 2
  }
  this.renderTitles_(input.titleRow, titleX, titleY);
  renderInfo.core.push("v", row.height);
  if(Blockly.RTL) {
    renderInfo.highlight.push("v", row.height - 2)
  }
};
Blockly.BlockSvg.prototype.renderDrawRightNextStatement_ = function(renderInfo, inputRows, rowIndex, connectionsXY) {
  var row = inputRows[rowIndex];
  var input = row[0];
  if(rowIndex === 0) {
    renderInfo.core.push("v", BS.SEP_SPACE_Y);
    if(Blockly.RTL) {
      renderInfo.highlight.push("v", BS.SEP_SPACE_Y - 1)
    }
    renderInfo.curY += BS.SEP_SPACE_Y
  }
  var titleX = renderInfo.curX;
  var titleY = renderInfo.curY + BS.TITLE_HEIGHT;
  if(input.align != Blockly.ALIGN_LEFT) {
    var titleRightX = inputRows.statementEdge - input.titleWidth - 2 * BS.SEP_SPACE_X;
    if(input.align == Blockly.ALIGN_RIGHT) {
      titleX += titleRightX
    }else {
      if(input.align == Blockly.ALIGN_CENTRE) {
        titleX += (titleRightX + titleX) / 2
      }
    }
  }
  this.renderTitles_(input.titleRow, titleX, titleY);
  renderInfo.curX = inputRows.statementEdge + BS.NOTCH_WIDTH;
  renderInfo.core.push("H", renderInfo.curX);
  renderInfo.core.push(BS.INNER_TOP_LEFT_CORNER);
  renderInfo.core.push("v", row.height - 2 * BS.CORNER_RADIUS);
  renderInfo.core.push(BS.INNER_BOTTOM_LEFT_CORNER);
  renderInfo.core.push("H", inputRows.rightEdgeWithoutInline);
  if(Blockly.RTL) {
    renderInfo.highlight.push("M", renderInfo.curX - BS.NOTCH_WIDTH + BS.DISTANCE_45_OUTSIDE + "," + (renderInfo.curY + BS.DISTANCE_45_OUTSIDE));
    renderInfo.highlight.push(BS.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
    renderInfo.highlight.push("v", row.height - 2 * BS.CORNER_RADIUS);
    renderInfo.highlight.push(BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
    renderInfo.highlight.push("H", inputRows.rightEdgeWithoutInline - 1)
  }else {
    renderInfo.highlight.push("M", renderInfo.curX - BS.NOTCH_WIDTH + BS.DISTANCE_45_OUTSIDE + "," + (renderInfo.curY + row.height - BS.DISTANCE_45_OUTSIDE));
    renderInfo.highlight.push(BS.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
    renderInfo.highlight.push("H", inputRows.rightEdgeWithoutInline)
  }
  connectionX = connectionsXY.x + oppositeIfRTL(renderInfo.curX);
  connectionY = connectionsXY.y + renderInfo.curY + 1;
  input.connection.moveTo(connectionX, connectionY);
  if(input.connection.targetConnection) {
    input.connection.tighten_()
  }
  if(rowIndex === inputRows.length - 1 || inputRows[rowIndex + 1].type === Blockly.NEXT_STATEMENT) {
    renderInfo.core.push("v", BS.SEP_SPACE_Y);
    if(Blockly.RTL) {
      renderInfo.highlight.push("v", BS.SEP_SPACE_Y - 1)
    }
    renderInfo.curY += BS.SEP_SPACE_Y
  }
};
Blockly.BlockSvg.prototype.renderDrawRightInline_ = function(renderInfo, inputRows, rowIndex, connectionsXY) {
  var row = inputRows[rowIndex];
  var hasFunctionalInput = false;
  if(row[0].type === Blockly.FUNCTIONAL_INPUT) {
    var widths = BS.SEP_SPACE_X * (row.length - 1);
    row.forEach(function(input) {
      widths += input.renderWidth
    });
    if(inputRows.rightEdge > widths) {
      renderInfo.curX = (inputRows.rightEdge - widths) / 2
    }
  }
  for(var x = 0, input;input = row[x];x++) {
    var titleX = renderInfo.curX;
    var titleY = renderInfo.curY + BS.TITLE_HEIGHT;
    if(row.thicker) {
      titleY += BS.INLINE_PADDING_Y
    }
    renderInfo.curX += this.renderTitles_(input.titleRow, titleX, titleY);
    if(input.type === Blockly.INPUT_VALUE) {
      renderInfo.curX += input.renderWidth + BS.SEP_SPACE_X;
      renderInfo.inline.push("M", renderInfo.curX - BS.SEP_SPACE_X + "," + (renderInfo.curY + BS.INLINE_PADDING_Y));
      renderInfo.inline.push("h", BS.TAB_WIDTH - input.renderWidth);
      renderInfo.inline.push(BS.TAB_PATH_DOWN);
      renderInfo.inline.push("v", input.renderHeight - BS.TAB_HEIGHT);
      renderInfo.inline.push("h", input.renderWidth - BS.TAB_WIDTH);
      renderInfo.inline.push("z");
      if(Blockly.RTL) {
        renderInfo.highlightInline.push("M", renderInfo.curX - BS.SEP_SPACE_X + BS.TAB_WIDTH - input.renderWidth - 1 + "," + (renderInfo.curY + BS.INLINE_PADDING_Y + 1));
        renderInfo.highlightInline.push(BS.TAB_PATH_DOWN_HIGHLIGHT_RTL);
        renderInfo.highlightInline.push("v", input.renderHeight - BS.TAB_HEIGHT + 2);
        renderInfo.highlightInline.push("h", input.renderWidth - BS.TAB_WIDTH)
      }else {
        renderInfo.highlightInline.push("M", renderInfo.curX - BS.SEP_SPACE_X + 1 + "," + (renderInfo.curY + BS.INLINE_PADDING_Y + 1));
        renderInfo.highlightInline.push("v", input.renderHeight);
        renderInfo.highlightInline.push("h", BS.TAB_WIDTH - input.renderWidth);
        renderInfo.highlightInline.push("M", renderInfo.curX - input.renderWidth - BS.SEP_SPACE_X + 3.8 + "," + (renderInfo.curY + BS.INLINE_PADDING_Y + BS.TAB_HEIGHT - 0.4));
        renderInfo.highlightInline.push("l", BS.TAB_WIDTH * 0.42 + ",-1.8")
      }
      connectionX = connectionsXY.x + oppositeIfRTL(renderInfo.curX + BS.TAB_WIDTH - BS.SEP_SPACE_X - input.renderWidth + 1);
      connectionY = connectionsXY.y + renderInfo.curY + BS.INLINE_PADDING_Y;
      input.connection.moveTo(connectionX, connectionY);
      if(input.connection.targetConnection) {
        input.connection.tighten_()
      }
    }else {
      if(input.type === Blockly.FUNCTIONAL_INPUT) {
        hasFunctionalInput = true;
        this.renderDrawRightInlineFunctional_(renderInfo, input, connectionsXY)
      }else {
        if(input.type != Blockly.DUMMY_INPUT) {
          renderInfo.curX += input.renderWidth + BS.SEP_SPACE_X
        }
      }
    }
  }
  renderInfo.curX = Math.max(renderInfo.curX, inputRows.rightEdge);
  renderInfo.core.push("H", renderInfo.curX);
  if(!hasFunctionalInput) {
    renderInfo.highlight.push("H", renderInfo.curX + (Blockly.RTL ? -1 : 0))
  }
  renderInfo.core.push("v", row.height);
  if(Blockly.RTL) {
    renderInfo.highlight.push("v", row.height - 2)
  }
};
Blockly.BlockSvg.prototype.renderDrawRightInlineFunctional_ = function(renderInfo, input, connectionsXY) {
  throw"Only supported for functional blocks";
};
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(renderInfo, connectionsXY) {
  renderInfo.core.push(brokenControlPointWorkaround());
  if(this.block_.nextConnection) {
    renderInfo.core.push("H", BS.NOTCH_WIDTH + " " + BS.NOTCH_PATH_RIGHT);
    var connectionX = connectionsXY.x + oppositeIfRTL(BS.NOTCH_WIDTH);
    var connectionY = connectionsXY.y + renderInfo.curY + 1;
    this.block_.nextConnection.moveTo(connectionX, connectionY);
    if(this.block_.nextConnection.targetConnection) {
      this.block_.nextConnection.tighten_()
    }
  }
  if(this.squareBottomLeftCorner_) {
    renderInfo.core.push("H 0");
    if(!Blockly.RTL) {
      renderInfo.highlight.push("M", "1," + renderInfo.curY)
    }
  }else {
    renderInfo.core.push("H", BS.CORNER_RADIUS);
    renderInfo.core.push("a", BS.CORNER_RADIUS + "," + BS.CORNER_RADIUS + " 0 0,1 -" + BS.CORNER_RADIUS + ",-" + BS.CORNER_RADIUS);
    if(!Blockly.RTL) {
      renderInfo.highlight.push("M", BS.DISTANCE_45_INSIDE + "," + (renderInfo.curY - BS.DISTANCE_45_INSIDE));
      renderInfo.highlight.push("A", BS.CORNER_RADIUS - 1 + "," + (BS.CORNER_RADIUS - 1) + " 0 0,1 " + "1," + (renderInfo.curY - BS.CORNER_RADIUS))
    }
  }
};
Blockly.BlockSvg.prototype.renderDrawLeft_ = function(renderInfo) {
  if(this.block_.outputConnection) {
    renderInfo.core.push("V", BS.TAB_HEIGHT);
    renderInfo.core.push("c 0,-10 -" + BS.TAB_WIDTH + ",8 -" + BS.TAB_WIDTH + ",-7.5 s " + BS.TAB_WIDTH + ",2.5 " + BS.TAB_WIDTH + ",-7.5");
    if(Blockly.RTL) {
      renderInfo.highlight.push("M", BS.TAB_WIDTH * -0.3 + ",8.9");
      renderInfo.highlight.push("l", BS.TAB_WIDTH * -0.45 + ",-2.1")
    }else {
      renderInfo.highlight.push("V", BS.TAB_HEIGHT - 1);
      renderInfo.highlight.push("m", BS.TAB_WIDTH * -0.92 + ",-1 q " + BS.TAB_WIDTH * -0.19 + ",-5.5 0,-11");
      renderInfo.highlight.push("m", BS.TAB_WIDTH * 0.92 + ",1 V 1 H 2")
    }
  }else {
    if(!Blockly.RTL) {
      renderInfo.highlight.push("V", this.squareTopLeftCorner_ ? 1 : BS.CORNER_RADIUS)
    }
  }
  renderInfo.core.push("z")
};
Blockly.BlockSvg.prototype.setVisible = function(visible) {
  this.svgGroup_.style.display = visible ? "" : "none"
};
goog.provide("Blockly.Field");
goog.require("Blockly.BlockSvg");
Blockly.Field = function(text) {
  this.sourceBlock_ = null;
  this.fieldGroup_ = Blockly.createSvgElement("g", {}, null);
  this.borderRect_ = Blockly.createSvgElement("rect", {"rx":4, "ry":4, "x":-Blockly.BlockSvg.SEP_SPACE_X / 2, "y":-12, "height":16}, this.fieldGroup_);
  this.textElement_ = Blockly.createSvgElement("text", {"class":"blocklyText"}, this.fieldGroup_);
  this.size_ = {height:25, width:0};
  this.setText(text);
  this.visible_ = true
};
Blockly.Field.NBSP = "\u00a0";
Blockly.Field.prototype.EDITABLE = true;
Blockly.Field.prototype.init = function(block) {
  if(this.sourceBlock_) {
    throw"Field has already been initialized once.";
  }
  this.sourceBlock_ = block;
  this.updateEditable();
  block.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseDownWrapper_ = Blockly.bindEvent_(this.fieldGroup_, "mousedown", this, this.onMouseDown_);
  this.mouseUpWrapper_ = Blockly.bindEvent_(this.fieldGroup_, "mouseup", this, this.onMouseUp_);
  this.clickWrapper_ = Blockly.bindEvent_(this.fieldGroup_, "click", this, this.onClick_);
  this.setText(null)
};
Blockly.Field.prototype.dispose = function() {
  if(this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null
  }
  if(this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null
  }
  if(this.clickWrapper_) {
    Blockly.unbindEvent_(this.clickWrapper_);
    this.clickWrapper_ = null
  }
  this.sourceBlock_ = null;
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.textElement_ = null;
  this.borderRect_ = null
};
Blockly.Field.prototype.updateEditable = function() {
  if(!this.EDITABLE) {
    return
  }
  if(this.sourceBlock_.isEditable()) {
    Blockly.addClass_((this.fieldGroup_), "blocklyEditableText");
    Blockly.removeClass_((this.fieldGroup_), "blocklyNoNEditableText");
    this.fieldGroup_.style.cursor = this.CURSOR
  }else {
    Blockly.addClass_((this.fieldGroup_), "blocklyNonEditableText");
    Blockly.removeClass_((this.fieldGroup_), "blocklyEditableText");
    this.fieldGroup_.style.cursor = ""
  }
};
Blockly.Field.prototype.isVisible = function() {
  return this.visible_
};
Blockly.Field.prototype.setVisible = function(visible) {
  this.visible_ = visible;
  this.getRootElement().style.display = visible ? "block" : "none"
};
Blockly.Field.prototype.getRootElement = function() {
  return(this.fieldGroup_)
};
Blockly.Field.prototype.updateWidth_ = function() {
  var width;
  if(this.textElement_.getComputedTextLength) {
    width = this.textElement_.getComputedTextLength()
  }else {
    width = 1
  }
  if(this.borderRect_) {
    this.borderRect_.setAttribute("width", width + Blockly.BlockSvg.SEP_SPACE_X)
  }
  this.size_.width = width
};
Blockly.Field.prototype.getSize = function() {
  if(!this.size_.width) {
    this.updateWidth_()
  }
  return this.size_
};
Blockly.Field.prototype.getBufferY = function() {
  return 0
};
Blockly.Field.prototype.getText = function() {
  return this.text_
};
Blockly.Field.prototype.setText = function(text) {
  if(text === null || text === this.text_) {
    return
  }
  this.text_ = text;
  goog.dom.removeChildren((this.textElement_));
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if(!text) {
    text = Blockly.Field.NBSP
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);
  this.size_.width = 0;
  this.refreshRender()
};
Blockly.Field.prototype.refreshRender = function() {
  if(this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
    this.sourceBlock_.workspace.fireChangeEvent()
  }
};
Blockly.Field.prototype.getValue = function() {
  return this.getText()
};
Blockly.Field.prototype.setValue = function(text) {
  this.setText(text)
};
Blockly.Field.prototype.isKeyboardInputField_ = function() {
  return false
};
Blockly.Field.prototype.showEditorOnClick_ = function() {
  return!!(this.isKeyboardInputField_() && (goog.userAgent.ANDROID || goog.userAgent.MOBILE))
};
Blockly.Field.prototype.onMouseDown_ = function(e) {
  if(this.showEditorOnClick_()) {
    e.stopPropagation()
  }
};
Blockly.Field.prototype.onMouseUp_ = function(e) {
  if(this.showEditorOnClick_()) {
    return
  }else {
    if(Blockly.isRightButton(e)) {
      return
    }else {
      if(Blockly.Block.isFreelyDragging()) {
        return
      }else {
        if(this.sourceBlock_.isEditable()) {
          this.showEditor_()
        }
      }
    }
  }
};
Blockly.Field.prototype.onClick_ = function(e) {
  if(!this.showEditorOnClick_()) {
    return
  }else {
    if(Blockly.isRightButton(e)) {
      return
    }else {
      if(this.sourceBlock_.isEditable()) {
        this.showEditor_()
      }
    }
  }
};
Blockly.Field.prototype.setTooltip = function(newTip) {
};
goog.provide("Blockly.FieldImage");
goog.require("Blockly.Field");
goog.require("goog.userAgent");
goog.require("Blockly.ImageDimensionCache");
Blockly.FieldImage = function(src, width, height) {
  if(!width && !height) {
    var self = this;
    var dimensions = Blockly.ImageDimensionCache.getCachedDimensionsOrDefaultAndUpdate(src, function(updatedWidth, updatedHeight) {
      if(!self.isDestroyed_()) {
        self.updateDimensions_(updatedWidth, updatedHeight)
      }
    });
    width = dimensions.width;
    height = dimensions.height
  }
  this.initializeWithImage_(src, width, height)
};
goog.inherits(Blockly.FieldImage, Blockly.Field);
Blockly.FieldImage.prototype.isDestroyed_ = function() {
  return!this.imageElement_
};
Blockly.FieldImage.IMAGE_LOADING_WIDTH = 40;
Blockly.FieldImage.IMAGE_LOADING_HEIGHT = 40;
Blockly.FieldImage.IMAGE_OFFSET_Y = 6 - Blockly.BlockSvg.TITLE_HEIGHT;
Blockly.FieldImage.BELOW_IMAGE_PADDING = 10;
Blockly.FieldImage.prototype.initializeWithImage_ = function(src, width, height) {
  this.sourceBlock_ = null;
  height = Number(height);
  width = Number(width);
  this.size_ = {height:height + Blockly.FieldImage.BELOW_IMAGE_PADDING, width:width};
  this.fieldGroup_ = Blockly.createSvgElement("g", {}, null);
  this.imageElement_ = Blockly.createSvgElement("image", {"height":height + "px", "width":width + "px", "y":Blockly.FieldImage.IMAGE_OFFSET_Y}, this.fieldGroup_);
  this.setText(src);
  if(goog.userAgent.GECKO) {
    this.clickRectElement_ = Blockly.createSvgElement("rect", {"height":height + "px", "width":width + "px", "y":Blockly.FieldImage.IMAGE_OFFSET_Y, "fill-opacity":0}, this.fieldGroup_)
  }
};
Blockly.FieldImage.prototype.updateDimensions_ = function(width, height) {
  this.size_ = {height:height + Blockly.FieldImage.BELOW_IMAGE_PADDING, width:width};
  this.imageElement_.setAttribute("width", width + "px");
  this.imageElement_.setAttribute("height", height + "px");
  if(this.clickRectElement_) {
    this.clickRectElement_.setAttribute("width", width + "px");
    this.clickRectElement_.setAttribute("height", height + "px")
  }
  this.refreshRender()
};
Blockly.FieldImage.prototype.clickRectElement_ = null;
Blockly.FieldImage.prototype.EDITABLE = false;
Blockly.FieldImage.prototype.init = function(block) {
  if(this.sourceBlock_) {
    throw"Image has already been initialized once.";
  }
  this.sourceBlock_ = block;
  block.getSvgRoot().appendChild(this.fieldGroup_);
  var topElement = this.getClickTarget();
  topElement.tooltip = this.sourceBlock_;
  Blockly.Tooltip && Blockly.Tooltip.bindMouseEvents(topElement)
};
Blockly.FieldImage.prototype.dispose = function() {
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.imageElement_ = null;
  this.clickRectElement_ = null
};
Blockly.FieldImage.prototype.setPreserveAspectRatio = function(value) {
  this.imageElement_.setAttribute("preserveAspectRatio", value)
};
Blockly.FieldImage.prototype.getClickTarget = function() {
  return this.clickRectElement_ || this.imageElement_
};
Blockly.FieldImage.prototype.setTooltip = function(newTip) {
  this.getClickTarget().tooltip = newTip
};
Blockly.FieldImage.prototype.getText = function() {
  return this.src_
};
Blockly.FieldImage.prototype.setText = function(src) {
  if(src === null) {
    return
  }
  this.src_ = src;
  this.imageElement_.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", goog.isString(src) ? src : "")
};
Blockly.FieldImage.prototype.setTextAndRefreshSize = function(src) {
  this.setText(src);
  this.getDimensionsThenUpdate_(src)
};
goog.provide("Blockly.FieldRectangularDropdown");
goog.require("Blockly.Field");
goog.require("Blockly.FieldImage");
goog.require("Blockly.ImageDimensionCache");
Blockly.FieldRectangularDropdown = function(choices) {
  this.choices_ = choices;
  var firstTuple = this.choices_[0];
  this.value_ = firstTuple[Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX];
  var firstPreviewData = firstTuple[Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX];
  this.size_ = {width:Blockly.FieldImage.IMAGE_LOADING_WIDTH, height:Blockly.FieldImage.IMAGE_LOADING_HEIGHT};
  this.buildDOMElements_();
  this.updatePreviewData_(firstPreviewData)
};
goog.inherits(Blockly.FieldRectangularDropdown, Blockly.Field);
Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX = 0;
Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX = 1;
Blockly.FieldRectangularDropdown.BORDER_MARGIN = 2;
Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER = 2;
Blockly.FieldRectangularDropdown.MENU_CSS_CLASS = "blocklyRectangularDropdownMenu";
Blockly.FieldRectangularDropdown.BORDER_OFFSET_X = -Blockly.FieldRectangularDropdown.BORDER_MARGIN;
Blockly.FieldRectangularDropdown.BORDER_OFFSET_Y = Blockly.FieldImage.IMAGE_OFFSET_Y - Blockly.FieldRectangularDropdown.BORDER_MARGIN;
Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS = 4;
Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH = 30;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_WIDTH = 20;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_HEIGHT = 23;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_X_OFFSET_FROM_PREVIEW_RIGHT = Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH / 2 - Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_WIDTH / 2;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_Y_OFFSET_FROM_PREVIEW_MIDDLE = -Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_HEIGHT / 2 - 4;
Blockly.FieldRectangularDropdown.CHECKMARK_OVERHANG = 0;
Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER = "\u25bc";
Blockly.FieldRectangularDropdown.UP_ARROW_CHARACTER = "\u25b2";
Blockly.FieldRectangularDropdown.prototype.CURSOR = "default";
Blockly.FieldRectangularDropdown.prototype.EDITABLE = true;
Blockly.FieldRectangularDropdown.prototype.getOptions = function() {
  return this.choices_
};
Blockly.FieldRectangularDropdown.prototype.buildDOMElements_ = function() {
  this.fieldGroup_ = Blockly.createSvgElement("g", {}, null);
  this.dropdownBorderRectElement_ = Blockly.createSvgElement("rect", {"rx":Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS, "ry":Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS, "x":Blockly.FieldRectangularDropdown.BORDER_OFFSET_X, "y":Blockly.FieldRectangularDropdown.BORDER_OFFSET_Y, "height":Blockly.FieldImage.IMAGE_LOADING_HEIGHT, "class":"fieldRectangularDropdownBackdrop"}, this.fieldGroup_);
  this.addPreviewElementTo_(this.fieldGroup_);
  this.createDropdownArrow_();
  this.clickRectElement_ = Blockly.createSvgElement("rect", {"height":Blockly.FieldImage.IMAGE_LOADING_HEIGHT + "px", "width":Blockly.FieldImage.IMAGE_LOADING_WIDTH + "px", "y":Blockly.FieldImage.IMAGE_OFFSET_Y, "fill-opacity":0}, this.fieldGroup_)
};
Blockly.FieldRectangularDropdown.prototype.addPreviewElementTo_ = function() {
  throw Error("FieldRectangularDropdown.prototype.addPreviewElementTo_ not implemented");
};
Blockly.FieldRectangularDropdown.prototype.createDropdownArrow_ = function() {
  this.dropdownArrowText_ = Blockly.createSvgElement("text", {"class":"blocklyText"}, this.fieldGroup_);
  this.arrowCharacter_ = Blockly.createSvgElement("tspan", {"class":"blocklyArrow blocklyRectangularDropdownArrow"}, this.dropdownArrowText_);
  this.arrowCharacter_.appendChild(document.createTextNode(Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER))
};
Blockly.FieldRectangularDropdown.prototype.updatePreviewData_ = function(previewData) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewData_ not implemented");
};
Blockly.FieldRectangularDropdown.prototype.updateDimensions_ = function(previewRectangleWidth, previewRectangleHeight) {
  this.previewSize_ = {width:previewRectangleWidth, height:previewRectangleHeight};
  var borderHeight = previewRectangleHeight + 2 * Blockly.FieldRectangularDropdown.BORDER_MARGIN;
  var borderWidth = previewRectangleWidth + 2 * Blockly.FieldRectangularDropdown.BORDER_MARGIN + Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH;
  this.updatePreviewDimensions_(previewRectangleWidth, previewRectangleHeight);
  this.clickRectElement_.setAttribute("width", borderWidth + "px");
  this.clickRectElement_.setAttribute("height", borderHeight + "px");
  this.dropdownBorderRectElement_.setAttribute("width", borderWidth + "px");
  this.dropdownBorderRectElement_.setAttribute("height", borderHeight + "px");
  var previewMiddle = previewRectangleHeight / 2 - Blockly.FieldImage.IMAGE_OFFSET_Y;
  this.dropdownArrowText_.setAttribute("x", previewRectangleWidth + Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_X_OFFSET_FROM_PREVIEW_RIGHT);
  this.dropdownArrowText_.setAttribute("y", previewMiddle + Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_Y_OFFSET_FROM_PREVIEW_MIDDLE);
  this.size_ = {height:borderHeight + Blockly.FieldImage.BELOW_IMAGE_PADDING, width:borderWidth};
  this.refreshRender()
};
Blockly.FieldRectangularDropdown.prototype.updatePreviewDimensions_ = function(previewWidth, previewHeight) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewDimensions_ not implemented");
};
Blockly.FieldRectangularDropdown.prototype.createDropdownPreviewElement_ = function(previewData) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewDimensions_ not implemented");
};
Blockly.FieldRectangularDropdown.prototype.pointArrowUp_ = function() {
  this.setArrowDirection_(true)
};
Blockly.FieldRectangularDropdown.prototype.pointArrowDown_ = function() {
  this.setArrowDirection_(false)
};
Blockly.FieldRectangularDropdown.prototype.setArrowDirection_ = function(up) {
  this.arrowCharacter_.firstChild.nodeValue = up ? Blockly.FieldRectangularDropdown.UP_ARROW_CHARACTER : Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER
};
Blockly.FieldRectangularDropdown.prototype.showMenu_ = function() {
  Blockly.WidgetDiv.show(this, this.generateMenuClosedHandler_());
  this.menu_ = this.createMenuWithChoices_(this.choices_);
  goog.events.listen(this.menu_, goog.ui.Component.EventType.ACTION, this.generateMenuItemSelectedHandler_());
  this.addPositionAndShowMenu(this.menu_);
  this.pointArrowUp_()
};
Blockly.FieldRectangularDropdown.prototype.menuAlreadyShowing_ = function() {
  return this.menu_ && (Blockly.WidgetDiv.isOwner(this) && Blockly.WidgetDiv.isVisible())
};
Blockly.FieldRectangularDropdown.prototype.createMenuWithChoices_ = function(choices) {
  var menu = new goog.ui.Menu;
  for(var x = 0;x < choices.length;x++) {
    var previewData = choices[x][Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX];
    var value = choices[x][Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX];
    var isCurrentSelection = value === this.value_;
    var dropdownPreviewElement = this.createDropdownPreviewElement_(previewData);
    var menuItem = new goog.ui.MenuItem(dropdownPreviewElement);
    menuItem.setValue(value);
    var singleColumnLayout = chooseNumberOfColumns(choices.length) === 1;
    if(isCurrentSelection && singleColumnLayout) {
      menu.addItemAt(menuItem, 0)
    }else {
      menu.addItem(menuItem)
    }
  }
  return menu
};
function chooseNumberOfColumns(numItems) {
  if(numItems <= 7) {
    return 1
  }
  return Math.floor(Math.sqrt(numItems))
}
Blockly.FieldRectangularDropdown.prototype.generateMenuItemSelectedHandler_ = function() {
  var fieldRectanglularDropdown = this;
  return function(googMenuElement) {
    var menuItem = googMenuElement.target;
    if(menuItem) {
      var value = menuItem.getValue();
      if(value !== null) {
        fieldRectanglularDropdown.setValue(value)
      }
    }
    Blockly.WidgetDiv.hideIfOwner(fieldRectanglularDropdown)
  }
};
Blockly.FieldRectangularDropdown.prototype.generateMenuClosedHandler_ = function() {
  var fieldRectangularDropdown = this;
  return function() {
    fieldRectangularDropdown.pointArrowDown_()
  }
};
Blockly.FieldRectangularDropdown.prototype.addPositionAndShowMenu = function(menu) {
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var widgetDiv = Blockly.WidgetDiv.DIV;
  widgetDiv.style.visibility = "hidden";
  menu.render(widgetDiv);
  menu.setAllowAutoFocus(true);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, "blocklyDropdownMenu");
  Blockly.addClass_(menuDom, Blockly.FieldRectangularDropdown.MENU_CSS_CLASS);
  Blockly.addClass_(menuDom, "goog-menu-noaccel");
  var backdropColour = this.calculateBackdropColourWithoutAlpha_();
  menuDom.style.borderColor = backdropColour;
  menuDom.style.background = backdropColour;
  var numberOfColumns = chooseNumberOfColumns(menu.getChildCount());
  var multipleColumns = numberOfColumns > 1;
  if(multipleColumns) {
    var marginWidth = 4;
    var widthPerMenuItem = this.previewSize_.width + marginWidth;
    menuDom.style.width = widthPerMenuItem * numberOfColumns + marginWidth + "px";
    Blockly.addClass_(menuDom, "blocklyGridDropdownMenu")
  }
  var menuPosition = this.calculateMenuPosition_(this.previewElement_, multipleColumns);
  Blockly.WidgetDiv.position(menuPosition.x, menuPosition.y, windowSize, scrollOffset);
  widgetDiv.style.visibility = "visible"
};
Blockly.FieldRectangularDropdown.prototype.calculateMenuPosition_ = function(dropdownTargetElement, positionBelow) {
  var previewTopLeft = Blockly.getAbsoluteXY_(dropdownTargetElement);
  var menuTopLeft = {x:previewTopLeft.x - Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER, y:previewTopLeft.y - Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER};
  if(positionBelow) {
    menuTopLeft.y += this.previewSize_.height + Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER
  }
  return menuTopLeft
};
Blockly.FieldRectangularDropdown.prototype.getValue = function() {
  return this.value_
};
Blockly.FieldRectangularDropdown.prototype.setValue = function(newValue) {
  this.value_ = newValue;
  this.refreshPreview_()
};
Blockly.FieldRectangularDropdown.prototype.refreshPreview_ = function() {
  this.updatePreviewData_(this.getCurrentPreviewData_())
};
Blockly.FieldRectangularDropdown.prototype.getCurrentPreviewData_ = function() {
  return this.getPreviewDataForValue_(this.value_)
};
Blockly.FieldRectangularDropdown.prototype.getPreviewDataForValue_ = function(value) {
  var choices = this.choices_;
  for(var x = 0;x < choices.length;x++) {
    if(choices[x][Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX] == value) {
      return choices[x][Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX]
    }
  }
  throw'Preview data for given value "' + value + '" not found';
};
Blockly.FieldRectangularDropdown.prototype.init = function(block) {
  if(this.sourceBlock_) {
    throw"Field has already been initialized once.";
  }
  this.sourceBlock_ = block;
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseUpWrapper_ = Blockly.bindEvent_(this.getClickTarget(), "mouseup", this, this.onMouseUp_);
  this.mouseDownWrapper_ = Blockly.bindEvent_(this.getClickTarget(), "mousedown", this, this.onMouseDown_);
  this.updateDropdownArrowColour_()
};
Blockly.FieldRectangularDropdown.prototype.updateDropdownArrowColour_ = function() {
  if(!this.sourceBlock_) {
    throw"Cannot update dropdown arrow colour before added to block";
  }
  this.arrowCharacter_.style.fill = this.sourceBlock_.getHexColour()
};
Blockly.FieldRectangularDropdown.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  if(this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null
  }
  Blockly.FieldRectangularDropdown.superClass_.dispose.call(this)
};
Blockly.FieldRectangularDropdown.prototype.onMouseUp_ = function(e) {
  if(this.doNotOpenEditorNextMouseUp_) {
    this.doNotOpenEditorNextMouseUp_ = false;
    return
  }
  if(Blockly.isRightButton(e) || (Blockly.Block.isFreelyDragging() || !this.sourceBlock_.isEditable())) {
    return
  }
  this.showMenu_()
};
Blockly.FieldRectangularDropdown.prototype.onMouseDown_ = function(e) {
  if(this.menuAlreadyShowing_()) {
    this.doNotOpenEditorNextMouseUp_ = true
  }
};
Blockly.FieldRectangularDropdown.prototype.getClickTarget = function() {
  return this.clickRectElement_
};
Blockly.FieldRectangularDropdown.prototype.sendClickRectToFront_ = function() {
  this.fieldGroup_.appendChild(this.clickRectElement_)
};
Blockly.FieldRectangularDropdown.prototype.calculateBackdropColourWithoutAlpha_ = function() {
  var blockColour = this.sourceBlock_.getHexColour();
  var backdropOverlayColour = "#ffffff";
  var backdropOverlayOpacity = 0.6;
  return Blockly.mixColoursWithForegroundOpacity(backdropOverlayColour, blockColour, backdropOverlayOpacity)
};
goog.provide("Blockly.FieldColourDropdown");
goog.require("Blockly.Field");
goog.require("Blockly.FieldRectangularDropdown");
Blockly.FieldColourDropdown = function(choices, width, height) {
  var colourChoiceTuples = this.convertColourChoicesToTuples_(choices);
  Blockly.FieldColourDropdown.superClass_.constructor.call(this, colourChoiceTuples);
  this.updateDimensions_(width, height)
};
goog.inherits(Blockly.FieldColourDropdown, Blockly.FieldRectangularDropdown);
Blockly.FieldColourDropdown.prototype.convertColourChoicesToTuples_ = function(choices) {
  var previewDataValueTuples = [];
  for(var i = 0;i < choices.length;i++) {
    var choice = choices[i];
    var choiceTuple = [];
    choiceTuple[Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX] = choice;
    choiceTuple[Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX] = choice;
    previewDataValueTuples.push(choiceTuple)
  }
  return previewDataValueTuples
};
Blockly.FieldColourDropdown.prototype.addPreviewElementTo_ = function(parentElement) {
  this.previewElement_ = Blockly.createSvgElement("rect", {"y":Blockly.FieldImage.IMAGE_OFFSET_Y, "height":Blockly.FieldImage.IMAGE_LOADING_HEIGHT + "px", "width":Blockly.FieldImage.IMAGE_LOADING_WIDTH + "px"}, parentElement)
};
Blockly.FieldColourDropdown.prototype.createDropdownPreviewElement_ = function(previewData) {
  var rect = document.createElement("div");
  rect.style.backgroundColor = previewData;
  rect.style.width = this.previewSize_.width + "px";
  rect.style.height = this.previewSize_.height + "px";
  return rect
};
Blockly.FieldColourDropdown.prototype.updatePreviewData_ = function(previewData) {
  this.previewElement_.setAttribute("fill", previewData)
};
Blockly.FieldColourDropdown.prototype.updatePreviewDimensions_ = function(previewWidth, previewHeight) {
  this.previewElement_.setAttribute("width", previewWidth + "px");
  this.previewElement_.setAttribute("height", previewHeight + "px")
};
goog.provide("Blockly.Names");
Blockly.Names = function(reservedWords) {
  this.reservedDict_ = {};
  if(reservedWords) {
    var splitWords = reservedWords.split(",");
    for(var x = 0;x < splitWords.length;x++) {
      this.reservedDict_[Blockly.Names.PREFIX_ + splitWords[x]] = true
    }
  }
  this.reset()
};
Blockly.Names.PREFIX_ = "$_";
Blockly.Names.prototype.reset = function() {
  this.db_ = {};
  this.dbSpecificType_ = {};
  this.dbReverse_ = {}
};
Blockly.Names.prototype.getName = function(name, type, specificType) {
  var normalized = Blockly.Names.PREFIX_ + name.toLowerCase() + "_" + type;
  if(normalized in this.db_) {
    return this.db_[normalized]
  }
  var safeName = this.getDistinctName(name, type);
  this.db_[normalized] = safeName;
  if(specificType) {
    this.dbSpecificType_[normalized] = specificType
  }
  return safeName
};
Blockly.Names.prototype.checkSpecificType = function(name, type, specificType) {
  var normalized = Blockly.Names.PREFIX_ + name.toLowerCase() + "_" + type;
  return normalized in this.dbSpecificType_ && this.dbSpecificType_[normalized] === specificType
};
Blockly.Names.prototype.getDistinctName = function(name, type) {
  var safeName = this.safeName_(name);
  var i = "";
  while(this.dbReverse_[Blockly.Names.PREFIX_ + safeName + i] || Blockly.Names.PREFIX_ + safeName + i in this.reservedDict_) {
    i = i ? i + 1 : 2
  }
  safeName += i;
  this.dbReverse_[Blockly.Names.PREFIX_ + safeName] = true;
  return safeName
};
Blockly.Names.prototype.safeName_ = function(name) {
  if(!name) {
    name = "unnamed"
  }else {
    name = encodeURI(name.replace(/ /g, "_")).replace(/[^\w]/g, "_");
    if("0123456789".indexOf(name[0]) != -1) {
      name = "my_" + name
    }
  }
  return name
};
Blockly.Names.equals = function(name1, name2) {
  return name1.toLowerCase() == name2.toLowerCase()
};
goog.provide("Blockly.Xml");
Blockly.Xml.workspaceToDom = function(workspace) {
  var width = Blockly.svgSize().width;
  var xml = Blockly.isMsie() ? document.createElementNS(null, "xml") : document.createElement("xml");
  var blocks = workspace.getTopBlocks(true);
  for(var i = 0, block;block = blocks[i];i++) {
    var element = Blockly.Xml.blockToDom_(block);
    xml.appendChild(element)
  }
  return xml
};
Blockly.Xml.blockToDom_ = function(block, ignoreChildBlocks) {
  var element = goog.dom.createDom("block");
  element.setAttribute("type", block.type);
  if(block.mutationToDom) {
    var mutation = block.mutationToDom();
    if(mutation) {
      element.appendChild(mutation)
    }
  }
  function titleToDom(title) {
    if(title.name && title.EDITABLE) {
      var container = goog.dom.createDom("title", null, title.getValue());
      container.setAttribute("name", title.name);
      if(title.config) {
        container.setAttribute("config", title.config)
      }
      element.appendChild(container)
    }
  }
  for(var x = 0, input;input = block.inputList[x];x++) {
    for(var y = 0, title;title = input.titleRow[y];y++) {
      titleToDom(title)
    }
  }
  if(block.comment) {
    var commentElement = goog.dom.createDom("comment", null, block.comment.getText());
    commentElement.setAttribute("pinned", block.comment.isVisible());
    var hw = block.comment.getBubbleSize();
    commentElement.setAttribute("h", hw.height);
    commentElement.setAttribute("w", hw.width);
    element.appendChild(commentElement)
  }
  var setInlineAttribute = false;
  for(var i = 0, input;input = block.inputList[i];i++) {
    var container;
    var empty = true;
    if(input.type == Blockly.DUMMY_INPUT) {
      continue
    }else {
      var ignoreChild = false;
      var childBlock = input.connection.targetBlock();
      if(input.type === Blockly.INPUT_VALUE) {
        container = goog.dom.createDom("value");
        setInlineAttribute = true
      }else {
        if(input.type === Blockly.NEXT_STATEMENT) {
          container = goog.dom.createDom("statement");
          ignoreChild = ignoreChildBlocks
        }else {
          if(input.type === Blockly.FUNCTIONAL_INPUT) {
            container = goog.dom.createDom("functional_input");
            ignoreChild = ignoreChildBlocks;
            setInlineAttribute = true
          }
        }
      }
      if(childBlock && !ignoreChild) {
        container.appendChild(Blockly.Xml.blockToDom_(childBlock));
        empty = false
      }
    }
    container.setAttribute("name", input.name);
    if(!empty) {
      element.appendChild(container)
    }
  }
  if(setInlineAttribute) {
    element.setAttribute("inline", block.inputsInline)
  }
  if(block.isCollapsed()) {
    element.setAttribute("collapsed", true)
  }
  if(block.disabled) {
    element.setAttribute("disabled", true)
  }
  if(!block.isDeletable()) {
    element.setAttribute("deletable", false)
  }
  if(!block.isMovable()) {
    element.setAttribute("movable", false)
  }
  if(!block.isEditable()) {
    element.setAttribute("editable", false)
  }
  if(block.nextConnection && !ignoreChildBlocks) {
    var nextBlock = block.nextConnection.targetBlock();
    if(nextBlock) {
      var container = goog.dom.createDom("next", null, Blockly.Xml.blockToDom_(nextBlock));
      element.appendChild(container)
    }
  }
  return element
};
Blockly.Xml.domToText = function(dom) {
  var oSerializer = new XMLSerializer;
  var text = oSerializer.serializeToString(dom);
  var re = new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', "g");
  return text.replace(re, "")
};
Blockly.Xml.domToPrettyText = function(dom) {
  var blob = Blockly.Xml.domToText(dom);
  var lines = blob.split("<");
  var indent = "";
  for(var x = 1;x < lines.length;x++) {
    var line = lines[x];
    if(line[0] == "/") {
      indent = indent.substring(2)
    }
    lines[x] = indent + "<" + line;
    if(line[0] != "/" && line.slice(-2) != "/>") {
      indent += "  "
    }
  }
  var text = lines.join("\n");
  text = text.replace(/(<(\w+)\b[^>]*>[^\n]*)\n *<\/\2>/g, "$1</$2>");
  return text.replace(/^\n/, "")
};
Blockly.Xml.textToDom = function(text) {
  var oParser = new DOMParser;
  var dom = oParser.parseFromString(text, "text/xml");
  if(!dom || (!dom.firstChild || dom.firstChild.nodeName.toLowerCase() != "xml")) {
    throw"Blockly.Xml.textToDom did not obtain a valid XML tree.";
  }
  return dom.firstChild
};
Blockly.Xml.domToWorkspace = function(workspace, xml) {
  var width = Blockly.svgSize().width;
  for(var x = 0, xmlChild;xmlChild = xml.childNodes[x];x++) {
    if(xmlChild.nodeName.toLowerCase() == "block") {
      var block = Blockly.Xml.domToBlock_(workspace, xmlChild);
      var blockX = parseInt(xmlChild.getAttribute("x"), 10);
      var blockY = parseInt(xmlChild.getAttribute("y"), 10);
      if(!isNaN(blockX) && !isNaN(blockY)) {
        block.moveBy(Blockly.RTL ? width - blockX : blockX, blockY)
      }
    }
  }
};
Blockly.Xml.domToBlock_ = function(workspace, xmlBlock) {
  var prototypeName = xmlBlock.getAttribute("type");
  var id = xmlBlock.getAttribute("id");
  var block = new Blockly.Block(workspace, prototypeName, id);
  block.initSvg();
  var inline = xmlBlock.getAttribute("inline");
  if(inline) {
    block.setInputsInline(inline == "true")
  }
  var collapsed = xmlBlock.getAttribute("collapsed");
  if(collapsed) {
    block.setCollapsed(collapsed == "true")
  }
  var disabled = xmlBlock.getAttribute("disabled");
  if(disabled) {
    block.setDisabled(disabled == "true")
  }
  var deletable = xmlBlock.getAttribute("deletable");
  if(deletable) {
    block.setDeletable(deletable == "true")
  }
  var movable = xmlBlock.getAttribute("movable");
  if(movable) {
    block.setMovable(movable == "true")
  }
  var editable = xmlBlock.getAttribute("editable");
  if(editable) {
    block.setEditable(editable == "true")
  }
  var blockChild = null;
  for(var x = 0, xmlChild;xmlChild = xmlBlock.childNodes[x];x++) {
    if(xmlChild.nodeType == 3 && xmlChild.data.match(/^\s*$/)) {
      continue
    }
    var input;
    var firstRealGrandchild = null;
    for(var y = 0, grandchildNode;grandchildNode = xmlChild.childNodes[y];y++) {
      if(grandchildNode.nodeType != 3 || !grandchildNode.data.match(/^\s*$/)) {
        firstRealGrandchild = grandchildNode
      }
    }
    var name = xmlChild.getAttribute("name");
    switch(xmlChild.nodeName.toLowerCase()) {
      case "mutation":
        if(block.domToMutation) {
          block.domToMutation(xmlChild)
        }
        break;
      case "comment":
        block.setCommentText(xmlChild.textContent);
        var visible = xmlChild.getAttribute("pinned");
        if(visible) {
          block.comment.setVisible(visible == "true")
        }
        var bubbleW = parseInt(xmlChild.getAttribute("w"), 10);
        var bubbleH = parseInt(xmlChild.getAttribute("h"), 10);
        if(!isNaN(bubbleW) && !isNaN(bubbleH)) {
          block.comment.setBubbleSize(bubbleW, bubbleH)
        }
        break;
      case "title":
        var config = xmlChild.getAttribute("config");
        if(config) {
          block.setFieldConfig(name, config)
        }
        block.setTitleValue(xmlChild.textContent, name);
        break;
      case "value":
      ;
      case "statement":
      ;
      case "functional_input":
        input = block.getInput(name);
        if(!input) {
          throw"Input does not exist: " + name;
        }
        if(firstRealGrandchild && firstRealGrandchild.nodeName.toLowerCase() == "block") {
          blockChild = Blockly.Xml.domToBlock_(workspace, firstRealGrandchild);
          if(blockChild.outputConnection) {
            input.connection.connect(blockChild.outputConnection)
          }else {
            if(blockChild.previousConnection) {
              input.connection.connect(blockChild.previousConnection)
            }else {
              throw"Child block does not have output or previous statement.";
            }
          }
        }
        break;
      case "next":
        if(firstRealGrandchild && firstRealGrandchild.nodeName.toLowerCase() == "block") {
          if(!block.nextConnection) {
            throw"Next statement does not exist.";
          }else {
            if(block.nextConnection.targetConnection) {
              throw"Next statement is already connected.";
            }
          }
          blockChild = Blockly.Xml.domToBlock_(workspace, firstRealGrandchild);
          if(!blockChild.previousConnection) {
            throw"Next block does not have previous statement.";
          }
          block.nextConnection.connect(blockChild.previousConnection)
        }
        break;
      default:
    }
  }
  var next = block.nextConnection && block.nextConnection.targetBlock();
  if(next) {
    next.render()
  }else {
    block.render()
  }
  return block
};
Blockly.Xml.deleteNext = function(xmlBlock) {
  for(var x = 0, child;child = xmlBlock.childNodes[x];x++) {
    if(child.nodeName.toLowerCase() == "next") {
      xmlBlock.removeChild(child);
      break
    }
  }
};
goog.provide("Blockly.Scrollbar");
goog.provide("Blockly.ScrollbarPair");
goog.require("goog.userAgent");
Blockly.ScrollbarPair = function(workspace) {
  this.workspace_ = workspace;
  this.oldHostMetrics_ = null;
  this.hScroll = new Blockly.Scrollbar(workspace, true, true);
  this.vScroll = new Blockly.Scrollbar(workspace, false, true);
  this.corner_ = Blockly.createSvgElement("rect", {"height":Blockly.Scrollbar.scrollbarThickness, "width":Blockly.Scrollbar.scrollbarThickness, "style":"fill: #fff"}, null);
  Blockly.Scrollbar.insertAfter_(this.corner_, workspace.getBubbleCanvas())
};
Blockly.ScrollbarPair.prototype.dispose = function() {
  Blockly.unbindEvent_(this.onResizeWrapper_);
  this.onResizeWrapper_ = null;
  goog.dom.removeNode(this.corner_);
  this.corner_ = null;
  this.workspace_ = null;
  this.oldHostMetrics_ = null;
  this.hScroll.dispose();
  this.hScroll = null;
  this.vScroll.dispose();
  this.vScroll = null
};
Blockly.ScrollbarPair.prototype.resize = function() {
  var hostMetrics = this.workspace_.getMetrics();
  if(!hostMetrics) {
    return
  }
  var resizeH = false;
  var resizeV = false;
  if(!this.oldHostMetrics_ || (this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth || (this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight || (this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop || this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft)))) {
    resizeH = true;
    resizeV = true
  }else {
    if(!this.oldHostMetrics_ || (this.oldHostMetrics_.contentWidth != hostMetrics.contentWidth || (this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft || this.oldHostMetrics_.contentLeft != hostMetrics.contentLeft))) {
      resizeH = true
    }
    if(!this.oldHostMetrics_ || (this.oldHostMetrics_.contentHeight != hostMetrics.contentHeight || (this.oldHostMetrics_.viewTop != hostMetrics.viewTop || this.oldHostMetrics_.contentTop != hostMetrics.contentTop))) {
      resizeV = true
    }
  }
  if(resizeH) {
    this.hScroll.resize(hostMetrics)
  }
  if(resizeV) {
    this.vScroll.resize(hostMetrics)
  }
  if(!this.oldHostMetrics_ || (this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth || this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft)) {
    this.corner_.setAttribute("x", this.vScroll.xCoordinate)
  }
  if(!this.oldHostMetrics_ || (this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight || this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop)) {
    this.corner_.setAttribute("y", this.hScroll.yCoordinate)
  }
  this.oldHostMetrics_ = hostMetrics
};
Blockly.ScrollbarPair.prototype.set = function(x, y) {
  if(Blockly.Scrollbar === Blockly.ScrollbarNative) {
    this.hScroll.set(x, false);
    this.vScroll.set(y, false);
    var xyRatio = {};
    xyRatio.x = this.hScroll.outerDiv_.scrollLeft / this.hScroll.innerImg_.offsetWidth || 0;
    xyRatio.y = this.vScroll.outerDiv_.scrollTop / this.vScroll.innerImg_.offsetHeight || 0;
    this.workspace_.setMetrics(xyRatio)
  }else {
    this.hScroll.set(x, true);
    this.vScroll.set(y, true)
  }
};
Blockly.ScrollbarInterface = function() {
};
Blockly.ScrollbarInterface.prototype.dispose = function() {
};
Blockly.ScrollbarInterface.prototype.resize = function() {
};
Blockly.ScrollbarInterface.prototype.isVisible = function() {
};
Blockly.ScrollbarInterface.prototype.setVisible = function(visible) {
};
Blockly.ScrollbarInterface.prototype.set = function(value, fireEvents) {
};
Blockly.ScrollbarNative = function(workspace, horizontal, opt_pair) {
  this.workspace_ = workspace;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;
  this.createDom_();
  if(horizontal === null) {
    return
  }
  if(!Blockly.Scrollbar.scrollbarThickness) {
    Blockly.ScrollbarNative.measureScrollbarThickness_(workspace)
  }
  if(horizontal) {
    this.foreignObject_.setAttribute("height", Blockly.Scrollbar.scrollbarThickness);
    this.outerDiv_.style.height = Blockly.Scrollbar.scrollbarThickness + "px";
    this.outerDiv_.style.overflowX = "scroll";
    this.outerDiv_.style.overflowY = "hidden";
    this.innerImg_.style.height = "1px"
  }else {
    this.foreignObject_.setAttribute("width", Blockly.Scrollbar.scrollbarThickness);
    this.outerDiv_.style.width = Blockly.Scrollbar.scrollbarThickness + "px";
    this.outerDiv_.style.overflowX = "hidden";
    this.outerDiv_.style.overflowY = "scroll";
    this.innerImg_.style.width = "1px"
  }
  var scrollbar = this;
  this.onScrollWrapper_ = Blockly.bindEvent_(this.outerDiv_, "scroll", scrollbar, function() {
    scrollbar.onScroll_()
  });
  Blockly.bindEvent_(this.foreignObject_, "mousedown", null, function(e) {
    Blockly.hideChaff(true);
    Blockly.noEvent(e)
  })
};
Blockly.ScrollbarNative.prototype.dispose = function() {
  Blockly.unbindEvent_(this.onResizeWrapper_);
  this.onResizeWrapper_ = null;
  Blockly.unbindEvent_(this.onScrollWrapper_);
  this.onScrollWrapper_ = null;
  goog.dom.removeNode(this.foreignObject_);
  this.foreignObject_ = null;
  this.workspace_ = null;
  this.outerDiv_ = null;
  this.innerImg_ = null
};
Blockly.ScrollbarNative.prototype.resize = function(opt_metrics) {
  var hostMetrics = opt_metrics;
  if(!hostMetrics) {
    hostMetrics = this.workspace_.getMetrics();
    if(!hostMetrics) {
      return
    }
  }
  if(this.horizontal_) {
    var outerLength = hostMetrics.viewWidth;
    if(this.pair_) {
      outerLength -= Blockly.Scrollbar.scrollbarThickness
    }else {
      this.setVisible(outerLength < hostMetrics.contentWidth)
    }
    this.ratio_ = outerLength / hostMetrics.viewWidth;
    var innerLength = this.ratio_ * hostMetrics.contentWidth;
    var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) * this.ratio_;
    this.outerDiv_.style.width = outerLength + "px";
    this.innerImg_.style.width = innerLength + "px";
    this.xCoordinate = hostMetrics.absoluteLeft;
    if(this.pair_ && Blockly.RTL) {
      this.xCoordinate += Blockly.Scrollbar.scrollbarThickness
    }
    this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight - Blockly.Scrollbar.scrollbarThickness;
    this.foreignObject_.setAttribute("x", this.xCoordinate);
    this.foreignObject_.setAttribute("y", this.yCoordinate);
    this.foreignObject_.setAttribute("width", Math.max(0, outerLength));
    this.outerDiv_.scrollLeft = Math.round(innerOffset)
  }else {
    var outerLength = hostMetrics.viewHeight;
    if(this.pair_) {
      outerLength -= Blockly.Scrollbar.scrollbarThickness
    }else {
      this.setVisible(outerLength < hostMetrics.contentHeight)
    }
    this.ratio_ = outerLength / hostMetrics.viewHeight;
    var innerLength = this.ratio_ * hostMetrics.contentHeight;
    var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) * this.ratio_;
    this.outerDiv_.style.height = outerLength + "px";
    this.innerImg_.style.height = innerLength + "px";
    this.xCoordinate = hostMetrics.absoluteLeft;
    if(!Blockly.RTL) {
      this.xCoordinate += hostMetrics.viewWidth - Blockly.Scrollbar.scrollbarThickness
    }
    this.yCoordinate = hostMetrics.absoluteTop;
    this.foreignObject_.setAttribute("x", this.xCoordinate);
    this.foreignObject_.setAttribute("y", this.yCoordinate);
    this.foreignObject_.setAttribute("height", Math.max(0, outerLength));
    this.outerDiv_.scrollTop = Math.round(innerOffset)
  }
};
Blockly.ScrollbarNative.prototype.createDom_ = function() {
  this.foreignObject_ = Blockly.createSvgElement("foreignObject", {}, null);
  var body = document.createElementNS(Blockly.HTML_NS, "body");
  body.setAttribute("xmlns", Blockly.HTML_NS);
  body.setAttribute("class", "blocklyMinimalBody");
  var outer = document.createElementNS(Blockly.HTML_NS, "div");
  this.outerDiv_ = outer;
  var inner = document.createElementNS(Blockly.HTML_NS, "img");
  inner.setAttribute("src", Blockly.assetUrl("media/1x1.gif"));
  this.innerImg_ = inner;
  outer.appendChild(inner);
  body.appendChild(outer);
  this.foreignObject_.appendChild(body);
  Blockly.Scrollbar.insertAfter_(this.foreignObject_, this.workspace_.getBubbleCanvas())
};
Blockly.ScrollbarNative.prototype.isVisible = function() {
  return this.foreignObject_.style.display != "none"
};
Blockly.ScrollbarNative.prototype.setVisible = function(visible) {
  if(visible == this.isVisible()) {
    return
  }
  if(this.pair_) {
    throw"Unable to toggle visibility of paired scrollbars.";
  }
  if(visible) {
    this.foreignObject_.style.display = "block";
    this.workspace_.getMetrics()
  }else {
    this.workspace_.setMetrics({x:0, y:0});
    this.foreignObject_.style.display = "none"
  }
};
Blockly.ScrollbarNative.prototype.onScroll_ = function() {
  var xyRatio = {};
  if(this.horizontal_) {
    xyRatio.x = this.outerDiv_.scrollLeft / this.innerImg_.offsetWidth || 0
  }else {
    xyRatio.y = this.outerDiv_.scrollTop / this.innerImg_.offsetHeight || 0
  }
  this.workspace_.setMetrics(xyRatio)
};
Blockly.ScrollbarNative.prototype.set = function(value, fireEvents) {
  if(!fireEvents && this.onScrollWrapper_) {
    var scrollFunc = Blockly.unbindEvent_(this.onScrollWrapper_)
  }
  if(this.horizontal_) {
    this.outerDiv_.scrollLeft = value * this.ratio_
  }else {
    this.outerDiv_.scrollTop = value * this.ratio_
  }
  if(scrollFunc) {
    var scrollbar = this;
    this.onScrollWrapper_ = Blockly.bindEvent_(this.outerDiv_, "scroll", scrollbar, scrollFunc)
  }
};
Blockly.ScrollbarNative.measureScrollbarThickness_ = function(workspace) {
  var testBar = new Blockly.ScrollbarNative(workspace, null, false);
  testBar.outerDiv_.style.width = "100px";
  testBar.outerDiv_.style.height = "100px";
  testBar.innerImg_.style.width = "100%";
  testBar.innerImg_.style.height = "200px";
  testBar.foreignObject_.setAttribute("width", 1);
  testBar.foreignObject_.setAttribute("height", 1);
  testBar.outerDiv_.style.overflowY = "scroll";
  var w1 = testBar.innerImg_.offsetWidth;
  testBar.outerDiv_.style.overflowY = "hidden";
  var w2 = testBar.innerImg_.offsetWidth;
  goog.dom.removeNode(testBar.foreignObject_);
  var thickness = w2 - w1;
  if(thickness <= 0) {
    thickness = 15
  }
  Blockly.Scrollbar.scrollbarThickness = thickness
};
Blockly.ScrollbarSvg = function(workspace, horizontal, opt_pair) {
  this.workspace_ = workspace;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;
  this.createDom_();
  if(horizontal) {
    this.svgBackground_.setAttribute("height", Blockly.Scrollbar.scrollbarThickness);
    this.svgKnob_.setAttribute("height", Blockly.Scrollbar.scrollbarThickness - 6);
    this.svgKnob_.setAttribute("y", 3)
  }else {
    this.svgBackground_.setAttribute("width", Blockly.Scrollbar.scrollbarThickness);
    this.svgKnob_.setAttribute("width", Blockly.Scrollbar.scrollbarThickness - 6);
    this.svgKnob_.setAttribute("x", 3)
  }
  var scrollbar = this;
  this.onMouseDownBarWrapper_ = Blockly.bindEvent_(this.svgBackground_, "mousedown", scrollbar, scrollbar.onMouseDownBar_);
  this.onMouseDownKnobWrapper_ = Blockly.bindEvent_(this.svgKnob_, "mousedown", scrollbar, scrollbar.onMouseDownKnob_)
};
Blockly.ScrollbarSvg.prototype.dispose = function() {
  this.onMouseUpKnob_();
  if(this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null
  }
  Blockly.unbindEvent_(this.onMouseDownBarWrapper_);
  this.onMouseDownBarWrapper_ = null;
  Blockly.unbindEvent_(this.onMouseDownKnobWrapper_);
  this.onMouseDownKnobWrapper_ = null;
  goog.dom.removeNode(this.svgGroup_);
  this.svgGroup_ = null;
  this.svgBackground_ = null;
  this.svgKnob_ = null;
  this.workspace_ = null
};
Blockly.ScrollbarSvg.prototype.resize = function(opt_metrics) {
  var hostMetrics = opt_metrics;
  if(!hostMetrics) {
    hostMetrics = this.workspace_.getMetrics();
    if(!hostMetrics) {
      return
    }
  }
  if(this.horizontal_) {
    var outerLength = hostMetrics.viewWidth;
    if(this.pair_) {
      outerLength -= Blockly.Scrollbar.scrollbarThickness
    }else {
      this.setVisible(outerLength < hostMetrics.contentHeight)
    }
    this.ratio_ = outerLength / hostMetrics.contentWidth;
    if(this.ratio_ === -Infinity || (this.ratio_ === Infinity || isNaN(this.ratio_))) {
      this.ratio_ = 0
    }
    var innerLength = hostMetrics.viewWidth * this.ratio_;
    var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) * this.ratio_;
    this.svgKnob_.setAttribute("width", Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if(this.pair_ && Blockly.RTL) {
      this.xCoordinate += hostMetrics.absoluteLeft + Blockly.Scrollbar.scrollbarThickness
    }
    this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight - Blockly.Scrollbar.scrollbarThickness;
    this.svgGroup_.setAttribute("transform", "translate(" + this.xCoordinate + ", " + this.yCoordinate + ")");
    this.svgBackground_.setAttribute("width", Math.max(0, outerLength));
    this.svgKnob_.setAttribute("x", this.constrainKnob_(innerOffset))
  }else {
    var outerLength = hostMetrics.viewHeight;
    if(this.pair_) {
      outerLength -= Blockly.Scrollbar.scrollbarThickness
    }else {
      this.setVisible(outerLength < hostMetrics.contentHeight)
    }
    this.ratio_ = outerLength / hostMetrics.contentHeight;
    if(this.ratio_ === -Infinity || (this.ratio_ === Infinity || isNaN(this.ratio_))) {
      this.ratio_ = 0
    }
    var innerLength = hostMetrics.viewHeight * this.ratio_;
    var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) * this.ratio_;
    this.svgKnob_.setAttribute("height", Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if(!Blockly.RTL) {
      this.xCoordinate += hostMetrics.viewWidth - Blockly.Scrollbar.scrollbarThickness
    }
    this.yCoordinate = hostMetrics.absoluteTop;
    this.svgGroup_.setAttribute("transform", "translate(" + this.xCoordinate + ", " + this.yCoordinate + ")");
    this.svgBackground_.setAttribute("height", Math.max(0, outerLength));
    this.svgKnob_.setAttribute("y", this.constrainKnob_(innerOffset))
  }
  this.onScroll_()
};
Blockly.ScrollbarSvg.prototype.createDom_ = function() {
  this.svgGroup_ = Blockly.createSvgElement("g", {}, null);
  this.svgBackground_ = Blockly.createSvgElement("rect", {"class":"blocklyScrollbarBackground"}, this.svgGroup_);
  var radius = Math.floor((Blockly.Scrollbar.scrollbarThickness - 6) / 2);
  this.svgKnob_ = Blockly.createSvgElement("rect", {"class":"blocklyScrollbarKnob", "rx":radius, "ry":radius}, this.svgGroup_);
  Blockly.Scrollbar.insertAfter_(this.svgGroup_, this.workspace_.getBubbleCanvas())
};
Blockly.ScrollbarSvg.prototype.isVisible = function() {
  return this.svgGroup_.getAttribute("display") != "none"
};
Blockly.ScrollbarSvg.prototype.setVisible = function(visible) {
  if(visible == this.isVisible()) {
    return
  }
  if(this.pair_) {
    throw"Unable to toggle visibility of paired scrollbars.";
  }
  if(visible) {
    this.svgGroup_.setAttribute("display", "block")
  }else {
    this.workspace_.setMetrics({x:0, y:0});
    this.svgGroup_.setAttribute("display", "none")
  }
};
Blockly.ScrollbarSvg.prototype.onMouseDownBar_ = function(e) {
  Blockly.hideChaff(true);
  if(Blockly.isRightButton(e)) {
    e.stopPropagation();
    return
  }
  var mouseXY = Blockly.mouseToSvg(e);
  var mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;
  var knobXY = Blockly.getSvgXY_(this.svgKnob_);
  var knobStart = this.horizontal_ ? knobXY.x : knobXY.y;
  var knobLength = parseFloat(this.svgKnob_.getAttribute(this.horizontal_ ? "width" : "height"));
  var knobValue = parseFloat(this.svgKnob_.getAttribute(this.horizontal_ ? "x" : "y"));
  var pageLength = knobLength * 0.95;
  if(mouseLocation <= knobStart) {
    knobValue -= pageLength
  }else {
    if(mouseLocation >= knobStart + knobLength) {
      knobValue += pageLength
    }
  }
  this.svgKnob_.setAttribute(this.horizontal_ ? "x" : "y", this.constrainKnob_(knobValue));
  this.onScroll_();
  e.stopPropagation()
};
Blockly.ScrollbarSvg.prototype.onMouseDownKnob_ = function(e) {
  Blockly.hideChaff(true);
  this.onMouseUpKnob_();
  if(Blockly.isRightButton(e)) {
    e.stopPropagation();
    return
  }
  this.startDragKnob = parseFloat(this.svgKnob_.getAttribute(this.horizontal_ ? "x" : "y"));
  this.startDragMouse = this.horizontal_ ? e.clientX : e.clientY;
  Blockly.ScrollbarSvg.onMouseUpWrapper_ = Blockly.bindEvent_(document, "mouseup", this, this.onMouseUpKnob_);
  Blockly.ScrollbarSvg.onMouseMoveWrapper_ = Blockly.bindEvent_(document, "mousemove", this, this.onMouseMoveKnob_);
  e.stopPropagation()
};
Blockly.ScrollbarSvg.prototype.onMouseMoveKnob_ = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY;
  var mouseDelta = currentMouse - this.startDragMouse;
  var knobValue = this.startDragKnob + mouseDelta;
  this.svgKnob_.setAttribute(this.horizontal_ ? "x" : "y", this.constrainKnob_(knobValue));
  this.onScroll_()
};
Blockly.ScrollbarSvg.prototype.onMouseUpKnob_ = function() {
  if(Blockly.ScrollbarSvg.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.ScrollbarSvg.onMouseUpWrapper_);
    Blockly.ScrollbarSvg.onMouseUpWrapper_ = null
  }
  if(Blockly.ScrollbarSvg.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.ScrollbarSvg.onMouseMoveWrapper_);
    Blockly.ScrollbarSvg.onMouseMoveWrapper_ = null
  }
};
Blockly.ScrollbarSvg.prototype.constrainKnob_ = function(value) {
  if(value <= 0 || isNaN(value)) {
    value = 0
  }else {
    var axis = this.horizontal_ ? "width" : "height";
    var barLength = parseFloat(this.svgBackground_.getAttribute(axis));
    var knobLength = parseFloat(this.svgKnob_.getAttribute(axis));
    value = Math.min(value, barLength - knobLength)
  }
  return value
};
Blockly.ScrollbarSvg.prototype.onScroll_ = function() {
  var knobValue = parseFloat(this.svgKnob_.getAttribute(this.horizontal_ ? "x" : "y"));
  var barLength = parseFloat(this.svgBackground_.getAttribute(this.horizontal_ ? "width" : "height"));
  var ratio = knobValue / barLength;
  if(isNaN(ratio)) {
    ratio = 0
  }
  var xyRatio = {};
  if(this.horizontal_) {
    xyRatio.x = ratio
  }else {
    xyRatio.y = ratio
  }
  this.workspace_.setMetrics(xyRatio)
};
Blockly.ScrollbarSvg.prototype.set = function(value, fireEvents) {
  this.svgKnob_.setAttribute(this.horizontal_ ? "x" : "y", value * this.ratio_);
  if(fireEvents) {
    this.onScroll_()
  }
};
if(goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.LINUX)) {
  Blockly.Scrollbar = Blockly.ScrollbarNative;
  Blockly.Scrollbar.scrollbarThickness = 0
}else {
  Blockly.Scrollbar = Blockly.ScrollbarSvg;
  Blockly.Scrollbar.scrollbarThickness = 15
}
Blockly.Scrollbar.insertAfter_ = function(newNode, refNode) {
  var siblingNode = refNode.nextSibling;
  var parentNode = refNode.parentNode;
  if(!parentNode) {
    throw"Reference node has no parent.";
  }
  if(siblingNode) {
    parentNode.insertBefore(newNode, siblingNode)
  }else {
    parentNode.appendChild(newNode)
  }
};
goog.provide("Blockly.Trashcan");
Blockly.Trashcan = function(workspace) {
  this.workspace_ = workspace
};
Blockly.Trashcan.prototype.CLOSED_URL_ = "media/canclosed.png";
Blockly.Trashcan.prototype.OPEN_URL_ = "media/canopen.png";
Blockly.Trashcan.prototype.WIDTH_ = 70;
Blockly.Trashcan.prototype.HEIGHT_ = 70;
Blockly.Trashcan.prototype.MARGIN_TOP_ = 15;
Blockly.Trashcan.prototype.MARGIN_SIDE_ = 22;
Blockly.Trashcan.prototype.isOpen = false;
Blockly.Trashcan.prototype.radius = 50;
Blockly.Trashcan.prototype.svgGroup_ = null;
Blockly.Trashcan.prototype.svgClosedCan_ = null;
Blockly.Trashcan.prototype.svgOpenCan_ = null;
Blockly.Trashcan.prototype.left_ = 0;
Blockly.Trashcan.prototype.top_ = 0;
Blockly.Trashcan.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement("g", {"id":"trashcan", "filter":"url(#blocklyTrashcanShadowFilter)"}, null);
  this.svgClosedCan_ = Blockly.createSvgElement("image", {"width":this.WIDTH_, "height":this.HEIGHT_}, this.svgGroup_);
  this.svgClosedCan_.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", Blockly.assetUrl(this.CLOSED_URL_));
  this.svgOpenCan_ = Blockly.createSvgElement("image", {"width":this.WIDTH_, "height":this.HEIGHT_}, this.svgGroup_);
  this.svgOpenCan_.setAttribute("visibility", "hidden");
  this.svgOpenCan_.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", Blockly.assetUrl(this.OPEN_URL_));
  return this.svgGroup_
};
Blockly.Trashcan.prototype.init = function() {
  this.setOpen_(false);
  this.position_();
  Blockly.bindEvent_(window, "resize", this, this.position_)
};
Blockly.Trashcan.prototype.dispose = function() {
  if(this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null
  }
  this.svgClosedCan_ = null;
  this.svgOpenCan_ = null;
  this.workspace_ = null
};
Blockly.Trashcan.prototype.position_ = function() {
  var metrics = this.workspace_.getMetrics();
  if(!metrics) {
    return
  }
  if(Blockly.RTL) {
    this.left_ = this.MARGIN_SIDE_
  }else {
    this.left_ = metrics.viewWidth + metrics.absoluteLeft - this.WIDTH_ - this.MARGIN_SIDE_
  }
  this.top_ = this.MARGIN_TOP_;
  this.svgGroup_.setAttribute("transform", "translate(" + this.left_ + "," + this.top_ + ")")
};
Blockly.Trashcan.prototype.onMouseMove = function(e) {
  if(!this.svgGroup_) {
    return
  }
  var mouseXY = Blockly.mouseToSvg(e);
  var trashXY = Blockly.getSvgXY_(this.svgGroup_);
  if(Blockly.ieVersion() && Blockly.ieVersion() <= 10) {
    mouseXY = {"x":e.clientX, "y":e.clientY};
    var trashBB = document.getElementById("trashcan").getBoundingClientRect();
    trashXY = {"x":trashBB.left, "y":trashBB.top}
  }
  var over = mouseXY.x + this.radius > trashXY.x && (mouseXY.x < trashXY.x + this.WIDTH_ + this.radius && (mouseXY.y + this.radius > trashXY.y && mouseXY.y < trashXY.y + this.HEIGHT_ + this.radius));
  if(this.isOpen != over) {
    this.setOpen_(over)
  }
};
Blockly.Trashcan.prototype.setOpen_ = function(state) {
  if(this.isOpen == state) {
    return
  }
  this.isOpen = state;
  this.animateLid_()
};
Blockly.Trashcan.prototype.animateLid_ = function() {
  if(this.isOpen) {
    this.svgOpenCan_.setAttribute("visibility", "visible")
  }else {
    this.svgOpenCan_.setAttribute("visibility", "hidden")
  }
};
Blockly.Trashcan.prototype.close = function() {
  this.setOpen_(false)
};
goog.provide("Blockly.Workspace");
goog.require("Blockly.ScrollbarPair");
goog.require("Blockly.Trashcan");
goog.require("Blockly.Xml");
Blockly.Workspace = function(getMetrics, setMetrics) {
  this.getMetrics = getMetrics;
  this.setMetrics = setMetrics;
  this.isFlyout = false;
  this.topBlocks_ = [];
  this.maxBlocks = Infinity;
  Blockly.ConnectionDB.init(this)
};
Blockly.Workspace.SCAN_ANGLE = 3;
Blockly.Workspace.prototype.dragMode = false;
Blockly.Workspace.prototype.pageXOffset = 0;
Blockly.Workspace.prototype.pageYOffset = 0;
Blockly.Workspace.prototype.trashcan = null;
Blockly.Workspace.prototype.fireChangeEventPid_ = null;
Blockly.Workspace.prototype.scrollbar = null;
Blockly.Workspace.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement("g", {}, null);
  this.svgBlockCanvas_ = Blockly.createSvgElement("g", {}, this.svgGroup_);
  this.svgBubbleCanvas_ = Blockly.createSvgElement("g", {}, this.svgGroup_);
  this.fireChangeEvent();
  return this.svgGroup_
};
Blockly.Workspace.prototype.dispose = function() {
  if(this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null
  }
  this.svgBlockCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if(this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null
  }
};
Blockly.Workspace.prototype.addTrashcan = function() {
  if(Blockly.hasTrashcan && !Blockly.readOnly) {
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
    this.trashcan.init()
  }
};
Blockly.Workspace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_
};
Blockly.Workspace.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_
};
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
  this.fireChangeEvent()
};
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  var found = false;
  for(var child, x = 0;child = this.topBlocks_[x];x++) {
    if(child == block) {
      this.topBlocks_.splice(x, 1);
      found = true;
      break
    }
  }
  if(!found) {
    throw"Block not present in workspace's list of top-most blocks.";
  }
  this.fireChangeEvent()
};
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  var blocks = [].concat(this.topBlocks_);
  if(ordered && blocks.length > 1) {
    var offset = Math.sin(Blockly.Workspace.SCAN_ANGLE / 180 * Math.PI);
    if(Blockly.RTL) {
      offset *= -1
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return aXY.y + offset * aXY.x - (bXY.y + offset * bXY.x)
    })
  }
  return blocks
};
Blockly.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for(var x = 0;x < blocks.length;x++) {
    blocks = blocks.concat(blocks[x].getChildren())
  }
  return blocks
};
Blockly.Workspace.prototype.getBlockCount = function() {
  return this.getAllBlocks().length
};
Blockly.Workspace.prototype.clear = function() {
  Blockly.hideChaff();
  while(this.topBlocks_.length) {
    this.topBlocks_[0].dispose()
  }
};
Blockly.Workspace.prototype.render = function() {
  var renderList = this.getAllBlocks();
  for(var x = 0, block;block = renderList[x];x++) {
    if(!block.getChildren().length) {
      block.render()
    }
  }
};
Blockly.Workspace.prototype.getBlockById = function(id) {
  var blocks = this.getAllBlocks();
  for(var x = 0, block;block = blocks[x];x++) {
    if(block.id == id) {
      return block
    }
  }
  return null
};
Blockly.Workspace.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if(this.traceWrapper_) {
    Blockly.unbindEvent_(this.traceWrapper_);
    this.traceWrapper_ = null
  }
  if(armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_, "blocklySelectChange", this, function() {
      this.traceOn_ = false
    })
  }
};
Blockly.Workspace.prototype.highlightBlock = function(id, spotlight) {
  if(!this.traceOn_ || Blockly.Block.isDragging()) {
    return
  }
  var block = null;
  if(id) {
    block = this.getBlockById(id);
    if(!block) {
      return
    }
  }
  this.traceOn(false);
  if(block) {
    block.select(spotlight)
  }else {
    if(Blockly.selected) {
      Blockly.selected.unselect()
    }
  }
  this.traceOn(true)
};
Blockly.Workspace.prototype.fireChangeEvent = function() {
  if(this.fireChangeEventPid_) {
    window.clearTimeout(this.fireChangeEventPid_)
  }
  var canvas = this.svgBlockCanvas_;
  if(canvas) {
    this.fireChangeEventPid_ = window.setTimeout(function() {
      Blockly.fireUiEvent(canvas, "blocklyWorkspaceChange")
    }, 0)
  }
};
Blockly.Workspace.prototype.paste = function(xmlBlock) {
  if(xmlBlock.getElementsByTagName("block").length >= this.remainingCapacity()) {
    return
  }
  var block = Blockly.Xml.domToBlock_(this, xmlBlock);
  var blockX = parseInt(xmlBlock.getAttribute("x"), 10);
  var blockY = parseInt(xmlBlock.getAttribute("y"), 10);
  if(!isNaN(blockX) && !isNaN(blockY)) {
    if(Blockly.RTL) {
      blockX = -blockX
    }
    do {
      var collide = false;
      var allBlocks = this.getAllBlocks();
      for(var x = 0, otherBlock;otherBlock = allBlocks[x];x++) {
        var otherXY = otherBlock.getRelativeToSurfaceXY();
        if(Math.abs(blockX - otherXY.x) <= 1 && Math.abs(blockY - otherXY.y) <= 1) {
          if(Blockly.RTL) {
            blockX -= Blockly.SNAP_RADIUS
          }else {
            blockX += Blockly.SNAP_RADIUS
          }
          blockY += Blockly.SNAP_RADIUS * 2;
          collide = true
        }
      }
    }while(collide);
    block.moveBy(blockX, blockY)
  }
  block.select()
};
Blockly.Workspace.prototype.remainingCapacity = function() {
  if(this.maxBlocks == Infinity) {
    return Infinity
  }
  return this.maxBlocks - this.getAllBlocks().length
};
goog.provide("goog.dom.NodeType");
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error)
  }else {
    var stack = (new Error).stack;
    if(stack) {
      this.stack = stack
    }
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.dom.NodeType");
goog.require("goog.string");
goog.define("goog.asserts.ENABLE_ASSERTS", goog.DEBUG);
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
  return value
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for(var key in Object.prototype) {
    goog.asserts.fail(key + " should not be enumerable in Object.prototype.")
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.define("goog.NATIVE_ARRAY_PROTOTYPES", goog.TRUSTED_SITE);
goog.define("goog.array.ASSUME_NATIVE_FUNCTIONS", false);
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.indexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.lastIndexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.forEach) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.filter) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.map) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduce) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if(opt_obj) {
    f = goog.bind(f, opt_obj)
  }
  return goog.array.ARRAY_PROTOTYPE_.reduce.call(arr, f, val)
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduceRight) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if(opt_obj) {
    f = goog.bind(f, opt_obj)
  }
  return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(arr, f, val)
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.some) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.every) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if(f.call(opt_obj, element, index, arr)) {
      ++count
    }
  }, opt_obj);
  return count
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.toArray = function(object) {
  var length = object.length;
  if(length > 0) {
    var rv = new Array(length);
    for(var i = 0;i < length;i++) {
      rv[i] = object[i]
    }
    return rv
  }
  return[]
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && Object.prototype.hasOwnProperty.call(arr2, "callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    return goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current
  };
  var hashFn = opt_hashFn || defaultHashFn;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  arr.sort(opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || (!goog.isArrayLike(arr2) || arr1.length != arr2.length)) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element
  });
  return ret
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if(opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end
  }
  if(step * (end - start) < 0) {
    return[]
  }
  if(step > 0) {
    for(var i = start;i < end;i += step) {
      array.push(i)
    }
  }else {
    for(var i = start;i > end;i += step) {
      array.push(i)
    }
  }
  return array
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  var removedItems = goog.array.ARRAY_PROTOTYPE_.splice.call(arr, fromIndex, 1);
  goog.array.ARRAY_PROTOTYPE_.splice.call(arr, toIndex, 0, removedItems[0])
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("Blockly.FieldDropdown");
goog.require("Blockly.Field");
goog.require("goog.array");
Blockly.FieldDropdown = function(menuGenerator, opt_changeHandler) {
  this.menuGenerator_ = menuGenerator || [[Blockly.FieldDropdown.NO_OPTIONS_MESSAGE, Blockly.FieldDropdown.NO_OPTIONS_MESSAGE]];
  this.changeHandler_ = opt_changeHandler;
  this.trimOptions_();
  var firstTuple = this.getOptions()[0];
  this.value_ = firstTuple[1];
  this.arrow_ = Blockly.createSvgElement("tspan", {"class":"blocklyArrow"}, null);
  this.arrow_.appendChild(document.createTextNode(Blockly.RTL ? "\u25bc " : " \u25bc"));
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[0])
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;
Blockly.FieldDropdown.NO_OPTIONS_MESSAGE = "uninitialized";
Blockly.FieldDropdown.prototype.CURSOR = "default";
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, null);
  var thisField = this;
  function callback(e) {
    var menuItem = e.target;
    if(menuItem) {
      var value = menuItem.getValue();
      if(thisField.changeHandler_) {
        var override = thisField.changeHandler_(value);
        if(override !== undefined) {
          value = override
        }
      }
      if(value !== null) {
        thisField.setValue(value)
      }
    }
    Blockly.WidgetDiv.hideIfOwner(thisField)
  }
  var menu = new goog.ui.Menu;
  var options = this.getOptions();
  for(var x = 0;x < options.length;x++) {
    var text = options[x][0];
    var value = options[x][1];
    var menuItem = new goog.ui.MenuItem(text);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menu.addItem(menuItem);
    menuItem.setChecked(value === this.value_)
  }
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = Blockly.getAbsoluteXY_((this.borderRect_));
  var borderBBox = this.borderRect_.getBBox();
  var div = Blockly.WidgetDiv.DIV;
  div.style.visibility = "hidden";
  menu.render(div);
  menu.setAllowAutoFocus(true);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, "blocklyDropdownMenu");
  Blockly.addClass_(menuDom, "goog-menu-noaccel");
  menuDom.style.borderColor = "hsla(" + this.sourceBlock_.getColour() + ", " + this.sourceBlock_.getSaturation() * 100 + "%, " + this.sourceBlock_.getValue() * 100 + "%" + ", 0.5)";
  var menuSize = goog.style.getSize(menuDom);
  if(xy.y + menuSize.height + borderBBox.height >= windowSize.height + scrollOffset.y) {
    xy.y -= menuSize.height
  }else {
    xy.y += borderBBox.height
  }
  if(Blockly.RTL) {
    xy.x += borderBBox.width;
    xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
    if(xy.x < scrollOffset.x + menuSize.width) {
      xy.x = scrollOffset.x + menuSize.width
    }
  }else {
    xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
    if(xy.x > windowSize.width + scrollOffset.x - menuSize.width) {
      xy.x = windowSize.width + scrollOffset.x - menuSize.width
    }
  }
  if(Blockly.isIOS()) {
    xy.y -= scrollOffset.y
  }
  Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset);
  div.style.visibility = "visible"
};
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  this.prefixTitle = null;
  this.suffixTitle = null;
  var options = this.menuGenerator_;
  if(!goog.isArray(options) || options.length < 2) {
    return
  }
  var strings = options.map(function(t) {
    return t[0]
  });
  var shortest = Blockly.shortestStringLength(strings);
  var prefixLength = Blockly.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.commonWordSuffix(strings, shortest);
  if(!prefixLength && !suffixLength) {
    return
  }
  if(shortest <= prefixLength + suffixLength) {
    return
  }
  if(prefixLength) {
    this.prefixTitle = strings[0].substring(0, prefixLength - 1)
  }
  if(suffixLength) {
    this.suffixTitle = strings[0].substr(1 - suffixLength)
  }
  var newOptions = [];
  for(var x = 0;x < options.length;x++) {
    var text = options[x][0];
    var value = options[x][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[x] = [text, value]
  }
  this.menuGenerator_ = newOptions
};
Blockly.FieldDropdown.prototype.getOptions = function() {
  if(goog.isFunction(this.menuGenerator_)) {
    return this.menuGenerator_.call(this)
  }
  return(this.menuGenerator_)
};
Blockly.FieldDropdown.prototype.getValue = function() {
  return this.value_
};
Blockly.FieldDropdown.prototype.setValue = function(newValue) {
  this.value_ = newValue;
  var options = this.getOptions();
  for(var x = 0;x < options.length;x++) {
    if(options[x][1] == newValue) {
      this.setText(options[x][0]);
      return
    }
  }
  this.setText(newValue)
};
Blockly.FieldDropdown.prototype.setToFirstValue_ = function() {
  this.setValue(this.getOptions()[0][1])
};
Blockly.FieldDropdown.prototype.setConfig = function(configString) {
  this.config = configString;
  var numberOptions = Blockly.printerRangeToNumbers(configString);
  if(numberOptions.length === 0) {
    return
  }
  this.menuGenerator_ = goog.array.map(numberOptions, function(item) {
    return[item.toString(), item.toString()]
  });
  this.setToFirstValue_()
};
Blockly.FieldDropdown.prototype.setText = function(text) {
  if(this.sourceBlock_) {
    this.arrow_.style.fill = this.sourceBlock_.getHexColour()
  }
  if(text === null) {
    return
  }
  this.text_ = text;
  goog.dom.removeChildren((this.textElement_));
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if(!text) {
    text = Blockly.Field.NBSP
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);
  if(Blockly.RTL) {
    this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild)
  }else {
    this.textElement_.appendChild(this.arrow_)
  }
  this.size_.width = 0;
  if(this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
    this.sourceBlock_.workspace.fireChangeEvent()
  }
};
Blockly.FieldDropdown.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDropdown.superClass_.dispose.call(this)
};
goog.provide("Blockly.Msg");
goog.provide("goog.string.StringBuffer");
goog.string.StringBuffer = function(opt_a1, var_args) {
  if(opt_a1 != null) {
    this.append.apply(this, arguments)
  }
};
goog.string.StringBuffer.prototype.buffer_ = "";
goog.string.StringBuffer.prototype.set = function(s) {
  this.buffer_ = "" + s
};
goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
  this.buffer_ += a1;
  if(opt_a2 != null) {
    for(var i = 1;i < arguments.length;i++) {
      this.buffer_ += arguments[i]
    }
  }
  return this
};
goog.string.StringBuffer.prototype.clear = function() {
  this.buffer_ = ""
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.buffer_.length
};
goog.string.StringBuffer.prototype.toString = function() {
  return this.buffer_
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if(Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result)
  }
  return result
};
goog.object.isImmutableView = function(obj) {
  return!!Object.isFrozen && Object.isFrozen(obj)
};
goog.provide("goog.math");
goog.require("goog.array");
goog.require("goog.asserts");
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a)
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a)
};
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max)
};
goog.math.modulo = function(a, b) {
  var r = a % b;
  return r * b < 0 ? r + b : r
};
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a)
};
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 1E-6)
};
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360)
};
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180
};
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI
};
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees))
};
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees))
};
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)))
};
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
  if(d > 180) {
    d = d - 360
  }else {
    if(d <= -180) {
      d = 360 + d
    }
  }
  return d
};
goog.math.sign = function(x) {
  return x == 0 ? 0 : x < 0 ? -1 : 1
};
goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
  var compare = opt_compareFn || function(a, b) {
    return a == b
  };
  var collect = opt_collectorFn || function(i1, i2) {
    return array1[i1]
  };
  var length1 = array1.length;
  var length2 = array2.length;
  var arr = [];
  for(var i = 0;i < length1 + 1;i++) {
    arr[i] = [];
    arr[i][0] = 0
  }
  for(var j = 0;j < length2 + 1;j++) {
    arr[0][j] = 0
  }
  for(i = 1;i <= length1;i++) {
    for(j = 1;j <= length2;j++) {
      if(compare(array1[i - 1], array2[j - 1])) {
        arr[i][j] = arr[i - 1][j - 1] + 1
      }else {
        arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1])
      }
    }
  }
  var result = [];
  var i = length1, j = length2;
  while(i > 0 && j > 0) {
    if(compare(array1[i - 1], array2[j - 1])) {
      result.unshift(collect(i - 1, j - 1));
      i--;
      j--
    }else {
      if(arr[i - 1][j] > arr[i][j - 1]) {
        i--
      }else {
        j--
      }
    }
  }
  return result
};
goog.math.sum = function(var_args) {
  return(goog.array.reduce(arguments, function(sum, value) {
    return sum + value
  }, 0))
};
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length
};
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if(sampleSize < 2) {
    return 0
  }
  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
    return Math.pow(val - mean, 2)
  })) / (sampleSize - 1);
  return variance
};
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments))
};
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0
};
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num)
};
goog.math.log10Floor = function(num) {
  if(num > 0) {
    var x = Math.round(Math.log(num) * Math.LOG10E);
    return x - (Math.pow(10, x) > num)
  }
  return num == 0 ? -Infinity : NaN
};
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2E-15))
};
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2E-15))
};
goog.provide("goog.math.Coordinate");
goog.require("goog.math");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
if(goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return"(" + this.x + ", " + this.y + ")"
  }
}
goog.math.Coordinate.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy)
};
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y)
};
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this
};
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this
};
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this
};
goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.x += tx.x;
    this.y += tx.y
  }else {
    this.x += tx;
    if(goog.isNumber(opt_ty)) {
      this.y += opt_ty
    }
  }
  return this
};
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this
};
goog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {
  var center = opt_center || new goog.math.Coordinate(0, 0);
  var x = this.x;
  var y = this.y;
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y
};
goog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {
  this.rotateRadians(goog.math.toRadians(degrees), opt_center)
};
goog.provide("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for(var i = 1;i < arguments.length;i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x)
  }
  return box
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left)
};
if(goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return"(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)"
  }
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other)
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if(goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left
  }else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left
  }
  return this
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom)
};
goog.math.Box.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.top == b.top && (a.right == b.right && (a.bottom == b.bottom && a.left == b.left))
};
goog.math.Box.contains = function(box, other) {
  if(!box || !other) {
    return false
  }
  if(other instanceof goog.math.Box) {
    return other.left >= box.left && (other.right <= box.right && (other.top >= box.top && other.bottom <= box.bottom))
  }
  return other.x >= box.left && (other.x <= box.right && (other.y >= box.top && other.y <= box.bottom))
};
goog.math.Box.relativePositionX = function(box, coord) {
  if(coord.x < box.left) {
    return coord.x - box.left
  }else {
    if(coord.x > box.right) {
      return coord.x - box.right
    }
  }
  return 0
};
goog.math.Box.relativePositionY = function(box, coord) {
  if(coord.y < box.top) {
    return coord.y - box.top
  }else {
    if(coord.y > box.bottom) {
      return coord.y - box.bottom
    }
  }
  return 0
};
goog.math.Box.distance = function(box, coord) {
  var x = goog.math.Box.relativePositionX(box, coord);
  var y = goog.math.Box.relativePositionY(box, coord);
  return Math.sqrt(x * x + y * y)
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && (b.left <= a.right && (a.top <= b.bottom && b.top <= a.bottom))
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && (b.left <= a.right + padding && (a.top <= b.bottom + padding && b.top <= a.bottom + padding))
};
goog.math.Box.prototype.ceil = function() {
  this.top = Math.ceil(this.top);
  this.right = Math.ceil(this.right);
  this.bottom = Math.ceil(this.bottom);
  this.left = Math.ceil(this.left);
  return this
};
goog.math.Box.prototype.floor = function() {
  this.top = Math.floor(this.top);
  this.right = Math.floor(this.right);
  this.bottom = Math.floor(this.bottom);
  this.left = Math.floor(this.left);
  return this
};
goog.math.Box.prototype.round = function() {
  this.top = Math.round(this.top);
  this.right = Math.round(this.right);
  this.bottom = Math.round(this.bottom);
  this.left = Math.round(this.left);
  return this
};
goog.math.Box.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.right += tx.x;
    this.top += tx.y;
    this.bottom += tx.y
  }else {
    this.left += tx;
    this.right += tx;
    if(goog.isNumber(opt_ty)) {
      this.top += opt_ty;
      this.bottom += opt_ty
    }
  }
  return this
};
goog.math.Box.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.right *= sx;
  this.top *= sy;
  this.bottom *= sy;
  return this
};
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height
};
goog.math.Size.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
if(goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return"(" + this.width + " x " + this.height + ")"
  }
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s)
};
goog.provide("goog.math.Rect");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height)
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left)
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top)
};
if(goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return"(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)"
  }
}
goog.math.Rect.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.left == b.left && (a.width == b.width && (a.top == b.top && a.height == b.height))
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if(x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if(y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true
    }
  }
  return false
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if(x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if(y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0)
    }
  }
  return null
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && (b.left <= a.left + a.width && (a.top <= b.top + b.height && b.top <= a.top + a.height))
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect)
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if(!intersection || (!intersection.height || !intersection.width)) {
    return[a.clone()]
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if(b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top
  }
  if(bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top
  }
  if(b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height))
  }
  if(br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height))
  }
  return result
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect)
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top
};
goog.math.Rect.boundingRect = function(a, b) {
  if(!a || !b) {
    return null
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone
};
goog.math.Rect.prototype.contains = function(another) {
  if(another instanceof goog.math.Rect) {
    return this.left <= another.left && (this.left + this.width >= another.left + another.width && (this.top <= another.top && this.top + this.height >= another.top + another.height))
  }else {
    return another.x >= this.left && (another.x <= this.left + this.width && (another.y >= this.top && another.y <= this.top + this.height))
  }
};
goog.math.Rect.prototype.squaredDistance = function(point) {
  var dx = point.x < this.left ? this.left - point.x : Math.max(point.x - (this.left + this.width), 0);
  var dy = point.y < this.top ? this.top - point.y : Math.max(point.y - (this.top + this.height), 0);
  return dx * dx + dy * dy
};
goog.math.Rect.prototype.distance = function(point) {
  return Math.sqrt(this.squaredDistance(point))
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.math.Rect.prototype.getTopLeft = function() {
  return new goog.math.Coordinate(this.left, this.top)
};
goog.math.Rect.prototype.getCenter = function() {
  return new goog.math.Coordinate(this.left + this.width / 2, this.top + this.height / 2)
};
goog.math.Rect.prototype.getBottomRight = function() {
  return new goog.math.Coordinate(this.left + this.width, this.top + this.height)
};
goog.math.Rect.prototype.ceil = function() {
  this.left = Math.ceil(this.left);
  this.top = Math.ceil(this.top);
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Rect.prototype.floor = function() {
  this.left = Math.floor(this.left);
  this.top = Math.floor(this.top);
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Rect.prototype.round = function() {
  this.left = Math.round(this.left);
  this.top = Math.round(this.top);
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Rect.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.top += tx.y
  }else {
    this.left += tx;
    if(goog.isNumber(opt_ty)) {
      this.top += opt_ty
    }
  }
  return this
};
goog.math.Rect.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.width *= sx;
  this.top *= sy;
  this.height *= sy;
  return this
};
goog.provide("goog.dom.vendor");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.vendor.getVendorJsPrefix = function() {
  if(goog.userAgent.WEBKIT) {
    return"Webkit"
  }else {
    if(goog.userAgent.GECKO) {
      return"Moz"
    }else {
      if(goog.userAgent.IE) {
        return"ms"
      }else {
        if(goog.userAgent.OPERA) {
          return"O"
        }
      }
    }
  }
  return null
};
goog.dom.vendor.getVendorPrefix = function() {
  if(goog.userAgent.WEBKIT) {
    return"-webkit"
  }else {
    if(goog.userAgent.GECKO) {
      return"-moz"
    }else {
      if(goog.userAgent.IE) {
        return"-ms"
      }else {
        if(goog.userAgent.OPERA) {
          return"-o"
        }
      }
    }
  }
  return null
};
goog.dom.vendor.getPrefixedPropertyName = function(propertyName, opt_object) {
  if(opt_object && propertyName in opt_object) {
    return propertyName
  }
  var prefix = goog.dom.vendor.getVendorJsPrefix();
  if(prefix) {
    prefix = prefix.toLowerCase();
    var prefixedPropertyName = prefix + goog.string.toTitleCase(propertyName);
    return!goog.isDef(opt_object) || prefixedPropertyName in opt_object ? prefixedPropertyName : null
  }
  return null
};
goog.dom.vendor.getPrefixedEventType = function(eventType) {
  var prefix = goog.dom.vendor.getVendorJsPrefix() || "";
  return(prefix + eventType).toLowerCase()
};
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || []
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  goog.dom.classes.set(element, classes.join(" "));
  return classes.length == expectedCount
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  goog.dom.classes.set(element, newClasses.join(" "));
  return newClasses.length == classes.length - args.length
};
goog.dom.classes.add_ = function(classes, args) {
  for(var i = 0;i < args.length;i++) {
    if(!goog.array.contains(classes, args[i])) {
      classes.push(args[i])
    }
  }
};
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return!goog.array.contains(arr2, item)
  })
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for(var i = 0;i < classes.length;i++) {
    if(classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true
    }
  }
  if(removed) {
    classes.push(toClass);
    goog.dom.classes.set(element, classes.join(" "))
  }
  return removed
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if(goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove)
  }else {
    if(goog.isArray(classesToRemove)) {
      classes = goog.dom.classes.getDifference_(classes, classesToRemove)
    }
  }
  if(goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd)
  }else {
    if(goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd)
    }
  }
  goog.dom.classes.set(element, classes.join(" "))
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className)
};
goog.dom.classes.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classes.add(element, className)
  }else {
    goog.dom.classes.remove(element, className)
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add
};
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", ARTICLE:"ARTICLE", ASIDE:"ASIDE", AUDIO:"AUDIO", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDI:"BDI", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", COMMAND:"COMMAND", DATA:"DATA", DATALIST:"DATALIST", DD:"DD", DEL:"DEL", DETAILS:"DETAILS", DFN:"DFN", 
DIALOG:"DIALOG", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", EMBED:"EMBED", FIELDSET:"FIELDSET", FIGCAPTION:"FIGCAPTION", FIGURE:"FIGURE", FONT:"FONT", FOOTER:"FOOTER", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HEADER:"HEADER", HGROUP:"HGROUP", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", KEYGEN:"KEYGEN", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", 
MAP:"MAP", MARK:"MARK", MATH:"MATH", MENU:"MENU", META:"META", METER:"METER", NAV:"NAV", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", OUTPUT:"OUTPUT", P:"P", PARAM:"PARAM", PRE:"PRE", PROGRESS:"PROGRESS", Q:"Q", RP:"RP", RT:"RT", RUBY:"RUBY", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SECTION:"SECTION", SELECT:"SELECT", SMALL:"SMALL", SOURCE:"SOURCE", SPAN:"SPAN", STRIKE:"STRIKE", STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUMMARY:"SUMMARY", 
SUP:"SUP", SVG:"SVG", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TIME:"TIME", TITLE:"TITLE", TR:"TR", TRACK:"TRACK", TT:"TT", U:"U", UL:"UL", VAR:"VAR", VIDEO:"VIDEO", WBR:"WBR"};
goog.provide("goog.functions");
goog.functions.constant = function(retValue) {
  return function() {
    return retValue
  }
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  }
};
goog.functions.fail = function(err) {
  return function() {
    throw err;
  }
};
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs))
  }
};
goog.functions.nth = function(n) {
  return function() {
    return arguments[n]
  }
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue))
};
goog.functions.compose = function(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if(length) {
      result = functions[length - 1].apply(this, arguments)
    }
    for(var i = length - 2;i >= 0;i--) {
      result = functions[i].call(this, result)
    }
    return result
  }
};
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for(var i = 0;i < length;i++) {
      result = functions[i].apply(this, arguments)
    }
    return result
  }
};
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(!functions[i].apply(this, arguments)) {
        return false
      }
    }
    return true
  }
};
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(functions[i].apply(this, arguments)) {
        return true
      }
    }
    return false
  }
};
goog.functions.not = function(f) {
  return function() {
    return!f.apply(this, arguments)
  }
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj
};
goog.define("goog.functions.CACHE_RETURN_VALUE", true);
goog.functions.cacheReturnValue = function(fn) {
  var called = false;
  var value;
  return function() {
    if(!goog.functions.CACHE_RETURN_VALUE) {
      return fn()
    }
    if(!called) {
      value = fn();
      called = true
    }
    return value
  }
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.1")), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), CAN_USE_PARENT_ELEMENT_PROPERTY:goog.userAgent.IE || (goog.userAgent.OPERA || goog.userAgent.WEBKIT), 
INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.provide("goog.dom");
goog.provide("goog.dom.Appendable");
goog.provide("goog.dom.DomHelper");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.functions");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.define("goog.dom.ASSUME_QUIRKS_MODE", false);
goog.define("goog.dom.ASSUME_STANDARDS_MODE", false);
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(element) {
  return goog.dom.getElementHelper_(document, element)
};
goog.dom.getElementHelper_ = function(doc, element) {
  return goog.isString(element) ? doc.getElementById(element) : element
};
goog.dom.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(document, id)
};
goog.dom.getRequiredElementHelper_ = function(doc, id) {
  goog.asserts.assertString(id);
  var element = goog.dom.getElementHelper_(doc, id);
  element = goog.asserts.assertElement(element, "No element found with id: " + id);
  return element
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el)
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if(goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className)
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if(goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className)
  }else {
    retVal = goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)[0]
  }
  return retVal || null
};
goog.dom.getRequiredElementByClass = function(className, opt_root) {
  var retValue = goog.dom.getElementByClass(className, opt_root);
  return goog.asserts.assert(retValue, "No element found with className: " + className)
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return!!(parent.querySelectorAll && parent.querySelector)
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query)
  }
  if(opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if(tagName) {
      var arrayLike = {};
      var len = 0;
      for(var i = 0, el;el = els[i];i++) {
        if(tagName == el.nodeName) {
          arrayLike[len++] = el
        }
      }
      arrayLike.length = len;
      return arrayLike
    }else {
      return els
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if(opt_class) {
    var arrayLike = {};
    var len = 0;
    for(var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if(typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el
      }
    }
    arrayLike.length = len;
    return arrayLike
  }else {
    return els
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if(key == "style") {
      element.style.cssText = val
    }else {
      if(key == "class") {
        element.className = val
      }else {
        if(key == "for") {
          element.htmlFor = val
        }else {
          if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val)
          }else {
            if(goog.string.startsWith(key, "aria-") || goog.string.startsWith(key, "data-")) {
              element.setAttribute(key, val)
            }else {
              element[key] = val
            }
          }
        }
      }
    }
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "frameborder":"frameBorder", "height":"height", "maxlength":"maxLength", "role":"role", "rowspan":"rowSpan", "type":"type", "usemap":"useMap", "valign":"vAlign", "width":"width"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window)
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if(doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight
    }else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if(docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight
      }
      if(sh > vh) {
        height = sh > oh ? sh : oh
      }else {
        height = sh < oh ? sh : oh
      }
    }
  }
  return height
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || (goog.global || window);
  return goog.dom.getDomHelper(win.document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  if(goog.userAgent.IE && (goog.userAgent.isVersionOrHigher("10") && win.pageYOffset != el.scrollTop)) {
    return new goog.math.Coordinate(el.scrollLeft, el.scrollTop)
  }
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  if(!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
    return doc.documentElement
  }
  return doc.body || doc.documentElement
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && (attributes && (attributes.name || attributes.type))) {
    var tagNameArr = ["<", tagName];
    if(attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"')
    }
    if(attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      delete clone["type"];
      attributes = clone
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("")
  }
  var element = doc.createElement(tagName);
  if(attributes) {
    if(goog.isString(attributes)) {
      element.className = attributes
    }else {
      if(goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes))
      }else {
        goog.dom.setProperties(element, attributes)
      }
    }
  }
  if(args.length > 2) {
    goog.dom.append_(doc, element, args, 2)
  }
  return element
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if(child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
    }
  }
  for(var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if(goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.toArray(arg) : arg, childHandler)
    }else {
      childHandler(arg)
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name)
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content))
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for(var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>")
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for(i = 0;i < rows;i++) {
    totalHtml.push(rowHtml)
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return(elem.removeChild(elem.firstChild))
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString)
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild)
  }else {
    tempDiv.innerHTML = htmlString
  }
  if(tempDiv.childNodes.length == 1) {
    return(tempDiv.removeChild(tempDiv.firstChild))
  }else {
    var fragment = doc.createDocumentFragment();
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    return fragment
  }
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if(goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE
  }
  return doc.compatMode == "CSS1Compat"
};
goog.dom.canHaveChildren = function(node) {
  if(node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.COMMAND:
    ;
    case goog.dom.TagName.EMBED:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.KEYGEN:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.SOURCE:
    ;
    case goog.dom.TagName.STYLE:
    ;
    case goog.dom.TagName.TRACK:
    ;
    case goog.dom.TagName.WBR:
      return false
  }
  return true
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child)
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1)
};
goog.dom.removeChildren = function(node) {
  var child;
  while(child = node.firstChild) {
    node.removeChild(child)
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null)
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if(parent) {
    parent.replaceChild(newNode, oldNode)
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(element.removeNode) {
      return(element.removeNode(false))
    }else {
      while(child = element.firstChild) {
        parent.insertBefore(child, element)
      }
      return(goog.dom.removeNode(element))
    }
  }
};
goog.dom.getChildren = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(node) {
  if(node.firstElementChild != undefined) {
    return(node).firstElementChild
  }
  return goog.dom.getNextElementNode_(node.firstChild, true)
};
goog.dom.getLastElementChild = function(node) {
  if(node.lastElementChild != undefined) {
    return(node).lastElementChild
  }
  return goog.dom.getNextElementNode_(node.lastChild, false)
};
goog.dom.getNextElementSibling = function(node) {
  if(node.nextElementSibling != undefined) {
    return(node).nextElementSibling
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true)
};
goog.dom.getPreviousElementSibling = function(node) {
  if(node.previousElementSibling != undefined) {
    return(node).previousElementSibling
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false)
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling
  }
  return(node)
};
goog.dom.getNextNode = function(node) {
  if(!node) {
    return null
  }
  if(node.firstChild) {
    return node.firstChild
  }
  while(node && !node.nextSibling) {
    node = node.parentNode
  }
  return node ? node.nextSibling : null
};
goog.dom.getPreviousNode = function(node) {
  if(!node) {
    return null
  }
  if(!node.previousSibling) {
    return node.parentNode
  }
  node = node.previousSibling;
  while(node && node.lastChild) {
    node = node.lastChild
  }
  return node
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0
};
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj
};
goog.dom.getParentElement = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    var isIe9 = goog.userAgent.IE && (goog.userAgent.isVersionOrHigher("9") && !goog.userAgent.isVersionOrHigher("10"));
    if(!(isIe9 && (goog.global["SVGElement"] && element instanceof goog.global["SVGElement"]))) {
      return element.parentElement
    }
  }
  var parent = element.parentNode;
  return goog.dom.isElement(parent) ? (parent) : null
};
goog.dom.contains = function(parent, descendant) {
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant)
  }
  if(typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16)
  }
  while(descendant && parent != descendant) {
    descendant = descendant.parentNode
  }
  return descendant == parent
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if(node1 == node2) {
    return 0
  }
  if(node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1
  }
  if(goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if(node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return-1
    }
    if(node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1
    }
  }
  if("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if(isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex
    }else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if(parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2)
      }
      if(!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2)
      }
      if(!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1)
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex)
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2)
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if(parent == node) {
    return-1
  }
  var sibling = node;
  while(sibling.parentNode != parent) {
    sibling = sibling.parentNode
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode)
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while(s = s.previousSibling) {
    if(s == node1) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if(!count) {
    return null
  }else {
    if(count == 1) {
      return arguments[0]
    }
  }
  var paths = [];
  var minLength = Infinity;
  for(i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while(node) {
      ancestors.unshift(node);
      node = node.parentNode
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length)
  }
  var output = null;
  for(i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for(var j = 1;j < count;j++) {
      if(first != paths[j][i]) {
        return output
      }
    }
    output = first
  }
  return output
};
goog.dom.getOwnerDocument = function(node) {
  return(node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document)
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow(goog.dom.getFrameContentDocument(frame))
};
goog.dom.setTextContent = function(node, text) {
  goog.asserts.assert(node != null, "goog.dom.setTextContent expects a non-null value for node");
  if("textContent" in node) {
    node.textContent = text
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      node.data = text
    }else {
      if(node.firstChild && node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
        while(node.lastChild != node.firstChild) {
          node.removeChild(node.lastChild)
        }
        node.firstChild.data = text
      }else {
        goog.dom.removeChildren(node);
        var doc = goog.dom.getOwnerDocument(node);
        node.appendChild(doc.createTextNode(String(text)))
      }
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if("outerHTML" in element) {
    return element.outerHTML
  }else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if(root != null) {
    var child = root.firstChild;
    while(child) {
      if(p(child)) {
        rv.push(child);
        if(findOne) {
          return true
        }
      }
      if(goog.dom.findNodes_(child, p, rv, findOne)) {
        return true
      }
      child = child.nextSibling
    }
  }
  return false
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  return goog.dom.hasSpecifiedTabIndex_(element) && goog.dom.isTabIndexFocusable_(element)
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if(enable) {
    element.tabIndex = 0
  }else {
    element.tabIndex = -1;
    element.removeAttribute("tabIndex")
  }
};
goog.dom.isFocusable = function(element) {
  var focusable;
  if(goog.dom.nativelySupportsFocus_(element)) {
    focusable = !element.disabled && (!goog.dom.hasSpecifiedTabIndex_(element) || goog.dom.isTabIndexFocusable_(element))
  }else {
    focusable = goog.dom.isFocusableTabIndex(element)
  }
  return focusable && goog.userAgent.IE ? goog.dom.hasNonZeroBoundingRect_(element) : focusable
};
goog.dom.hasSpecifiedTabIndex_ = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  return goog.isDefAndNotNull(attrNode) && attrNode.specified
};
goog.dom.isTabIndexFocusable_ = function(element) {
  var index = element.tabIndex;
  return goog.isNumber(index) && (index >= 0 && index < 32768)
};
goog.dom.nativelySupportsFocus_ = function(element) {
  return element.tagName == goog.dom.TagName.A || (element.tagName == goog.dom.TagName.INPUT || (element.tagName == goog.dom.TagName.TEXTAREA || (element.tagName == goog.dom.TagName.SELECT || element.tagName == goog.dom.TagName.BUTTON)))
};
goog.dom.hasNonZeroBoundingRect_ = function(element) {
  var rect = goog.isFunction(element["getBoundingClientRect"]) ? element.getBoundingClientRect() : {"height":element.offsetHeight, "width":element.offsetWidth};
  return goog.isDefAndNotNull(rect) && (rect.height > 0 && rect.width > 0)
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText)
  }else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("")
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if(!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, " ")
  }
  if(textContent != " ") {
    textContent = textContent.replace(/^\s*/, "")
  }
  return textContent
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("")
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      if(normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""))
      }else {
        buf.push(node.nodeValue)
      }
    }else {
      if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName])
      }else {
        var child = node.firstChild;
        while(child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while(node && node != root) {
    var cur = node;
    while(cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur))
    }
    node = node.parentNode
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while(stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    }else {
      if(cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length
      }else {
        if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length
        }else {
          for(var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i])
          }
        }
      }
    }
  }
  if(goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur
  }
  return cur
};
goog.dom.isNodeList = function(val) {
  if(val && typeof val.length == "number") {
    if(goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string"
    }else {
      if(goog.isFunction(val)) {
        return typeof val.item == "function"
      }
    }
  }
  return false
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if(!opt_tag && !opt_class) {
    return null
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return(goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class))
  }, true))
};
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className)
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if(!opt_includeNode) {
    element = element.parentNode
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while(element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if(matcher(element)) {
      return element
    }
    element = element.parentNode;
    steps++
  }
  return null
};
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement
  }catch(e) {
  }
  return null
};
goog.dom.devicePixelRatio_;
goog.dom.getPixelRatio = goog.functions.cacheReturnValue(function() {
  var win = goog.dom.getWindow();
  var isFirefoxMobile = goog.userAgent.GECKO && goog.userAgent.MOBILE;
  if(goog.isDef(win.devicePixelRatio) && !isFirefoxMobile) {
    return win.devicePixelRatio
  }else {
    if(win.matchMedia) {
      return goog.dom.matchesPixelRatio_(0.75) || (goog.dom.matchesPixelRatio_(1.5) || (goog.dom.matchesPixelRatio_(2) || (goog.dom.matchesPixelRatio_(3) || 1)))
    }
  }
  return 1
});
goog.dom.matchesPixelRatio_ = function(pixelRatio) {
  var win = goog.dom.getWindow();
  var query = "(-webkit-min-device-pixel-ratio: " + pixelRatio + ")," + "(min--moz-device-pixel-ratio: " + pixelRatio + ")," + "(min-resolution: " + pixelRatio + "dppx)";
  return win.matchMedia(query).matches ? pixelRatio : 0
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || (goog.global.document || document)
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  return goog.dom.getElementHelper_(this.document_, element)
};
goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(this.document_, id)
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc)
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc)
};
goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className, opt_root) {
  var root = opt_root || this.document_;
  return goog.dom.getRequiredElementByClass(className, root)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name)
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content))
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString)
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;
goog.dom.DomHelper.prototype.setFocusableTabIndex = goog.dom.setFocusableTabIndex;
goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.vendor");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.define("goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS", false);
goog.style.setStyle = function(element, style, opt_value) {
  if(goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style)
  }else {
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element))
  }
};
goog.style.setStyle_ = function(element, value, style) {
  var propertyName = goog.style.getVendorJsStyleName_(element, style);
  if(propertyName) {
    element.style[propertyName] = value
  }
};
goog.style.getVendorJsStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if(element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if(element.style[prefixedStyle] !== undefined) {
      return prefixedStyle
    }
  }
  return camelStyle
};
goog.style.getVendorStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if(element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if(element.style[prefixedStyle] !== undefined) {
      return goog.dom.vendor.getVendorPrefix() + "-" + style
    }
  }
  return style
};
goog.style.getStyle = function(element, property) {
  var styleValue = element.style[goog.string.toCamelCase(property)];
  if(typeof styleValue !== "undefined") {
    return styleValue
  }
  return element.style[goog.style.getVendorJsStyleName_(element, property)] || ""
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if(doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if(styles) {
      return styles[property] || (styles.getPropertyValue(property) || "")
    }
  }
  return""
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || (goog.style.getCascadedStyle(element, style) || element.style && element.style[style])
};
goog.style.getComputedBoxSizing = function(element) {
  return goog.style.getStyle_(element, "boxSizing") || (goog.style.getStyle_(element, "MozBoxSizing") || (goog.style.getStyle_(element, "WebkitBoxSizing") || null))
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position")
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor")
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX")
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY")
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex")
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign")
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor")
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO && ((goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersionOrHigher("1.9"));
  if(arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y
  }else {
    x = arg1;
    y = opt_arg2
  }
  el.style.left = goog.style.getPixelStyleValue_((x), buggyGeckoSubPixelPos);
  el.style.top = goog.style.getPixelStyleValue_((y), buggyGeckoSubPixelPos)
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop)
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if(opt_node) {
    doc = goog.dom.getOwnerDocument(opt_node)
  }else {
    doc = goog.dom.getDocument()
  }
  if(goog.userAgent.IE && (!goog.userAgent.isDocumentModeOrHigher(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode())) {
    return doc.body
  }
  return doc.documentElement
};
goog.style.getViewportPageOffset = function(doc) {
  var body = doc.body;
  var documentElement = doc.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new goog.math.Coordinate(scrollLeft, scrollTop)
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect;
  try {
    rect = el.getBoundingClientRect()
  }catch(e) {
    return{"left":0, "top":0, "right":0, "bottom":0}
  }
  if(goog.userAgent.IE && el.ownerDocument.body) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop
  }
  return(rect)
};
goog.style.getOffsetParent = function(element) {
  if(goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(8)) {
    return element.offsetParent
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for(var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    positionStyle = goog.style.getStyle_((parent), "position");
    skipStatic = skipStatic && (positionStyle == "static" && (parent != doc.documentElement && parent != doc.body));
    if(!skipStatic && (parent.scrollWidth > parent.clientWidth || (parent.scrollHeight > parent.clientHeight || (positionStyle == "fixed" || (positionStyle == "absolute" || positionStyle == "relative"))))) {
      return(parent)
    }
  }
  return null
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var documentElement = dom.getDocument().documentElement;
  var scrollEl = dom.getDocumentScrollElement();
  for(var el = element;el = goog.style.getOffsetParent(el);) {
    if((!goog.userAgent.IE || el.clientWidth != 0) && ((!goog.userAgent.WEBKIT || (el.clientHeight != 0 || el != body)) && (el != body && (el != documentElement && goog.style.getStyle_(el, "overflow") != "visible")))) {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x)
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && (visibleRect.left >= 0 && (visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left)) ? visibleRect : null
};
goog.style.getContainerOffsetToScrollInto = function(element, container, opt_center) {
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  var spaceX = container.clientWidth - element.offsetWidth;
  var spaceY = container.clientHeight - element.offsetHeight;
  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if(opt_center) {
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2
  }else {
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0))
  }
  return new goog.math.Coordinate(scrollLeft, scrollTop)
};
goog.style.scrollIntoContainerView = function(element, container, opt_center) {
  var offset = goog.style.getContainerOffsetToScrollInto(element, container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y
};
goog.style.getClientLeftTop = function(el) {
  if(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("1.9")) {
    var left = parseFloat(goog.style.getComputedStyle(el, "borderLeftWidth"));
    if(goog.style.isRightToLeft(el)) {
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, "borderRightWidth"));
      left += scrollbarWidth
    }
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, "borderTopWidth")))
  }
  return new goog.math.Coordinate(el.clientLeft, el.clientTop)
};
goog.style.getPageOffset = function(el) {
  var box, doc = goog.dom.getOwnerDocument(el);
  var positionStyle = goog.style.getStyle_(el, "position");
  goog.asserts.assertObject(el, "Parameter is required");
  var BUGGY_GECKO_BOX_OBJECT = !goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS && (goog.userAgent.GECKO && (doc.getBoxObjectFor && (!el.getBoundingClientRect && (positionStyle == "absolute" && ((box = doc.getBoxObjectFor(el)) && (box.screenX < 0 || box.screenY < 0))))));
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if(el == viewportElement) {
    return pos
  }
  if(goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS || el.getBoundingClientRect) {
    box = goog.style.getBoundingClientRect_(el);
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
    pos.x = box.left + scrollCoord.x;
    pos.y = box.top + scrollCoord.y
  }else {
    if(doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
      box = doc.getBoxObjectFor(el);
      var vpBox = doc.getBoxObjectFor(viewportElement);
      pos.x = box.screenX - vpBox.screenX;
      pos.y = box.screenY - vpBox.screenY
    }else {
      var parent = el;
      do {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        if(parent != el) {
          pos.x += parent.clientLeft || 0;
          pos.y += parent.clientTop || 0
        }
        if(goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == "fixed") {
          pos.x += doc.body.scrollLeft;
          pos.y += doc.body.scrollTop;
          break
        }
        parent = parent.offsetParent
      }while(parent && parent != el);
      if(goog.userAgent.OPERA || goog.userAgent.WEBKIT && positionStyle == "absolute") {
        pos.y -= doc.body.offsetTop
      }
      for(parent = el;(parent = goog.style.getOffsetParent(parent)) && (parent != doc.body && parent != viewportElement);) {
        pos.x -= parent.scrollLeft;
        if(!goog.userAgent.OPERA || parent.tagName != "TR") {
          pos.y -= parent.scrollTop
        }
      }
    }
  }
  return pos
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPositionForElement_(goog.asserts.assert(currentEl));
    position.x += offset.x;
    position.y += offset.y
  }while(currentWin && (currentWin != relativeWin && ((currentEl = currentWin.frameElement) && (currentWin = currentWin.parent))));
  return position
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if(origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if(goog.userAgent.IE && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll())
    }
    rect.left += pos.x;
    rect.top += pos.y
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y)
};
goog.style.getClientPositionForElement_ = function(el) {
  var pos;
  if(goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS || el.getBoundingClientRect) {
    var box = goog.style.getBoundingClientRect_(el);
    pos = new goog.math.Coordinate(box.left, box.top)
  }else {
    var scrollCoord = goog.dom.getDomHelper(el).getDocumentScroll();
    var pageCoord = goog.style.getPageOffset(el);
    pos = new goog.math.Coordinate(pageCoord.x - scrollCoord.x, pageCoord.y - scrollCoord.y)
  }
  if(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher(12)) {
    return goog.math.Coordinate.sum(pos, goog.style.getCssTranslation(el))
  }else {
    return pos
  }
};
goog.style.getClientPosition = function(el) {
  goog.asserts.assert(el);
  if(el.nodeType == goog.dom.NodeType.ELEMENT) {
    return goog.style.getClientPositionForElement_((el))
  }else {
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent);
    var be = (el);
    var targetEvent = el;
    if(el.targetTouches) {
      targetEvent = el.targetTouches[0]
    }else {
      if(isAbstractedEvent && be.getBrowserEvent().targetTouches) {
        targetEvent = be.getBrowserEvent().targetTouches[0]
      }
    }
    return new goog.math.Coordinate(targetEvent.clientX, targetEvent.clientY)
  }
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if(x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x
  }
  var dx = x - cur.x;
  var dy = opt_y - cur.y;
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy)
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if(w instanceof goog.math.Size) {
    h = w.height;
    w = w.width
  }else {
    if(opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h
  }
  goog.style.setWidth(element, (w));
  goog.style.setHeight(element, (h))
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if(typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px"
  }
  return value
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true)
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true)
};
goog.style.getSize = function(element) {
  return goog.style.evaluateWithTemporaryDisplay_(goog.style.getSizeWithDisplay_, (element))
};
goog.style.evaluateWithTemporaryDisplay_ = function(fn, element) {
  if(goog.style.getStyle_(element, "display") != "none") {
    return fn(element)
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var retVal = fn(element);
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return retVal
};
goog.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = element.offsetWidth;
  var offsetHeight = element.offsetHeight;
  var webkitOffsetsZero = goog.userAgent.WEBKIT && (!offsetWidth && !offsetHeight);
  if((!goog.isDef(offsetWidth) || webkitOffsetsZero) && element.getBoundingClientRect) {
    var clientRect = goog.style.getBoundingClientRect_(element);
    return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top)
  }
  return new goog.math.Size(offsetWidth, offsetHeight)
};
goog.style.getTransformedSize = function(element) {
  if(!element.getBoundingClientRect) {
    return null
  }
  var clientRect = goog.style.evaluateWithTemporaryDisplay_(goog.style.getBoundingClientRect_, element);
  return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top)
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height)
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector))
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector)
};
goog.style.getOpacity = function(el) {
  var style = el.style;
  var result = "";
  if("opacity" in style) {
    result = style.opacity
  }else {
    if("MozOpacity" in style) {
      result = style.MozOpacity
    }else {
      if("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if(match) {
          result = String(match[1] / 100)
        }
      }
    }
  }
  return result == "" ? result : Number(result)
};
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if("opacity" in style) {
    style.opacity = alpha
  }else {
    if("MozOpacity" in style) {
      style.MozOpacity = alpha
    }else {
      if("filter" in style) {
        if(alpha === "") {
          style.filter = ""
        }else {
          style.filter = "alpha(opacity=" + alpha * 100 + ")"
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")'
  }else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat"
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if("filter" in style) {
    style.filter = ""
  }else {
    style.backgroundImage = "none"
  }
};
goog.style.showElement = function(el, display) {
  goog.style.setElementShown(el, display)
};
goog.style.setElementShown = function(el, isShown) {
  el.style.display = isShown ? "" : "none"
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none"
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  var doc = dh.getDocument();
  if(goog.userAgent.IE && doc.createStyleSheet) {
    styleSheet = doc.createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString)
  }else {
    var head = dh.getElementsByTagNameAndClass("head")[0];
    if(!head) {
      var body = dh.getElementsByTagNameAndClass("body")[0];
      head = dh.createDom("head");
      body.parentNode.insertBefore(head, body)
    }
    styleSheet = dh.createDom("style");
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet)
  }
  return styleSheet
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || (styleSheet.owningElement || (styleSheet));
  goog.dom.removeNode(node)
};
goog.style.setStyles = function(element, stylesString) {
  if(goog.userAgent.IE && goog.isDef(element.cssText)) {
    element.cssText = stylesString
  }else {
    element.innerHTML = stylesString
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word"
  }else {
    if(goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap"
    }else {
      style.whiteSpace = "pre-wrap"
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.zoom = "1";
    style.display = "inline"
  }else {
    if(goog.userAgent.GECKO) {
      style.display = goog.userAgent.isVersionOrHigher("1.9a") ? "inline-block" : "-moz-inline-box"
    }else {
      style.display = "inline-block"
    }
  }
};
goog.style.isRightToLeft = function(el) {
  return"rtl" == goog.style.getStyle_(el, "direction")
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if(goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none"
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on"
    }
  }
  return false
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if(name) {
    var value = unselectable ? "none" : "";
    el.style[name] = value;
    if(descendants) {
      for(var i = 0, descendant;descendant = descendants[i];i++) {
        descendant.style[name] = value
      }
    }
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if(descendants) {
        for(var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value)
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size(element.offsetWidth, element.offsetHeight)
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom
    }else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "border-box")
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if(ieCurrentStyle && (goog.dom.getDomHelper(doc).isCss1CompatMode() && (ieCurrentStyle.width != "auto" && (ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing)))) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height)
  }else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom)
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "content-box")
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if(goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing
  }else {
    if(goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing
    }else {
      style.boxSizing = boxSizing
    }
  }
  style.width = Math.max(size.width, 0) + "px";
  style.height = Math.max(size.height, 0) + "px"
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if(/^\d+px?$/.test(value)) {
    return parseInt(value, 10)
  }else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  var value = goog.style.getCascadedStyle(element, propName);
  return value ? goog.style.getIePixelValue_(element, value, "left", "pixelLeft") : 0
};
goog.style.getBox_ = function(element, stylePrefix) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = (goog.style.getComputedStyle(element, stylePrefix + "Left"));
    var right = (goog.style.getComputedStyle(element, stylePrefix + "Right"));
    var top = (goog.style.getComputedStyle(element, stylePrefix + "Top"));
    var bottom = (goog.style.getComputedStyle(element, stylePrefix + "Bottom"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding")
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin")
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if(goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if(width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width]
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft")
};
goog.style.getBorderBox = function(element) {
  if(goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = (goog.style.getComputedStyle(element, "borderLeftWidth"));
    var right = (goog.style.getComputedStyle(element, "borderRightWidth"));
    var top = (goog.style.getComputedStyle(element, "borderTopWidth"));
    var bottom = (goog.style.getComputedStyle(element, "borderBottomWidth"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if(doc.body.createTextRange) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName")
    }catch(e) {
      font = ""
    }
  }
  if(!font) {
    font = goog.style.getStyle_(el, "fontFamily")
  }
  var fontsArray = font.split(",");
  if(fontsArray.length > 1) {
    font = fontsArray[0]
  }
  return goog.string.stripQuotes(font, "\"'")
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if(fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10)
  }
  if(goog.userAgent.IE) {
    if(sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft")
    }else {
      if(el.parentNode && (el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_)) {
        var parentElement = (el.parentNode);
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft")
      }
    }
  }
  var sizeElement = goog.dom.createDom("span", {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.split(/\s*:\s*/);
    if(keyValue.length == 2) {
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())] = keyValue[1]
    }
  });
  return result
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";")
  });
  return buffer.join("")
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || ""
};
goog.style.getScrollbarWidth = function(opt_className) {
  var outerDiv = goog.dom.createElement("div");
  if(opt_className) {
    outerDiv.className = opt_className
  }
  outerDiv.style.cssText = "overflow:auto;" + "position:absolute;top:0;width:100px;height:100px";
  var innerDiv = goog.dom.createElement("div");
  goog.style.setSize(innerDiv, "200px", "200px");
  outerDiv.appendChild(innerDiv);
  goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);
  var width = outerDiv.offsetWidth - outerDiv.clientWidth;
  goog.dom.removeNode(outerDiv);
  return width
};
goog.style.MATRIX_TRANSLATION_REGEX_ = new RegExp("matrix\\([0-9\\.\\-]+, [0-9\\.\\-]+, " + "[0-9\\.\\-]+, [0-9\\.\\-]+, " + "([0-9\\.\\-]+)p?x?, ([0-9\\.\\-]+)p?x?\\)");
goog.style.getCssTranslation = function(element) {
  var property;
  if(goog.userAgent.IE) {
    property = "-ms-transform"
  }else {
    if(goog.userAgent.WEBKIT) {
      property = "-webkit-transform"
    }else {
      if(goog.userAgent.OPERA) {
        property = "-o-transform"
      }else {
        if(goog.userAgent.GECKO) {
          property = "-moz-transform"
        }
      }
    }
  }
  var transform;
  if(property) {
    transform = goog.style.getStyle_(element, property)
  }
  if(!transform) {
    transform = goog.style.getStyle_(element, "transform")
  }
  if(!transform) {
    return new goog.math.Coordinate(0, 0)
  }
  var matches = transform.match(goog.style.MATRIX_TRANSLATION_REGEX_);
  if(!matches) {
    return new goog.math.Coordinate(0, 0)
  }
  return new goog.math.Coordinate(parseFloat(matches[1]), parseFloat(matches[2]))
};
goog.provide("goog.events.EventId");
goog.events.EventId = function(eventId) {
  this.id = eventId
};
goog.events.EventId.prototype.toString = function() {
  return this.id
};
goog.provide("goog.events.Listenable");
goog.provide("goog.events.ListenableKey");
goog.require("goog.events.EventId");
goog.events.Listenable = function() {
};
goog.events.Listenable.IMPLEMENTED_BY_PROP = "closure_listenable_" + (Math.random() * 1E6 | 0);
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true
};
goog.events.Listenable.isImplementedBy = function(obj) {
  try {
    return!!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP])
  }catch(e) {
    return false
  }
};
goog.events.Listenable.prototype.listen;
goog.events.Listenable.prototype.listenOnce;
goog.events.Listenable.prototype.unlisten;
goog.events.Listenable.prototype.unlistenByKey;
goog.events.Listenable.prototype.dispatchEvent;
goog.events.Listenable.prototype.removeAllListeners;
goog.events.Listenable.prototype.getParentEventTarget;
goog.events.Listenable.prototype.fireListeners;
goog.events.Listenable.prototype.getListeners;
goog.events.Listenable.prototype.getListener;
goog.events.Listenable.prototype.hasListener;
goog.events.ListenableKey = function() {
};
goog.events.ListenableKey.counter_ = 0;
goog.events.ListenableKey.reserveKey = function() {
  return++goog.events.ListenableKey.counter_
};
goog.events.ListenableKey.prototype.src;
goog.events.ListenableKey.prototype.type;
goog.events.ListenableKey.prototype.listener;
goog.events.ListenableKey.prototype.capture;
goog.events.ListenableKey.prototype.handler;
goog.events.ListenableKey.prototype.key;
goog.provide("goog.events.Listener");
goog.require("goog.events.ListenableKey");
goog.events.Listener = function(listener, proxy, src, type, capture, opt_handler) {
  if(goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = (new Error).stack
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.key = goog.events.ListenableKey.reserveKey();
  this.callOnce = false;
  this.removed = false
};
goog.define("goog.events.Listener.ENABLE_MONITORING", false);
goog.events.Listener.prototype.creationStack;
goog.events.Listener.prototype.markAsRemoved = function() {
  this.removed = true;
  this.listener = null;
  this.proxy = null;
  this.src = null;
  this.handler = null
};
goog.provide("goog.events.ListenerMap");
goog.require("goog.array");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.ListenerMap = function(src) {
  this.src = src;
  this.listeners = {};
  this.typeCount_ = 0
};
goog.events.ListenerMap.prototype.getTypeCount = function() {
  return this.typeCount_
};
goog.events.ListenerMap.prototype.getListenerCount = function() {
  var count = 0;
  for(var type in this.listeners) {
    count += this.listeners[type].length
  }
  return count
};
goog.events.ListenerMap.prototype.add = function(type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  var listenerArray = this.listeners[typeStr];
  if(!listenerArray) {
    listenerArray = this.listeners[typeStr] = [];
    this.typeCount_++
  }
  var listenerObj;
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if(index > -1) {
    listenerObj = listenerArray[index];
    if(!callOnce) {
      listenerObj.callOnce = false
    }
  }else {
    listenerObj = new goog.events.Listener(listener, null, this.src, typeStr, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj)
  }
  return listenerObj
};
goog.events.ListenerMap.prototype.remove = function(type, listener, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  if(!(typeStr in this.listeners)) {
    return false
  }
  var listenerArray = this.listeners[typeStr];
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if(index > -1) {
    var listenerObj = listenerArray[index];
    listenerObj.markAsRemoved();
    goog.array.removeAt(listenerArray, index);
    if(listenerArray.length == 0) {
      delete this.listeners[typeStr];
      this.typeCount_--
    }
    return true
  }
  return false
};
goog.events.ListenerMap.prototype.removeByKey = function(listener) {
  var type = listener.type;
  if(!(type in this.listeners)) {
    return false
  }
  var removed = goog.array.remove(this.listeners[type], listener);
  if(removed) {
    listener.markAsRemoved();
    if(this.listeners[type].length == 0) {
      delete this.listeners[type];
      this.typeCount_--
    }
  }
  return removed
};
goog.events.ListenerMap.prototype.removeAll = function(opt_type) {
  var typeStr = opt_type && opt_type.toString();
  var count = 0;
  for(var type in this.listeners) {
    if(!typeStr || type == typeStr) {
      var listenerArray = this.listeners[type];
      for(var i = 0;i < listenerArray.length;i++) {
        ++count;
        listenerArray[i].markAsRemoved()
      }
      delete this.listeners[type];
      this.typeCount_--
    }
  }
  return count
};
goog.events.ListenerMap.prototype.getListeners = function(type, capture) {
  var listenerArray = this.listeners[type.toString()];
  var rv = [];
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;++i) {
      var listenerObj = listenerArray[i];
      if(listenerObj.capture == capture) {
        rv.push(listenerObj)
      }
    }
  }
  return rv
};
goog.events.ListenerMap.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  var listenerArray = this.listeners[type.toString()];
  var i = -1;
  if(listenerArray) {
    i = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, capture, opt_listenerScope)
  }
  return i > -1 ? listenerArray[i] : null
};
goog.events.ListenerMap.prototype.hasListener = function(opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var typeStr = hasType ? opt_type.toString() : "";
  var hasCapture = goog.isDef(opt_capture);
  return goog.object.some(this.listeners, function(listenerArray, type) {
    for(var i = 0;i < listenerArray.length;++i) {
      if((!hasType || listenerArray[i].type == typeStr) && (!hasCapture || listenerArray[i].capture == opt_capture)) {
        return true
      }
    }
    return false
  })
};
goog.events.ListenerMap.findListenerIndex_ = function(listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for(var i = 0;i < listenerArray.length;++i) {
    var listenerObj = listenerArray[i];
    if(!listenerObj.removed && (listenerObj.listener == listener && (listenerObj.capture == !!opt_useCapture && listenerObj.handler == opt_listenerScope))) {
      return i
    }
  }
  return-1
};
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), HAS_W3C_EVENT_SUPPORT:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), HAS_NAVIGATOR_ONLINE_PROPERTY:!goog.userAgent.WEBKIT || goog.userAgent.isVersionOrHigher("528"), HAS_HTML5_NETWORK_EVENT_SUPPORT:goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9b") || (goog.userAgent.IE && 
goog.userAgent.isVersionOrHigher("8") || (goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher("9.5") || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("528"))), HTML5_NETWORK_EVENTS_FIRE_ON_BODY:goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("8") || goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), TOUCH_ENABLED:"ontouchstart" in goog.global || (!!(goog.global["document"] && (document.documentElement && "ontouchstart" in document.documentElement)) || !!(goog.global["navigator"] && 
goog.global["navigator"]["msMaxTouchPoints"]))};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.require("goog.asserts");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.monitors_ = [];
goog.debug.entryPointRegistry.monitorsMayExist_ = false;
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback;
  if(goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for(var i = 0;i < monitors.length;i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]))
    }
  }
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor)
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1], "Only the most recent monitor can be unwrapped.");
  var transformer = goog.bind(monitor.unwrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  monitors.length--
};
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.getVendorPrefixedName_ = function(eventName) {
  return goog.userAgent.WEBKIT ? "webkit" + eventName : goog.userAgent.OPERA ? "o" + eventName.toLowerCase() : eventName.toLowerCase()
};
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", MOUSEENTER:"mouseenter", MOUSELEAVE:"mouseleave", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", 
INPUT:"input", PROPERTYCHANGE:"propertychange", DRAGSTART:"dragstart", DRAG:"drag", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", DRAGEND:"dragend", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", BEFOREUNLOAD:"beforeunload", CONSOLEMESSAGE:"consolemessage", CONTEXTMENU:"contextmenu", DOMCONTENTLOADED:"DOMContentLoaded", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", ORIENTATIONCHANGE:"orientationchange", 
READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", BEFORECOPY:"beforecopy", BEFORECUT:"beforecut", BEFOREPASTE:"beforepaste", ONLINE:"online", OFFLINE:"offline", MESSAGE:"message", CONNECT:"connect", ANIMATIONSTART:goog.events.getVendorPrefixedName_("AnimationStart"), ANIMATIONEND:goog.events.getVendorPrefixedName_("AnimationEnd"), ANIMATIONITERATION:goog.events.getVendorPrefixedName_("AnimationIteration"), 
TRANSITIONEND:goog.events.getVendorPrefixedName_("TransitionEnd"), POINTERDOWN:"pointerdown", POINTERUP:"pointerup", POINTERCANCEL:"pointercancel", POINTERMOVE:"pointermove", POINTEROVER:"pointerover", POINTEROUT:"pointerout", POINTERENTER:"pointerenter", POINTERLEAVE:"pointerleave", GOTPOINTERCAPTURE:"gotpointercapture", LOSTPOINTERCAPTURE:"lostpointercapture", MSGESTURECHANGE:"MSGestureChange", MSGESTUREEND:"MSGestureEnd", MSGESTUREHOLD:"MSGestureHold", MSGESTURESTART:"MSGestureStart", MSGESTURETAP:"MSGestureTap", 
MSGOTPOINTERCAPTURE:"MSGotPointerCapture", MSINERTIASTART:"MSInertiaStart", MSLOSTPOINTERCAPTURE:"MSLostPointerCapture", MSPOINTERCANCEL:"MSPointerCancel", MSPOINTERDOWN:"MSPointerDown", MSPOINTERENTER:"MSPointerEnter", MSPOINTERHOVER:"MSPointerHover", MSPOINTERLEAVE:"MSPointerLeave", MSPOINTERMOVE:"MSPointerMove", MSPOINTEROUT:"MSPointerOut", MSPOINTEROVER:"MSPointerOver", MSPOINTERUP:"MSPointerUp", TEXTINPUT:"textinput", COMPOSITIONSTART:"compositionstart", COMPOSITIONUPDATE:"compositionupdate", 
COMPOSITIONEND:"compositionend", EXIT:"exit", LOADABORT:"loadabort", LOADCOMMIT:"loadcommit", LOADREDIRECT:"loadredirect", LOADSTART:"loadstart", LOADSTOP:"loadstop", RESPONSIVE:"responsive", SIZECHANGED:"sizechanged", UNRESPONSIVE:"unresponsive", VISIBILITYCHANGE:"visibilitychange", STORAGE:"storage"};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.provide("goog.disposeAll");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if(goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = (new Error).stack
    }
    goog.Disposable.instances_[goog.getUid(this)] = this
  }
};
goog.Disposable.MonitoringMode = {OFF:0, PERMANENT:1, INTERACTIVE:2};
goog.define("goog.Disposable.MONITORING_MODE", 0);
goog.define("goog.Disposable.INCLUDE_STACK_ON_CREATION", true);
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for(var id in goog.Disposable.instances_) {
    if(goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)])
    }
  }
  return ret
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.onDisposeCallbacks_;
goog.Disposable.prototype.creationStack;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if(goog.Disposable.MONITORING_MODE == goog.Disposable.MonitoringMode.PERMANENT && !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid]
    }
  }
};
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable))
};
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if(!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = []
  }
  this.onDisposeCallbacks_.push(goog.bind(callback, opt_scope))
};
goog.Disposable.prototype.disposeInternal = function() {
  if(this.onDisposeCallbacks_) {
    while(this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()()
    }
  }
};
goog.Disposable.isDisposed = function(obj) {
  if(obj && typeof obj.isDisposed == "function") {
    return obj.isDisposed()
  }
  return false
};
goog.dispose = function(obj) {
  if(obj && typeof obj.dispose == "function") {
    obj.dispose()
  }
};
goog.disposeAll = function(var_args) {
  for(var i = 0, len = arguments.length;i < len;++i) {
    var disposable = arguments[i];
    if(goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable)
    }else {
      goog.dispose(disposable)
    }
  }
};
goog.provide("goog.events.Event");
goog.provide("goog.events.EventLike");
goog.require("goog.Disposable");
goog.require("goog.events.EventId");
goog.events.EventLike;
goog.events.Event = function(type, opt_target) {
  this.type = type instanceof goog.events.EventId ? String(type) : type;
  this.target = opt_target;
  this.currentTarget = this.target;
  this.propagationStopped_ = false;
  this.defaultPrevented = false;
  this.returnValue_ = true
};
goog.events.Event.prototype.disposeInternal = function() {
};
goog.events.Event.prototype.dispose = function() {
};
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation()
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault()
};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true
  }catch(e) {
  }
  return false
};
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  goog.events.BrowserEvent.base(this, "constructor", opt_e ? opt_e.type : "");
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
  this.offsetX = 0;
  this.offsetY = 0;
  this.clientX = 0;
  this.clientY = 0;
  this.screenX = 0;
  this.screenY = 0;
  this.button = 0;
  this.keyCode = 0;
  this.charCode = 0;
  this.ctrlKey = false;
  this.altKey = false;
  this.shiftKey = false;
  this.metaKey = false;
  this.state = null;
  this.platformModifierKey = false;
  this.event_ = null;
  if(opt_e) {
    this.init(opt_e, opt_currentTarget)
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  this.target = (e.target) || e.srcElement;
  this.currentTarget = (opt_currentTarget);
  var relatedTarget = (e.relatedTarget);
  if(relatedTarget) {
    if(goog.userAgent.GECKO) {
      if(!goog.reflect.canAccessProperty(relatedTarget, "nodeName")) {
        relatedTarget = null
      }
    }
  }else {
    if(type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement
    }else {
      if(type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = goog.userAgent.WEBKIT || e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = goog.userAgent.WEBKIT || e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if(e.defaultPrevented) {
    this.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if(!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if(this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT
    }else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button])
    }
  }else {
    return this.event_.button == button
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && (goog.userAgent.MAC && this.ctrlKey))
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if(this.event_.stopPropagation) {
    this.event_.stopPropagation()
  }else {
    this.event_.cancelBubble = true
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if(!be.preventDefault) {
    be.returnValue = false;
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1
        }
      }catch(ex) {
      }
    }
  }else {
    be.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};
goog.provide("goog.events");
goog.provide("goog.events.CaptureSimulationMode");
goog.provide("goog.events.Key");
goog.provide("goog.events.ListenableType");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.events.Key;
goog.events.ListenableType;
goog.events.listeners_ = {};
goog.events.LISTENER_MAP_PROP_ = "closure_lm_" + (Math.random() * 1E6 | 0);
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.CaptureSimulationMode = {OFF_AND_FAIL:0, OFF_AND_SILENT:1, ON:2};
goog.define("goog.events.CAPTURE_SIMULATION_MODE", 2);
goog.events.listenerCountEstimate_ = 0;
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  listener = goog.events.wrapListener(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.listen((type), listener, opt_capt, opt_handler)
  }else {
    return goog.events.listen_((src), type, listener, false, opt_capt, opt_handler)
  }
};
goog.events.listen_ = function(src, type, listener, callOnce, opt_capt, opt_handler) {
  if(!type) {
    throw Error("Invalid event type");
  }
  var capture = !!opt_capt;
  if(capture && !goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    if(goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_FAIL) {
      goog.asserts.fail("Can not register capture listener in IE8-.");
      return null
    }else {
      if(goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_SILENT) {
        return null
      }
    }
  }
  var listenerMap = goog.events.getListenerMap_(src);
  if(!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap = new goog.events.ListenerMap(src)
  }
  var listenerObj = listenerMap.add(type, listener, callOnce, opt_capt, opt_handler);
  if(listenerObj.proxy) {
    return listenerObj
  }
  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;
  proxy.src = src;
  proxy.listener = listenerObj;
  if(src.addEventListener) {
    src.addEventListener(type, proxy, capture)
  }else {
    src.attachEvent(goog.events.getOnString_(type), proxy)
  }
  goog.events.listenerCountEstimate_++;
  return listenerObj
};
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ? function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject)
  } : function(eventObject) {
    var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
    if(!v) {
      return v
    }
  };
  return f
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  listener = goog.events.wrapListener(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.listenOnce((type), listener, opt_capt, opt_handler)
  }else {
    return goog.events.listen_((src), type, listener, true, opt_capt, opt_handler)
  }
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler)
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  listener = goog.events.wrapListener(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten((type), listener, opt_capt, opt_handler)
  }
  if(!src) {
    return false
  }
  var capture = !!opt_capt;
  var listenerMap = goog.events.getListenerMap_((src));
  if(listenerMap) {
    var listenerObj = listenerMap.getListener((type), listener, capture, opt_handler);
    if(listenerObj) {
      return goog.events.unlistenByKey(listenerObj)
    }
  }
  return false
};
goog.events.unlistenByKey = function(key) {
  if(goog.isNumber(key)) {
    return false
  }
  var listener = (key);
  if(!listener || listener.removed) {
    return false
  }
  var src = listener.src;
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener)
  }
  var type = listener.type;
  var proxy = listener.proxy;
  if(src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture)
  }else {
    if(src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy)
    }
  }
  goog.events.listenerCountEstimate_--;
  var listenerMap = goog.events.getListenerMap_((src));
  if(listenerMap) {
    listenerMap.removeByKey(listener);
    if(listenerMap.getTypeCount() == 0) {
      listenerMap.src = null;
      src[goog.events.LISTENER_MAP_PROP_] = null
    }
  }else {
    listener.markAsRemoved()
  }
  return true
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler)
};
goog.events.removeAll = function(opt_obj, opt_type) {
  if(!opt_obj) {
    return 0
  }
  if(goog.events.Listenable.isImplementedBy(opt_obj)) {
    return opt_obj.removeAllListeners(opt_type)
  }
  var listenerMap = goog.events.getListenerMap_((opt_obj));
  if(!listenerMap) {
    return 0
  }
  var count = 0;
  for(var type in listenerMap.listeners) {
    if(!opt_type || type == opt_type) {
      var listeners = goog.array.clone(listenerMap.listeners[type]);
      for(var i = 0;i < listeners.length;++i) {
        if(goog.events.unlistenByKey(listeners[i])) {
          ++count
        }
      }
    }
  }
  return count
};
goog.events.removeAllNativeListeners = function() {
  goog.events.listenerCountEstimate_ = 0;
  return 0
};
goog.events.getListeners = function(obj, type, capture) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture)
  }else {
    if(!obj) {
      return[]
    }
    var listenerMap = goog.events.getListenerMap_((obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : []
  }
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  type = (type);
  listener = goog.events.wrapListener(listener);
  var capture = !!opt_capt;
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler)
  }
  if(!src) {
    return null
  }
  var listenerMap = goog.events.getListenerMap_((src));
  if(listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler)
  }
  return null
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture)
  }
  var listenerMap = goog.events.getListenerMap_((obj));
  return!!listenerMap && listenerMap.hasListener(opt_type, opt_capture)
};
goog.events.expose = function(e) {
  var str = [];
  for(var key in e) {
    if(e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")")
    }else {
      str.push(key + " = " + e[key])
    }
  }
  return str.join("\n")
};
goog.events.getOnString_ = function(type) {
  if(type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type]
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject)
  }
  return goog.events.fireListeners_(obj, type, capture, eventObject)
};
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  var retval = 1;
  var listenerMap = goog.events.getListenerMap_((obj));
  if(listenerMap) {
    var listenerArray = listenerMap.listeners[type];
    if(listenerArray) {
      listenerArray = goog.array.clone(listenerArray);
      for(var i = 0;i < listenerArray.length;i++) {
        var listener = listenerArray[i];
        if(listener && (listener.capture == capture && !listener.removed)) {
          retval &= goog.events.fireListener(listener, eventObject) !== false
        }
      }
    }
  }
  return Boolean(retval)
};
goog.events.fireListener = function(listener, eventObject) {
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;
  if(listener.callOnce) {
    goog.events.unlistenByKey(listener)
  }
  return listenerFn.call(listenerHandler, eventObject)
};
goog.events.getTotalListenerCount = function() {
  return goog.events.listenerCountEstimate_
};
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(goog.events.Listenable.isImplementedBy(src), "Can not use goog.events.dispatchEvent with " + "non-goog.events.Listenable instance.");
  return src.dispatchEvent(e)
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if(listener.removed) {
    return true
  }
  if(!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt || (goog.getObjectByName("window.event"));
    var evt = new goog.events.BrowserEvent(ieEvent, this);
    var retval = true;
    if(goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.ON) {
      if(!goog.events.isMarkedIeEvent_(ieEvent)) {
        goog.events.markIeEvent_(ieEvent);
        var ancestors = [];
        for(var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent)
        }
        var type = listener.type;
        for(var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, true, evt)
        }
        for(var i = 0;!evt.propagationStopped_ && i < ancestors.length;i++) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, false, evt)
        }
      }
    }else {
      retval = goog.events.fireListener(listener, evt)
    }
    return retval
  }
  return goog.events.fireListener(listener, new goog.events.BrowserEvent(opt_evt, this))
};
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if(e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return
    }catch(ex) {
      useReturnValue = true
    }
  }
  if(useReturnValue || (e.returnValue) == undefined) {
    e.returnValue = true
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++
};
goog.events.getListenerMap_ = function(src) {
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null
};
goog.events.LISTENER_WRAPPER_PROP_ = "__closure_events_fn_" + (Math.random() * 1E9 >>> 0);
goog.events.wrapListener = function(listener) {
  goog.asserts.assert(listener, "Listener can not be null.");
  if(goog.isFunction(listener)) {
    return listener
  }
  goog.asserts.assert(listener.handleEvent, "An object listener must have handleEvent method.");
  return listener[goog.events.LISTENER_WRAPPER_PROP_] || (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
    return listener.handleEvent(e)
  })
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_)
});
goog.provide("goog.events.EventHandler");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.object");
goog.events.EventHandler = function(opt_scope) {
  goog.Disposable.call(this);
  this.handler_ = opt_scope;
  this.keys_ = {}
};
goog.inherits(goog.events.EventHandler, goog.Disposable);
goog.events.EventHandler.typeArray_ = [];
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture) {
  return this.listen_(src, type, opt_fn, opt_capture)
};
goog.events.EventHandler.prototype.listenWithScope = function(src, type, fn, capture, scope) {
  return this.listen_(src, type, fn, capture, scope)
};
goog.events.EventHandler.prototype.listen_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if(!goog.isArray(type)) {
    goog.events.EventHandler.typeArray_[0] = (type);
    type = goog.events.EventHandler.typeArray_
  }
  for(var i = 0;i < type.length;i++) {
    var listenerObj = goog.events.listen(src, type[i], opt_fn || this.handleEvent, opt_capture || false, opt_scope || (this.handler_ || this));
    if(!listenerObj) {
      return this
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj
  }
  return this
};
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture) {
  return this.listenOnce_(src, type, opt_fn, opt_capture)
};
goog.events.EventHandler.prototype.listenOnceWithScope = function(src, type, fn, capture, scope) {
  return this.listenOnce_(src, type, fn, capture, scope)
};
goog.events.EventHandler.prototype.listenOnce_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      this.listenOnce_(src, type[i], opt_fn, opt_capture, opt_scope)
    }
  }else {
    var listenerObj = goog.events.listenOnce(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || (this.handler_ || this));
    if(!listenerObj) {
      return this
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj
  }
  return this
};
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt) {
  return this.listenWithWrapper_(src, wrapper, listener, opt_capt)
};
goog.events.EventHandler.prototype.listenWithWrapperAndScope = function(src, wrapper, listener, capture, scope) {
  return this.listenWithWrapper_(src, wrapper, listener, capture, scope)
};
goog.events.EventHandler.prototype.listenWithWrapper_ = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.listen(src, listener, opt_capt, opt_scope || (this.handler_ || this), this);
  return this
};
goog.events.EventHandler.prototype.getListenerCount = function() {
  var count = 0;
  for(var key in this.keys_) {
    if(Object.prototype.hasOwnProperty.call(this.keys_, key)) {
      count++
    }
  }
  return count
};
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_scope) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_scope)
    }
  }else {
    var listener = goog.events.getListener(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || (this.handler_ || this));
    if(listener) {
      goog.events.unlistenByKey(listener);
      delete this.keys_[listener.key]
    }
  }
  return this
};
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.unlisten(src, listener, opt_capt, opt_scope || (this.handler_ || this), this);
  return this
};
goog.events.EventHandler.prototype.removeAll = function() {
  goog.object.forEach(this.keys_, goog.events.unlistenByKey);
  this.keys_ = {}
};
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll()
};
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error("EventHandler.handleEvent not implemented");
};
goog.provide("goog.ui.IdGenerator");
goog.ui.IdGenerator = function() {
};
goog.addSingletonGetter(goog.ui.IdGenerator);
goog.ui.IdGenerator.prototype.nextId_ = 0;
goog.ui.IdGenerator.prototype.getNextUniqueId = function() {
  return":" + (this.nextId_++).toString(36)
};
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.require("goog.object");
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);
  this.actualEventTarget_ = this
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);
goog.events.EventTarget.MAX_ANCESTORS_ = 1E3;
goog.events.EventTarget.prototype.parentEventTarget_ = null;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  this.assertInitialized_();
  var ancestorsTree, ancestor = this.getParentEventTarget();
  if(ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for(;ancestor;ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_, "infinite loop")
    }
  }
  return goog.events.EventTarget.dispatchEventInternal_(this.actualEventTarget_, e, ancestorsTree)
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  this.removeAllListeners();
  this.parentEventTarget_ = null
};
goog.events.EventTarget.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  return this.eventTargetListeners_.add(String(type), listener, false, opt_useCapture, opt_listenerScope)
};
goog.events.EventTarget.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.add(String(type), listener, true, opt_useCapture, opt_listenerScope)
};
goog.events.EventTarget.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.remove(String(type), listener, opt_useCapture, opt_listenerScope)
};
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  return this.eventTargetListeners_.removeByKey(key)
};
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type) {
  if(!this.eventTargetListeners_) {
    return 0
  }
  return this.eventTargetListeners_.removeAll(opt_type)
};
goog.events.EventTarget.prototype.fireListeners = function(type, capture, eventObject) {
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if(!listenerArray) {
    return true
  }
  listenerArray = goog.array.clone(listenerArray);
  var rv = true;
  for(var i = 0;i < listenerArray.length;++i) {
    var listener = listenerArray[i];
    if(listener && (!listener.removed && listener.capture == capture)) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;
      if(listener.callOnce) {
        this.unlistenByKey(listener)
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv
    }
  }
  return rv && eventObject.returnValue_ != false
};
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  return this.eventTargetListeners_.getListeners(String(type), capture)
};
goog.events.EventTarget.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  return this.eventTargetListeners_.getListener(String(type), listener, capture, opt_listenerScope)
};
goog.events.EventTarget.prototype.hasListener = function(opt_type, opt_capture) {
  var id = goog.isDef(opt_type) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture)
};
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  this.actualEventTarget_ = target
};
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(this.eventTargetListeners_, "Event target is not initialized. Did you call the superclass " + "(goog.events.EventTarget) constructor?")
};
goog.events.EventTarget.dispatchEventInternal_ = function(target, e, opt_ancestorsTree) {
  var type = e.type || (e);
  if(goog.isString(e)) {
    e = new goog.events.Event(e, target)
  }else {
    if(!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, target);
      goog.object.extend(e, oldEvent)
    }else {
      e.target = e.target || target
    }
  }
  var rv = true, currentTarget;
  if(opt_ancestorsTree) {
    for(var i = opt_ancestorsTree.length - 1;!e.propagationStopped_ && i >= 0;i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv
    }
  }
  if(!e.propagationStopped_) {
    currentTarget = e.currentTarget = target;
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if(!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv
    }
  }
  if(opt_ancestorsTree) {
    for(i = 0;!e.propagationStopped_ && i < opt_ancestorsTree.length;i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv
    }
  }
  return rv
};
goog.provide("goog.ui.Component");
goog.provide("goog.ui.Component.Error");
goog.provide("goog.ui.Component.EventType");
goog.provide("goog.ui.Component.State");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.IdGenerator");
goog.ui.Component = function(opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.rightToLeft_ = goog.ui.Component.defaultRightToLeft_
};
goog.inherits(goog.ui.Component, goog.events.EventTarget);
goog.define("goog.ui.Component.ALLOW_DETACHED_DECORATION", false);
goog.ui.Component.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();
goog.define("goog.ui.Component.DEFAULT_BIDI_DIR", 0);
goog.ui.Component.defaultRightToLeft_ = goog.ui.Component.DEFAULT_BIDI_DIR == 1 ? false : goog.ui.Component.DEFAULT_BIDI_DIR == -1 ? true : null;
goog.ui.Component.EventType = {BEFORE_SHOW:"beforeshow", SHOW:"show", HIDE:"hide", DISABLE:"disable", ENABLE:"enable", HIGHLIGHT:"highlight", UNHIGHLIGHT:"unhighlight", ACTIVATE:"activate", DEACTIVATE:"deactivate", SELECT:"select", UNSELECT:"unselect", CHECK:"check", UNCHECK:"uncheck", FOCUS:"focus", BLUR:"blur", OPEN:"open", CLOSE:"close", ENTER:"enter", LEAVE:"leave", ACTION:"action", CHANGE:"change"};
goog.ui.Component.Error = {NOT_SUPPORTED:"Method not supported", DECORATE_INVALID:"Invalid element to decorate", ALREADY_RENDERED:"Component already rendered", PARENT_UNABLE_TO_BE_SET:"Unable to set parent component", CHILD_INDEX_OUT_OF_BOUNDS:"Child component index out of bounds", NOT_OUR_CHILD:"Child is not in parent component", NOT_IN_DOCUMENT:"Operation not supported while component is not in document", STATE_INVALID:"Invalid component state"};
goog.ui.Component.State = {ALL:255, DISABLED:1, HOVER:2, ACTIVE:4, SELECTED:8, CHECKED:16, FOCUSED:32, OPENED:64};
goog.ui.Component.getStateTransitionEvent = function(state, isEntering) {
  switch(state) {
    case goog.ui.Component.State.DISABLED:
      return isEntering ? goog.ui.Component.EventType.DISABLE : goog.ui.Component.EventType.ENABLE;
    case goog.ui.Component.State.HOVER:
      return isEntering ? goog.ui.Component.EventType.HIGHLIGHT : goog.ui.Component.EventType.UNHIGHLIGHT;
    case goog.ui.Component.State.ACTIVE:
      return isEntering ? goog.ui.Component.EventType.ACTIVATE : goog.ui.Component.EventType.DEACTIVATE;
    case goog.ui.Component.State.SELECTED:
      return isEntering ? goog.ui.Component.EventType.SELECT : goog.ui.Component.EventType.UNSELECT;
    case goog.ui.Component.State.CHECKED:
      return isEntering ? goog.ui.Component.EventType.CHECK : goog.ui.Component.EventType.UNCHECK;
    case goog.ui.Component.State.FOCUSED:
      return isEntering ? goog.ui.Component.EventType.FOCUS : goog.ui.Component.EventType.BLUR;
    case goog.ui.Component.State.OPENED:
      return isEntering ? goog.ui.Component.EventType.OPEN : goog.ui.Component.EventType.CLOSE;
    default:
  }
  throw Error(goog.ui.Component.Error.STATE_INVALID);
};
goog.ui.Component.setDefaultRightToLeft = function(rightToLeft) {
  goog.ui.Component.defaultRightToLeft_ = rightToLeft
};
goog.ui.Component.prototype.id_ = null;
goog.ui.Component.prototype.dom_;
goog.ui.Component.prototype.inDocument_ = false;
goog.ui.Component.prototype.element_ = null;
goog.ui.Component.prototype.googUiComponentHandler_;
goog.ui.Component.prototype.rightToLeft_ = null;
goog.ui.Component.prototype.model_ = null;
goog.ui.Component.prototype.parent_ = null;
goog.ui.Component.prototype.children_ = null;
goog.ui.Component.prototype.childIndex_ = null;
goog.ui.Component.prototype.wasDecorated_ = false;
goog.ui.Component.prototype.getId = function() {
  return this.id_ || (this.id_ = this.idGenerator_.getNextUniqueId())
};
goog.ui.Component.prototype.setId = function(id) {
  if(this.parent_ && this.parent_.childIndex_) {
    goog.object.remove(this.parent_.childIndex_, this.id_);
    goog.object.add(this.parent_.childIndex_, id, this)
  }
  this.id_ = id
};
goog.ui.Component.prototype.getElement = function() {
  return this.element_
};
goog.ui.Component.prototype.getElementStrict = function() {
  var el = this.element_;
  goog.asserts.assert(el, "Can not call getElementStrict before rendering/decorating.");
  return el
};
goog.ui.Component.prototype.setElementInternal = function(element) {
  this.element_ = element
};
goog.ui.Component.prototype.getElementsByClass = function(className) {
  return this.element_ ? this.dom_.getElementsByClass(className, this.element_) : []
};
goog.ui.Component.prototype.getElementByClass = function(className) {
  return this.element_ ? this.dom_.getElementByClass(className, this.element_) : null
};
goog.ui.Component.prototype.getRequiredElementByClass = function(className) {
  var el = this.getElementByClass(className);
  goog.asserts.assert(el, "Expected element in component with class: %s", className);
  return el
};
goog.ui.Component.prototype.getHandler = function() {
  if(!this.googUiComponentHandler_) {
    this.googUiComponentHandler_ = new goog.events.EventHandler(this)
  }
  return this.googUiComponentHandler_
};
goog.ui.Component.prototype.setParent = function(parent) {
  if(this == parent) {
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }
  if(parent && (this.parent_ && (this.id_ && (this.parent_.getChild(this.id_) && this.parent_ != parent)))) {
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }
  this.parent_ = parent;
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent)
};
goog.ui.Component.prototype.getParent = function() {
  return this.parent_
};
goog.ui.Component.prototype.setParentEventTarget = function(parent) {
  if(this.parent_ && this.parent_ != parent) {
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED);
  }
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent)
};
goog.ui.Component.prototype.getDomHelper = function() {
  return this.dom_
};
goog.ui.Component.prototype.isInDocument = function() {
  return this.inDocument_
};
goog.ui.Component.prototype.createDom = function() {
  this.element_ = this.dom_.createElement("div")
};
goog.ui.Component.prototype.render = function(opt_parentElement) {
  this.render_(opt_parentElement)
};
goog.ui.Component.prototype.renderBefore = function(sibling) {
  this.render_((sibling.parentNode), sibling)
};
goog.ui.Component.prototype.render_ = function(opt_parentElement, opt_beforeNode) {
  if(this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if(!this.element_) {
    this.createDom()
  }
  if(opt_parentElement) {
    opt_parentElement.insertBefore(this.element_, opt_beforeNode || null)
  }else {
    this.dom_.getDocument().body.appendChild(this.element_)
  }
  if(!this.parent_ || this.parent_.isInDocument()) {
    this.enterDocument()
  }
};
goog.ui.Component.prototype.decorate = function(element) {
  if(this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }else {
    if(element && this.canDecorate(element)) {
      this.wasDecorated_ = true;
      var doc = goog.dom.getOwnerDocument(element);
      if(!this.dom_ || this.dom_.getDocument() != doc) {
        this.dom_ = goog.dom.getDomHelper(element)
      }
      this.decorateInternal(element);
      if(!goog.ui.Component.ALLOW_DETACHED_DECORATION || goog.dom.contains(doc, element)) {
        this.enterDocument()
      }
    }else {
      throw Error(goog.ui.Component.Error.DECORATE_INVALID);
    }
  }
};
goog.ui.Component.prototype.canDecorate = function(element) {
  return true
};
goog.ui.Component.prototype.wasDecorated = function() {
  return this.wasDecorated_
};
goog.ui.Component.prototype.decorateInternal = function(element) {
  this.element_ = element
};
goog.ui.Component.prototype.enterDocument = function() {
  this.inDocument_ = true;
  this.forEachChild(function(child) {
    if(!child.isInDocument() && child.getElement()) {
      child.enterDocument()
    }
  })
};
goog.ui.Component.prototype.exitDocument = function() {
  this.forEachChild(function(child) {
    if(child.isInDocument()) {
      child.exitDocument()
    }
  });
  if(this.googUiComponentHandler_) {
    this.googUiComponentHandler_.removeAll()
  }
  this.inDocument_ = false
};
goog.ui.Component.prototype.disposeInternal = function() {
  if(this.inDocument_) {
    this.exitDocument()
  }
  if(this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_
  }
  this.forEachChild(function(child) {
    child.dispose()
  });
  if(!this.wasDecorated_ && this.element_) {
    goog.dom.removeNode(this.element_)
  }
  this.children_ = null;
  this.childIndex_ = null;
  this.element_ = null;
  this.model_ = null;
  this.parent_ = null;
  goog.ui.Component.superClass_.disposeInternal.call(this)
};
goog.ui.Component.prototype.makeId = function(idFragment) {
  return this.getId() + "." + idFragment
};
goog.ui.Component.prototype.makeIds = function(object) {
  var ids = {};
  for(var key in object) {
    ids[key] = this.makeId(object[key])
  }
  return ids
};
goog.ui.Component.prototype.getModel = function() {
  return this.model_
};
goog.ui.Component.prototype.setModel = function(obj) {
  this.model_ = obj
};
goog.ui.Component.prototype.getFragmentFromId = function(id) {
  return id.substring(this.getId().length + 1)
};
goog.ui.Component.prototype.getElementByFragment = function(idFragment) {
  if(!this.inDocument_) {
    throw Error(goog.ui.Component.Error.NOT_IN_DOCUMENT);
  }
  return this.dom_.getElement(this.makeId(idFragment))
};
goog.ui.Component.prototype.addChild = function(child, opt_render) {
  this.addChildAt(child, this.getChildCount(), opt_render)
};
goog.ui.Component.prototype.addChildAt = function(child, index, opt_render) {
  goog.asserts.assert(!!child, "Provided element must not be null.");
  if(child.inDocument_ && (opt_render || !this.inDocument_)) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if(index < 0 || index > this.getChildCount()) {
    throw Error(goog.ui.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS);
  }
  if(!this.childIndex_ || !this.children_) {
    this.childIndex_ = {};
    this.children_ = []
  }
  if(child.getParent() == this) {
    goog.object.set(this.childIndex_, child.getId(), child);
    goog.array.remove(this.children_, child)
  }else {
    goog.object.add(this.childIndex_, child.getId(), child)
  }
  child.setParent(this);
  goog.array.insertAt(this.children_, child, index);
  if(child.inDocument_ && (this.inDocument_ && child.getParent() == this)) {
    var contentElement = this.getContentElement();
    contentElement.insertBefore(child.getElement(), contentElement.childNodes[index] || null)
  }else {
    if(opt_render) {
      if(!this.element_) {
        this.createDom()
      }
      var sibling = this.getChildAt(index + 1);
      child.render_(this.getContentElement(), sibling ? sibling.element_ : null)
    }else {
      if(this.inDocument_ && (!child.inDocument_ && (child.element_ && (child.element_.parentNode && child.element_.parentNode.nodeType == goog.dom.NodeType.ELEMENT)))) {
        child.enterDocument()
      }
    }
  }
};
goog.ui.Component.prototype.getContentElement = function() {
  return this.element_
};
goog.ui.Component.prototype.isRightToLeft = function() {
  if(this.rightToLeft_ == null) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.inDocument_ ? this.element_ : this.dom_.getDocument().body)
  }
  return(this.rightToLeft_)
};
goog.ui.Component.prototype.setRightToLeft = function(rightToLeft) {
  if(this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.rightToLeft_ = rightToLeft
};
goog.ui.Component.prototype.hasChildren = function() {
  return!!this.children_ && this.children_.length != 0
};
goog.ui.Component.prototype.getChildCount = function() {
  return this.children_ ? this.children_.length : 0
};
goog.ui.Component.prototype.getChildIds = function() {
  var ids = [];
  this.forEachChild(function(child) {
    ids.push(child.getId())
  });
  return ids
};
goog.ui.Component.prototype.getChild = function(id) {
  return this.childIndex_ && id ? (goog.object.get(this.childIndex_, id)) || null : null
};
goog.ui.Component.prototype.getChildAt = function(index) {
  return this.children_ ? this.children_[index] || null : null
};
goog.ui.Component.prototype.forEachChild = function(f, opt_obj) {
  if(this.children_) {
    goog.array.forEach(this.children_, f, opt_obj)
  }
};
goog.ui.Component.prototype.indexOfChild = function(child) {
  return this.children_ && child ? goog.array.indexOf(this.children_, child) : -1
};
goog.ui.Component.prototype.removeChild = function(child, opt_unrender) {
  if(child) {
    var id = goog.isString(child) ? child : child.getId();
    child = this.getChild(id);
    if(id && child) {
      goog.object.remove(this.childIndex_, id);
      goog.array.remove(this.children_, child);
      if(opt_unrender) {
        child.exitDocument();
        if(child.element_) {
          goog.dom.removeNode(child.element_)
        }
      }
      child.setParent(null)
    }
  }
  if(!child) {
    throw Error(goog.ui.Component.Error.NOT_OUR_CHILD);
  }
  return(child)
};
goog.ui.Component.prototype.removeChildAt = function(index, opt_unrender) {
  return this.removeChild(this.getChildAt(index), opt_unrender)
};
goog.ui.Component.prototype.removeChildren = function(opt_unrender) {
  var removedChildren = [];
  while(this.hasChildren()) {
    removedChildren.push(this.removeChildAt(0, opt_unrender))
  }
  return removedChildren
};
goog.provide("goog.Timer");
goog.require("goog.events.EventTarget");
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);
  this.interval_ = opt_interval || 1;
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;
  this.boundTick_ = goog.bind(this.tick_, this);
  this.last_ = goog.now()
};
goog.inherits(goog.Timer, goog.events.EventTarget);
goog.Timer.MAX_TIMEOUT_ = 2147483647;
goog.Timer.prototype.enabled = false;
goog.Timer.defaultTimerObject = goog.global;
goog.Timer.intervalScale = 0.8;
goog.Timer.prototype.timer_ = null;
goog.Timer.prototype.getInterval = function() {
  return this.interval_
};
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if(this.timer_ && this.enabled) {
    this.stop();
    this.start()
  }else {
    if(this.timer_) {
      this.stop()
    }
  }
};
goog.Timer.prototype.tick_ = function() {
  if(this.enabled) {
    var elapsed = goog.now() - this.last_;
    if(elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);
      return
    }
    if(this.timer_) {
      this.timerObject_.clearTimeout(this.timer_);
      this.timer_ = null
    }
    this.dispatchTick();
    if(this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
      this.last_ = goog.now()
    }
  }
};
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK)
};
goog.Timer.prototype.start = function() {
  this.enabled = true;
  if(!this.timer_) {
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
    this.last_ = goog.now()
  }
};
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if(this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null
  }
};
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_
};
goog.Timer.TICK = "tick";
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if(goog.isFunction(listener)) {
    if(opt_handler) {
      listener = goog.bind(listener, opt_handler)
    }
  }else {
    if(listener && typeof listener.handleEvent == "function") {
      listener = goog.bind(listener.handleEvent, listener)
    }else {
      throw Error("Invalid listener argument");
    }
  }
  if(opt_delay > goog.Timer.MAX_TIMEOUT_) {
    return-1
  }else {
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0)
  }
};
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId)
};
goog.provide("goog.a11y.aria.AutoCompleteValues");
goog.provide("goog.a11y.aria.CheckedValues");
goog.provide("goog.a11y.aria.DropEffectValues");
goog.provide("goog.a11y.aria.ExpandedValues");
goog.provide("goog.a11y.aria.GrabbedValues");
goog.provide("goog.a11y.aria.InvalidValues");
goog.provide("goog.a11y.aria.LivePriority");
goog.provide("goog.a11y.aria.OrientationValues");
goog.provide("goog.a11y.aria.PressedValues");
goog.provide("goog.a11y.aria.RelevantValues");
goog.provide("goog.a11y.aria.SelectedValues");
goog.provide("goog.a11y.aria.SortValues");
goog.provide("goog.a11y.aria.State");
goog.a11y.aria.State = {ACTIVEDESCENDANT:"activedescendant", ATOMIC:"atomic", AUTOCOMPLETE:"autocomplete", BUSY:"busy", CHECKED:"checked", CONTROLS:"controls", DESCRIBEDBY:"describedby", DISABLED:"disabled", DROPEFFECT:"dropeffect", EXPANDED:"expanded", FLOWTO:"flowto", GRABBED:"grabbed", HASPOPUP:"haspopup", HIDDEN:"hidden", INVALID:"invalid", LABEL:"label", LABELLEDBY:"labelledby", LEVEL:"level", LIVE:"live", MULTILINE:"multiline", MULTISELECTABLE:"multiselectable", ORIENTATION:"orientation", OWNS:"owns", 
POSINSET:"posinset", PRESSED:"pressed", READONLY:"readonly", RELEVANT:"relevant", REQUIRED:"required", SELECTED:"selected", SETSIZE:"setsize", SORT:"sort", VALUEMAX:"valuemax", VALUEMIN:"valuemin", VALUENOW:"valuenow", VALUETEXT:"valuetext"};
goog.a11y.aria.AutoCompleteValues = {INLINE:"inline", LIST:"list", BOTH:"both", NONE:"none"};
goog.a11y.aria.DropEffectValues = {COPY:"copy", MOVE:"move", LINK:"link", EXECUTE:"execute", POPUP:"popup", NONE:"none"};
goog.a11y.aria.LivePriority = {OFF:"off", POLITE:"polite", ASSERTIVE:"assertive"};
goog.a11y.aria.OrientationValues = {VERTICAL:"vertical", HORIZONTAL:"horizontal"};
goog.a11y.aria.RelevantValues = {ADDITIONS:"additions", REMOVALS:"removals", TEXT:"text", ALL:"all"};
goog.a11y.aria.SortValues = {ASCENDING:"ascending", DESCENDING:"descending", NONE:"none", OTHER:"other"};
goog.a11y.aria.CheckedValues = {TRUE:"true", FALSE:"false", MIXED:"mixed", UNDEFINED:"undefined"};
goog.a11y.aria.ExpandedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.a11y.aria.GrabbedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.a11y.aria.InvalidValues = {FALSE:"false", TRUE:"true", GRAMMAR:"grammar", SPELLING:"spelling"};
goog.a11y.aria.PressedValues = {TRUE:"true", FALSE:"false", MIXED:"mixed", UNDEFINED:"undefined"};
goog.a11y.aria.SelectedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.provide("goog.a11y.aria.datatables");
goog.require("goog.a11y.aria.State");
goog.require("goog.object");
goog.a11y.aria.DefaultStateValueMap_;
goog.a11y.aria.datatables.getDefaultValuesMap = function() {
  if(!goog.a11y.aria.DefaultStateValueMap_) {
    goog.a11y.aria.DefaultStateValueMap_ = goog.object.create(goog.a11y.aria.State.ATOMIC, false, goog.a11y.aria.State.AUTOCOMPLETE, "none", goog.a11y.aria.State.DROPEFFECT, "none", goog.a11y.aria.State.HASPOPUP, false, goog.a11y.aria.State.LIVE, "off", goog.a11y.aria.State.MULTILINE, false, goog.a11y.aria.State.MULTISELECTABLE, false, goog.a11y.aria.State.ORIENTATION, "vertical", goog.a11y.aria.State.READONLY, false, goog.a11y.aria.State.RELEVANT, "additions text", goog.a11y.aria.State.REQUIRED, 
    false, goog.a11y.aria.State.SORT, "none", goog.a11y.aria.State.BUSY, false, goog.a11y.aria.State.DISABLED, false, goog.a11y.aria.State.HIDDEN, false, goog.a11y.aria.State.INVALID, "false")
  }
  return goog.a11y.aria.DefaultStateValueMap_
};
goog.provide("goog.a11y.aria.Role");
goog.a11y.aria.Role = {ALERT:"alert", ALERTDIALOG:"alertdialog", APPLICATION:"application", ARTICLE:"article", BANNER:"banner", BUTTON:"button", CHECKBOX:"checkbox", COLUMNHEADER:"columnheader", COMBOBOX:"combobox", COMPLEMENTARY:"complementary", CONTENTINFO:"contentinfo", DEFINITION:"definition", DIALOG:"dialog", DIRECTORY:"directory", DOCUMENT:"document", FORM:"form", GRID:"grid", GRIDCELL:"gridcell", GROUP:"group", HEADING:"heading", IMG:"img", LINK:"link", LIST:"list", LISTBOX:"listbox", LISTITEM:"listitem", 
LOG:"log", MAIN:"main", MARQUEE:"marquee", MATH:"math", MENU:"menu", MENUBAR:"menubar", MENU_ITEM:"menuitem", MENU_ITEM_CHECKBOX:"menuitemcheckbox", MENU_ITEM_RADIO:"menuitemradio", NAVIGATION:"navigation", NOTE:"note", OPTION:"option", PRESENTATION:"presentation", PROGRESSBAR:"progressbar", RADIO:"radio", RADIOGROUP:"radiogroup", REGION:"region", ROW:"row", ROWGROUP:"rowgroup", ROWHEADER:"rowheader", SCROLLBAR:"scrollbar", SEARCH:"search", SEPARATOR:"separator", SLIDER:"slider", SPINBUTTON:"spinbutton", 
STATUS:"status", TAB:"tab", TAB_LIST:"tablist", TAB_PANEL:"tabpanel", TEXTBOX:"textbox", TIMER:"timer", TOOLBAR:"toolbar", TOOLTIP:"tooltip", TREE:"tree", TREEGRID:"treegrid", TREEITEM:"treeitem"};
goog.provide("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.a11y.aria.datatables");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.TagName");
goog.require("goog.object");
goog.a11y.aria.ARIA_PREFIX_ = "aria-";
goog.a11y.aria.ROLE_ATTRIBUTE_ = "role";
goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_ = [goog.dom.TagName.A, goog.dom.TagName.AREA, goog.dom.TagName.BUTTON, goog.dom.TagName.HEAD, goog.dom.TagName.INPUT, goog.dom.TagName.LINK, goog.dom.TagName.MENU, goog.dom.TagName.META, goog.dom.TagName.OPTGROUP, goog.dom.TagName.OPTION, goog.dom.TagName.PROGRESS, goog.dom.TagName.STYLE, goog.dom.TagName.SELECT, goog.dom.TagName.SOURCE, goog.dom.TagName.TEXTAREA, goog.dom.TagName.TITLE, goog.dom.TagName.TRACK];
goog.a11y.aria.setRole = function(element, roleName) {
  if(!roleName) {
    goog.a11y.aria.removeRole(element)
  }else {
    if(goog.asserts.ENABLE_ASSERTS) {
      goog.asserts.assert(goog.object.containsValue(goog.a11y.aria.Role, roleName), "No such ARIA role " + roleName)
    }
    element.setAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_, roleName)
  }
};
goog.a11y.aria.getRole = function(element) {
  var role = element.getAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_);
  return(role) || null
};
goog.a11y.aria.removeRole = function(element) {
  element.removeAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_)
};
goog.a11y.aria.setState = function(element, stateName, value) {
  if(goog.isArrayLike(value)) {
    var array = (value);
    value = array.join(" ")
  }
  var attrStateName = goog.a11y.aria.getAriaAttributeName_(stateName);
  if(value === "" || value == undefined) {
    var defaultValueMap = goog.a11y.aria.datatables.getDefaultValuesMap();
    if(stateName in defaultValueMap) {
      element.setAttribute(attrStateName, defaultValueMap[stateName])
    }else {
      element.removeAttribute(attrStateName)
    }
  }else {
    element.setAttribute(attrStateName, value)
  }
};
goog.a11y.aria.removeState = function(element, stateName) {
  element.removeAttribute(goog.a11y.aria.getAriaAttributeName_(stateName))
};
goog.a11y.aria.getState = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  var isNullOrUndefined = attr == null || attr == undefined;
  return isNullOrUndefined ? "" : String(attr)
};
goog.a11y.aria.getActiveDescendant = function(element) {
  var id = goog.a11y.aria.getState(element, goog.a11y.aria.State.ACTIVEDESCENDANT);
  return goog.dom.getOwnerDocument(element).getElementById(id)
};
goog.a11y.aria.setActiveDescendant = function(element, activeElement) {
  var id = "";
  if(activeElement) {
    id = activeElement.id;
    goog.asserts.assert(id, "The active element should have an id.")
  }
  goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, id)
};
goog.a11y.aria.getLabel = function(element) {
  return goog.a11y.aria.getState(element, goog.a11y.aria.State.LABEL)
};
goog.a11y.aria.setLabel = function(element, label) {
  goog.a11y.aria.setState(element, goog.a11y.aria.State.LABEL, label)
};
goog.a11y.aria.assertRoleIsSetInternalUtil = function(element, allowedRoles) {
  if(goog.array.contains(goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_, element.tagName)) {
    return
  }
  var elementRole = (goog.a11y.aria.getRole(element));
  goog.asserts.assert(elementRole != null, "The element ARIA role cannot be null.");
  goog.asserts.assert(goog.array.contains(allowedRoles, elementRole), "Non existing or incorrect role set for element." + 'The role set is "' + elementRole + '". The role should be any of "' + allowedRoles + '". Check the ARIA specification for more details ' + "http://www.w3.org/TR/wai-aria/roles.")
};
goog.a11y.aria.getStateBoolean = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert(goog.isBoolean(attr) || (attr == null || (attr == "true" || attr == "false")));
  if(attr == null) {
    return attr
  }
  return goog.isBoolean(attr) ? attr : attr == "true"
};
goog.a11y.aria.getStateNumber = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert((attr == null || !isNaN(Number(attr))) && !goog.isBoolean(attr));
  return attr == null ? null : Number(attr)
};
goog.a11y.aria.getStateString = function(element, stateName) {
  var attr = element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
  goog.asserts.assert((attr == null || goog.isString(attr)) && (isNaN(Number(attr)) && (attr != "true" && attr != "false")));
  return attr == null ? null : attr
};
goog.a11y.aria.getStringArrayStateInternalUtil = function(element, stateName) {
  var attrValue = element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
  return goog.a11y.aria.splitStringOnWhitespace_(attrValue)
};
goog.a11y.aria.splitStringOnWhitespace_ = function(stringValue) {
  return stringValue ? stringValue.split(/\s+/) : []
};
goog.a11y.aria.getAriaAttributeName_ = function(ariaName) {
  if(goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.assert(ariaName, "ARIA attribute cannot be empty.");
    goog.asserts.assert(goog.object.containsValue(goog.a11y.aria.State, ariaName), "No such ARIA attribute " + ariaName)
  }
  return goog.a11y.aria.ARIA_PREFIX_ + ariaName
};
goog.provide("goog.events.KeyCodes");
goog.require("goog.userAgent");
goog.events.KeyCodes = {WIN_KEY_FF_LINUX:0, MAC_ENTER:3, BACKSPACE:8, TAB:9, NUM_CENTER:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, PAUSE:19, CAPS_LOCK:20, ESC:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, PRINT_SCREEN:44, INSERT:45, DELETE:46, ZERO:48, ONE:49, TWO:50, THREE:51, FOUR:52, FIVE:53, SIX:54, SEVEN:55, EIGHT:56, NINE:57, FF_SEMICOLON:59, FF_EQUALS:61, FF_DASH:173, QUESTION_MARK:63, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, 
L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, META:91, WIN_KEY_RIGHT:92, CONTEXT_MENU:93, NUM_ZERO:96, NUM_ONE:97, NUM_TWO:98, NUM_THREE:99, NUM_FOUR:100, NUM_FIVE:101, NUM_SIX:102, NUM_SEVEN:103, NUM_EIGHT:104, NUM_NINE:105, NUM_MULTIPLY:106, NUM_PLUS:107, NUM_MINUS:109, NUM_PERIOD:110, NUM_DIVISION:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, NUMLOCK:144, SCROLL_LOCK:145, FIRST_MEDIA_KEY:166, 
LAST_MEDIA_KEY:183, SEMICOLON:186, DASH:189, EQUALS:187, COMMA:188, PERIOD:190, SLASH:191, APOSTROPHE:192, TILDE:192, SINGLE_QUOTE:222, OPEN_SQUARE_BRACKET:219, BACKSLASH:220, CLOSE_SQUARE_BRACKET:221, WIN_KEY:224, MAC_FF_META:224, MAC_WK_CMD_LEFT:91, MAC_WK_CMD_RIGHT:93, WIN_IME:229, PHANTOM:255};
goog.events.KeyCodes.isTextModifyingKeyEvent = function(e) {
  if(e.altKey && !e.ctrlKey || (e.metaKey || e.keyCode >= goog.events.KeyCodes.F1 && e.keyCode <= goog.events.KeyCodes.F12)) {
    return false
  }
  switch(e.keyCode) {
    case goog.events.KeyCodes.ALT:
    ;
    case goog.events.KeyCodes.CAPS_LOCK:
    ;
    case goog.events.KeyCodes.CONTEXT_MENU:
    ;
    case goog.events.KeyCodes.CTRL:
    ;
    case goog.events.KeyCodes.DOWN:
    ;
    case goog.events.KeyCodes.END:
    ;
    case goog.events.KeyCodes.ESC:
    ;
    case goog.events.KeyCodes.HOME:
    ;
    case goog.events.KeyCodes.INSERT:
    ;
    case goog.events.KeyCodes.LEFT:
    ;
    case goog.events.KeyCodes.MAC_FF_META:
    ;
    case goog.events.KeyCodes.META:
    ;
    case goog.events.KeyCodes.NUMLOCK:
    ;
    case goog.events.KeyCodes.NUM_CENTER:
    ;
    case goog.events.KeyCodes.PAGE_DOWN:
    ;
    case goog.events.KeyCodes.PAGE_UP:
    ;
    case goog.events.KeyCodes.PAUSE:
    ;
    case goog.events.KeyCodes.PHANTOM:
    ;
    case goog.events.KeyCodes.PRINT_SCREEN:
    ;
    case goog.events.KeyCodes.RIGHT:
    ;
    case goog.events.KeyCodes.SCROLL_LOCK:
    ;
    case goog.events.KeyCodes.SHIFT:
    ;
    case goog.events.KeyCodes.UP:
    ;
    case goog.events.KeyCodes.WIN_KEY:
    ;
    case goog.events.KeyCodes.WIN_KEY_RIGHT:
      return false;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return!goog.userAgent.GECKO;
    default:
      return e.keyCode < goog.events.KeyCodes.FIRST_MEDIA_KEY || e.keyCode > goog.events.KeyCodes.LAST_MEDIA_KEY
  }
};
goog.events.KeyCodes.firesKeyPressEvent = function(keyCode, opt_heldKeyCode, opt_shiftKey, opt_ctrlKey, opt_altKey) {
  if(!goog.userAgent.IE && !(goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("525"))) {
    return true
  }
  if(goog.userAgent.MAC && opt_altKey) {
    return goog.events.KeyCodes.isCharacterKey(keyCode)
  }
  if(opt_altKey && !opt_ctrlKey) {
    return false
  }
  if(goog.isNumber(opt_heldKeyCode)) {
    opt_heldKeyCode = goog.events.KeyCodes.normalizeKeyCode(opt_heldKeyCode)
  }
  if(!opt_shiftKey && (opt_heldKeyCode == goog.events.KeyCodes.CTRL || (opt_heldKeyCode == goog.events.KeyCodes.ALT || goog.userAgent.MAC && opt_heldKeyCode == goog.events.KeyCodes.META))) {
    return false
  }
  if(goog.userAgent.WEBKIT && (opt_ctrlKey && opt_shiftKey)) {
    switch(keyCode) {
      case goog.events.KeyCodes.BACKSLASH:
      ;
      case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
      ;
      case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      ;
      case goog.events.KeyCodes.TILDE:
      ;
      case goog.events.KeyCodes.SEMICOLON:
      ;
      case goog.events.KeyCodes.DASH:
      ;
      case goog.events.KeyCodes.EQUALS:
      ;
      case goog.events.KeyCodes.COMMA:
      ;
      case goog.events.KeyCodes.PERIOD:
      ;
      case goog.events.KeyCodes.SLASH:
      ;
      case goog.events.KeyCodes.APOSTROPHE:
      ;
      case goog.events.KeyCodes.SINGLE_QUOTE:
        return false
    }
  }
  if(goog.userAgent.IE && (opt_ctrlKey && opt_heldKeyCode == keyCode)) {
    return false
  }
  switch(keyCode) {
    case goog.events.KeyCodes.ENTER:
      return!(goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9));
    case goog.events.KeyCodes.ESC:
      return!goog.userAgent.WEBKIT
  }
  return goog.events.KeyCodes.isCharacterKey(keyCode)
};
goog.events.KeyCodes.isCharacterKey = function(keyCode) {
  if(keyCode >= goog.events.KeyCodes.ZERO && keyCode <= goog.events.KeyCodes.NINE) {
    return true
  }
  if(keyCode >= goog.events.KeyCodes.NUM_ZERO && keyCode <= goog.events.KeyCodes.NUM_MULTIPLY) {
    return true
  }
  if(keyCode >= goog.events.KeyCodes.A && keyCode <= goog.events.KeyCodes.Z) {
    return true
  }
  if(goog.userAgent.WEBKIT && keyCode == 0) {
    return true
  }
  switch(keyCode) {
    case goog.events.KeyCodes.SPACE:
    ;
    case goog.events.KeyCodes.QUESTION_MARK:
    ;
    case goog.events.KeyCodes.NUM_PLUS:
    ;
    case goog.events.KeyCodes.NUM_MINUS:
    ;
    case goog.events.KeyCodes.NUM_PERIOD:
    ;
    case goog.events.KeyCodes.NUM_DIVISION:
    ;
    case goog.events.KeyCodes.SEMICOLON:
    ;
    case goog.events.KeyCodes.FF_SEMICOLON:
    ;
    case goog.events.KeyCodes.DASH:
    ;
    case goog.events.KeyCodes.EQUALS:
    ;
    case goog.events.KeyCodes.FF_EQUALS:
    ;
    case goog.events.KeyCodes.COMMA:
    ;
    case goog.events.KeyCodes.PERIOD:
    ;
    case goog.events.KeyCodes.SLASH:
    ;
    case goog.events.KeyCodes.APOSTROPHE:
    ;
    case goog.events.KeyCodes.SINGLE_QUOTE:
    ;
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
    ;
    case goog.events.KeyCodes.BACKSLASH:
    ;
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      return true;
    default:
      return false
  }
};
goog.events.KeyCodes.normalizeKeyCode = function(keyCode) {
  if(goog.userAgent.GECKO) {
    return goog.events.KeyCodes.normalizeGeckoKeyCode(keyCode)
  }else {
    if(goog.userAgent.MAC && goog.userAgent.WEBKIT) {
      return goog.events.KeyCodes.normalizeMacWebKitKeyCode(keyCode)
    }else {
      return keyCode
    }
  }
};
goog.events.KeyCodes.normalizeGeckoKeyCode = function(keyCode) {
  switch(keyCode) {
    case goog.events.KeyCodes.FF_EQUALS:
      return goog.events.KeyCodes.EQUALS;
    case goog.events.KeyCodes.FF_SEMICOLON:
      return goog.events.KeyCodes.SEMICOLON;
    case goog.events.KeyCodes.FF_DASH:
      return goog.events.KeyCodes.DASH;
    case goog.events.KeyCodes.MAC_FF_META:
      return goog.events.KeyCodes.META;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return goog.events.KeyCodes.WIN_KEY;
    default:
      return keyCode
  }
};
goog.events.KeyCodes.normalizeMacWebKitKeyCode = function(keyCode) {
  switch(keyCode) {
    case goog.events.KeyCodes.MAC_WK_CMD_RIGHT:
      return goog.events.KeyCodes.META;
    default:
      return keyCode
  }
};
goog.provide("goog.ui.tree.BaseNode");
goog.provide("goog.ui.tree.BaseNode.EventType");
goog.require("goog.Timer");
goog.require("goog.a11y.aria");
goog.require("goog.asserts");
goog.require("goog.events.KeyCodes");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.userAgent");
goog.ui.tree.BaseNode = function(html, opt_config, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.config_ = opt_config || goog.ui.tree.TreeControl.defaultConfig;
  this.html_ = html
};
goog.inherits(goog.ui.tree.BaseNode, goog.ui.Component);
goog.ui.tree.BaseNode.EventType = {BEFORE_EXPAND:"beforeexpand", EXPAND:"expand", BEFORE_COLLAPSE:"beforecollapse", COLLAPSE:"collapse"};
goog.ui.tree.BaseNode.allNodes = {};
goog.ui.tree.BaseNode.prototype.selected_ = false;
goog.ui.tree.BaseNode.prototype.expanded_ = false;
goog.ui.tree.BaseNode.prototype.toolTip_ = null;
goog.ui.tree.BaseNode.prototype.afterLabelHtml_ = "";
goog.ui.tree.BaseNode.prototype.isUserCollapsible_ = true;
goog.ui.tree.BaseNode.prototype.depth_ = -1;
goog.ui.tree.BaseNode.prototype.disposeInternal = function() {
  goog.ui.tree.BaseNode.superClass_.disposeInternal.call(this);
  if(this.tree_) {
    this.tree_.removeNode(this);
    this.tree_ = null
  }
  this.setElementInternal(null)
};
goog.ui.tree.BaseNode.prototype.initAccessibility = function() {
  var el = this.getElement();
  if(el) {
    var label = this.getLabelElement();
    if(label && !label.id) {
      label.id = this.getId() + ".label"
    }
    goog.a11y.aria.setRole(el, "treeitem");
    goog.a11y.aria.setState(el, "selected", false);
    goog.a11y.aria.setState(el, "expanded", false);
    goog.a11y.aria.setState(el, "level", this.getDepth());
    if(label) {
      goog.a11y.aria.setState(el, "labelledby", label.id)
    }
    var img = this.getIconElement();
    if(img) {
      goog.a11y.aria.setRole(img, "presentation")
    }
    var ei = this.getExpandIconElement();
    if(ei) {
      goog.a11y.aria.setRole(ei, "presentation")
    }
    var ce = this.getChildrenElement();
    if(ce) {
      goog.a11y.aria.setRole(ce, "group");
      if(ce.hasChildNodes()) {
        var count = this.getChildCount();
        for(var i = 1;i <= count;i++) {
          var child = this.getChildAt(i - 1).getElement();
          goog.asserts.assert(child, "The child element cannot be null");
          goog.a11y.aria.setState(child, "setsize", count);
          goog.a11y.aria.setState(child, "posinset", i)
        }
      }
    }
  }
};
goog.ui.tree.BaseNode.prototype.createDom = function() {
  var sb = new goog.string.StringBuffer;
  this.toHtml(sb);
  var element = this.getDomHelper().htmlToDocumentFragment(sb.toString());
  this.setElementInternal((element))
};
goog.ui.tree.BaseNode.prototype.enterDocument = function() {
  goog.ui.tree.BaseNode.superClass_.enterDocument.call(this);
  goog.ui.tree.BaseNode.allNodes[this.getId()] = this;
  this.initAccessibility()
};
goog.ui.tree.BaseNode.prototype.exitDocument = function() {
  goog.ui.tree.BaseNode.superClass_.exitDocument.call(this);
  delete goog.ui.tree.BaseNode.allNodes[this.getId()]
};
goog.ui.tree.BaseNode.prototype.addChildAt = function(child, index, opt_render) {
  goog.asserts.assert(!child.getParent());
  var prevNode = this.getChildAt(index - 1);
  var nextNode = this.getChildAt(index);
  goog.ui.tree.BaseNode.superClass_.addChildAt.call(this, child, index);
  child.previousSibling_ = prevNode;
  child.nextSibling_ = nextNode;
  if(prevNode) {
    prevNode.nextSibling_ = child
  }else {
    this.firstChild_ = child
  }
  if(nextNode) {
    nextNode.previousSibling_ = child
  }else {
    this.lastChild_ = child
  }
  var tree = this.getTree();
  if(tree) {
    child.setTreeInternal(tree)
  }
  child.setDepth_(this.getDepth() + 1);
  if(this.getElement()) {
    this.updateExpandIcon();
    if(this.getExpanded()) {
      var el = this.getChildrenElement();
      if(!child.getElement()) {
        child.createDom()
      }
      var childElement = child.getElement();
      var nextElement = nextNode && nextNode.getElement();
      el.insertBefore(childElement, nextElement);
      if(this.isInDocument()) {
        child.enterDocument()
      }
      if(!nextNode) {
        if(prevNode) {
          prevNode.updateExpandIcon()
        }else {
          goog.style.setElementShown(el, true);
          this.setExpanded(this.getExpanded())
        }
      }
    }
  }
};
goog.ui.tree.BaseNode.prototype.add = function(child, opt_before) {
  goog.asserts.assert(!opt_before || opt_before.getParent() == this, "Can only add nodes before siblings");
  if(child.getParent()) {
    child.getParent().removeChild(child)
  }
  this.addChildAt(child, opt_before ? this.indexOfChild(opt_before) : this.getChildCount());
  return child
};
goog.ui.tree.BaseNode.prototype.removeChild = function(childNode, opt_unrender) {
  var child = (childNode);
  var tree = this.getTree();
  var selectedNode = tree ? tree.getSelectedItem() : null;
  if(selectedNode == child || child.contains(selectedNode)) {
    if(tree.hasFocus()) {
      this.select();
      goog.Timer.callOnce(this.onTimeoutSelect_, 10, this)
    }else {
      this.select()
    }
  }
  goog.ui.tree.BaseNode.superClass_.removeChild.call(this, child);
  if(this.lastChild_ == child) {
    this.lastChild_ = child.previousSibling_
  }
  if(this.firstChild_ == child) {
    this.firstChild_ = child.nextSibling_
  }
  if(child.previousSibling_) {
    child.previousSibling_.nextSibling_ = child.nextSibling_
  }
  if(child.nextSibling_) {
    child.nextSibling_.previousSibling_ = child.previousSibling_
  }
  var wasLast = child.isLastSibling();
  child.tree_ = null;
  child.depth_ = -1;
  if(tree) {
    tree.removeNode(this);
    if(this.isInDocument()) {
      var el = this.getChildrenElement();
      if(child.isInDocument()) {
        var childEl = child.getElement();
        el.removeChild(childEl);
        child.exitDocument()
      }
      if(wasLast) {
        var newLast = this.getLastChild();
        if(newLast) {
          newLast.updateExpandIcon()
        }
      }
      if(!this.hasChildren()) {
        el.style.display = "none";
        this.updateExpandIcon();
        this.updateIcon_()
      }
    }
  }
  return child
};
goog.ui.tree.BaseNode.prototype.remove = goog.ui.tree.BaseNode.prototype.removeChild;
goog.ui.tree.BaseNode.prototype.onTimeoutSelect_ = function() {
  this.select()
};
goog.ui.tree.BaseNode.prototype.getTree = goog.abstractMethod;
goog.ui.tree.BaseNode.prototype.getDepth = function() {
  var depth = this.depth_;
  if(depth < 0) {
    depth = this.computeDepth_();
    this.setDepth_(depth)
  }
  return depth
};
goog.ui.tree.BaseNode.prototype.computeDepth_ = function() {
  var parent = this.getParent();
  if(parent) {
    return parent.getDepth() + 1
  }else {
    return 0
  }
};
goog.ui.tree.BaseNode.prototype.setDepth_ = function(depth) {
  if(depth != this.depth_) {
    this.depth_ = depth;
    var row = this.getRowElement();
    if(row) {
      var indent = this.getPixelIndent_() + "px";
      if(this.isRightToLeft()) {
        row.style.paddingRight = indent
      }else {
        row.style.paddingLeft = indent
      }
    }
    this.forEachChild(function(child) {
      child.setDepth_(depth + 1)
    })
  }
};
goog.ui.tree.BaseNode.prototype.contains = function(node) {
  var current = node;
  while(current) {
    if(current == this) {
      return true
    }
    current = current.getParent()
  }
  return false
};
goog.ui.tree.BaseNode.EMPTY_CHILDREN_ = [];
goog.ui.tree.BaseNode.prototype.getChildAt;
goog.ui.tree.BaseNode.prototype.getChildren = function() {
  var children = [];
  this.forEachChild(function(child) {
    children.push(child)
  });
  return children
};
goog.ui.tree.BaseNode.prototype.getFirstChild = function() {
  return this.getChildAt(0)
};
goog.ui.tree.BaseNode.prototype.getLastChild = function() {
  return this.getChildAt(this.getChildCount() - 1)
};
goog.ui.tree.BaseNode.prototype.getPreviousSibling = function() {
  return this.previousSibling_
};
goog.ui.tree.BaseNode.prototype.getNextSibling = function() {
  return this.nextSibling_
};
goog.ui.tree.BaseNode.prototype.isLastSibling = function() {
  return!this.nextSibling_
};
goog.ui.tree.BaseNode.prototype.isSelected = function() {
  return this.selected_
};
goog.ui.tree.BaseNode.prototype.select = function() {
  var tree = this.getTree();
  if(tree) {
    tree.setSelectedItem(this)
  }
};
goog.ui.tree.BaseNode.prototype.deselect = goog.nullFunction;
goog.ui.tree.BaseNode.prototype.setSelectedInternal = function(selected) {
  if(this.selected_ == selected) {
    return
  }
  this.selected_ = selected;
  this.updateRow();
  var el = this.getElement();
  if(el) {
    goog.a11y.aria.setState(el, "selected", selected);
    if(selected) {
      var treeElement = this.getTree().getElement();
      goog.asserts.assert(treeElement, "The DOM element for the tree cannot be null");
      goog.a11y.aria.setState(treeElement, "activedescendant", this.getId())
    }
  }
};
goog.ui.tree.BaseNode.prototype.getExpanded = function() {
  return this.expanded_
};
goog.ui.tree.BaseNode.prototype.setExpandedInternal = function(expanded) {
  this.expanded_ = expanded
};
goog.ui.tree.BaseNode.prototype.setExpanded = function(expanded) {
  var isStateChange = expanded != this.expanded_;
  if(isStateChange) {
    var prevented = !this.dispatchEvent(expanded ? goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND : goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE);
    if(prevented) {
      return
    }
  }
  var ce;
  this.expanded_ = expanded;
  var tree = this.getTree();
  var el = this.getElement();
  if(this.hasChildren()) {
    if(!expanded && (tree && this.contains(tree.getSelectedItem()))) {
      this.select()
    }
    if(el) {
      ce = this.getChildrenElement();
      if(ce) {
        goog.style.setElementShown(ce, expanded);
        if(expanded && (this.isInDocument() && !ce.hasChildNodes())) {
          var sb = new goog.string.StringBuffer;
          this.forEachChild(function(child) {
            child.toHtml(sb)
          });
          ce.innerHTML = sb.toString();
          this.forEachChild(function(child) {
            child.enterDocument()
          })
        }
      }
      this.updateExpandIcon()
    }
  }else {
    ce = this.getChildrenElement();
    if(ce) {
      goog.style.setElementShown(ce, false)
    }
  }
  if(el) {
    this.updateIcon_();
    goog.a11y.aria.setState(el, "expanded", expanded)
  }
  if(isStateChange) {
    this.dispatchEvent(expanded ? goog.ui.tree.BaseNode.EventType.EXPAND : goog.ui.tree.BaseNode.EventType.COLLAPSE)
  }
};
goog.ui.tree.BaseNode.prototype.toggle = function() {
  this.setExpanded(!this.getExpanded())
};
goog.ui.tree.BaseNode.prototype.expand = function() {
  this.setExpanded(true)
};
goog.ui.tree.BaseNode.prototype.collapse = function() {
  this.setExpanded(false)
};
goog.ui.tree.BaseNode.prototype.collapseChildren = function() {
  this.forEachChild(function(child) {
    child.collapseAll()
  })
};
goog.ui.tree.BaseNode.prototype.collapseAll = function() {
  this.collapseChildren();
  this.collapse()
};
goog.ui.tree.BaseNode.prototype.expandChildren = function() {
  this.forEachChild(function(child) {
    child.expandAll()
  })
};
goog.ui.tree.BaseNode.prototype.expandAll = function() {
  this.expandChildren();
  this.expand()
};
goog.ui.tree.BaseNode.prototype.reveal = function() {
  var parent = this.getParent();
  if(parent) {
    parent.setExpanded(true);
    parent.reveal()
  }
};
goog.ui.tree.BaseNode.prototype.setIsUserCollapsible = function(isCollapsible) {
  this.isUserCollapsible_ = isCollapsible;
  if(!this.isUserCollapsible_) {
    this.expand()
  }
  if(this.getElement()) {
    this.updateExpandIcon()
  }
};
goog.ui.tree.BaseNode.prototype.isUserCollapsible = function() {
  return this.isUserCollapsible_
};
goog.ui.tree.BaseNode.prototype.toHtml = function(sb) {
  var tree = this.getTree();
  var hideLines = !tree.getShowLines() || tree == this.getParent() && !tree.getShowRootLines();
  var childClass = hideLines ? this.config_.cssChildrenNoLines : this.config_.cssChildren;
  var nonEmptyAndExpanded = this.getExpanded() && this.hasChildren();
  sb.append('<div class="', this.config_.cssItem, '" id="', this.getId(), '">', this.getRowHtml(), '<div class="', childClass, '" style="', this.getLineStyle(), nonEmptyAndExpanded ? "" : "display:none;", '">');
  if(nonEmptyAndExpanded) {
    this.forEachChild(function(child) {
      child.toHtml(sb)
    })
  }
  sb.append("</div></div>")
};
goog.ui.tree.BaseNode.prototype.getPixelIndent_ = function() {
  return Math.max(0, (this.getDepth() - 1) * this.config_.indentWidth)
};
goog.ui.tree.BaseNode.prototype.getRowHtml = function() {
  var sb = new goog.string.StringBuffer;
  sb.append('<div class="', this.getRowClassName(), '" style="padding-', this.isRightToLeft() ? "right:" : "left:", this.getPixelIndent_(), 'px">', this.getExpandIconHtml(), this.getIconHtml(), this.getLabelHtml(), "</div>");
  return sb.toString()
};
goog.ui.tree.BaseNode.prototype.getRowClassName = function() {
  var selectedClass;
  if(this.isSelected()) {
    selectedClass = " " + this.config_.cssSelectedRow
  }else {
    selectedClass = ""
  }
  return this.config_.cssTreeRow + selectedClass
};
goog.ui.tree.BaseNode.prototype.getLabelHtml = function() {
  var toolTip = this.getToolTip();
  var sb = new goog.string.StringBuffer;
  sb.append('<span class="', this.config_.cssItemLabel, '"', toolTip ? ' title="' + goog.string.htmlEscape(toolTip) + '"' : "", ">", this.getHtml(), "</span>", "<span>", this.getAfterLabelHtml(), "</span>");
  return sb.toString()
};
goog.ui.tree.BaseNode.prototype.getAfterLabelHtml = function() {
  return this.afterLabelHtml_
};
goog.ui.tree.BaseNode.prototype.setAfterLabelHtml = function(html) {
  this.afterLabelHtml_ = html;
  var el = this.getAfterLabelElement();
  if(el) {
    el.innerHTML = html
  }
};
goog.ui.tree.BaseNode.prototype.getIconHtml = function() {
  return'<span style="display:inline-block" class="' + this.getCalculatedIconClass() + '"></span>'
};
goog.ui.tree.BaseNode.prototype.getCalculatedIconClass = goog.abstractMethod;
goog.ui.tree.BaseNode.prototype.getExpandIconHtml = function() {
  return'<span type="expand" style="display:inline-block" class="' + this.getExpandIconClass() + '"></span>'
};
goog.ui.tree.BaseNode.prototype.getExpandIconClass = function() {
  var tree = this.getTree();
  var hideLines = !tree.getShowLines() || tree == this.getParent() && !tree.getShowRootLines();
  var config = this.config_;
  var sb = new goog.string.StringBuffer;
  sb.append(config.cssTreeIcon, " ", config.cssExpandTreeIcon, " ");
  if(this.hasChildren()) {
    var bits = 0;
    if(tree.getShowExpandIcons() && this.isUserCollapsible_) {
      if(this.getExpanded()) {
        bits = 2
      }else {
        bits = 1
      }
    }
    if(!hideLines) {
      if(this.isLastSibling()) {
        bits += 4
      }else {
        bits += 8
      }
    }
    switch(bits) {
      case 1:
        sb.append(config.cssExpandTreeIconPlus);
        break;
      case 2:
        sb.append(config.cssExpandTreeIconMinus);
        break;
      case 4:
        sb.append(config.cssExpandTreeIconL);
        break;
      case 5:
        sb.append(config.cssExpandTreeIconLPlus);
        break;
      case 6:
        sb.append(config.cssExpandTreeIconLMinus);
        break;
      case 8:
        sb.append(config.cssExpandTreeIconT);
        break;
      case 9:
        sb.append(config.cssExpandTreeIconTPlus);
        break;
      case 10:
        sb.append(config.cssExpandTreeIconTMinus);
        break;
      default:
        sb.append(config.cssExpandTreeIconBlank)
    }
  }else {
    if(hideLines) {
      sb.append(config.cssExpandTreeIconBlank)
    }else {
      if(this.isLastSibling()) {
        sb.append(config.cssExpandTreeIconL)
      }else {
        sb.append(config.cssExpandTreeIconT)
      }
    }
  }
  return sb.toString()
};
goog.ui.tree.BaseNode.prototype.getLineStyle = function() {
  return"background-position:" + this.getLineStyle2() + ";"
};
goog.ui.tree.BaseNode.prototype.getLineStyle2 = function() {
  return(this.isLastSibling() ? "-100" : (this.getDepth() - 1) * this.config_.indentWidth) + "px 0"
};
goog.ui.tree.BaseNode.prototype.getElement = function() {
  var el = goog.ui.tree.BaseNode.superClass_.getElement.call(this);
  if(!el) {
    el = this.getDomHelper().getElement(this.getId());
    this.setElementInternal(el)
  }
  return el
};
goog.ui.tree.BaseNode.prototype.getRowElement = function() {
  var el = this.getElement();
  return el ? (el.firstChild) : null
};
goog.ui.tree.BaseNode.prototype.getExpandIconElement = function() {
  var el = this.getRowElement();
  return el ? (el.firstChild) : null
};
goog.ui.tree.BaseNode.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? (el.childNodes[1]) : null
};
goog.ui.tree.BaseNode.prototype.getLabelElement = function() {
  var el = this.getRowElement();
  return el && el.lastChild ? (el.lastChild.previousSibling) : null
};
goog.ui.tree.BaseNode.prototype.getAfterLabelElement = function() {
  var el = this.getRowElement();
  return el ? (el.lastChild) : null
};
goog.ui.tree.BaseNode.prototype.getChildrenElement = function() {
  var el = this.getElement();
  return el ? (el.lastChild) : null
};
goog.ui.tree.BaseNode.prototype.setIconClass = function(s) {
  this.iconClass_ = s;
  if(this.isInDocument()) {
    this.updateIcon_()
  }
};
goog.ui.tree.BaseNode.prototype.getIconClass = function() {
  return this.iconClass_
};
goog.ui.tree.BaseNode.prototype.setExpandedIconClass = function(s) {
  this.expandedIconClass_ = s;
  if(this.isInDocument()) {
    this.updateIcon_()
  }
};
goog.ui.tree.BaseNode.prototype.getExpandedIconClass = function() {
  return this.expandedIconClass_
};
goog.ui.tree.BaseNode.prototype.setText = function(s) {
  this.setHtml(goog.string.htmlEscape(s))
};
goog.ui.tree.BaseNode.prototype.getText = function() {
  return goog.string.unescapeEntities(this.getHtml())
};
goog.ui.tree.BaseNode.prototype.setHtml = function(s) {
  this.html_ = s;
  var el = this.getLabelElement();
  if(el) {
    el.innerHTML = s
  }
  var tree = this.getTree();
  if(tree) {
    tree.setNode(this)
  }
};
goog.ui.tree.BaseNode.prototype.getHtml = function() {
  return this.html_
};
goog.ui.tree.BaseNode.prototype.setToolTip = function(s) {
  this.toolTip_ = s;
  var el = this.getLabelElement();
  if(el) {
    el.title = s
  }
};
goog.ui.tree.BaseNode.prototype.getToolTip = function() {
  return this.toolTip_
};
goog.ui.tree.BaseNode.prototype.updateRow = function() {
  var rowEl = this.getRowElement();
  if(rowEl) {
    rowEl.className = this.getRowClassName()
  }
};
goog.ui.tree.BaseNode.prototype.updateExpandIcon = function() {
  var img = this.getExpandIconElement();
  if(img) {
    img.className = this.getExpandIconClass()
  }
  var cel = this.getChildrenElement();
  if(cel) {
    cel.style.backgroundPosition = this.getLineStyle2()
  }
};
goog.ui.tree.BaseNode.prototype.updateIcon_ = function() {
  this.getIconElement().className = this.getCalculatedIconClass()
};
goog.ui.tree.BaseNode.prototype.onMouseDown = function(e) {
  var el = e.target;
  var type = el.getAttribute("type");
  if(type == "expand" && this.hasChildren()) {
    if(this.isUserCollapsible_) {
      this.toggle()
    }
    return
  }
  this.select();
  this.updateRow()
};
goog.ui.tree.BaseNode.prototype.onClick_ = goog.events.Event.preventDefault;
goog.ui.tree.BaseNode.prototype.onDoubleClick_ = function(e) {
  var el = e.target;
  var type = el.getAttribute("type");
  if(type == "expand" && this.hasChildren()) {
    return
  }
  if(this.isUserCollapsible_) {
    this.toggle()
  }
};
goog.ui.tree.BaseNode.prototype.onKeyDown = function(e) {
  var handled = true;
  switch(e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
      if(e.altKey) {
        break
      }
      if(this.hasChildren()) {
        if(!this.getExpanded()) {
          this.setExpanded(true)
        }else {
          this.getFirstChild().select()
        }
      }
      break;
    case goog.events.KeyCodes.LEFT:
      if(e.altKey) {
        break
      }
      if(this.hasChildren() && (this.getExpanded() && this.isUserCollapsible_)) {
        this.setExpanded(false)
      }else {
        var parent = this.getParent();
        var tree = this.getTree();
        if(parent && (tree.getShowRootNode() || parent != tree)) {
          parent.select()
        }
      }
      break;
    case goog.events.KeyCodes.DOWN:
      var nextNode = this.getNextShownNode();
      if(nextNode) {
        nextNode.select()
      }
      break;
    case goog.events.KeyCodes.UP:
      var previousNode = this.getPreviousShownNode();
      if(previousNode) {
        previousNode.select()
      }
      break;
    default:
      handled = false
  }
  if(handled) {
    e.preventDefault();
    var tree = this.getTree();
    if(tree) {
      tree.clearTypeAhead()
    }
  }
  return handled
};
goog.ui.tree.BaseNode.prototype.onKeyPress_ = function(e) {
  if(!e.altKey && (e.keyCode >= goog.events.KeyCodes.LEFT && e.keyCode <= goog.events.KeyCodes.DOWN)) {
    e.preventDefault()
  }
};
goog.ui.tree.BaseNode.prototype.getLastShownDescendant = function() {
  if(!this.getExpanded() || !this.hasChildren()) {
    return this
  }
  return this.getLastChild().getLastShownDescendant()
};
goog.ui.tree.BaseNode.prototype.getNextShownNode = function() {
  if(this.hasChildren() && this.getExpanded()) {
    return this.getFirstChild()
  }else {
    var parent = this;
    var next;
    while(parent != this.getTree()) {
      next = parent.getNextSibling();
      if(next != null) {
        return next
      }
      parent = parent.getParent()
    }
    return null
  }
};
goog.ui.tree.BaseNode.prototype.getPreviousShownNode = function() {
  var ps = this.getPreviousSibling();
  if(ps != null) {
    return ps.getLastShownDescendant()
  }
  var parent = this.getParent();
  var tree = this.getTree();
  if(!tree.getShowRootNode() && parent == tree) {
    return null
  }
  return(parent)
};
goog.ui.tree.BaseNode.prototype.getClientData = goog.ui.tree.BaseNode.prototype.getModel;
goog.ui.tree.BaseNode.prototype.setClientData = goog.ui.tree.BaseNode.prototype.setModel;
goog.ui.tree.BaseNode.prototype.getConfig = function() {
  return this.config_
};
goog.ui.tree.BaseNode.prototype.setTreeInternal = function(tree) {
  if(this.tree_ != tree) {
    this.tree_ = tree;
    tree.setNode(this);
    this.forEachChild(function(child) {
      child.setTreeInternal(tree)
    })
  }
};
goog.provide("goog.ui.tree.TreeNode");
goog.require("goog.ui.tree.BaseNode");
goog.ui.tree.TreeNode = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.BaseNode.call(this, html, opt_config, opt_domHelper)
};
goog.inherits(goog.ui.tree.TreeNode, goog.ui.tree.BaseNode);
goog.ui.tree.TreeNode.prototype.tree_ = null;
goog.ui.tree.TreeNode.prototype.getTree = function() {
  if(this.tree_) {
    return this.tree_
  }
  var parent = this.getParent();
  if(parent) {
    var tree = parent.getTree();
    if(tree) {
      this.setTreeInternal(tree);
      return tree
    }
  }
  return null
};
goog.ui.tree.TreeNode.prototype.getCalculatedIconClass = function() {
  var expanded = this.getExpanded();
  if(expanded && this.expandedIconClass_) {
    return this.expandedIconClass_
  }
  if(!expanded && this.iconClass_) {
    return this.iconClass_
  }
  var config = this.getConfig();
  if(this.hasChildren()) {
    if(expanded && config.cssExpandedFolderIcon) {
      return config.cssTreeIcon + " " + config.cssExpandedFolderIcon
    }else {
      if(!expanded && config.cssCollapsedFolderIcon) {
        return config.cssTreeIcon + " " + config.cssCollapsedFolderIcon
      }
    }
  }else {
    if(config.cssFileIcon) {
      return config.cssTreeIcon + " " + config.cssFileIcon
    }
  }
  return""
};
goog.provide("Blockly.BlockSvgFramed");
var FRAME_MARGIN_SIDE = 15;
var FRAME_MARGIN_TOP = 10;
var FRAME_MARGIN_BOTTOM = 5;
var FRAME_HEADER_HEIGHT = 25;
Blockly.BlockSvgFramed = function(block) {
  Blockly.BlockSvg.call(this, block)
};
goog.inherits(Blockly.BlockSvgFramed, Blockly.BlockSvg);
Blockly.BlockSvgFramed.prototype.initChildren = function() {
  var clip = Blockly.createSvgElement("clipPath", {id:"frameClip" + this.block_.id}, this.svgGroup_);
  this.frameClipRect_ = Blockly.createSvgElement("rect", {x:-FRAME_MARGIN_SIDE, y:-(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT), height:FRAME_HEADER_HEIGHT, width:"100%"}, clip);
  this.frameBase_ = Blockly.createSvgElement("rect", {x:-FRAME_MARGIN_SIDE, y:-(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT), fill:"#dddddd", stroke:"#aaaaaa", rx:15, ry:15}, this.svgGroup_);
  this.frameHeader_ = Blockly.createSvgElement("rect", {x:-FRAME_MARGIN_SIDE, y:-(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT), fill:"#aaaaaa", rx:15, ry:15, "clip-path":"url(#frameClip" + this.block_.id + ")"}, this.svgGroup_);
  this.frameText_ = Blockly.createSvgElement("text", {"class":"blocklyText", style:"font-size: 12pt"}, this.svgGroup_);
  this.frameText_.appendChild(document.createTextNode(Blockly.Msg.FUNCTION_HEADER));
  goog.base(this, "initChildren")
};
Blockly.BlockSvgFramed.prototype.renderDraw_ = function(iconWidth, inputRows) {
  goog.base(this, "renderDraw_", iconWidth, inputRows);
  var groupRect = this.svgPath_.getBoundingClientRect();
  var width = groupRect.width + 2 * FRAME_MARGIN_SIDE;
  var height = groupRect.height + FRAME_MARGIN_TOP + FRAME_MARGIN_BOTTOM + FRAME_HEADER_HEIGHT;
  this.frameBase_.setAttribute("width", width);
  this.frameBase_.setAttribute("height", height);
  this.frameHeader_.setAttribute("width", width);
  this.frameHeader_.setAttribute("height", height);
  if(Blockly.RTL) {
    this.frameClipRect_.setAttribute("x", -width + FRAME_MARGIN_SIDE);
    this.frameHeader_.setAttribute("x", -width + FRAME_MARGIN_SIDE);
    this.frameBase_.setAttribute("x", -width + FRAME_MARGIN_SIDE);
    this.frameText_.setAttribute("x", -width + 2 * FRAME_MARGIN_SIDE)
  }
  if(!this.frameText_.getAttribute("y")) {
    var textHeight = Math.abs(this.frameText_.getBoundingClientRect().top - this.svgPathDark_.getBoundingClientRect().top);
    this.frameText_.setAttribute("y", -(FRAME_MARGIN_TOP + (FRAME_HEADER_HEIGHT - textHeight) / 2))
  }
};
Blockly.BlockSvgFramed.prototype.dispose = function() {
  goog.base(this, "dispose");
  this.frameClipRect_ = null;
  this.frameBase_ = null;
  this.frameHeader_ = null;
  this.frameText_ = null
};
goog.provide("goog.dom.classlist");
goog.require("goog.array");
goog.define("goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST", false);
goog.dom.classlist.get = function(element) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList
  }
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || []
};
goog.dom.classlist.set = function(element, className) {
  element.className = className
};
goog.dom.classlist.contains = function(element, className) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList.contains(className)
  }
  return goog.array.contains(goog.dom.classlist.get(element), className)
};
goog.dom.classlist.add = function(element, className) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.add(className);
    return
  }
  if(!goog.dom.classlist.contains(element, className)) {
    element.className += element.className.length > 0 ? " " + className : className
  }
};
goog.dom.classlist.addAll = function(element, classesToAdd) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    goog.array.forEach(classesToAdd, function(className) {
      goog.dom.classlist.add(element, className)
    });
    return
  }
  var classMap = {};
  goog.array.forEach(goog.dom.classlist.get(element), function(className) {
    classMap[className] = true
  });
  goog.array.forEach(classesToAdd, function(className) {
    classMap[className] = true
  });
  element.className = "";
  for(var className in classMap) {
    element.className += element.className.length > 0 ? " " + className : className
  }
};
goog.dom.classlist.remove = function(element, className) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.remove(className);
    return
  }
  if(goog.dom.classlist.contains(element, className)) {
    element.className = goog.array.filter(goog.dom.classlist.get(element), function(c) {
      return c != className
    }).join(" ")
  }
};
goog.dom.classlist.removeAll = function(element, classesToRemove) {
  if(goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    goog.array.forEach(classesToRemove, function(className) {
      goog.dom.classlist.remove(element, className)
    });
    return
  }
  element.className = goog.array.filter(goog.dom.classlist.get(element), function(className) {
    return!goog.array.contains(classesToRemove, className)
  }).join(" ")
};
goog.dom.classlist.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classlist.add(element, className)
  }else {
    goog.dom.classlist.remove(element, className)
  }
};
goog.dom.classlist.swap = function(element, fromClass, toClass) {
  if(goog.dom.classlist.contains(element, fromClass)) {
    goog.dom.classlist.remove(element, fromClass);
    goog.dom.classlist.add(element, toClass);
    return true
  }
  return false
};
goog.dom.classlist.toggle = function(element, className) {
  var add = !goog.dom.classlist.contains(element, className);
  goog.dom.classlist.enable(element, className, add);
  return add
};
goog.dom.classlist.addRemove = function(element, classToRemove, classToAdd) {
  goog.dom.classlist.remove(element, classToRemove);
  goog.dom.classlist.add(element, classToAdd)
};
goog.provide("goog.ui.registry");
goog.require("goog.dom.classlist");
goog.ui.registry.getDefaultRenderer = function(componentCtor) {
  var key;
  var rendererCtor;
  while(componentCtor) {
    key = goog.getUid(componentCtor);
    if(rendererCtor = goog.ui.registry.defaultRenderers_[key]) {
      break
    }
    componentCtor = componentCtor.superClass_ ? componentCtor.superClass_.constructor : null
  }
  if(rendererCtor) {
    return goog.isFunction(rendererCtor.getInstance) ? rendererCtor.getInstance() : new rendererCtor
  }
  return null
};
goog.ui.registry.setDefaultRenderer = function(componentCtor, rendererCtor) {
  if(!goog.isFunction(componentCtor)) {
    throw Error("Invalid component class " + componentCtor);
  }
  if(!goog.isFunction(rendererCtor)) {
    throw Error("Invalid renderer class " + rendererCtor);
  }
  var key = goog.getUid(componentCtor);
  goog.ui.registry.defaultRenderers_[key] = rendererCtor
};
goog.ui.registry.getDecoratorByClassName = function(className) {
  return className in goog.ui.registry.decoratorFunctions_ ? goog.ui.registry.decoratorFunctions_[className]() : null
};
goog.ui.registry.setDecoratorByClassName = function(className, decoratorFn) {
  if(!className) {
    throw Error("Invalid class name " + className);
  }
  if(!goog.isFunction(decoratorFn)) {
    throw Error("Invalid decorator function " + decoratorFn);
  }
  goog.ui.registry.decoratorFunctions_[className] = decoratorFn
};
goog.ui.registry.getDecorator = function(element) {
  var decorator;
  var classNames = goog.dom.classlist.get(element);
  for(var i = 0, len = classNames.length;i < len;i++) {
    if(decorator = goog.ui.registry.getDecoratorByClassName(classNames[i])) {
      return decorator
    }
  }
  return null
};
goog.ui.registry.reset = function() {
  goog.ui.registry.defaultRenderers_ = {};
  goog.ui.registry.decoratorFunctions_ = {}
};
goog.ui.registry.defaultRenderers_ = {};
goog.ui.registry.decoratorFunctions_ = {};
goog.provide("goog.ui.ContainerRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.classlist");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.ui.ContainerRenderer = function(opt_ariaRole) {
  this.ariaRole_ = opt_ariaRole
};
goog.addSingletonGetter(goog.ui.ContainerRenderer);
goog.ui.ContainerRenderer.getCustomRenderer = function(ctor, cssClassName) {
  var renderer = new ctor;
  renderer.getCssClass = function() {
    return cssClassName
  };
  return renderer
};
goog.ui.ContainerRenderer.CSS_CLASS = goog.getCssName("goog-container");
goog.ui.ContainerRenderer.prototype.getAriaRole = function() {
  return this.ariaRole_
};
goog.ui.ContainerRenderer.prototype.enableTabIndex = function(element, enable) {
  if(element) {
    element.tabIndex = enable ? 0 : -1
  }
};
goog.ui.ContainerRenderer.prototype.createDom = function(container) {
  return container.getDomHelper().createDom("div", this.getClassNames(container).join(" "))
};
goog.ui.ContainerRenderer.prototype.getContentElement = function(element) {
  return element
};
goog.ui.ContainerRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "DIV"
};
goog.ui.ContainerRenderer.prototype.decorate = function(container, element) {
  if(element.id) {
    container.setId(element.id)
  }
  var baseClass = this.getCssClass();
  var hasBaseClass = false;
  var classNames = goog.dom.classlist.get(element);
  if(classNames) {
    goog.array.forEach(classNames, function(className) {
      if(className == baseClass) {
        hasBaseClass = true
      }else {
        if(className) {
          this.setStateFromClassName(container, className, baseClass)
        }
      }
    }, this)
  }
  if(!hasBaseClass) {
    goog.dom.classlist.add(element, baseClass)
  }
  this.decorateChildren(container, this.getContentElement(element));
  return element
};
goog.ui.ContainerRenderer.prototype.setStateFromClassName = function(container, className, baseClass) {
  if(className == goog.getCssName(baseClass, "disabled")) {
    container.setEnabled(false)
  }else {
    if(className == goog.getCssName(baseClass, "horizontal")) {
      container.setOrientation(goog.ui.Container.Orientation.HORIZONTAL)
    }else {
      if(className == goog.getCssName(baseClass, "vertical")) {
        container.setOrientation(goog.ui.Container.Orientation.VERTICAL)
      }
    }
  }
};
goog.ui.ContainerRenderer.prototype.decorateChildren = function(container, element, opt_firstChild) {
  if(element) {
    var node = opt_firstChild || element.firstChild, next;
    while(node && node.parentNode == element) {
      next = node.nextSibling;
      if(node.nodeType == goog.dom.NodeType.ELEMENT) {
        var child = this.getDecoratorForChild((node));
        if(child) {
          child.setElementInternal((node));
          if(!container.isEnabled()) {
            child.setEnabled(false)
          }
          container.addChild(child);
          child.decorate((node))
        }
      }else {
        if(!node.nodeValue || goog.string.trim(node.nodeValue) == "") {
          element.removeChild(node)
        }
      }
      node = next
    }
  }
};
goog.ui.ContainerRenderer.prototype.getDecoratorForChild = function(element) {
  return(goog.ui.registry.getDecorator(element))
};
goog.ui.ContainerRenderer.prototype.initializeDom = function(container) {
  var elem = container.getElement();
  goog.asserts.assert(elem, "The container DOM element cannot be null.");
  goog.style.setUnselectable(elem, true, goog.userAgent.GECKO);
  if(goog.userAgent.IE) {
    elem.hideFocus = true
  }
  var ariaRole = this.getAriaRole();
  if(ariaRole) {
    goog.a11y.aria.setRole(elem, ariaRole)
  }
};
goog.ui.ContainerRenderer.prototype.getKeyEventTarget = function(container) {
  return container.getElement()
};
goog.ui.ContainerRenderer.prototype.getCssClass = function() {
  return goog.ui.ContainerRenderer.CSS_CLASS
};
goog.ui.ContainerRenderer.prototype.getClassNames = function(container) {
  var baseClass = this.getCssClass();
  var isHorizontal = container.getOrientation() == goog.ui.Container.Orientation.HORIZONTAL;
  var classNames = [baseClass, isHorizontal ? goog.getCssName(baseClass, "horizontal") : goog.getCssName(baseClass, "vertical")];
  if(!container.isEnabled()) {
    classNames.push(goog.getCssName(baseClass, "disabled"))
  }
  return classNames
};
goog.ui.ContainerRenderer.prototype.getDefaultOrientation = function() {
  return goog.ui.Container.Orientation.VERTICAL
};
goog.provide("goog.ui.ControlRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.classes");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.userAgent");
goog.ui.ControlRenderer = function() {
};
goog.addSingletonGetter(goog.ui.ControlRenderer);
goog.ui.ControlRenderer.getCustomRenderer = function(ctor, cssClassName) {
  var renderer = new ctor;
  renderer.getCssClass = function() {
    return cssClassName
  };
  return renderer
};
goog.ui.ControlRenderer.CSS_CLASS = goog.getCssName("goog-control");
goog.ui.ControlRenderer.IE6_CLASS_COMBINATIONS = [];
goog.ui.ControlRenderer.ARIA_STATE_MAP_;
goog.ui.ControlRenderer.prototype.getAriaRole = function() {
  return undefined
};
goog.ui.ControlRenderer.prototype.createDom = function(control) {
  var element = control.getDomHelper().createDom("div", this.getClassNames(control).join(" "), control.getContent());
  this.setAriaStates(control, element);
  return element
};
goog.ui.ControlRenderer.prototype.getContentElement = function(element) {
  return element
};
goog.ui.ControlRenderer.prototype.enableClassName = function(control, className, enable) {
  var element = (control.getElement ? control.getElement() : control);
  if(element) {
    if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
      var combinedClasses = this.getAppliedCombinedClassNames_(goog.dom.classes.get(element), className);
      combinedClasses.push(className);
      var f = enable ? goog.dom.classes.add : goog.dom.classes.remove;
      goog.partial(f, element).apply(null, combinedClasses)
    }else {
      goog.dom.classes.enable(element, className, enable)
    }
  }
};
goog.ui.ControlRenderer.prototype.enableExtraClassName = function(control, className, enable) {
  this.enableClassName(control, className, enable)
};
goog.ui.ControlRenderer.prototype.canDecorate = function(element) {
  return true
};
goog.ui.ControlRenderer.prototype.decorate = function(control, element) {
  if(element.id) {
    control.setId(element.id)
  }
  var contentElem = this.getContentElement(element);
  if(contentElem && contentElem.firstChild) {
    control.setContentInternal(contentElem.firstChild.nextSibling ? goog.array.clone(contentElem.childNodes) : contentElem.firstChild)
  }else {
    control.setContentInternal(null)
  }
  var state = 0;
  var rendererClassName = this.getCssClass();
  var structuralClassName = this.getStructuralCssClass();
  var hasRendererClassName = false;
  var hasStructuralClassName = false;
  var hasCombinedClassName = false;
  var classNames = goog.dom.classes.get(element);
  goog.array.forEach(classNames, function(className) {
    if(!hasRendererClassName && className == rendererClassName) {
      hasRendererClassName = true;
      if(structuralClassName == rendererClassName) {
        hasStructuralClassName = true
      }
    }else {
      if(!hasStructuralClassName && className == structuralClassName) {
        hasStructuralClassName = true
      }else {
        state |= this.getStateFromClass(className)
      }
    }
  }, this);
  control.setStateInternal(state);
  if(!hasRendererClassName) {
    classNames.push(rendererClassName);
    if(structuralClassName == rendererClassName) {
      hasStructuralClassName = true
    }
  }
  if(!hasStructuralClassName) {
    classNames.push(structuralClassName)
  }
  var extraClassNames = control.getExtraClassNames();
  if(extraClassNames) {
    classNames.push.apply(classNames, extraClassNames)
  }
  if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
    var combinedClasses = this.getAppliedCombinedClassNames_(classNames);
    if(combinedClasses.length > 0) {
      classNames.push.apply(classNames, combinedClasses);
      hasCombinedClassName = true
    }
  }
  if(!hasRendererClassName || (!hasStructuralClassName || (extraClassNames || hasCombinedClassName))) {
    goog.dom.classes.set(element, classNames.join(" "))
  }
  this.setAriaStates(control, element);
  return element
};
goog.ui.ControlRenderer.prototype.initializeDom = function(control) {
  if(control.isRightToLeft()) {
    this.setRightToLeft(control.getElement(), true)
  }
  if(control.isEnabled()) {
    this.setFocusable(control, control.isVisible())
  }
};
goog.ui.ControlRenderer.prototype.setAriaRole = function(element, opt_preferredRole) {
  var ariaRole = opt_preferredRole || this.getAriaRole();
  if(ariaRole) {
    goog.asserts.assert(element, "The element passed as a first parameter cannot be null.");
    goog.a11y.aria.setRole(element, ariaRole)
  }
};
goog.ui.ControlRenderer.prototype.setAriaStates = function(control, element) {
  goog.asserts.assert(control);
  goog.asserts.assert(element);
  if(!control.isVisible()) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.HIDDEN, !control.isVisible())
  }
  if(!control.isEnabled()) {
    this.updateAriaState(element, goog.ui.Component.State.DISABLED, !control.isEnabled())
  }
  if(control.isSupportedState(goog.ui.Component.State.SELECTED)) {
    this.updateAriaState(element, goog.ui.Component.State.SELECTED, control.isSelected())
  }
  if(control.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, control.isChecked())
  }
  if(control.isSupportedState(goog.ui.Component.State.OPENED)) {
    this.updateAriaState(element, goog.ui.Component.State.OPENED, control.isOpen())
  }
};
goog.ui.ControlRenderer.prototype.setAllowTextSelection = function(element, allow) {
  goog.style.setUnselectable(element, !allow, !goog.userAgent.IE && !goog.userAgent.OPERA)
};
goog.ui.ControlRenderer.prototype.setRightToLeft = function(element, rightToLeft) {
  this.enableClassName(element, goog.getCssName(this.getStructuralCssClass(), "rtl"), rightToLeft)
};
goog.ui.ControlRenderer.prototype.isFocusable = function(control) {
  var keyTarget;
  if(control.isSupportedState(goog.ui.Component.State.FOCUSED) && (keyTarget = control.getKeyEventTarget())) {
    return goog.dom.isFocusableTabIndex(keyTarget)
  }
  return false
};
goog.ui.ControlRenderer.prototype.setFocusable = function(control, focusable) {
  var keyTarget;
  if(control.isSupportedState(goog.ui.Component.State.FOCUSED) && (keyTarget = control.getKeyEventTarget())) {
    if(!focusable && control.isFocused()) {
      try {
        keyTarget.blur()
      }catch(e) {
      }
      if(control.isFocused()) {
        control.handleBlur(null)
      }
    }
    if(goog.dom.isFocusableTabIndex(keyTarget) != focusable) {
      goog.dom.setFocusableTabIndex(keyTarget, focusable)
    }
  }
};
goog.ui.ControlRenderer.prototype.setVisible = function(element, visible) {
  goog.style.setElementShown(element, visible);
  if(element) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.HIDDEN, !visible)
  }
};
goog.ui.ControlRenderer.prototype.setState = function(control, state, enable) {
  var element = control.getElement();
  if(element) {
    var className = this.getClassForState(state);
    if(className) {
      this.enableClassName(control, className, enable)
    }
    this.updateAriaState(element, state, enable)
  }
};
goog.ui.ControlRenderer.prototype.updateAriaState = function(element, state, enable) {
  if(!goog.ui.ControlRenderer.ARIA_STATE_MAP_) {
    goog.ui.ControlRenderer.ARIA_STATE_MAP_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.a11y.aria.State.DISABLED, goog.ui.Component.State.SELECTED, goog.a11y.aria.State.SELECTED, goog.ui.Component.State.CHECKED, goog.a11y.aria.State.CHECKED, goog.ui.Component.State.OPENED, goog.a11y.aria.State.EXPANDED)
  }
  var ariaState = goog.ui.ControlRenderer.ARIA_STATE_MAP_[state];
  if(ariaState) {
    goog.asserts.assert(element, "The element passed as a first parameter cannot be null.");
    goog.a11y.aria.setState(element, ariaState, enable)
  }
};
goog.ui.ControlRenderer.prototype.setContent = function(element, content) {
  var contentElem = this.getContentElement(element);
  if(contentElem) {
    goog.dom.removeChildren(contentElem);
    if(content) {
      if(goog.isString(content)) {
        goog.dom.setTextContent(contentElem, content)
      }else {
        var childHandler = function(child) {
          if(child) {
            var doc = goog.dom.getOwnerDocument(contentElem);
            contentElem.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
          }
        };
        if(goog.isArray(content)) {
          goog.array.forEach(content, childHandler)
        }else {
          if(goog.isArrayLike(content) && !("nodeType" in content)) {
            goog.array.forEach(goog.array.clone((content)), childHandler)
          }else {
            childHandler(content)
          }
        }
      }
    }
  }
};
goog.ui.ControlRenderer.prototype.getKeyEventTarget = function(control) {
  return control.getElement()
};
goog.ui.ControlRenderer.prototype.getCssClass = function() {
  return goog.ui.ControlRenderer.CSS_CLASS
};
goog.ui.ControlRenderer.prototype.getIe6ClassCombinations = function() {
  return[]
};
goog.ui.ControlRenderer.prototype.getStructuralCssClass = function() {
  return this.getCssClass()
};
goog.ui.ControlRenderer.prototype.getClassNames = function(control) {
  var cssClass = this.getCssClass();
  var classNames = [cssClass];
  var structuralCssClass = this.getStructuralCssClass();
  if(structuralCssClass != cssClass) {
    classNames.push(structuralCssClass)
  }
  var classNamesForState = this.getClassNamesForState(control.getState());
  classNames.push.apply(classNames, classNamesForState);
  var extraClassNames = control.getExtraClassNames();
  if(extraClassNames) {
    classNames.push.apply(classNames, extraClassNames)
  }
  if(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
    classNames.push.apply(classNames, this.getAppliedCombinedClassNames_(classNames))
  }
  return classNames
};
goog.ui.ControlRenderer.prototype.getAppliedCombinedClassNames_ = function(classes, opt_includedClass) {
  var toAdd = [];
  if(opt_includedClass) {
    classes = classes.concat([opt_includedClass])
  }
  goog.array.forEach(this.getIe6ClassCombinations(), function(combo) {
    if(goog.array.every(combo, goog.partial(goog.array.contains, classes)) && (!opt_includedClass || goog.array.contains(combo, opt_includedClass))) {
      toAdd.push(combo.join("_"))
    }
  });
  return toAdd
};
goog.ui.ControlRenderer.prototype.getClassNamesForState = function(state) {
  var classNames = [];
  while(state) {
    var mask = state & -state;
    classNames.push(this.getClassForState((mask)));
    state &= ~mask
  }
  return classNames
};
goog.ui.ControlRenderer.prototype.getClassForState = function(state) {
  if(!this.classByState_) {
    this.createClassByStateMap_()
  }
  return this.classByState_[state]
};
goog.ui.ControlRenderer.prototype.getStateFromClass = function(className) {
  if(!this.stateByClass_) {
    this.createStateByClassMap_()
  }
  var state = parseInt(this.stateByClass_[className], 10);
  return(isNaN(state) ? 0 : state)
};
goog.ui.ControlRenderer.prototype.createClassByStateMap_ = function() {
  var baseClass = this.getStructuralCssClass();
  this.classByState_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.getCssName(baseClass, "disabled"), goog.ui.Component.State.HOVER, goog.getCssName(baseClass, "hover"), goog.ui.Component.State.ACTIVE, goog.getCssName(baseClass, "active"), goog.ui.Component.State.SELECTED, goog.getCssName(baseClass, "selected"), goog.ui.Component.State.CHECKED, goog.getCssName(baseClass, "checked"), goog.ui.Component.State.FOCUSED, goog.getCssName(baseClass, "focused"), goog.ui.Component.State.OPENED, 
  goog.getCssName(baseClass, "open"))
};
goog.ui.ControlRenderer.prototype.createStateByClassMap_ = function() {
  if(!this.classByState_) {
    this.createClassByStateMap_()
  }
  this.stateByClass_ = goog.object.transpose(this.classByState_)
};
goog.provide("goog.ui.decorate");
goog.require("goog.ui.registry");
goog.ui.decorate = function(element) {
  var decorator = goog.ui.registry.getDecorator(element);
  if(decorator) {
    decorator.decorate(element)
  }
  return decorator
};
goog.provide("goog.ui.ControlContent");
goog.ui.ControlContent;
goog.provide("goog.events.KeyEvent");
goog.provide("goog.events.KeyHandler");
goog.provide("goog.events.KeyHandler.EventType");
goog.require("goog.events");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.userAgent");
goog.events.KeyHandler = function(opt_element, opt_capture) {
  goog.events.EventTarget.call(this);
  if(opt_element) {
    this.attach(opt_element, opt_capture)
  }
};
goog.inherits(goog.events.KeyHandler, goog.events.EventTarget);
goog.events.KeyHandler.prototype.element_ = null;
goog.events.KeyHandler.prototype.keyPressKey_ = null;
goog.events.KeyHandler.prototype.keyDownKey_ = null;
goog.events.KeyHandler.prototype.keyUpKey_ = null;
goog.events.KeyHandler.prototype.lastKey_ = -1;
goog.events.KeyHandler.prototype.keyCode_ = -1;
goog.events.KeyHandler.prototype.altKey_ = false;
goog.events.KeyHandler.EventType = {KEY:"key"};
goog.events.KeyHandler.safariKey_ = {3:goog.events.KeyCodes.ENTER, 12:goog.events.KeyCodes.NUMLOCK, 63232:goog.events.KeyCodes.UP, 63233:goog.events.KeyCodes.DOWN, 63234:goog.events.KeyCodes.LEFT, 63235:goog.events.KeyCodes.RIGHT, 63236:goog.events.KeyCodes.F1, 63237:goog.events.KeyCodes.F2, 63238:goog.events.KeyCodes.F3, 63239:goog.events.KeyCodes.F4, 63240:goog.events.KeyCodes.F5, 63241:goog.events.KeyCodes.F6, 63242:goog.events.KeyCodes.F7, 63243:goog.events.KeyCodes.F8, 63244:goog.events.KeyCodes.F9, 
63245:goog.events.KeyCodes.F10, 63246:goog.events.KeyCodes.F11, 63247:goog.events.KeyCodes.F12, 63248:goog.events.KeyCodes.PRINT_SCREEN, 63272:goog.events.KeyCodes.DELETE, 63273:goog.events.KeyCodes.HOME, 63275:goog.events.KeyCodes.END, 63276:goog.events.KeyCodes.PAGE_UP, 63277:goog.events.KeyCodes.PAGE_DOWN, 63289:goog.events.KeyCodes.NUMLOCK, 63302:goog.events.KeyCodes.INSERT};
goog.events.KeyHandler.keyIdentifier_ = {"Up":goog.events.KeyCodes.UP, "Down":goog.events.KeyCodes.DOWN, "Left":goog.events.KeyCodes.LEFT, "Right":goog.events.KeyCodes.RIGHT, "Enter":goog.events.KeyCodes.ENTER, "F1":goog.events.KeyCodes.F1, "F2":goog.events.KeyCodes.F2, "F3":goog.events.KeyCodes.F3, "F4":goog.events.KeyCodes.F4, "F5":goog.events.KeyCodes.F5, "F6":goog.events.KeyCodes.F6, "F7":goog.events.KeyCodes.F7, "F8":goog.events.KeyCodes.F8, "F9":goog.events.KeyCodes.F9, "F10":goog.events.KeyCodes.F10, 
"F11":goog.events.KeyCodes.F11, "F12":goog.events.KeyCodes.F12, "U+007F":goog.events.KeyCodes.DELETE, "Home":goog.events.KeyCodes.HOME, "End":goog.events.KeyCodes.END, "PageUp":goog.events.KeyCodes.PAGE_UP, "PageDown":goog.events.KeyCodes.PAGE_DOWN, "Insert":goog.events.KeyCodes.INSERT};
goog.events.KeyHandler.USES_KEYDOWN_ = goog.userAgent.IE || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("525");
goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_ = goog.userAgent.MAC && goog.userAgent.GECKO;
goog.events.KeyHandler.prototype.handleKeyDown_ = function(e) {
  if(goog.userAgent.WEBKIT) {
    if(this.lastKey_ == goog.events.KeyCodes.CTRL && !e.ctrlKey || (this.lastKey_ == goog.events.KeyCodes.ALT && !e.altKey || goog.userAgent.MAC && (this.lastKey_ == goog.events.KeyCodes.META && !e.metaKey))) {
      this.lastKey_ = -1;
      this.keyCode_ = -1
    }
  }
  if(this.lastKey_ == -1) {
    if(e.ctrlKey && e.keyCode != goog.events.KeyCodes.CTRL) {
      this.lastKey_ = goog.events.KeyCodes.CTRL
    }else {
      if(e.altKey && e.keyCode != goog.events.KeyCodes.ALT) {
        this.lastKey_ = goog.events.KeyCodes.ALT
      }else {
        if(e.metaKey && e.keyCode != goog.events.KeyCodes.META) {
          this.lastKey_ = goog.events.KeyCodes.META
        }
      }
    }
  }
  if(goog.events.KeyHandler.USES_KEYDOWN_ && !goog.events.KeyCodes.firesKeyPressEvent(e.keyCode, this.lastKey_, e.shiftKey, e.ctrlKey, e.altKey)) {
    this.handleEvent(e)
  }else {
    this.keyCode_ = goog.events.KeyCodes.normalizeKeyCode(e.keyCode);
    if(goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_) {
      this.altKey_ = e.altKey
    }
  }
};
goog.events.KeyHandler.prototype.resetState = function() {
  this.lastKey_ = -1;
  this.keyCode_ = -1
};
goog.events.KeyHandler.prototype.handleKeyup_ = function(e) {
  this.resetState();
  this.altKey_ = e.altKey
};
goog.events.KeyHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var keyCode, charCode;
  var altKey = be.altKey;
  if(goog.userAgent.IE && e.type == goog.events.EventType.KEYPRESS) {
    keyCode = this.keyCode_;
    charCode = keyCode != goog.events.KeyCodes.ENTER && keyCode != goog.events.KeyCodes.ESC ? be.keyCode : 0
  }else {
    if(goog.userAgent.WEBKIT && e.type == goog.events.EventType.KEYPRESS) {
      keyCode = this.keyCode_;
      charCode = be.charCode >= 0 && (be.charCode < 63232 && goog.events.KeyCodes.isCharacterKey(keyCode)) ? be.charCode : 0
    }else {
      if(goog.userAgent.OPERA) {
        keyCode = this.keyCode_;
        charCode = goog.events.KeyCodes.isCharacterKey(keyCode) ? be.keyCode : 0
      }else {
        keyCode = be.keyCode || this.keyCode_;
        charCode = be.charCode || 0;
        if(goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_) {
          altKey = this.altKey_
        }
        if(goog.userAgent.MAC && (charCode == goog.events.KeyCodes.QUESTION_MARK && keyCode == goog.events.KeyCodes.WIN_KEY)) {
          keyCode = goog.events.KeyCodes.SLASH
        }
      }
    }
  }
  keyCode = goog.events.KeyCodes.normalizeKeyCode(keyCode);
  var key = keyCode;
  var keyIdentifier = be.keyIdentifier;
  if(keyCode) {
    if(keyCode >= 63232 && keyCode in goog.events.KeyHandler.safariKey_) {
      key = goog.events.KeyHandler.safariKey_[keyCode]
    }else {
      if(keyCode == 25 && e.shiftKey) {
        key = 9
      }
    }
  }else {
    if(keyIdentifier && keyIdentifier in goog.events.KeyHandler.keyIdentifier_) {
      key = goog.events.KeyHandler.keyIdentifier_[keyIdentifier]
    }
  }
  var repeat = key == this.lastKey_;
  this.lastKey_ = key;
  var event = new goog.events.KeyEvent(key, charCode, repeat, be);
  event.altKey = altKey;
  this.dispatchEvent(event)
};
goog.events.KeyHandler.prototype.getElement = function() {
  return this.element_
};
goog.events.KeyHandler.prototype.attach = function(element, opt_capture) {
  if(this.keyUpKey_) {
    this.detach()
  }
  this.element_ = element;
  this.keyPressKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYPRESS, this, opt_capture);
  this.keyDownKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYDOWN, this.handleKeyDown_, opt_capture, this);
  this.keyUpKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYUP, this.handleKeyup_, opt_capture, this)
};
goog.events.KeyHandler.prototype.detach = function() {
  if(this.keyPressKey_) {
    goog.events.unlistenByKey(this.keyPressKey_);
    goog.events.unlistenByKey(this.keyDownKey_);
    goog.events.unlistenByKey(this.keyUpKey_);
    this.keyPressKey_ = null;
    this.keyDownKey_ = null;
    this.keyUpKey_ = null
  }
  this.element_ = null;
  this.lastKey_ = -1;
  this.keyCode_ = -1
};
goog.events.KeyHandler.prototype.disposeInternal = function() {
  goog.events.KeyHandler.superClass_.disposeInternal.call(this);
  this.detach()
};
goog.events.KeyEvent = function(keyCode, charCode, repeat, browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent);
  this.type = goog.events.KeyHandler.EventType.KEY;
  this.keyCode = keyCode;
  this.charCode = charCode;
  this.repeat = repeat
};
goog.inherits(goog.events.KeyEvent, goog.events.BrowserEvent);
goog.provide("goog.ui.Control");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.string");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlContent");
goog.require("goog.ui.ControlRenderer");
goog.require("goog.ui.decorate");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.ui.Control = function(opt_content, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.registry.getDefaultRenderer(this.constructor);
  this.setContentInternal(goog.isDef(opt_content) ? opt_content : null)
};
goog.inherits(goog.ui.Control, goog.ui.Component);
goog.ui.Control.registerDecorator = goog.ui.registry.setDecoratorByClassName;
goog.ui.Control.getDecorator = (goog.ui.registry.getDecorator);
goog.ui.Control.decorate = (goog.ui.decorate);
goog.ui.Control.prototype.renderer_;
goog.ui.Control.prototype.content_ = null;
goog.ui.Control.prototype.state_ = 0;
goog.ui.Control.prototype.supportedStates_ = goog.ui.Component.State.DISABLED | goog.ui.Component.State.HOVER | goog.ui.Component.State.ACTIVE | goog.ui.Component.State.FOCUSED;
goog.ui.Control.prototype.autoStates_ = goog.ui.Component.State.ALL;
goog.ui.Control.prototype.statesWithTransitionEvents_ = 0;
goog.ui.Control.prototype.visible_ = true;
goog.ui.Control.prototype.keyHandler_;
goog.ui.Control.prototype.extraClassNames_ = null;
goog.ui.Control.prototype.handleMouseEvents_ = true;
goog.ui.Control.prototype.allowTextSelection_ = false;
goog.ui.Control.prototype.preferredAriaRole_ = null;
goog.ui.Control.prototype.isHandleMouseEvents = function() {
  return this.handleMouseEvents_
};
goog.ui.Control.prototype.setHandleMouseEvents = function(enable) {
  if(this.isInDocument() && enable != this.handleMouseEvents_) {
    this.enableMouseEventHandling_(enable)
  }
  this.handleMouseEvents_ = enable
};
goog.ui.Control.prototype.getKeyEventTarget = function() {
  return this.renderer_.getKeyEventTarget(this)
};
goog.ui.Control.prototype.getKeyHandler = function() {
  return this.keyHandler_ || (this.keyHandler_ = new goog.events.KeyHandler)
};
goog.ui.Control.prototype.getRenderer = function() {
  return this.renderer_
};
goog.ui.Control.prototype.setRenderer = function(renderer) {
  if(this.isInDocument()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if(this.getElement()) {
    this.setElementInternal(null)
  }
  this.renderer_ = renderer
};
goog.ui.Control.prototype.getExtraClassNames = function() {
  return this.extraClassNames_
};
goog.ui.Control.prototype.addClassName = function(className) {
  if(className) {
    if(this.extraClassNames_) {
      if(!goog.array.contains(this.extraClassNames_, className)) {
        this.extraClassNames_.push(className)
      }
    }else {
      this.extraClassNames_ = [className]
    }
    this.renderer_.enableExtraClassName(this, className, true)
  }
};
goog.ui.Control.prototype.removeClassName = function(className) {
  if(className && (this.extraClassNames_ && goog.array.remove(this.extraClassNames_, className))) {
    if(this.extraClassNames_.length == 0) {
      this.extraClassNames_ = null
    }
    this.renderer_.enableExtraClassName(this, className, false)
  }
};
goog.ui.Control.prototype.enableClassName = function(className, enable) {
  if(enable) {
    this.addClassName(className)
  }else {
    this.removeClassName(className)
  }
};
goog.ui.Control.prototype.createDom = function() {
  var element = this.renderer_.createDom(this);
  this.setElementInternal(element);
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());
  if(!this.isAllowTextSelection()) {
    this.renderer_.setAllowTextSelection(element, false)
  }
  if(!this.isVisible()) {
    this.renderer_.setVisible(element, false)
  }
};
goog.ui.Control.prototype.getPreferredAriaRole = function() {
  return this.preferredAriaRole_
};
goog.ui.Control.prototype.setPreferredAriaRole = function(role) {
  this.preferredAriaRole_ = role
};
goog.ui.Control.prototype.getContentElement = function() {
  return this.renderer_.getContentElement(this.getElement())
};
goog.ui.Control.prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element)
};
goog.ui.Control.prototype.decorateInternal = function(element) {
  element = this.renderer_.decorate(this, element);
  this.setElementInternal(element);
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());
  if(!this.isAllowTextSelection()) {
    this.renderer_.setAllowTextSelection(element, false)
  }
  this.visible_ = element.style.display != "none"
};
goog.ui.Control.prototype.enterDocument = function() {
  goog.ui.Control.superClass_.enterDocument.call(this);
  this.renderer_.initializeDom(this);
  if(this.supportedStates_ & ~goog.ui.Component.State.DISABLED) {
    if(this.isHandleMouseEvents()) {
      this.enableMouseEventHandling_(true)
    }
    if(this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
      var keyTarget = this.getKeyEventTarget();
      if(keyTarget) {
        var keyHandler = this.getKeyHandler();
        keyHandler.attach(keyTarget);
        this.getHandler().listen(keyHandler, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent).listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur)
      }
    }
  }
};
goog.ui.Control.prototype.enableMouseEventHandling_ = function(enable) {
  var handler = this.getHandler();
  var element = this.getElement();
  if(enable) {
    handler.listen(element, goog.events.EventType.MOUSEOVER, this.handleMouseOver).listen(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).listen(element, goog.events.EventType.MOUSEUP, this.handleMouseUp).listen(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if(this.handleContextMenu != goog.nullFunction) {
      handler.listen(element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu)
    }
    if(goog.userAgent.IE) {
      handler.listen(element, goog.events.EventType.DBLCLICK, this.handleDblClick)
    }
  }else {
    handler.unlisten(element, goog.events.EventType.MOUSEOVER, this.handleMouseOver).unlisten(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).unlisten(element, goog.events.EventType.MOUSEUP, this.handleMouseUp).unlisten(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if(this.handleContextMenu != goog.nullFunction) {
      handler.unlisten(element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu)
    }
    if(goog.userAgent.IE) {
      handler.unlisten(element, goog.events.EventType.DBLCLICK, this.handleDblClick)
    }
  }
};
goog.ui.Control.prototype.exitDocument = function() {
  goog.ui.Control.superClass_.exitDocument.call(this);
  if(this.keyHandler_) {
    this.keyHandler_.detach()
  }
  if(this.isVisible() && this.isEnabled()) {
    this.renderer_.setFocusable(this, false)
  }
};
goog.ui.Control.prototype.disposeInternal = function() {
  goog.ui.Control.superClass_.disposeInternal.call(this);
  if(this.keyHandler_) {
    this.keyHandler_.dispose();
    delete this.keyHandler_
  }
  delete this.renderer_;
  this.content_ = null;
  this.extraClassNames_ = null
};
goog.ui.Control.prototype.getContent = function() {
  return this.content_
};
goog.ui.Control.prototype.setContent = function(content) {
  this.renderer_.setContent(this.getElement(), content);
  this.setContentInternal(content)
};
goog.ui.Control.prototype.setContentInternal = function(content) {
  this.content_ = content
};
goog.ui.Control.prototype.getCaption = function() {
  var content = this.getContent();
  if(!content) {
    return""
  }
  var caption = goog.isString(content) ? content : goog.isArray(content) ? goog.array.map(content, goog.dom.getRawTextContent).join("") : goog.dom.getTextContent((content));
  return goog.string.collapseBreakingSpaces(caption)
};
goog.ui.Control.prototype.setCaption = function(caption) {
  this.setContent(caption)
};
goog.ui.Control.prototype.setRightToLeft = function(rightToLeft) {
  goog.ui.Control.superClass_.setRightToLeft.call(this, rightToLeft);
  var element = this.getElement();
  if(element) {
    this.renderer_.setRightToLeft(element, rightToLeft)
  }
};
goog.ui.Control.prototype.isAllowTextSelection = function() {
  return this.allowTextSelection_
};
goog.ui.Control.prototype.setAllowTextSelection = function(allow) {
  this.allowTextSelection_ = allow;
  var element = this.getElement();
  if(element) {
    this.renderer_.setAllowTextSelection(element, allow)
  }
};
goog.ui.Control.prototype.isVisible = function() {
  return this.visible_
};
goog.ui.Control.prototype.setVisible = function(visible, opt_force) {
  if(opt_force || this.visible_ != visible && this.dispatchEvent(visible ? goog.ui.Component.EventType.SHOW : goog.ui.Component.EventType.HIDE)) {
    var element = this.getElement();
    if(element) {
      this.renderer_.setVisible(element, visible)
    }
    if(this.isEnabled()) {
      this.renderer_.setFocusable(this, visible)
    }
    this.visible_ = visible;
    return true
  }
  return false
};
goog.ui.Control.prototype.isEnabled = function() {
  return!this.hasState(goog.ui.Component.State.DISABLED)
};
goog.ui.Control.prototype.isParentDisabled_ = function() {
  var parent = this.getParent();
  return!!parent && (typeof parent.isEnabled == "function" && !parent.isEnabled())
};
goog.ui.Control.prototype.setEnabled = function(enable) {
  if(!this.isParentDisabled_() && this.isTransitionAllowed(goog.ui.Component.State.DISABLED, !enable)) {
    if(!enable) {
      this.setActive(false);
      this.setHighlighted(false)
    }
    if(this.isVisible()) {
      this.renderer_.setFocusable(this, enable)
    }
    this.setState(goog.ui.Component.State.DISABLED, !enable)
  }
};
goog.ui.Control.prototype.isHighlighted = function() {
  return this.hasState(goog.ui.Component.State.HOVER)
};
goog.ui.Control.prototype.setHighlighted = function(highlight) {
  if(this.isTransitionAllowed(goog.ui.Component.State.HOVER, highlight)) {
    this.setState(goog.ui.Component.State.HOVER, highlight)
  }
};
goog.ui.Control.prototype.isActive = function() {
  return this.hasState(goog.ui.Component.State.ACTIVE)
};
goog.ui.Control.prototype.setActive = function(active) {
  if(this.isTransitionAllowed(goog.ui.Component.State.ACTIVE, active)) {
    this.setState(goog.ui.Component.State.ACTIVE, active)
  }
};
goog.ui.Control.prototype.isSelected = function() {
  return this.hasState(goog.ui.Component.State.SELECTED)
};
goog.ui.Control.prototype.setSelected = function(select) {
  if(this.isTransitionAllowed(goog.ui.Component.State.SELECTED, select)) {
    this.setState(goog.ui.Component.State.SELECTED, select)
  }
};
goog.ui.Control.prototype.isChecked = function() {
  return this.hasState(goog.ui.Component.State.CHECKED)
};
goog.ui.Control.prototype.setChecked = function(check) {
  if(this.isTransitionAllowed(goog.ui.Component.State.CHECKED, check)) {
    this.setState(goog.ui.Component.State.CHECKED, check)
  }
};
goog.ui.Control.prototype.isFocused = function() {
  return this.hasState(goog.ui.Component.State.FOCUSED)
};
goog.ui.Control.prototype.setFocused = function(focused) {
  if(this.isTransitionAllowed(goog.ui.Component.State.FOCUSED, focused)) {
    this.setState(goog.ui.Component.State.FOCUSED, focused)
  }
};
goog.ui.Control.prototype.isOpen = function() {
  return this.hasState(goog.ui.Component.State.OPENED)
};
goog.ui.Control.prototype.setOpen = function(open) {
  if(this.isTransitionAllowed(goog.ui.Component.State.OPENED, open)) {
    this.setState(goog.ui.Component.State.OPENED, open)
  }
};
goog.ui.Control.prototype.getState = function() {
  return this.state_
};
goog.ui.Control.prototype.hasState = function(state) {
  return!!(this.state_ & state)
};
goog.ui.Control.prototype.setState = function(state, enable) {
  if(this.isSupportedState(state) && enable != this.hasState(state)) {
    this.renderer_.setState(this, state, enable);
    this.state_ = enable ? this.state_ | state : this.state_ & ~state
  }
};
goog.ui.Control.prototype.setStateInternal = function(state) {
  this.state_ = state
};
goog.ui.Control.prototype.isSupportedState = function(state) {
  return!!(this.supportedStates_ & state)
};
goog.ui.Control.prototype.setSupportedState = function(state, support) {
  if(this.isInDocument() && (this.hasState(state) && !support)) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if(!support && this.hasState(state)) {
    this.setState(state, false)
  }
  this.supportedStates_ = support ? this.supportedStates_ | state : this.supportedStates_ & ~state
};
goog.ui.Control.prototype.isAutoState = function(state) {
  return!!(this.autoStates_ & state) && this.isSupportedState(state)
};
goog.ui.Control.prototype.setAutoStates = function(states, enable) {
  this.autoStates_ = enable ? this.autoStates_ | states : this.autoStates_ & ~states
};
goog.ui.Control.prototype.isDispatchTransitionEvents = function(state) {
  return!!(this.statesWithTransitionEvents_ & state) && this.isSupportedState(state)
};
goog.ui.Control.prototype.setDispatchTransitionEvents = function(states, enable) {
  this.statesWithTransitionEvents_ = enable ? this.statesWithTransitionEvents_ | states : this.statesWithTransitionEvents_ & ~states
};
goog.ui.Control.prototype.isTransitionAllowed = function(state, enable) {
  return this.isSupportedState(state) && (this.hasState(state) != enable && ((!(this.statesWithTransitionEvents_ & state) || this.dispatchEvent(goog.ui.Component.getStateTransitionEvent(state, enable))) && !this.isDisposed()))
};
goog.ui.Control.prototype.handleMouseOver = function(e) {
  if(!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) && (this.dispatchEvent(goog.ui.Component.EventType.ENTER) && (this.isEnabled() && this.isAutoState(goog.ui.Component.State.HOVER)))) {
    this.setHighlighted(true)
  }
};
goog.ui.Control.prototype.handleMouseOut = function(e) {
  if(!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) && this.dispatchEvent(goog.ui.Component.EventType.LEAVE)) {
    if(this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      this.setActive(false)
    }
    if(this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(false)
    }
  }
};
goog.ui.Control.prototype.handleContextMenu = goog.nullFunction;
goog.ui.Control.isMouseEventWithinElement_ = function(e, elem) {
  return!!e.relatedTarget && goog.dom.contains(elem, e.relatedTarget)
};
goog.ui.Control.prototype.handleMouseDown = function(e) {
  if(this.isEnabled()) {
    if(this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true)
    }
    if(e.isMouseActionButton()) {
      if(this.isAutoState(goog.ui.Component.State.ACTIVE)) {
        this.setActive(true)
      }
      if(this.renderer_.isFocusable(this)) {
        this.getKeyEventTarget().focus()
      }
    }
  }
  if(!this.isAllowTextSelection() && e.isMouseActionButton()) {
    e.preventDefault()
  }
};
goog.ui.Control.prototype.handleMouseUp = function(e) {
  if(this.isEnabled()) {
    if(this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true)
    }
    if(this.isActive() && (this.performActionInternal(e) && this.isAutoState(goog.ui.Component.State.ACTIVE))) {
      this.setActive(false)
    }
  }
};
goog.ui.Control.prototype.handleDblClick = function(e) {
  if(this.isEnabled()) {
    this.performActionInternal(e)
  }
};
goog.ui.Control.prototype.performActionInternal = function(e) {
  if(this.isAutoState(goog.ui.Component.State.CHECKED)) {
    this.setChecked(!this.isChecked())
  }
  if(this.isAutoState(goog.ui.Component.State.SELECTED)) {
    this.setSelected(true)
  }
  if(this.isAutoState(goog.ui.Component.State.OPENED)) {
    this.setOpen(!this.isOpen())
  }
  var actionEvent = new goog.events.Event(goog.ui.Component.EventType.ACTION, this);
  if(e) {
    actionEvent.altKey = e.altKey;
    actionEvent.ctrlKey = e.ctrlKey;
    actionEvent.metaKey = e.metaKey;
    actionEvent.shiftKey = e.shiftKey;
    actionEvent.platformModifierKey = e.platformModifierKey
  }
  return this.dispatchEvent(actionEvent)
};
goog.ui.Control.prototype.handleFocus = function(e) {
  if(this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(true)
  }
};
goog.ui.Control.prototype.handleBlur = function(e) {
  if(this.isAutoState(goog.ui.Component.State.ACTIVE)) {
    this.setActive(false)
  }
  if(this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(false)
  }
};
goog.ui.Control.prototype.handleKeyEvent = function(e) {
  if(this.isVisible() && (this.isEnabled() && this.handleKeyEventInternal(e))) {
    e.preventDefault();
    e.stopPropagation();
    return true
  }
  return false
};
goog.ui.Control.prototype.handleKeyEventInternal = function(e) {
  return e.keyCode == goog.events.KeyCodes.ENTER && this.performActionInternal(e)
};
goog.ui.registry.setDefaultRenderer(goog.ui.Control, goog.ui.ControlRenderer);
goog.ui.registry.setDecoratorByClassName(goog.ui.ControlRenderer.CSS_CLASS, function() {
  return new goog.ui.Control(null)
});
goog.provide("goog.ui.MenuSeparatorRenderer");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.ui.ControlContent");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuSeparatorRenderer = function() {
  goog.ui.ControlRenderer.call(this)
};
goog.inherits(goog.ui.MenuSeparatorRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuSeparatorRenderer);
goog.ui.MenuSeparatorRenderer.CSS_CLASS = goog.getCssName("goog-menuseparator");
goog.ui.MenuSeparatorRenderer.prototype.createDom = function(separator) {
  return separator.getDomHelper().createDom("div", this.getCssClass())
};
goog.ui.MenuSeparatorRenderer.prototype.decorate = function(separator, element) {
  if(element.id) {
    separator.setId(element.id)
  }
  if(element.tagName == "HR") {
    var hr = element;
    element = this.createDom(separator);
    goog.dom.insertSiblingBefore(element, hr);
    goog.dom.removeNode(hr)
  }else {
    goog.dom.classlist.add(element, this.getCssClass())
  }
  return element
};
goog.ui.MenuSeparatorRenderer.prototype.setContent = function(separator, content) {
};
goog.ui.MenuSeparatorRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuSeparatorRenderer.CSS_CLASS
};
goog.provide("goog.ui.Separator");
goog.require("goog.a11y.aria");
goog.require("goog.asserts");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuSeparatorRenderer");
goog.require("goog.ui.registry");
goog.ui.Separator = function(opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, null, opt_renderer || goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setStateInternal(goog.ui.Component.State.DISABLED)
};
goog.inherits(goog.ui.Separator, goog.ui.Control);
goog.ui.Separator.prototype.enterDocument = function() {
  goog.ui.Separator.superClass_.enterDocument.call(this);
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the separator cannot be null.");
  goog.a11y.aria.setRole(element, "separator")
};
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator
});
goog.provide("goog.ui.MenuRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.ui.ContainerRenderer");
goog.require("goog.ui.Separator");
goog.ui.MenuRenderer = function(opt_ariaRole) {
  goog.ui.ContainerRenderer.call(this, opt_ariaRole || goog.a11y.aria.Role.MENU)
};
goog.inherits(goog.ui.MenuRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(goog.ui.MenuRenderer);
goog.ui.MenuRenderer.CSS_CLASS = goog.getCssName("goog-menu");
goog.ui.MenuRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "UL" || goog.ui.MenuRenderer.superClass_.canDecorate.call(this, element)
};
goog.ui.MenuRenderer.prototype.getDecoratorForChild = function(element) {
  return element.tagName == "HR" ? new goog.ui.Separator : goog.ui.MenuRenderer.superClass_.getDecoratorForChild.call(this, element)
};
goog.ui.MenuRenderer.prototype.containsElement = function(menu, element) {
  return goog.dom.contains(menu.getElement(), element)
};
goog.ui.MenuRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuRenderer.CSS_CLASS
};
goog.ui.MenuRenderer.prototype.initializeDom = function(container) {
  goog.ui.MenuRenderer.superClass_.initializeDom.call(this, container);
  var element = container.getElement();
  goog.asserts.assert(element, "The menu DOM element cannot be null.");
  goog.a11y.aria.setState(element, goog.a11y.aria.State.HASPOPUP, "true")
};
goog.provide("goog.ui.MenuSeparator");
goog.require("goog.ui.MenuSeparatorRenderer");
goog.require("goog.ui.Separator");
goog.require("goog.ui.registry");
goog.ui.MenuSeparator = function(opt_domHelper) {
  goog.ui.Separator.call(this, goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper)
};
goog.inherits(goog.ui.MenuSeparator, goog.ui.Separator);
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator
});
goog.provide("goog.ui.MenuItemRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuItemRenderer = function() {
  goog.ui.ControlRenderer.call(this);
  this.classNameCache_ = []
};
goog.inherits(goog.ui.MenuItemRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuItemRenderer);
goog.ui.MenuItemRenderer.CSS_CLASS = goog.getCssName("goog-menuitem");
goog.ui.MenuItemRenderer.CompositeCssClassIndex_ = {HOVER:0, CHECKBOX:1, CONTENT:2};
goog.ui.MenuItemRenderer.prototype.getCompositeCssClass_ = function(index) {
  var result = this.classNameCache_[index];
  if(!result) {
    switch(index) {
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER:
        result = goog.getCssName(this.getStructuralCssClass(), "highlight");
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX:
        result = goog.getCssName(this.getStructuralCssClass(), "checkbox");
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT:
        result = goog.getCssName(this.getStructuralCssClass(), "content");
        break
    }
    this.classNameCache_[index] = result
  }
  return result
};
goog.ui.MenuItemRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.MENU_ITEM
};
goog.ui.MenuItemRenderer.prototype.createDom = function(item) {
  var element = item.getDomHelper().createDom("div", this.getClassNames(item).join(" "), this.createContent(item.getContent(), item.getDomHelper()));
  this.setEnableCheckBoxStructure(item, element, item.isSupportedState(goog.ui.Component.State.SELECTED) || item.isSupportedState(goog.ui.Component.State.CHECKED));
  this.setAriaStates(item, element);
  this.correctAriaRole(item, element);
  return element
};
goog.ui.MenuItemRenderer.prototype.getContentElement = function(element) {
  return(element && element.firstChild)
};
goog.ui.MenuItemRenderer.prototype.decorate = function(item, element) {
  if(!this.hasContentStructure(element)) {
    element.appendChild(this.createContent(element.childNodes, item.getDomHelper()))
  }
  if(goog.dom.classlist.contains(element, goog.getCssName("goog-option"))) {
    (item).setCheckable(true);
    this.setCheckable(item, element, true)
  }
  return goog.ui.MenuItemRenderer.superClass_.decorate.call(this, item, element)
};
goog.ui.MenuItemRenderer.prototype.setContent = function(element, content) {
  var contentElement = this.getContentElement(element);
  var checkBoxElement = this.hasCheckBoxStructure(element) ? contentElement.firstChild : null;
  goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content);
  if(checkBoxElement && !this.hasCheckBoxStructure(element)) {
    contentElement.insertBefore(checkBoxElement, contentElement.firstChild || null)
  }
};
goog.ui.MenuItemRenderer.prototype.hasContentStructure = function(element) {
  var child = goog.dom.getFirstElementChild(element);
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return!!child && goog.dom.classlist.contains(child, contentClassName)
};
goog.ui.MenuItemRenderer.prototype.createContent = function(content, dom) {
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return dom.createDom("div", contentClassName, content)
};
goog.ui.MenuItemRenderer.prototype.setSelectable = function(item, element, selectable) {
  if(element) {
    goog.a11y.aria.setRole(element, selectable ? goog.a11y.aria.Role.MENU_ITEM_RADIO : (this.getAriaRole()));
    this.setEnableCheckBoxStructure(item, element, selectable)
  }
};
goog.ui.MenuItemRenderer.prototype.setCheckable = function(item, element, checkable) {
  if(element) {
    goog.a11y.aria.setRole(element, checkable ? goog.a11y.aria.Role.MENU_ITEM_CHECKBOX : (this.getAriaRole()));
    this.setEnableCheckBoxStructure(item, element, checkable)
  }
};
goog.ui.MenuItemRenderer.prototype.hasCheckBoxStructure = function(element) {
  var contentElement = this.getContentElement(element);
  if(contentElement) {
    var child = contentElement.firstChild;
    var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
    return!!child && (goog.dom.isElement(child) && goog.dom.classlist.contains((child), checkboxClassName))
  }
  return false
};
goog.ui.MenuItemRenderer.prototype.setEnableCheckBoxStructure = function(item, element, enable) {
  if(enable != this.hasCheckBoxStructure(element)) {
    goog.dom.classlist.enable(element, goog.getCssName("goog-option"), enable);
    var contentElement = this.getContentElement(element);
    if(enable) {
      var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
      contentElement.insertBefore(item.getDomHelper().createDom("div", checkboxClassName), contentElement.firstChild || null)
    }else {
      contentElement.removeChild(contentElement.firstChild)
    }
  }
};
goog.ui.MenuItemRenderer.prototype.getClassForState = function(state) {
  switch(state) {
    case goog.ui.Component.State.HOVER:
      return this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
    case goog.ui.Component.State.CHECKED:
    ;
    case goog.ui.Component.State.SELECTED:
      return goog.getCssName("goog-option-selected");
    default:
      return goog.ui.MenuItemRenderer.superClass_.getClassForState.call(this, state)
  }
};
goog.ui.MenuItemRenderer.prototype.getStateFromClass = function(className) {
  var hoverClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
  switch(className) {
    case goog.getCssName("goog-option-selected"):
      return goog.ui.Component.State.CHECKED;
    case hoverClassName:
      return goog.ui.Component.State.HOVER;
    default:
      return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(this, className)
  }
};
goog.ui.MenuItemRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuItemRenderer.CSS_CLASS
};
goog.ui.MenuItemRenderer.prototype.correctAriaRole = function(item, element) {
  if(item.isSupportedState(goog.ui.Component.State.SELECTED) || item.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.setAriaRole(element, item.isSupportedState(goog.ui.Component.State.CHECKED) ? goog.a11y.aria.Role.MENU_ITEM_CHECKBOX : goog.a11y.aria.Role.MENU_ITEM_RADIO)
  }
};
goog.provide("goog.ui.MenuItem");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.math.Coordinate");
goog.require("goog.string");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuItemRenderer");
goog.require("goog.ui.registry");
goog.ui.MenuItem = function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuItemRenderer.getInstance(), opt_domHelper);
  this.setValue(opt_model)
};
goog.inherits(goog.ui.MenuItem, goog.ui.Control);
goog.ui.MenuItem.mnemonicKey_;
goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_ = goog.getCssName("goog-menuitem-mnemonic-separator");
goog.ui.MenuItem.ACCELERATOR_CLASS_ = goog.getCssName("goog-menuitem-accel");
goog.ui.MenuItem.prototype.getValue = function() {
  var model = this.getModel();
  return model != null ? model : this.getCaption()
};
goog.ui.MenuItem.prototype.setValue = function(value) {
  this.setModel(value)
};
goog.ui.MenuItem.prototype.setSelectable = function(selectable) {
  this.setSupportedState(goog.ui.Component.State.SELECTED, selectable);
  if(this.isChecked() && !selectable) {
    this.setChecked(false)
  }
  var element = this.getElement();
  if(element) {
    this.getRenderer().setSelectable(this, element, selectable)
  }
};
goog.ui.MenuItem.prototype.setCheckable = function(checkable) {
  this.setSupportedState(goog.ui.Component.State.CHECKED, checkable);
  var element = this.getElement();
  if(element) {
    this.getRenderer().setCheckable(this, element, checkable)
  }
};
goog.ui.MenuItem.prototype.getCaption = function() {
  var content = this.getContent();
  if(goog.isArray(content)) {
    var acceleratorClass = goog.ui.MenuItem.ACCELERATOR_CLASS_;
    var mnemonicWrapClass = goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_;
    var caption = goog.array.map(content, function(node) {
      if(goog.dom.isElement(node) && (goog.dom.classlist.contains((node), acceleratorClass) || goog.dom.classlist.contains((node), mnemonicWrapClass))) {
        return""
      }else {
        return goog.dom.getRawTextContent(node)
      }
    }).join("");
    return goog.string.collapseBreakingSpaces(caption)
  }
  return goog.ui.MenuItem.superClass_.getCaption.call(this)
};
goog.ui.MenuItem.prototype.handleMouseUp = function(e) {
  var parentMenu = (this.getParent());
  if(parentMenu) {
    var oldCoords = parentMenu.openingCoords;
    parentMenu.openingCoords = null;
    if(oldCoords && goog.isNumber(e.clientX)) {
      var newCoords = new goog.math.Coordinate(e.clientX, e.clientY);
      if(goog.math.Coordinate.equals(oldCoords, newCoords)) {
        return
      }
    }
  }
  goog.ui.MenuItem.base(this, "handleMouseUp", e)
};
goog.ui.MenuItem.prototype.handleKeyEventInternal = function(e) {
  if(e.keyCode == this.getMnemonic() && this.performActionInternal(e)) {
    return true
  }else {
    return goog.ui.MenuItem.base(this, "handleKeyEventInternal", e)
  }
};
goog.ui.MenuItem.prototype.setMnemonic = function(key) {
  this.mnemonicKey_ = key
};
goog.ui.MenuItem.prototype.getMnemonic = function() {
  return this.mnemonicKey_
};
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuItemRenderer.CSS_CLASS, function() {
  return new goog.ui.MenuItem(null)
});
goog.ui.MenuItem.prototype.createDom = function() {
  goog.ui.MenuItem.base(this, "createDom");
  this.getRenderer().correctAriaRole(this, this.getElement())
};
goog.provide("goog.ui.Container");
goog.provide("goog.ui.Container.EventType");
goog.provide("goog.ui.Container.Orientation");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.ui.ContainerRenderer");
goog.require("goog.ui.Control");
goog.ui.Container = function(opt_orientation, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
  this.orientation_ = opt_orientation || this.renderer_.getDefaultOrientation()
};
goog.inherits(goog.ui.Container, goog.ui.Component);
goog.ui.Container.EventType = {AFTER_SHOW:"aftershow", AFTER_HIDE:"afterhide"};
goog.ui.Container.Orientation = {HORIZONTAL:"horizontal", VERTICAL:"vertical"};
goog.ui.Container.prototype.keyEventTarget_ = null;
goog.ui.Container.prototype.keyHandler_ = null;
goog.ui.Container.prototype.renderer_ = null;
goog.ui.Container.prototype.orientation_ = null;
goog.ui.Container.prototype.visible_ = true;
goog.ui.Container.prototype.enabled_ = true;
goog.ui.Container.prototype.focusable_ = true;
goog.ui.Container.prototype.highlightedIndex_ = -1;
goog.ui.Container.prototype.openItem_ = null;
goog.ui.Container.prototype.mouseButtonPressed_ = false;
goog.ui.Container.prototype.allowFocusableChildren_ = false;
goog.ui.Container.prototype.openFollowsHighlight_ = true;
goog.ui.Container.prototype.childElementIdMap_ = null;
goog.ui.Container.prototype.getKeyEventTarget = function() {
  return this.keyEventTarget_ || this.renderer_.getKeyEventTarget(this)
};
goog.ui.Container.prototype.setKeyEventTarget = function(element) {
  if(this.focusable_) {
    var oldTarget = this.getKeyEventTarget();
    var inDocument = this.isInDocument();
    this.keyEventTarget_ = element;
    var newTarget = this.getKeyEventTarget();
    if(inDocument) {
      this.keyEventTarget_ = oldTarget;
      this.enableFocusHandling_(false);
      this.keyEventTarget_ = element;
      this.getKeyHandler().attach(newTarget);
      this.enableFocusHandling_(true)
    }
  }else {
    throw Error("Can't set key event target for container " + "that doesn't support keyboard focus!");
  }
};
goog.ui.Container.prototype.getKeyHandler = function() {
  return this.keyHandler_ || (this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget()))
};
goog.ui.Container.prototype.getRenderer = function() {
  return this.renderer_
};
goog.ui.Container.prototype.setRenderer = function(renderer) {
  if(this.getElement()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.renderer_ = renderer
};
goog.ui.Container.prototype.createDom = function() {
  this.setElementInternal(this.renderer_.createDom(this))
};
goog.ui.Container.prototype.getContentElement = function() {
  return this.renderer_.getContentElement(this.getElement())
};
goog.ui.Container.prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element)
};
goog.ui.Container.prototype.decorateInternal = function(element) {
  this.setElementInternal(this.renderer_.decorate(this, element));
  if(element.style.display == "none") {
    this.visible_ = false
  }
};
goog.ui.Container.prototype.enterDocument = function() {
  goog.ui.Container.superClass_.enterDocument.call(this);
  this.forEachChild(function(child) {
    if(child.isInDocument()) {
      this.registerChildId_(child)
    }
  }, this);
  var elem = this.getElement();
  this.renderer_.initializeDom(this);
  this.setVisible(this.visible_, true);
  this.getHandler().listen(this, goog.ui.Component.EventType.ENTER, this.handleEnterItem).listen(this, goog.ui.Component.EventType.HIGHLIGHT, this.handleHighlightItem).listen(this, goog.ui.Component.EventType.UNHIGHLIGHT, this.handleUnHighlightItem).listen(this, goog.ui.Component.EventType.OPEN, this.handleOpenItem).listen(this, goog.ui.Component.EventType.CLOSE, this.handleCloseItem).listen(elem, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).listen(goog.dom.getOwnerDocument(elem), goog.events.EventType.MOUSEUP, 
  this.handleDocumentMouseUp).listen(elem, [goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP, goog.events.EventType.MOUSEOVER, goog.events.EventType.MOUSEOUT, goog.events.EventType.CONTEXTMENU], this.handleChildMouseEvents);
  if(this.isFocusable()) {
    this.enableFocusHandling_(true)
  }
};
goog.ui.Container.prototype.enableFocusHandling_ = function(enable) {
  var handler = this.getHandler();
  var keyTarget = this.getKeyEventTarget();
  if(enable) {
    handler.listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur).listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent)
  }else {
    handler.unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur).unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent)
  }
};
goog.ui.Container.prototype.exitDocument = function() {
  this.setHighlightedIndex(-1);
  if(this.openItem_) {
    this.openItem_.setOpen(false)
  }
  this.mouseButtonPressed_ = false;
  goog.ui.Container.superClass_.exitDocument.call(this)
};
goog.ui.Container.prototype.disposeInternal = function() {
  goog.ui.Container.superClass_.disposeInternal.call(this);
  if(this.keyHandler_) {
    this.keyHandler_.dispose();
    this.keyHandler_ = null
  }
  this.keyEventTarget_ = null;
  this.childElementIdMap_ = null;
  this.openItem_ = null;
  this.renderer_ = null
};
goog.ui.Container.prototype.handleEnterItem = function(e) {
  return true
};
goog.ui.Container.prototype.handleHighlightItem = function(e) {
  var index = this.indexOfChild((e.target));
  if(index > -1 && index != this.highlightedIndex_) {
    var item = this.getHighlighted();
    if(item) {
      item.setHighlighted(false)
    }
    this.highlightedIndex_ = index;
    item = this.getHighlighted();
    if(this.isMouseButtonPressed()) {
      item.setActive(true)
    }
    if(this.openFollowsHighlight_ && (this.openItem_ && item != this.openItem_)) {
      if(item.isSupportedState(goog.ui.Component.State.OPENED)) {
        item.setOpen(true)
      }else {
        this.openItem_.setOpen(false)
      }
    }
  }
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the container cannot be null.");
  if(e.target.getElement() != null) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, e.target.getElement().id)
  }
};
goog.ui.Container.prototype.handleUnHighlightItem = function(e) {
  if(e.target == this.getHighlighted()) {
    this.highlightedIndex_ = -1
  }
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the container cannot be null.");
  goog.a11y.aria.removeState(element, goog.a11y.aria.State.ACTIVEDESCENDANT)
};
goog.ui.Container.prototype.handleOpenItem = function(e) {
  var item = (e.target);
  if(item && (item != this.openItem_ && item.getParent() == this)) {
    if(this.openItem_) {
      this.openItem_.setOpen(false)
    }
    this.openItem_ = item
  }
};
goog.ui.Container.prototype.handleCloseItem = function(e) {
  if(e.target == this.openItem_) {
    this.openItem_ = null
  }
};
goog.ui.Container.prototype.handleMouseDown = function(e) {
  if(this.enabled_) {
    this.setMouseButtonPressed(true)
  }
  var keyTarget = this.getKeyEventTarget();
  if(keyTarget && goog.dom.isFocusableTabIndex(keyTarget)) {
    keyTarget.focus()
  }else {
    e.preventDefault()
  }
};
goog.ui.Container.prototype.handleDocumentMouseUp = function(e) {
  this.setMouseButtonPressed(false)
};
goog.ui.Container.prototype.handleChildMouseEvents = function(e) {
  var control = this.getOwnerControl((e.target));
  if(control) {
    switch(e.type) {
      case goog.events.EventType.MOUSEDOWN:
        control.handleMouseDown(e);
        break;
      case goog.events.EventType.MOUSEUP:
        control.handleMouseUp(e);
        break;
      case goog.events.EventType.MOUSEOVER:
        control.handleMouseOver(e);
        break;
      case goog.events.EventType.MOUSEOUT:
        control.handleMouseOut(e);
        break;
      case goog.events.EventType.CONTEXTMENU:
        control.handleContextMenu(e);
        break
    }
  }
};
goog.ui.Container.prototype.getOwnerControl = function(node) {
  if(this.childElementIdMap_) {
    var elem = this.getElement();
    while(node && node !== elem) {
      var id = node.id;
      if(id in this.childElementIdMap_) {
        return this.childElementIdMap_[id]
      }
      node = node.parentNode
    }
  }
  return null
};
goog.ui.Container.prototype.handleFocus = function(e) {
};
goog.ui.Container.prototype.handleBlur = function(e) {
  this.setHighlightedIndex(-1);
  this.setMouseButtonPressed(false);
  if(this.openItem_) {
    this.openItem_.setOpen(false)
  }
};
goog.ui.Container.prototype.handleKeyEvent = function(e) {
  if(this.isEnabled() && (this.isVisible() && ((this.getChildCount() != 0 || this.keyEventTarget_) && this.handleKeyEventInternal(e)))) {
    e.preventDefault();
    e.stopPropagation();
    return true
  }
  return false
};
goog.ui.Container.prototype.handleKeyEventInternal = function(e) {
  var highlighted = this.getHighlighted();
  if(highlighted && (typeof highlighted.handleKeyEvent == "function" && highlighted.handleKeyEvent(e))) {
    return true
  }
  if(this.openItem_ && (this.openItem_ != highlighted && (typeof this.openItem_.handleKeyEvent == "function" && this.openItem_.handleKeyEvent(e)))) {
    return true
  }
  if(e.shiftKey || (e.ctrlKey || (e.metaKey || e.altKey))) {
    return false
  }
  switch(e.keyCode) {
    case goog.events.KeyCodes.ESC:
      if(this.isFocusable()) {
        this.getKeyEventTarget().blur()
      }else {
        return false
      }
      break;
    case goog.events.KeyCodes.HOME:
      this.highlightFirst();
      break;
    case goog.events.KeyCodes.END:
      this.highlightLast();
      break;
    case goog.events.KeyCodes.UP:
      if(this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightPrevious()
      }else {
        return false
      }
      break;
    case goog.events.KeyCodes.LEFT:
      if(this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if(this.isRightToLeft()) {
          this.highlightNext()
        }else {
          this.highlightPrevious()
        }
      }else {
        return false
      }
      break;
    case goog.events.KeyCodes.DOWN:
      if(this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightNext()
      }else {
        return false
      }
      break;
    case goog.events.KeyCodes.RIGHT:
      if(this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if(this.isRightToLeft()) {
          this.highlightPrevious()
        }else {
          this.highlightNext()
        }
      }else {
        return false
      }
      break;
    default:
      return false
  }
  return true
};
goog.ui.Container.prototype.registerChildId_ = function(child) {
  var childElem = child.getElement();
  var id = childElem.id || (childElem.id = child.getId());
  if(!this.childElementIdMap_) {
    this.childElementIdMap_ = {}
  }
  this.childElementIdMap_[id] = child
};
goog.ui.Container.prototype.addChild = function(child, opt_render) {
  goog.asserts.assertInstanceof(child, goog.ui.Control, "The child of a container must be a control");
  goog.ui.Container.superClass_.addChild.call(this, child, opt_render)
};
goog.ui.Container.prototype.getChild;
goog.ui.Container.prototype.getChildAt;
goog.ui.Container.prototype.addChildAt = function(control, index, opt_render) {
  control.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true);
  control.setDispatchTransitionEvents(goog.ui.Component.State.OPENED, true);
  if(this.isFocusable() || !this.isFocusableChildrenAllowed()) {
    control.setSupportedState(goog.ui.Component.State.FOCUSED, false)
  }
  control.setHandleMouseEvents(false);
  goog.ui.Container.superClass_.addChildAt.call(this, control, index, opt_render);
  if(control.isInDocument() && this.isInDocument()) {
    this.registerChildId_(control)
  }
  if(index <= this.highlightedIndex_) {
    this.highlightedIndex_++
  }
};
goog.ui.Container.prototype.removeChild = function(control, opt_unrender) {
  control = goog.isString(control) ? this.getChild(control) : control;
  if(control) {
    var index = this.indexOfChild(control);
    if(index != -1) {
      if(index == this.highlightedIndex_) {
        control.setHighlighted(false);
        this.highlightedIndex_ = -1
      }else {
        if(index < this.highlightedIndex_) {
          this.highlightedIndex_--
        }
      }
    }
    var childElem = control.getElement();
    if(childElem && (childElem.id && this.childElementIdMap_)) {
      goog.object.remove(this.childElementIdMap_, childElem.id)
    }
  }
  control = (goog.ui.Container.superClass_.removeChild.call(this, control, opt_unrender));
  control.setHandleMouseEvents(true);
  return control
};
goog.ui.Container.prototype.getOrientation = function() {
  return this.orientation_
};
goog.ui.Container.prototype.setOrientation = function(orientation) {
  if(this.getElement()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.orientation_ = orientation
};
goog.ui.Container.prototype.isVisible = function() {
  return this.visible_
};
goog.ui.Container.prototype.setVisible = function(visible, opt_force) {
  if(opt_force || this.visible_ != visible && this.dispatchEvent(visible ? goog.ui.Component.EventType.SHOW : goog.ui.Component.EventType.HIDE)) {
    this.visible_ = visible;
    var elem = this.getElement();
    if(elem) {
      goog.style.setElementShown(elem, visible);
      if(this.isFocusable()) {
        this.renderer_.enableTabIndex(this.getKeyEventTarget(), this.enabled_ && this.visible_)
      }
      if(!opt_force) {
        this.dispatchEvent(this.visible_ ? goog.ui.Container.EventType.AFTER_SHOW : goog.ui.Container.EventType.AFTER_HIDE)
      }
    }
    return true
  }
  return false
};
goog.ui.Container.prototype.isEnabled = function() {
  return this.enabled_
};
goog.ui.Container.prototype.setEnabled = function(enable) {
  if(this.enabled_ != enable && this.dispatchEvent(enable ? goog.ui.Component.EventType.ENABLE : goog.ui.Component.EventType.DISABLE)) {
    if(enable) {
      this.enabled_ = true;
      this.forEachChild(function(child) {
        if(child.wasDisabled) {
          delete child.wasDisabled
        }else {
          child.setEnabled(true)
        }
      })
    }else {
      this.forEachChild(function(child) {
        if(child.isEnabled()) {
          child.setEnabled(false)
        }else {
          child.wasDisabled = true
        }
      });
      this.enabled_ = false;
      this.setMouseButtonPressed(false)
    }
    if(this.isFocusable()) {
      this.renderer_.enableTabIndex(this.getKeyEventTarget(), enable && this.visible_)
    }
  }
};
goog.ui.Container.prototype.isFocusable = function() {
  return this.focusable_
};
goog.ui.Container.prototype.setFocusable = function(focusable) {
  if(focusable != this.focusable_ && this.isInDocument()) {
    this.enableFocusHandling_(focusable)
  }
  this.focusable_ = focusable;
  if(this.enabled_ && this.visible_) {
    this.renderer_.enableTabIndex(this.getKeyEventTarget(), focusable)
  }
};
goog.ui.Container.prototype.isFocusableChildrenAllowed = function() {
  return this.allowFocusableChildren_
};
goog.ui.Container.prototype.setFocusableChildrenAllowed = function(focusable) {
  this.allowFocusableChildren_ = focusable
};
goog.ui.Container.prototype.isOpenFollowsHighlight = function() {
  return this.openFollowsHighlight_
};
goog.ui.Container.prototype.setOpenFollowsHighlight = function(follow) {
  this.openFollowsHighlight_ = follow
};
goog.ui.Container.prototype.getHighlightedIndex = function() {
  return this.highlightedIndex_
};
goog.ui.Container.prototype.setHighlightedIndex = function(index) {
  var child = this.getChildAt(index);
  if(child) {
    child.setHighlighted(true)
  }else {
    if(this.highlightedIndex_ > -1) {
      this.getHighlighted().setHighlighted(false)
    }
  }
};
goog.ui.Container.prototype.setHighlighted = function(item) {
  this.setHighlightedIndex(this.indexOfChild(item))
};
goog.ui.Container.prototype.getHighlighted = function() {
  return this.getChildAt(this.highlightedIndex_)
};
goog.ui.Container.prototype.highlightFirst = function() {
  this.highlightHelper(function(index, max) {
    return(index + 1) % max
  }, this.getChildCount() - 1)
};
goog.ui.Container.prototype.highlightLast = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index
  }, 0)
};
goog.ui.Container.prototype.highlightNext = function() {
  this.highlightHelper(function(index, max) {
    return(index + 1) % max
  }, this.highlightedIndex_)
};
goog.ui.Container.prototype.highlightPrevious = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index
  }, this.highlightedIndex_)
};
goog.ui.Container.prototype.highlightHelper = function(fn, startIndex) {
  var curIndex = startIndex < 0 ? this.indexOfChild(this.openItem_) : startIndex;
  var numItems = this.getChildCount();
  curIndex = fn.call(this, curIndex, numItems);
  var visited = 0;
  while(visited <= numItems) {
    var control = this.getChildAt(curIndex);
    if(control && this.canHighlightItem(control)) {
      this.setHighlightedIndexFromKeyEvent(curIndex);
      return true
    }
    visited++;
    curIndex = fn.call(this, curIndex, numItems)
  }
  return false
};
goog.ui.Container.prototype.canHighlightItem = function(item) {
  return item.isVisible() && (item.isEnabled() && item.isSupportedState(goog.ui.Component.State.HOVER))
};
goog.ui.Container.prototype.setHighlightedIndexFromKeyEvent = function(index) {
  this.setHighlightedIndex(index)
};
goog.ui.Container.prototype.getOpenItem = function() {
  return this.openItem_
};
goog.ui.Container.prototype.isMouseButtonPressed = function() {
  return this.mouseButtonPressed_
};
goog.ui.Container.prototype.setMouseButtonPressed = function(pressed) {
  this.mouseButtonPressed_ = pressed
};
goog.provide("goog.ui.MenuHeaderRenderer");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuHeaderRenderer = function() {
  goog.ui.ControlRenderer.call(this)
};
goog.inherits(goog.ui.MenuHeaderRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuHeaderRenderer);
goog.ui.MenuHeaderRenderer.CSS_CLASS = goog.getCssName("goog-menuheader");
goog.ui.MenuHeaderRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuHeaderRenderer.CSS_CLASS
};
goog.provide("goog.ui.MenuHeader");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuHeaderRenderer");
goog.require("goog.ui.registry");
goog.ui.MenuHeader = function(content, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuHeaderRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setStateInternal(goog.ui.Component.State.DISABLED)
};
goog.inherits(goog.ui.MenuHeader, goog.ui.Control);
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuHeaderRenderer.CSS_CLASS, function() {
  return new goog.ui.MenuHeader(null)
});
goog.provide("goog.ui.Menu");
goog.provide("goog.ui.Menu.EventType");
goog.require("goog.math.Coordinate");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.Component.EventType");
goog.require("goog.ui.Component.State");
goog.require("goog.ui.Container");
goog.require("goog.ui.Container.Orientation");
goog.require("goog.ui.MenuHeader");
goog.require("goog.ui.MenuItem");
goog.require("goog.ui.MenuRenderer");
goog.require("goog.ui.MenuSeparator");
goog.ui.Menu = function(opt_domHelper, opt_renderer) {
  goog.ui.Container.call(this, goog.ui.Container.Orientation.VERTICAL, opt_renderer || goog.ui.MenuRenderer.getInstance(), opt_domHelper);
  this.setFocusable(false)
};
goog.inherits(goog.ui.Menu, goog.ui.Container);
goog.ui.Menu.EventType = {BEFORE_SHOW:goog.ui.Component.EventType.BEFORE_SHOW, SHOW:goog.ui.Component.EventType.SHOW, BEFORE_HIDE:goog.ui.Component.EventType.HIDE, HIDE:goog.ui.Component.EventType.HIDE};
goog.ui.Menu.CSS_CLASS = goog.ui.MenuRenderer.CSS_CLASS;
goog.ui.Menu.prototype.openingCoords;
goog.ui.Menu.prototype.allowAutoFocus_ = true;
goog.ui.Menu.prototype.allowHighlightDisabled_ = false;
goog.ui.Menu.prototype.getCssClass = function() {
  return this.getRenderer().getCssClass()
};
goog.ui.Menu.prototype.containsElement = function(element) {
  if(this.getRenderer().containsElement(this, element)) {
    return true
  }
  for(var i = 0, count = this.getChildCount();i < count;i++) {
    var child = this.getChildAt(i);
    if(typeof child.containsElement == "function" && child.containsElement(element)) {
      return true
    }
  }
  return false
};
goog.ui.Menu.prototype.addItem = function(item) {
  this.addChild(item, true)
};
goog.ui.Menu.prototype.addItemAt = function(item, n) {
  this.addChildAt(item, n, true)
};
goog.ui.Menu.prototype.removeItem = function(item) {
  var removedChild = this.removeChild(item, true);
  if(removedChild) {
    removedChild.dispose()
  }
};
goog.ui.Menu.prototype.removeItemAt = function(n) {
  var removedChild = this.removeChildAt(n, true);
  if(removedChild) {
    removedChild.dispose()
  }
};
goog.ui.Menu.prototype.getItemAt = function(n) {
  return(this.getChildAt(n))
};
goog.ui.Menu.prototype.getItemCount = function() {
  return this.getChildCount()
};
goog.ui.Menu.prototype.getItems = function() {
  var children = [];
  this.forEachChild(function(child) {
    children.push(child)
  });
  return children
};
goog.ui.Menu.prototype.setPosition = function(x, opt_y) {
  var visible = this.isVisible();
  if(!visible) {
    goog.style.setElementShown(this.getElement(), true)
  }
  goog.style.setPageOffset(this.getElement(), x, opt_y);
  if(!visible) {
    goog.style.setElementShown(this.getElement(), false)
  }
};
goog.ui.Menu.prototype.getPosition = function() {
  return this.isVisible() ? goog.style.getPageOffset(this.getElement()) : null
};
goog.ui.Menu.prototype.setAllowAutoFocus = function(allow) {
  this.allowAutoFocus_ = allow;
  if(allow) {
    this.setFocusable(true)
  }
};
goog.ui.Menu.prototype.getAllowAutoFocus = function() {
  return this.allowAutoFocus_
};
goog.ui.Menu.prototype.setAllowHighlightDisabled = function(allow) {
  this.allowHighlightDisabled_ = allow
};
goog.ui.Menu.prototype.getAllowHighlightDisabled = function() {
  return this.allowHighlightDisabled_
};
goog.ui.Menu.prototype.setVisible = function(show, opt_force, opt_e) {
  var visibilityChanged = goog.ui.Menu.superClass_.setVisible.call(this, show, opt_force);
  if(visibilityChanged && (show && (this.isInDocument() && this.allowAutoFocus_))) {
    this.getKeyEventTarget().focus()
  }
  if(show && (opt_e && goog.isNumber(opt_e.clientX))) {
    this.openingCoords = new goog.math.Coordinate(opt_e.clientX, opt_e.clientY)
  }else {
    this.openingCoords = null
  }
  return visibilityChanged
};
goog.ui.Menu.prototype.handleEnterItem = function(e) {
  if(this.allowAutoFocus_) {
    this.getKeyEventTarget().focus()
  }
  return goog.ui.Menu.superClass_.handleEnterItem.call(this, e)
};
goog.ui.Menu.prototype.highlightNextPrefix = function(charStr) {
  var re = new RegExp("^" + goog.string.regExpEscape(charStr), "i");
  return this.highlightHelper(function(index, max) {
    var start = index < 0 ? 0 : index;
    var wrapped = false;
    do {
      ++index;
      if(index == max) {
        index = 0;
        wrapped = true
      }
      var name = this.getChildAt(index).getCaption();
      if(name && name.match(re)) {
        return index
      }
    }while(!wrapped || index != start);
    return this.getHighlightedIndex()
  }, this.getHighlightedIndex())
};
goog.ui.Menu.prototype.canHighlightItem = function(item) {
  return(this.allowHighlightDisabled_ || item.isEnabled()) && (item.isVisible() && item.isSupportedState(goog.ui.Component.State.HOVER))
};
goog.ui.Menu.prototype.decorateInternal = function(element) {
  this.decorateContent(element);
  goog.ui.Menu.superClass_.decorateInternal.call(this, element)
};
goog.ui.Menu.prototype.handleKeyEventInternal = function(e) {
  var handled = goog.ui.Menu.base(this, "handleKeyEventInternal", e);
  if(!handled) {
    this.forEachChild(function(menuItem) {
      if(!handled && (menuItem.getMnemonic && menuItem.getMnemonic() == e.keyCode)) {
        if(this.isEnabled()) {
          this.setHighlighted(menuItem)
        }
        handled = menuItem.handleKeyEvent(e)
      }
    }, this)
  }
  return handled
};
goog.ui.Menu.prototype.setHighlightedIndex = function(index) {
  goog.ui.Menu.base(this, "setHighlightedIndex", index);
  var child = this.getChildAt(index);
  if(child) {
    goog.style.scrollIntoContainerView(child.getElement(), this.getElement())
  }
};
goog.ui.Menu.prototype.decorateContent = function(element) {
  var renderer = this.getRenderer();
  var contentElements = this.getDomHelper().getElementsByTagNameAndClass("div", goog.getCssName(renderer.getCssClass(), "content"), element);
  var length = contentElements.length;
  for(var i = 0;i < length;i++) {
    renderer.decorateChildren(this, contentElements[i])
  }
};
goog.provide("Blockly.ContextMenu");
goog.require("goog.dom");
goog.require("goog.style");
goog.require("goog.ui.Menu");
goog.require("goog.ui.MenuItem");
Blockly.ContextMenu.currentBlock = null;
Blockly.ContextMenu.show = function(e, options) {
  Blockly.WidgetDiv.show(Blockly.ContextMenu, null);
  if(!options.length) {
    Blockly.ContextMenu.hide();
    return
  }
  var menu = new goog.ui.Menu;
  for(var x = 0, option;option = options[x];x++) {
    var menuItem = new goog.ui.MenuItem(option.text);
    menu.addItem(menuItem);
    menuItem.setEnabled(option.enabled);
    if(option.enabled) {
      var evtHandlerCapturer = function(callback) {
        return function() {
          Blockly.doCommand(callback)
        }
      };
      goog.events.listen(menuItem, goog.ui.Component.EventType.ACTION, evtHandlerCapturer(option.callback))
    }
  }
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, Blockly.ContextMenu.hide);
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  menu.setAllowAutoFocus(true);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, "blocklyContextMenu");
  var menuSize = goog.style.getSize(menuDom);
  var x = e.clientX + scrollOffset.x;
  var y = e.clientY + scrollOffset.y;
  if(e.clientY + menuSize.height >= windowSize.height) {
    y -= menuSize.height
  }
  if(Blockly.RTL) {
    if(menuSize.width >= e.clientX) {
      x += menuSize.width
    }
  }else {
    if(e.clientX + menuSize.width >= windowSize.width) {
      x -= menuSize.width
    }
  }
  Blockly.WidgetDiv.position(x, y, windowSize, scrollOffset);
  Blockly.ContextMenu.currentBlock = null
};
Blockly.ContextMenu.hide = function() {
  Blockly.WidgetDiv.hideIfOwner(Blockly.ContextMenu);
  Blockly.ContextMenu.currentBlock = null
};
Blockly.ContextMenu.optionToDom_ = function(text) {
  var gElement = Blockly.createSvgElement("g", {"class":"blocklyMenuDiv"}, null);
  var rectElement = Blockly.createSvgElement("rect", {"height":Blockly.ContextMenu.Y_HEIGHT}, gElement);
  var textElement = Blockly.createSvgElement("text", {"class":"blocklyMenuText", "x":Blockly.ContextMenu.X_PADDING, "y":15}, gElement);
  var textNode = document.createTextNode(text);
  textElement.appendChild(textNode);
  return gElement
};
Blockly.ContextMenu.hide = function() {
  if(Blockly.ContextMenu.visible) {
    Blockly.ContextMenu.svgGroup.style.display = "none";
    Blockly.ContextMenu.visible = false
  }
};
Blockly.ContextMenu.callbackFactory = function(block, xml) {
  return function() {
    var newBlock = Blockly.Xml.domToBlock_(block.workspace, xml);
    var xy = block.getRelativeToSurfaceXY();
    if(Blockly.RTL) {
      xy.x -= Blockly.SNAP_RADIUS
    }else {
      xy.x += Blockly.SNAP_RADIUS
    }
    xy.y += Blockly.SNAP_RADIUS * 2;
    newBlock.moveBy(xy.x, xy.y);
    newBlock.select()
  }
};
goog.provide("Blockly.Bubble");
goog.require("Blockly.Workspace");
Blockly.Bubble = function(workspace, content, shape, anchorX, anchorY, bubbleWidth, bubbleHeight) {
  var angle = Blockly.Bubble.ARROW_ANGLE;
  if(Blockly.RTL) {
    angle = -angle
  }
  this.arrow_radians_ = angle / 360 * Math.PI * 2;
  this.workspace_ = workspace;
  this.content_ = content;
  this.shape_ = shape;
  var canvas = workspace.getBubbleCanvas();
  canvas.appendChild(this.createDom_(content, !!(bubbleWidth && bubbleHeight)));
  this.setAnchorLocation(anchorX, anchorY);
  if(!bubbleWidth || !bubbleHeight) {
    var bBox;
    try {
      bBox = content.getBBox()
    }catch(e) {
      bBox = this.workspace_.getCanvas().getBBox()
    }
    bubbleWidth = bBox.width + 2 * Blockly.Bubble.BORDER_WIDTH;
    bubbleHeight = bBox.height + 2 * Blockly.Bubble.BORDER_WIDTH
  }
  this.setBubbleSize(bubbleWidth, bubbleHeight);
  this.positionBubble_();
  this.renderArrow_();
  this.rendered_ = true;
  if(!Blockly.readOnly) {
    Blockly.bindEvent_(this.bubbleBack_, "mousedown", this, this.bubbleMouseDown_);
    if(this.resizeGroup_) {
      Blockly.bindEvent_(this.resizeGroup_, "mousedown", this, this.resizeMouseDown_)
    }
  }
};
Blockly.Bubble.BORDER_WIDTH = 6;
Blockly.Bubble.ARROW_THICKNESS = 10;
Blockly.Bubble.ARROW_ANGLE = 20;
Blockly.Bubble.ARROW_BEND = 4;
Blockly.Bubble.ANCHOR_RADIUS = 8;
Blockly.Bubble.onMouseUpWrapper_ = null;
Blockly.Bubble.onMouseMoveWrapper_ = null;
Blockly.Bubble.unbindDragEvents_ = function() {
  if(Blockly.Bubble.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Bubble.onMouseUpWrapper_);
    Blockly.Bubble.onMouseUpWrapper_ = null
  }
  if(Blockly.Bubble.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Bubble.onMouseMoveWrapper_);
    Blockly.Bubble.onMouseMoveWrapper_ = null
  }
};
Blockly.Bubble.prototype.rendered_ = false;
Blockly.Bubble.prototype.anchorX_ = 0;
Blockly.Bubble.prototype.anchorY_ = 0;
Blockly.Bubble.prototype.relativeLeft_ = 0;
Blockly.Bubble.prototype.relativeTop_ = 0;
Blockly.Bubble.prototype.width_ = 0;
Blockly.Bubble.prototype.height_ = 0;
Blockly.Bubble.prototype.autoLayout_ = true;
Blockly.Bubble.prototype.createDom_ = function(content, hasResize) {
  this.bubbleGroup_ = Blockly.createSvgElement("g", {}, null);
  var bubbleEmboss = Blockly.createSvgElement("g", {"filter":"url(#blocklyEmboss)"}, this.bubbleGroup_);
  this.bubbleArrow_ = Blockly.createSvgElement("path", {}, bubbleEmboss);
  this.bubbleBack_ = Blockly.createSvgElement("rect", {"class":"blocklyDraggable", "x":0, "y":0, "rx":Blockly.Bubble.BORDER_WIDTH, "ry":Blockly.Bubble.BORDER_WIDTH}, bubbleEmboss);
  if(hasResize) {
    this.resizeGroup_ = Blockly.createSvgElement("g", {"class":Blockly.RTL ? "blocklyResizeSW" : "blocklyResizeSE"}, this.bubbleGroup_);
    var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
    Blockly.createSvgElement("polygon", {"points":"0,x x,x x,0".replace(/x/g, resizeSize.toString())}, this.resizeGroup_);
    Blockly.createSvgElement("line", {"class":"blocklyResizeLine", "x1":resizeSize / 3, "y1":resizeSize - 1, "x2":resizeSize - 1, "y2":resizeSize / 3}, this.resizeGroup_);
    Blockly.createSvgElement("line", {"class":"blocklyResizeLine", "x1":resizeSize * 2 / 3, "y1":resizeSize - 1, "x2":resizeSize - 1, "y2":resizeSize * 2 / 3}, this.resizeGroup_)
  }else {
    this.resizeGroup_ = null
  }
  this.bubbleGroup_.appendChild(content);
  return this.bubbleGroup_
};
Blockly.Bubble.prototype.bubbleMouseDown_ = function(e) {
  this.promote_();
  Blockly.Bubble.unbindDragEvents_();
  if(Blockly.isRightButton(e)) {
    return
  }else {
    if(Blockly.isTargetInput_(e)) {
      return
    }
  }
  Blockly.setCursorHand_(true);
  if(Blockly.RTL) {
    this.dragDeltaX = this.relativeLeft_ + e.clientX
  }else {
    this.dragDeltaX = this.relativeLeft_ - e.clientX
  }
  this.dragDeltaY = this.relativeTop_ - e.clientY;
  Blockly.Bubble.onMouseUpWrapper_ = Blockly.bindEvent_(document, "mouseup", this, Blockly.Bubble.unbindDragEvents_);
  Blockly.Bubble.onMouseMoveWrapper_ = Blockly.bindEvent_(document, "mousemove", this, this.bubbleMouseMove_);
  Blockly.hideChaff();
  e.stopPropagation()
};
Blockly.Bubble.prototype.bubbleMouseMove_ = function(e) {
  this.autoLayout_ = false;
  if(Blockly.RTL) {
    this.relativeLeft_ = this.dragDeltaX - e.clientX
  }else {
    this.relativeLeft_ = this.dragDeltaX + e.clientX
  }
  this.relativeTop_ = this.dragDeltaY + e.clientY;
  this.positionBubble_();
  this.renderArrow_()
};
Blockly.Bubble.prototype.resizeMouseDown_ = function(e) {
  this.promote_();
  Blockly.Bubble.unbindDragEvents_();
  if(Blockly.isRightButton(e)) {
    return
  }
  Blockly.setCursorHand_(true);
  if(Blockly.RTL) {
    this.resizeDeltaWidth = this.width_ + e.clientX
  }else {
    this.resizeDeltaWidth = this.width_ - e.clientX
  }
  this.resizeDeltaHeight = this.height_ - e.clientY;
  Blockly.Bubble.onMouseUpWrapper_ = Blockly.bindEvent_(document, "mouseup", this, Blockly.Bubble.unbindDragEvents_);
  Blockly.Bubble.onMouseMoveWrapper_ = Blockly.bindEvent_(document, "mousemove", this, this.resizeMouseMove_);
  Blockly.hideChaff();
  e.stopPropagation()
};
Blockly.Bubble.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var w = this.resizeDeltaWidth;
  var h = this.resizeDeltaHeight + e.clientY;
  if(Blockly.RTL) {
    w -= e.clientX
  }else {
    w += e.clientX
  }
  this.setBubbleSize(w, h);
  if(Blockly.RTL) {
    this.positionBubble_()
  }
};
Blockly.Bubble.prototype.registerResizeEvent = function(thisObject, callback) {
  Blockly.bindEvent_(this.bubbleGroup_, "resize", thisObject, callback)
};
Blockly.Bubble.prototype.promote_ = function() {
  var svgGroup = this.bubbleGroup_.parentNode;
  svgGroup.appendChild(this.bubbleGroup_)
};
Blockly.Bubble.prototype.setAnchorLocation = function(x, y) {
  this.anchorX_ = x;
  this.anchorY_ = y;
  if(this.rendered_) {
    this.positionBubble_()
  }
};
Blockly.Bubble.prototype.layoutBubble_ = function() {
  var relativeLeft = -this.width_ / 4;
  var relativeTop = -this.height_ - Blockly.BlockSvg.MIN_BLOCK_Y;
  if(this.workspace_.scrollbar) {
    var metrics = this.workspace_.getMetrics();
    if(this.anchorX_ + relativeLeft < Blockly.BlockSvg.SEP_SPACE_X + metrics.viewLeft) {
      relativeLeft = Blockly.BlockSvg.SEP_SPACE_X + metrics.viewLeft - this.anchorX_
    }else {
      if(metrics.viewLeft + metrics.viewWidth < this.anchorX_ + relativeLeft + this.width_ + Blockly.BlockSvg.SEP_SPACE_X + Blockly.Scrollbar.scrollbarThickness) {
        relativeLeft = metrics.viewLeft + metrics.viewWidth - this.anchorX_ - this.width_ - Blockly.BlockSvg.SEP_SPACE_X - Blockly.Scrollbar.scrollbarThickness
      }
    }
    if(this.anchorY_ + relativeTop < Blockly.BlockSvg.SEP_SPACE_Y + metrics.viewTop) {
      if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
        this.shape_.style.display = "inline";
        var bBox = {x:this.shape_.getBBox().x, y:this.shape_.getBBox().y, width:this.shape_.scrollWidth, height:this.shape_.scrollHeight}
      }else {
        var bBox = (this.shape_).getBBox()
      }
      relativeTop = bBox.height
    }
  }
  this.relativeLeft_ = relativeLeft;
  this.relativeTop_ = relativeTop
};
Blockly.Bubble.prototype.positionBubble_ = function() {
  var left;
  if(Blockly.RTL) {
    left = this.anchorX_ - this.relativeLeft_ - this.width_
  }else {
    left = this.anchorX_ + this.relativeLeft_
  }
  var top = this.relativeTop_ + this.anchorY_;
  this.bubbleGroup_.setAttribute("transform", "translate(" + left + ", " + top + ")")
};
Blockly.Bubble.prototype.getBubbleSize = function() {
  return{width:this.width_, height:this.height_}
};
Blockly.Bubble.prototype.setBubbleSize = function(width, height) {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  width = Math.max(width, doubleBorderWidth + 45);
  height = Math.max(height, doubleBorderWidth + Blockly.BlockSvg.TITLE_HEIGHT);
  this.width_ = width;
  this.height_ = height;
  this.bubbleBack_.setAttribute("width", width);
  this.bubbleBack_.setAttribute("height", height);
  if(this.resizeGroup_) {
    if(Blockly.RTL) {
      var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
      this.resizeGroup_.setAttribute("transform", "translate(" + resizeSize + ", " + (height - doubleBorderWidth) + ") scale(-1 1)")
    }else {
      this.resizeGroup_.setAttribute("transform", "translate(" + (width - doubleBorderWidth) + ", " + (height - doubleBorderWidth) + ")")
    }
  }
  if(this.rendered_) {
    if(this.autoLayout_) {
      this.layoutBubble_()
    }
    this.positionBubble_();
    this.renderArrow_()
  }
  Blockly.fireUiEvent(this.bubbleGroup_, "resize")
};
Blockly.Bubble.prototype.renderArrow_ = function() {
  var steps = [];
  var relBubbleX = this.width_ / 2;
  var relBubbleY = this.height_ / 2;
  var relAnchorX = -this.relativeLeft_;
  var relAnchorY = -this.relativeTop_;
  if(relBubbleX == relAnchorX && relBubbleY == relAnchorY) {
    steps.push("M " + relBubbleX + "," + relBubbleY)
  }else {
    var rise = relAnchorY - relBubbleY;
    var run = relAnchorX - relBubbleX;
    if(Blockly.RTL) {
      run *= -1
    }
    var hypotenuse = Math.sqrt(rise * rise + run * run);
    var angle = Math.acos(run / hypotenuse);
    if(rise < 0) {
      angle = 2 * Math.PI - angle
    }
    var rightAngle = angle + Math.PI / 2;
    if(rightAngle > Math.PI * 2) {
      rightAngle -= Math.PI * 2
    }
    var rightRise = Math.sin(rightAngle);
    var rightRun = Math.cos(rightAngle);
    var bubbleSize = this.getBubbleSize();
    var thickness = (bubbleSize.width + bubbleSize.height) / Blockly.Bubble.ARROW_THICKNESS;
    thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 2;
    var backoffRatio = 1 - Blockly.Bubble.ANCHOR_RADIUS / hypotenuse;
    relAnchorX = relBubbleX + backoffRatio * run;
    relAnchorY = relBubbleY + backoffRatio * rise;
    var baseX1 = relBubbleX + thickness * rightRun;
    var baseY1 = relBubbleY + thickness * rightRise;
    var baseX2 = relBubbleX - thickness * rightRun;
    var baseY2 = relBubbleY - thickness * rightRise;
    var swirlAngle = angle + this.arrow_radians_;
    if(swirlAngle > Math.PI * 2) {
      swirlAngle -= Math.PI * 2
    }
    var swirlRise = Math.sin(swirlAngle) * hypotenuse / Blockly.Bubble.ARROW_BEND;
    var swirlRun = Math.cos(swirlAngle) * hypotenuse / Blockly.Bubble.ARROW_BEND;
    steps.push("M" + baseX1 + "," + baseY1);
    steps.push("C" + (baseX1 + swirlRun) + "," + (baseY1 + swirlRise) + " " + relAnchorX + "," + relAnchorY + " " + relAnchorX + "," + relAnchorY);
    steps.push("C" + relAnchorX + "," + relAnchorY + " " + (baseX2 + swirlRun) + "," + (baseY2 + swirlRise) + " " + baseX2 + "," + baseY2)
  }
  steps.push("z");
  this.bubbleArrow_.setAttribute("d", steps.join(" "))
};
Blockly.Bubble.prototype.setColour = function(hexColour) {
  this.bubbleBack_.setAttribute("fill", hexColour);
  this.bubbleArrow_.setAttribute("fill", hexColour)
};
Blockly.Bubble.prototype.dispose = function() {
  Blockly.Bubble.unbindDragEvents_();
  goog.dom.removeNode(this.bubbleGroup_);
  this.bubbleGroup_ = null;
  this.workspace_ = null;
  this.content_ = null;
  this.shape_ = null
};
goog.provide("Blockly.Icon");
Blockly.Icon = function(block) {
  this.block_ = block
};
Blockly.Icon.RADIUS = 8;
Blockly.Icon.prototype.bubble_ = null;
Blockly.Icon.prototype.iconX_ = 0;
Blockly.Icon.prototype.iconY_ = 0;
Blockly.Icon.prototype.createIcon_ = function() {
  this.iconGroup_ = Blockly.createSvgElement("g", {}, null);
  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  Blockly.bindEvent_(this.iconGroup_, "mouseup", this, this.iconClick_);
  this.updateEditable()
};
Blockly.Icon.prototype.dispose = function() {
  goog.dom.removeNode(this.iconGroup_);
  this.iconGroup_ = null;
  this.setVisible(false);
  this.block_ = null
};
Blockly.Icon.prototype.updateEditable = function() {
  if(this.block_.isEditable() && !this.block_.isInFlyout) {
    Blockly.addClass_((this.iconGroup_), "blocklyIconGroup")
  }else {
    Blockly.removeClass_((this.iconGroup_), "blocklyIconGroup")
  }
};
Blockly.Icon.prototype.isVisible = function() {
  return!!this.bubble_
};
Blockly.Icon.prototype.iconClick_ = function(e) {
  if(this.block_.isEditable() && !this.block_.isInFlyout) {
    this.setVisible(!this.isVisible())
  }
};
Blockly.Icon.prototype.updateColour = function() {
  if(this.isVisible()) {
    this.bubble_.setColour(this.block_.getHexColour())
  }
};
Blockly.Icon.prototype.renderIcon = function(cursorX) {
  if(this.block_.isCollapsed()) {
    this.iconGroup_.setAttribute("display", "none");
    return cursorX
  }
  this.iconGroup_.setAttribute("display", "block");
  var TOP_MARGIN = 5;
  var diameter = 2 * Blockly.Icon.RADIUS;
  if(Blockly.RTL) {
    cursorX -= diameter
  }
  this.iconGroup_.setAttribute("transform", "translate(" + cursorX + ", " + TOP_MARGIN + ")");
  this.computeIconLocation();
  if(Blockly.RTL) {
    cursorX -= Blockly.BlockSvg.SEP_SPACE_X
  }else {
    cursorX += diameter + Blockly.BlockSvg.SEP_SPACE_X
  }
  return cursorX
};
Blockly.Icon.prototype.setIconLocation = function(x, y) {
  this.iconX_ = x;
  this.iconY_ = y;
  if(this.isVisible()) {
    this.bubble_.setAnchorLocation(x, y)
  }
};
Blockly.Icon.prototype.computeIconLocation = function() {
  var blockXY = this.block_.getRelativeToSurfaceXY();
  var iconXY = Blockly.getRelativeXY_(this.iconGroup_);
  var newX = blockXY.x + iconXY.x + Blockly.Icon.RADIUS;
  var newY = blockXY.y + iconXY.y + Blockly.Icon.RADIUS;
  if(newX !== this.iconX_ || newY !== this.iconY_) {
    this.setIconLocation(newX, newY)
  }
};
Blockly.Icon.prototype.getIconLocation = function() {
  return{x:this.iconX_, y:this.iconY_}
};
goog.provide("Blockly.Mutator");
goog.require("Blockly.Bubble");
goog.require("Blockly.Icon");
Blockly.Mutator = function(quarkNames) {
  Blockly.Mutator.superClass_.constructor.call(this, null);
  this.quarkXml_ = [];
  for(var x = 0;x < quarkNames.length;x++) {
    var element = goog.dom.createDom("block", {"type":quarkNames[x]});
    this.quarkXml_[x] = element
  }
};
goog.inherits(Blockly.Mutator, Blockly.Icon);
Blockly.Mutator.prototype.workspaceWidth_ = 0;
Blockly.Mutator.prototype.workspaceHeight_ = 0;
Blockly.Mutator.prototype.createIcon = function() {
  Blockly.Icon.prototype.createIcon_.call(this);
  var quantum = Blockly.Icon.RADIUS / 2;
  var iconShield = Blockly.createSvgElement("rect", {"class":"blocklyIconShield", "width":4 * quantum, "height":4 * quantum, "rx":quantum, "ry":quantum}, this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement("text", {"class":"blocklyIconMark", "x":Blockly.Icon.RADIUS, "y":2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
  this.iconMark_.appendChild(document.createTextNode("\u2605"))
};
Blockly.Mutator.prototype.createEditor_ = function() {
  this.svgDialog_ = Blockly.createSvgElement("svg", {"x":Blockly.Bubble.BORDER_WIDTH, "y":Blockly.Bubble.BORDER_WIDTH}, null);
  this.svgBackground_ = Blockly.createSvgElement("rect", {"class":"blocklyMutatorBackground", "height":"100%", "width":"100%"}, this.svgDialog_);
  var mutator = this;
  this.workspace_ = new Blockly.Workspace(function() {
    return mutator.getFlyoutMetrics_()
  }, null);
  this.flyout_ = new Blockly.Flyout;
  this.flyout_.autoClose = false;
  this.svgDialog_.appendChild(this.flyout_.createDom());
  this.svgDialog_.appendChild(this.workspace_.createDom());
  return this.svgDialog_
};
Blockly.Mutator.prototype.resizeBubble_ = function() {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  var workspaceSize = this.workspace_.getCanvas().getBBox();
  var flyoutMetrics = this.flyout_.getMetrics_();
  var width;
  if(Blockly.RTL) {
    width = -workspaceSize.x
  }else {
    width = workspaceSize.width + workspaceSize.x
  }
  var height = Math.max(workspaceSize.height + doubleBorderWidth * 3, flyoutMetrics.contentHeight + 20);
  width += doubleBorderWidth * 3;
  if(Math.abs(this.workspaceWidth_ - width) > doubleBorderWidth || Math.abs(this.workspaceHeight_ - height) > doubleBorderWidth) {
    this.workspaceWidth_ = width;
    this.workspaceHeight_ = height;
    this.bubble_.setBubbleSize(width + doubleBorderWidth, height + doubleBorderWidth);
    this.svgDialog_.setAttribute("width", this.workspaceWidth_);
    this.svgDialog_.setAttribute("height", this.workspaceHeight_)
  }
  if(Blockly.RTL) {
    var translation = "translate(" + this.workspaceWidth_ + ",0)";
    this.workspace_.getCanvas().setAttribute("transform", translation)
  }
};
Blockly.Mutator.prototype.setVisible = function(visible) {
  if(visible == this.isVisible()) {
    return
  }
  if(visible) {
    this.bubble_ = new Blockly.Bubble(this.block_.workspace, this.createEditor_(), this.block_.svg_.svgGroup_, this.iconX_, this.iconY_, null, null);
    var thisObj = this;
    this.flyout_.init(this.workspace_, false);
    this.flyout_.show(this.quarkXml_);
    this.rootBlock_ = this.block_.decompose(this.workspace_);
    var blocks = this.rootBlock_.getDescendants();
    for(var i = 0, child;child = blocks[i];i++) {
      child.render()
    }
    this.rootBlock_.setMovable(false);
    this.rootBlock_.setDeletable(false);
    var margin = this.flyout_.CORNER_RADIUS * 2;
    var x = this.flyout_.width_ + margin;
    if(Blockly.RTL) {
      x = -x
    }
    this.rootBlock_.moveBy(x, margin);
    if(this.block_.saveConnections) {
      this.block_.saveConnections(this.rootBlock_);
      this.sourceListener_ = Blockly.bindEvent_(this.block_.workspace.getCanvas(), "blocklyWorkspaceChange", this.block_, function() {
        thisObj.block_.saveConnections(thisObj.rootBlock_)
      })
    }
    this.resizeBubble_();
    Blockly.bindEvent_(this.workspace_.getCanvas(), "blocklyWorkspaceChange", this.block_, function() {
      thisObj.workspaceChanged_()
    });
    this.updateColour()
  }else {
    this.svgDialog_ = null;
    this.svgBackground_ = null;
    this.flyout_.dispose();
    this.flyout_ = null;
    this.workspace_.dispose();
    this.workspace_ = null;
    this.rootBlock_ = null;
    this.bubble_.dispose();
    this.bubble_ = null;
    this.workspaceWidth_ = 0;
    this.workspaceHeight_ = 0;
    if(this.sourceListener_) {
      Blockly.unbindEvent_(this.sourceListener_);
      this.sourceListener_ = null
    }
  }
};
Blockly.Mutator.prototype.workspaceChanged_ = function() {
  if(!this.workspace_) {
    return
  }
  if(!Blockly.Block.isDragging()) {
    var blocks = this.workspace_.getTopBlocks(false);
    var MARGIN = 20;
    for(var b = 0, block;block = blocks[b];b++) {
      var blockXY = block.getRelativeToSurfaceXY();
      var blockHW = block.getHeightWidth();
      if(Blockly.RTL ? blockXY.x > -this.flyout_.width_ + MARGIN : blockXY.x < this.flyout_.width_ - MARGIN) {
        block.dispose(false, true)
      }else {
        if(blockXY.y + blockHW.height < MARGIN) {
          block.moveBy(0, MARGIN - blockHW.height - blockXY.y)
        }
      }
    }
  }
  if(this.rootBlock_.workspace == this.workspace_) {
    var savedRendered = this.block_.rendered;
    this.block_.rendered = false;
    this.block_.compose(this.rootBlock_);
    this.block_.rendered = savedRendered;
    if(this.block_.rendered) {
      this.block_.render()
    }
    this.resizeBubble_();
    this.block_.workspace.fireChangeEvent()
  }
};
Blockly.Mutator.prototype.getFlyoutMetrics_ = function() {
  var left = 0;
  if(Blockly.RTL) {
    left += this.workspaceWidth_
  }
  return{viewHeight:this.workspaceHeight_, viewWidth:0, absoluteTop:0, absoluteLeft:left}
};
Blockly.Mutator.prototype.dispose = function() {
  this.block_.mutator = null;
  Blockly.Icon.prototype.dispose.call(this)
};
goog.provide("Blockly.Connection");
goog.provide("Blockly.ConnectionDB");
goog.require("Blockly.Workspace");
Blockly.Connection = function(source, type) {
  this.sourceBlock_ = source;
  this.targetConnection = null;
  this.type = type;
  this.x_ = 0;
  this.y_ = 0;
  this.inDB_ = false;
  this.dbList_ = this.sourceBlock_.workspace.connectionDBList
};
Blockly.Connection.prototype.isConnected_ = function() {
  return this.targetConnection !== null
};
Blockly.Connection.prototype.dispose = function() {
  if(this.isConnected_()) {
    throw"Disconnect connection before disposing of it.";
  }
  if(this.inDB_) {
    this.dbList_[this.type].removeConnection_(this)
  }
  this.inDB_ = false;
  if(Blockly.highlightedConnection_ == this) {
    Blockly.highlightedConnection_ = null
  }
  if(Blockly.localConnection_ == this) {
    Blockly.localConnection_ = null
  }
};
Blockly.Connection.prototype.isSuperior = function() {
  return this.type === Blockly.INPUT_VALUE || (this.type === Blockly.NEXT_STATEMENT || this.type === Blockly.FUNCTIONAL_INPUT)
};
Blockly.Connection.prototype.connect = function(connectTo) {
  if(this.sourceBlock_ == connectTo.sourceBlock_) {
    throw"Attempted to connect a block to itself.";
  }
  if(this.sourceBlock_.workspace !== connectTo.sourceBlock_.workspace) {
    throw"Blocks are on different workspaces.";
  }
  if(Blockly.OPPOSITE_TYPE[this.type] != connectTo.type) {
    throw"Attempt to connect incompatible types.";
  }
  if(this.isConnected_()) {
    throw"Source connection already connected.";
  }
  if(connectTo.targetConnection) {
    this.handleOrphan_(connectTo)
  }
  var parentBlock, childBlock;
  if(this.isSuperior()) {
    parentBlock = this.sourceBlock_;
    childBlock = connectTo.sourceBlock_
  }else {
    parentBlock = connectTo.sourceBlock_;
    childBlock = this.sourceBlock_
  }
  this.targetConnection = connectTo;
  connectTo.targetConnection = this;
  childBlock.setParent(parentBlock);
  if(parentBlock.rendered) {
    parentBlock.svg_.updateDisabled()
  }
  if(childBlock.rendered) {
    childBlock.svg_.updateDisabled()
  }
  if(parentBlock.rendered && childBlock.rendered) {
    if(this.type == Blockly.NEXT_STATEMENT || this.type == Blockly.PREVIOUS_STATEMENT) {
      childBlock.render()
    }else {
      parentBlock.render()
    }
  }
};
Blockly.Connection.prototype.handleOrphan_ = function(existingConnection) {
  var orphanBlock = existingConnection.targetBlock();
  orphanBlock.setParent(null);
  if(this.type === Blockly.INPUT_VALUE || this.type === Blockly.OUTPUT_VALUE) {
    if(!orphanBlock.outputConnection) {
      throw"Orphan block does not have an output connection.";
    }
    var newBlock = this.sourceBlock_;
    var connection;
    while(connection = Blockly.Connection.singleConnection_(newBlock, orphanBlock)) {
      if(connection.targetBlock()) {
        newBlock = connection.targetBlock()
      }else {
        connection.connect(orphanBlock.outputConnection);
        orphanBlock = null;
        break
      }
    }
    if(orphanBlock) {
      window.setTimeout(function() {
        orphanBlock.outputConnection.bumpAwayFrom_(existingConnection)
      }, Blockly.BUMP_DELAY)
    }
  }else {
    if(this.type === Blockly.FUNCTIONAL_INPUT || this.type === Blockly.FUNCTIONAL_OUTPUT) {
      if(!orphanBlock.previousConnection) {
        throw"Orphan block does not have a previous connection.";
      }
      window.setTimeout(function() {
        orphanBlock.previousConnection.bumpAwayFrom_(existingConnection)
      }, Blockly.BUMP_DELAY)
    }else {
      if(this.type != Blockly.PREVIOUS_STATEMENT) {
        throw"Can only do a mid-stack connection with the top of a block.";
      }
      if(!orphanBlock.previousConnection) {
        throw"Orphan block does not have a previous connection.";
      }
      var newBlock = this.sourceBlock_;
      while(newBlock.nextConnection) {
        if(newBlock.nextConnection.targetConnection) {
          newBlock = newBlock.nextConnection.targetBlock()
        }else {
          newBlock.nextConnection.connect(orphanBlock.previousConnection);
          orphanBlock = null;
          break
        }
      }
      if(orphanBlock) {
        window.setTimeout(function() {
          orphanBlock.previousConnection.bumpAwayFrom_(existingConnection)
        }, Blockly.BUMP_DELAY)
      }
    }
  }
};
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
  var connection = false;
  for(var x = 0;x < block.inputList.length;x++) {
    var thisConnection = block.inputList[x].connection;
    if(thisConnection && (thisConnection.type == Blockly.INPUT_VALUE && orphanBlock.outputConnection.checkType_(thisConnection))) {
      if(connection) {
        return null
      }
      connection = thisConnection
    }
  }
  return connection
};
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if(!otherConnection) {
    throw"Source connection not connected.";
  }else {
    if(otherConnection.targetConnection != this) {
      throw"Target connection not connected to source connection.";
    }
  }
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  var parentBlock, childBlock;
  if(this.isSuperior()) {
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.sourceBlock_
  }else {
    parentBlock = otherConnection.sourceBlock_;
    childBlock = this.sourceBlock_
  }
  if(parentBlock.rendered) {
    parentBlock.render()
  }
  if(childBlock.rendered) {
    childBlock.svg_.updateDisabled();
    childBlock.render()
  }
};
Blockly.Connection.prototype.targetBlock = function() {
  if(this.targetConnection) {
    return this.targetConnection.sourceBlock_
  }
  return null
};
Blockly.Connection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if(Blockly.Block.isDragging()) {
    return
  }
  var rootBlock = this.sourceBlock_.getRootBlock();
  if(rootBlock.isInFlyout) {
    return
  }
  var reverse = false;
  if(!rootBlock.isMovable()) {
    rootBlock = staticConnection.sourceBlock_.getRootBlock();
    if(!rootBlock.isMovable()) {
      return
    }
    staticConnection = this;
    reverse = true
  }
  rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
  var dx = staticConnection.x_ + Blockly.SNAP_RADIUS - this.x_;
  var dy = staticConnection.y_ + Blockly.SNAP_RADIUS * 2 - this.y_;
  if(reverse) {
    dy = -dy
  }
  if(Blockly.RTL) {
    dx = -dx
  }
  rootBlock.moveBy(dx, dy)
};
Blockly.Connection.prototype.moveTo = function(x, y) {
  if(this.inDB_) {
    this.dbList_[this.type].removeConnection_(this)
  }
  this.x_ = x;
  this.y_ = y;
  this.dbList_[this.type].addConnection_(this)
};
Blockly.Connection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy)
};
Blockly.Connection.prototype.highlight = function() {
  var steps;
  if(this.type === Blockly.INPUT_VALUE || this.type === Blockly.OUTPUT_VALUE) {
    var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH : Blockly.BlockSvg.TAB_WIDTH;
    steps = "m 0,0 v 5 c 0,10 " + -tabWidth + ",-8 " + -tabWidth + ",7.5 s " + tabWidth + ",-2.5 " + tabWidth + ",7.5 v 5"
  }else {
    var moveWidth = 5 + Blockly.BlockSvg.NOTCH_PATH_WIDTH;
    if(Blockly.RTL) {
      steps = "m " + moveWidth + ",0 h -5 " + Blockly.BlockSvg.NOTCH_PATH_RIGHT + " h -5"
    }else {
      steps = "m -" + moveWidth + ",0 h 5 " + Blockly.BlockSvg.NOTCH_PATH_LEFT + " h 5"
    }
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement("path", {"class":"blocklyHighlightedConnectionPath", "d":steps, transform:"translate(" + x + ", " + y + ")"}, this.sourceBlock_.getSvgRoot())
};
Blockly.Connection.prototype.unhighlight = function() {
  goog.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_
};
Blockly.Connection.prototype.tighten_ = function() {
  var dx = Math.round(this.targetConnection.x_ - this.x_);
  var dy = Math.round(this.targetConnection.y_ - this.y_);
  if(dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if(!svgRoot) {
      throw"block is not rendered.";
    }
    var xy = Blockly.getRelativeXY_(svgRoot);
    block.getSvgRoot().setAttribute("transform", "translate(" + (xy.x - dx) + ", " + (xy.y - dy) + ")");
    block.moveConnections_(-dx, -dy)
  }
};
Blockly.Connection.prototype.closest = function(maxLimit, dx, dy) {
  if(this.isConnected_()) {
    return{connection:null, radius:maxLimit}
  }
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];
  var currentX = this.x_ + dx;
  var currentY = this.y_ + dy;
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while(pointerMin < pointerMid) {
    if(db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid
    }else {
      pointerMax = pointerMid
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2)
  }
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var closestConnection = null;
  var sourceBlock = this.sourceBlock_;
  var thisConnection = this;
  if(db.length) {
    while(pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--
    }
    do {
      pointerMax++
    }while(pointerMax < db.length && checkConnection_(pointerMax))
  }
  function checkConnection_(yIndex) {
    var connection = db[yIndex];
    if(connection.type === Blockly.OUTPUT_VALUE || (connection.type === Blockly.FUNCTIONAL_OUTPUT || connection.type === Blockly.PREVIOUS_STATEMENT)) {
      if(connection.targetConnection) {
        return true
      }
    }
    if(!thisConnection.checkType_(connection)) {
      return true
    }
    var targetSourceBlock = connection.sourceBlock_;
    do {
      if(sourceBlock == targetSourceBlock) {
        return true
      }
      targetSourceBlock = targetSourceBlock.getParent()
    }while(targetSourceBlock);
    var connectionX = connection.x_;
    var connectionY = connection.y_;
    if(connection.sourceBlock_.getDragging()) {
      connectionX += dx;
      connectionY += dy
    }
    var distX = currentX - connectionX;
    var distY = currentY - connectionY;
    var r = Math.sqrt(distX * distX + distY * distY);
    if(r <= maxLimit) {
      closestConnection = db[yIndex];
      maxLimit = r
    }
    return distY < maxLimit
  }
  return{connection:closestConnection, radius:maxLimit}
};
Blockly.Connection.prototype.checkType_ = function(otherConnection) {
  if(!this.check_ || !otherConnection.check_) {
    return true
  }
  for(var x = 0;x < this.check_.length;x++) {
    if(otherConnection.check_.indexOf(this.check_[x]) != -1) {
      return true
    }
  }
  return false
};
Blockly.Connection.prototype.setCheck = function(check) {
  if(check) {
    if(!(check instanceof Array)) {
      check = [check]
    }
    this.check_ = check;
    if(this.targetConnection && !this.checkType_(this.targetConnection)) {
      if(this.isSuperior()) {
        this.targetBlock().setParent(null)
      }else {
        this.sourceBlock_.setParent(null)
      }
      this.sourceBlock_.bumpNeighbours_()
    }
  }else {
    this.check_ = null
  }
  return this
};
Blockly.Connection.prototype.neighbours_ = function(maxLimit) {
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];
  var currentX = this.x_;
  var currentY = this.y_;
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while(pointerMin < pointerMid) {
    if(db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid
    }else {
      pointerMax = pointerMid
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2)
  }
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var neighbours = [];
  var sourceBlock = this.sourceBlock_;
  if(db.length) {
    while(pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--
    }
    do {
      pointerMax++
    }while(pointerMax < db.length && checkConnection_(pointerMax))
  }
  function checkConnection_(yIndex) {
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if(r <= maxLimit) {
      neighbours.push(db[yIndex])
    }
    return dy < maxLimit
  }
  return neighbours
};
Blockly.Connection.prototype.hideAll = function() {
  if(this.inDB_) {
    this.dbList_[this.type].removeConnection_(this)
  }
  if(this.isConnected_()) {
    var blocks = this.targetBlock().getDescendants();
    for(var b = 0;b < blocks.length;b++) {
      var block = blocks[b];
      var connections = block.getConnections_(true);
      for(var c = 0;c < connections.length;c++) {
        var connection = connections[c];
        if(connection.inDB_) {
          this.dbList_[connection.type].removeConnection_(connection)
        }
      }
      var icons = block.getIcons();
      for(var x = 0;x < icons.length;x++) {
        icons[x].setVisible(false)
      }
    }
  }
};
Blockly.Connection.prototype.unhideAll = function() {
  if(!this.inDB_) {
    this.dbList_[this.type].addConnection_(this)
  }
  var renderList = [];
  if(this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    return renderList
  }
  var block = this.targetBlock();
  if(block) {
    var connections;
    if(block.isCollapsed()) {
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection)
    }else {
      connections = block.getConnections_(true)
    }
    for(var c = 0;c < connections.length;c++) {
      renderList = renderList.concat(connections[c].unhideAll())
    }
    if(renderList.length == 0) {
      renderList[0] = block
    }
  }
  return renderList
};
Blockly.ConnectionDB = function() {
};
Blockly.ConnectionDB.prototype = new Array;
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;
Blockly.ConnectionDB.prototype.addConnection_ = function(connection) {
  if(connection.inDB_) {
    throw"Connection already in database.";
  }
  var pointerMin = 0;
  var pointerMax = this.length;
  while(pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if(this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1
    }else {
      if(this[pointerMid].y_ > connection.y_) {
        pointerMax = pointerMid
      }else {
        pointerMin = pointerMid;
        break
      }
    }
  }
  this.splice(pointerMin, 0, connection);
  connection.inDB_ = true
};
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if(!connection.inDB_) {
    throw"Connection not in database.";
  }
  connection.inDB_ = false;
  var pointerMin = 0;
  var pointerMax = this.length - 2;
  var pointerMid = pointerMax;
  while(pointerMin < pointerMid) {
    if(this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid
    }else {
      pointerMax = pointerMid
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2)
  }
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  while(pointerMin >= 0 && this[pointerMin].y_ == connection.y_) {
    if(this[pointerMin] == connection) {
      this.splice(pointerMin, 1);
      return
    }
    pointerMin--
  }
  do {
    if(this[pointerMax] == connection) {
      this.splice(pointerMax, 1);
      return
    }
    pointerMax++
  }while(pointerMax < this.length && this[pointerMax].y_ == connection.y_);
  throw"Unable to find connection in connectionDB.";
};
Blockly.ConnectionDB.init = function(workspace) {
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB;
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB;
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB;
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB;
  dbList[Blockly.FUNCTIONAL_INPUT] = new Blockly.ConnectionDB;
  dbList[Blockly.FUNCTIONAL_OUTPUT] = new Blockly.ConnectionDB;
  workspace.connectionDBList = dbList
};
goog.provide("Blockly.Blocks");
goog.provide("Blockly.BlockSvgFunctional");
Blockly.BlockSvgFunctional = function(block, options) {
  options = options || {};
  this.headerHeight = options.headerHeight;
  this.rowBuffer = options.rowBuffer || 0;
  this.patternId_ = null;
  this.inputMarkers_ = {};
  Blockly.BlockSvg.call(this, block)
};
goog.inherits(Blockly.BlockSvgFunctional, Blockly.BlockSvg);
Blockly.BlockSvgFunctional.prototype.initChildren = function() {
  var rgb = Blockly.makeColour(this.block_.getColour(), this.block_.getSaturation(), this.block_.getValue());
  var lightColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.3);
  var lighterColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.8);
  goog.base(this, "initChildren");
  var clip = Blockly.createSvgElement("clipPath", {id:"blockClip" + this.block_.id}, this.svgGroup_);
  this.blockClipRect_ = Blockly.createSvgElement("path", {}, clip);
  this.divider_ = Blockly.createSvgElement("rect", {x:1, y:this.headerHeight, height:3, width:0, fill:goog.color.rgbArrayToHex(lightColor), "clip-path":"url(#blockClip" + this.block_.id + ")", visibility:this.headerHeight > 0 ? "visible" : "hidden"}, this.svgGroup_);
  for(var i = 0;i < this.block_.inputList.length;i++) {
    var input = this.block_.inputList[i];
    if(input.type !== Blockly.FUNCTIONAL_INPUT) {
      continue
    }
    this.inputMarkers_[input.name] = Blockly.createSvgElement("rect", {fill:"red"}, this.svgGroup_)
  }
};
Blockly.BlockSvgFunctional.prototype.renderDraw_ = function(iconWidth, inputRows) {
  goog.base(this, "renderDraw_", iconWidth, inputRows);
  this.blockClipRect_.setAttribute("d", this.svgPath_.getAttribute("d"));
  var rect = this.svgPath_.getBBox();
  this.divider_.setAttribute("width", rect.width - 2)
};
Blockly.BlockSvgFunctional.prototype.renderDrawRight_ = function(renderInfo, connectionsXY, inputRows, iconWidth) {
  if(this.rowBuffer) {
    renderInfo.core.push("v", this.rowBuffer);
    renderInfo.curY += this.rowBuffer
  }
  goog.base(this, "renderDrawRight_", renderInfo, connectionsXY, inputRows, iconWidth)
};
Blockly.BlockSvgFunctional.prototype.renderDrawRightInlineFunctional_ = function(renderInfo, input, connectionsXY) {
  var inputTopLeft = {x:renderInfo.curX, y:renderInfo.curY + BS.INLINE_PADDING_Y};
  var notchStart = BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH;
  renderInfo.inline.push("M", inputTopLeft.x + "," + inputTopLeft.y);
  renderInfo.inline.push("h", notchStart);
  renderInfo.inline.push(BS.NOTCH_PATH_LEFT);
  renderInfo.inline.push("H", inputTopLeft.x + input.renderWidth);
  renderInfo.inline.push("v", input.renderHeight);
  renderInfo.inline.push("H", inputTopLeft.x);
  renderInfo.inline.push("z");
  this.inputMarkers_[input.name].setAttribute("x", inputTopLeft.x + 5);
  this.inputMarkers_[input.name].setAttribute("y", inputTopLeft.y + 15);
  this.inputMarkers_[input.name].setAttribute("width", input.renderWidth - 10);
  this.inputMarkers_[input.name].setAttribute("height", 5);
  this.inputMarkers_[input.name].setAttribute("fill", input.getHexColour());
  this.inputMarkers_[input.name].setAttribute("visibility", input.connection.targetConnection ? "hidden" : "visible");
  renderInfo.curX += input.renderWidth + BS.SEP_SPACE_X;
  var connectionX = connectionsXY.x + inputTopLeft.x + BS.NOTCH_WIDTH;
  var connectionY = connectionsXY.y + inputTopLeft.y;
  input.connection.moveTo(connectionX, connectionY);
  if(input.connection.targetConnection) {
    input.connection.tighten_()
  }
};
Blockly.BlockSvgFunctional.prototype.dispose = function() {
  goog.base(this, "dispose");
  this.blockClipRect_ = null;
  this.divider_ = null
};
goog.provide("Blockly.Comment");
goog.require("Blockly.Bubble");
goog.require("Blockly.Icon");
Blockly.Comment = function(block) {
  Blockly.Comment.superClass_.constructor.call(this, block);
  this.createIcon_()
};
goog.inherits(Blockly.Comment, Blockly.Icon);
Blockly.Comment.prototype.text_ = "";
Blockly.Comment.prototype.width_ = 160;
Blockly.Comment.prototype.height_ = 80;
Blockly.Comment.prototype.createIcon_ = function() {
  Blockly.Icon.prototype.createIcon_.call(this);
  var iconShield = Blockly.createSvgElement("circle", {"class":"blocklyIconShield", "r":Blockly.Icon.RADIUS, "cx":Blockly.Icon.RADIUS, "cy":Blockly.Icon.RADIUS}, this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement("text", {"class":"blocklyIconMark", "x":Blockly.Icon.RADIUS, "y":2 * Blockly.Icon.RADIUS - 3}, this.iconGroup_);
  this.iconMark_.appendChild(document.createTextNode("?"))
};
Blockly.Comment.prototype.createEditor_ = function() {
  this.foreignObject_ = Blockly.createSvgElement("foreignObject", {"x":Blockly.Bubble.BORDER_WIDTH, "y":Blockly.Bubble.BORDER_WIDTH}, null);
  var body = document.createElementNS(Blockly.HTML_NS, "body");
  body.setAttribute("xmlns", Blockly.HTML_NS);
  body.className = "blocklyMinimalBody";
  this.textarea_ = document.createElementNS(Blockly.HTML_NS, "textarea");
  this.textarea_.className = "blocklyCommentTextarea";
  this.textarea_.setAttribute("dir", Blockly.RTL ? "RTL" : "LTR");
  body.appendChild(this.textarea_);
  this.foreignObject_.appendChild(body);
  Blockly.bindEvent_(this.textarea_, "mouseup", this, this.textareaFocus_);
  return this.foreignObject_
};
Blockly.Comment.prototype.resizeBubble_ = function() {
  var size = this.bubble_.getBubbleSize();
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  this.foreignObject_.setAttribute("width", size.width - doubleBorderWidth);
  this.foreignObject_.setAttribute("height", size.height - doubleBorderWidth);
  this.textarea_.style.width = size.width - doubleBorderWidth - 4 + "px";
  this.textarea_.style.height = size.height - doubleBorderWidth - 4 + "px"
};
Blockly.Comment.prototype.setVisible = function(visible) {
  if(visible == this.isVisible()) {
    return
  }
  var text = this.getText();
  var size = this.getBubbleSize();
  if(visible) {
    this.bubble_ = new Blockly.Bubble((this.block_.workspace), this.createEditor_(), this.block_.svg_.svgGroup_, this.iconX_, this.iconY_, this.width_, this.height_);
    this.bubble_.registerResizeEvent(this, this.resizeBubble_);
    this.updateColour();
    this.text_ = null
  }else {
    this.bubble_.dispose();
    this.bubble_ = null;
    this.textarea_ = null;
    this.foreignObject_ = null
  }
  this.setText(text);
  this.setBubbleSize(size.width, size.height)
};
Blockly.Comment.prototype.textareaFocus_ = function(e) {
  this.bubble_.promote_();
  this.textarea_.focus()
};
Blockly.Comment.prototype.getBubbleSize = function() {
  if(this.isVisible()) {
    return this.bubble_.getBubbleSize()
  }else {
    return{width:this.width_, height:this.height_}
  }
};
Blockly.Comment.prototype.setBubbleSize = function(width, height) {
  if(this.isVisible()) {
    this.bubble_.setBubbleSize(width, height)
  }else {
    this.width_ = width;
    this.height_ = height
  }
};
Blockly.Comment.prototype.getText = function() {
  return this.isVisible() ? this.textarea_.value : this.text_
};
Blockly.Comment.prototype.setText = function(text) {
  if(this.isVisible()) {
    this.textarea_.value = text
  }else {
    this.text_ = text
  }
};
Blockly.Comment.prototype.dispose = function() {
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this)
};
goog.provide("Blockly.Tooltip");
Blockly.Tooltip.visible = false;
Blockly.Tooltip.mouseOutPid_ = 0;
Blockly.Tooltip.showPid_ = 0;
Blockly.Tooltip.lastXY_ = {x:0, y:0};
Blockly.Tooltip.element_ = null;
Blockly.Tooltip.poisonedElement_ = null;
Blockly.Tooltip.svgGroup_ = null;
Blockly.Tooltip.svgText_ = null;
Blockly.Tooltip.svgBackground_ = null;
Blockly.Tooltip.svgShadow_ = null;
Blockly.Tooltip.OFFSET_X = 0;
Blockly.Tooltip.OFFSET_Y = 10;
Blockly.Tooltip.RADIUS_OK = 10;
Blockly.Tooltip.HOVER_MS = 1E3;
Blockly.Tooltip.MARGINS = 5;
Blockly.Tooltip.createDom = function() {
  var svgGroup = (Blockly.createSvgElement("g", {"class":"blocklyHidden"}, null));
  Blockly.Tooltip.svgGroup_ = svgGroup;
  Blockly.Tooltip.svgShadow_ = (Blockly.createSvgElement("rect", {"class":"blocklyTooltipShadow", "x":2, "y":2}, svgGroup));
  Blockly.Tooltip.svgBackground_ = (Blockly.createSvgElement("rect", {"class":"blocklyTooltipBackground"}, svgGroup));
  Blockly.Tooltip.svgText_ = (Blockly.createSvgElement("text", {"class":"blocklyTooltipText"}, svgGroup));
  return svgGroup
};
Blockly.Tooltip.bindMouseEvents = function(element) {
  Blockly.bindEvent_(element, "mouseover", null, Blockly.Tooltip.onMouseOver_);
  Blockly.bindEvent_(element, "mouseout", null, Blockly.Tooltip.onMouseOut_);
  Blockly.bindEvent_(element, "mousemove", null, Blockly.Tooltip.onMouseMove_)
};
Blockly.Tooltip.onMouseOver_ = function(e) {
  var element = e.target;
  while(!goog.isString(element.tooltip) && !goog.isFunction(element.tooltip)) {
    element = element.tooltip
  }
  if(Blockly.Tooltip.element_ != element) {
    Blockly.Tooltip.hide();
    Blockly.Tooltip.poisonedElement_ = null;
    Blockly.Tooltip.element_ = element
  }
  window.clearTimeout(Blockly.Tooltip.mouseOutPid_)
};
Blockly.Tooltip.onMouseOut_ = function(e) {
  Blockly.Tooltip.mouseOutPid_ = window.setTimeout(function() {
    Blockly.Tooltip.element_ = null;
    Blockly.Tooltip.poisonedElement_ = null;
    Blockly.Tooltip.hide()
  }, 1);
  window.clearTimeout(Blockly.Tooltip.showPid_)
};
Blockly.Tooltip.onMouseMove_ = function(e) {
  if(!Blockly.Tooltip.element_ || !Blockly.Tooltip.element_.tooltip) {
    return
  }else {
    if(Blockly.Block.isDragging()) {
      return
    }else {
      if(Blockly.WidgetDiv.isVisible()) {
        return
      }
    }
  }
  if(Blockly.Tooltip.visible) {
    var mouseXY = Blockly.mouseToSvg(e);
    var dx = Blockly.Tooltip.lastXY_.x - mouseXY.x;
    var dy = Blockly.Tooltip.lastXY_.y - mouseXY.y;
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if(dr > Blockly.Tooltip.RADIUS_OK) {
      Blockly.Tooltip.hide()
    }
  }else {
    if(Blockly.Tooltip.poisonedElement_ != Blockly.Tooltip.element_) {
      window.clearTimeout(Blockly.Tooltip.showPid_);
      Blockly.Tooltip.lastXY_ = Blockly.mouseToSvg(e);
      Blockly.Tooltip.showPid_ = window.setTimeout(Blockly.Tooltip.show_, Blockly.Tooltip.HOVER_MS)
    }
  }
};
Blockly.Tooltip.hide = function() {
  if(Blockly.Tooltip.visible) {
    Blockly.Tooltip.visible = false;
    if(Blockly.Tooltip.svgGroup_) {
      Blockly.Tooltip.svgGroup_.style.display = "none"
    }
  }
  window.clearTimeout(Blockly.Tooltip.showPid_)
};
Blockly.Tooltip.show_ = function() {
  Blockly.Tooltip.poisonedElement_ = Blockly.Tooltip.element_;
  if(!Blockly.Tooltip.svgGroup_) {
    return
  }
  goog.dom.removeChildren((Blockly.Tooltip.svgText_));
  var tip = Blockly.Tooltip.element_.tooltip;
  if(goog.isFunction(tip)) {
    tip = tip()
  }
  var lines = tip.split("\n");
  for(var i = 0;i < lines.length;i++) {
    var tspanElement = Blockly.createSvgElement("tspan", {"dy":"1em", "x":Blockly.Tooltip.MARGINS}, Blockly.Tooltip.svgText_);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode)
  }
  Blockly.Tooltip.visible = true;
  Blockly.Tooltip.svgGroup_.style.display = "block";
  if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
    Blockly.Tooltip.svgText_.style.display = "inline";
    var bBox = {x:Blockly.Tooltip.svgText_.getBBox().x, y:Blockly.Tooltip.svgText_.getBBox().y, width:Blockly.Tooltip.svgText_.scrollWidth, height:Blockly.Tooltip.svgText_.scrollHeight}
  }else {
    var bBox = Blockly.Tooltip.svgText_.getBBox()
  }
  var width = 2 * Blockly.Tooltip.MARGINS + bBox.width;
  var height = bBox.height;
  Blockly.Tooltip.svgBackground_.setAttribute("width", width);
  Blockly.Tooltip.svgBackground_.setAttribute("height", height);
  Blockly.Tooltip.svgShadow_.setAttribute("width", width);
  Blockly.Tooltip.svgShadow_.setAttribute("height", height);
  if(Blockly.RTL) {
    var maxWidth = bBox.width;
    for(var x = 0, textElement;textElement = Blockly.Tooltip.svgText_.childNodes[x];x++) {
      textElement.setAttribute("text-anchor", "end");
      textElement.setAttribute("x", maxWidth + Blockly.Tooltip.MARGINS)
    }
  }
  var anchorX = Blockly.Tooltip.lastXY_.x;
  if(Blockly.RTL) {
    anchorX -= Blockly.Tooltip.OFFSET_X + width
  }else {
    anchorX += Blockly.Tooltip.OFFSET_X
  }
  var anchorY = Blockly.Tooltip.lastXY_.y + Blockly.Tooltip.OFFSET_Y;
  var svgSize = Blockly.svgSize();
  if(anchorY + bBox.height > svgSize.height) {
    anchorY -= bBox.height + 2 * Blockly.Tooltip.OFFSET_Y
  }
  if(Blockly.RTL) {
    anchorX = Math.max(Blockly.Tooltip.MARGINS, anchorX)
  }else {
    if(anchorX + bBox.width > svgSize.width - 2 * Blockly.Tooltip.MARGINS) {
      anchorX = svgSize.width - bBox.width - 2 * Blockly.Tooltip.MARGINS
    }
  }
  Blockly.Tooltip.svgGroup_.setAttribute("transform", "translate(" + anchorX + "," + anchorY + ")")
};
goog.provide("Blockly.FieldLabel");
goog.require("Blockly.Field");
goog.require("Blockly.Tooltip");
Blockly.FieldLabel = function(text, customOptions) {
  customOptions = customOptions || {};
  this.sourceBlock_ = null;
  this.textElement_ = Blockly.createSvgElement("text", {"class":"blocklyText"}, null);
  var loadingSize = {width:0, height:25};
  this.forceSize_ = customOptions.hasOwnProperty("fixedSize");
  this.fontSize_ = customOptions.fontSize;
  this.size_ = this.forceSize_ ? customOptions.fixedSize : loadingSize;
  this.setText(text)
};
goog.inherits(Blockly.FieldLabel, Blockly.Field);
Blockly.FieldLabel.prototype.EDITABLE = false;
Blockly.FieldLabel.prototype.init = function(block) {
  if(this.sourceBlock_) {
    throw"Text has already been initialized once.";
  }
  this.sourceBlock_ = block;
  block.getSvgRoot().appendChild(this.textElement_);
  this.textElement_.tooltip = this.sourceBlock_;
  Blockly.Tooltip && Blockly.Tooltip.bindMouseEvents(this.textElement_)
};
Blockly.FieldLabel.prototype.getSize = function() {
  if(!this.size_.width && !(this.forceSize_ && this.size_.width === 0)) {
    this.updateWidth_()
  }
  return this.size_
};
Blockly.FieldLabel.prototype.getBufferY = function() {
  if(!this.fontSize_) {
    return 0
  }
  return(this.size_.height - this.fontSize_) / 2
};
Blockly.FieldLabel.prototype.setText = function(text) {
  if(text === null || text === this.text_) {
    return
  }
  this.text_ = text;
  goog.dom.removeChildren((this.textElement_));
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if(!text) {
    text = Blockly.Field.NBSP
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);
  if(this.fontSize_) {
    this.textElement_.style.fontSize = this.fontSize_ + "px"
  }
  if(!this.forceSize_) {
    this.size_.width = 0
  }
  this.refreshRender()
};
Blockly.FieldLabel.prototype.dispose = function() {
  goog.dom.removeNode(this.textElement_);
  this.textElement_ = null
};
Blockly.FieldLabel.prototype.getRootElement = function() {
  return(this.textElement_)
};
Blockly.FieldLabel.prototype.setTooltip = function(newTip) {
  this.textElement_.tooltip = newTip
};
goog.provide("Blockly.Input");
goog.require("Blockly.Connection");
goog.require("Blockly.FieldLabel");
Blockly.Input = function(type, name, block, connection) {
  this.type = type;
  this.name = name;
  this.sourceBlock_ = block;
  this.connection = connection;
  this.titleRow = [];
  this.align = Blockly.ALIGN_LEFT;
  this.inline_ = false;
  this.visible_ = true;
  this.colour_ = {hue:null, saturation:null, value:null}
};
Blockly.Input.prototype.appendTitle = function(title, opt_name) {
  if(!title && !opt_name) {
    return this
  }
  if(goog.isString(title)) {
    title = new Blockly.FieldLabel((title))
  }
  if(this.sourceBlock_.svg_) {
    title.init(this.sourceBlock_)
  }
  title.name = opt_name;
  if(title.prefixTitle) {
    this.appendTitle(title.prefixTitle)
  }
  this.titleRow.push(title);
  if(title.suffixTitle) {
    this.appendTitle(title.suffixTitle)
  }
  if(this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_()
  }
  return this
};
Blockly.Input.prototype.isVisible = function() {
  return this.visible_
};
Blockly.Input.prototype.setVisible = function(visible) {
  var renderList = [];
  if(this.visible_ == visible) {
    return renderList
  }
  this.visible_ = visible;
  var display = visible ? "block" : "none";
  for(var y = 0, title;title = this.titleRow[y];y++) {
    title.setVisible(visible)
  }
  if(this.connection) {
    if(visible) {
      renderList = this.connection.unhideAll()
    }else {
      renderList = this.connection.hideAll()
    }
    var child = this.connection.targetBlock();
    if(child) {
      child.svg_.getRootElement().style.display = display;
      if(!visible) {
        child.rendered = false
      }
    }
  }
  return renderList
};
Blockly.Input.prototype.setCheck = function(check) {
  if(!this.connection) {
    throw"This input does not have a connection.";
  }
  this.connection.setCheck(check);
  return this
};
Blockly.Input.prototype.setAlign = function(align) {
  this.align = align;
  if(this.sourceBlock_.rendered) {
    this.sourceBlock_.render()
  }
  return this
};
Blockly.Input.prototype.init = function() {
  for(var x = 0;x < this.titleRow.length;x++) {
    this.titleRow[x].init(this.sourceBlock_)
  }
};
Blockly.Input.prototype.dispose = function() {
  for(var i = 0, title;title = this.titleRow[i];i++) {
    title.dispose()
  }
  if(this.connection) {
    this.connection.dispose()
  }
  this.sourceBlock_ = null
};
Blockly.Input.prototype.setInline = function(inline) {
  if(inline === undefined) {
    inline = true
  }
  this.inline_ = inline;
  if(this.type === Blockly.NEXT_STATEMENT && inline) {
    throw"Can't inline next statement";
  }
  return this
};
Blockly.Input.prototype.isInline = function() {
  if(this.type === Blockly.NEXT_STATEMENT) {
    return false
  }
  return this.inline_ || this.sourceBlock_.inputsInline
};
Blockly.Input.prototype.setHSV = function(hue, saturation, value) {
  if(this.type !== Blockly.FUNCTIONAL_INPUT) {
    throw"setColor only for functional inputs";
  }
  this.colour_ = {hue:hue, saturation:saturation, value:value};
  return this
};
Blockly.Input.prototype.getHexColour = function() {
  return Blockly.makeColour(this.colour_.hue, this.colour_.saturation, this.colour_.value)
};
Blockly.Input.prototype.matchesBlock = function(block) {
  if(block.getColour() !== this.colour_.hue) {
    return false
  }
  if(block.getSaturation() !== this.colour_.saturation) {
    return false
  }
  if(block.getValue() !== this.colour_.value) {
    return false
  }
  return true
};
goog.provide("Blockly.Warning");
goog.require("Blockly.Bubble");
goog.require("Blockly.Icon");
Blockly.Warning = function(block) {
  Blockly.Warning.superClass_.constructor.call(this, block);
  this.createIcon_()
};
goog.inherits(Blockly.Warning, Blockly.Icon);
Blockly.Warning.prototype.text_ = "";
Blockly.Warning.prototype.createIcon_ = function() {
  Blockly.Icon.prototype.createIcon_.call(this);
  var iconShield = Blockly.createSvgElement("path", {"class":"blocklyIconShield", "d":"M 2,15 Q -1,15 0.5,12 L 6.5,1.7 Q 8,-1 9.5,1.7 L 15.5,12 " + "Q 17,15 14,15 z"}, this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement("text", {"class":"blocklyIconMark", "x":Blockly.Icon.RADIUS, "y":2 * Blockly.Icon.RADIUS - 3}, this.iconGroup_);
  this.iconMark_.appendChild(document.createTextNode("!"))
};
Blockly.Warning.prototype.textToDom_ = function(text) {
  var paragraph = (Blockly.createSvgElement("text", {"class":"blocklyText", "y":Blockly.Bubble.BORDER_WIDTH}, null));
  var lines = text.split("\n");
  for(var i = 0;i < lines.length;i++) {
    var tspanElement = Blockly.createSvgElement("tspan", {"dy":"1em", "x":Blockly.Bubble.BORDER_WIDTH}, paragraph);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode)
  }
  return paragraph
};
Blockly.Warning.prototype.setVisible = function(visible) {
  if(visible == this.isVisible()) {
    return
  }
  if(visible) {
    var paragraph = this.textToDom_(this.text_);
    this.bubble_ = new Blockly.Bubble((this.block_.workspace), paragraph, this.block_.svg_.svgGroup_, this.iconX_, this.iconY_, null, null);
    if(Blockly.RTL) {
      if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
        paragraph.style.display = "inline";
        var bBox = {x:paragraph.getBBox().x, y:paragraph.getBBox().y, width:paragraph.scrollWidth, height:paragraph.scrollHeight};
        var maxWidth = bBox.width
      }else {
        var maxWidth = paragraph.getBBox().width
      }
      for(var x = 0, textElement;textElement = paragraph.childNodes[x];x++) {
        textElement.setAttribute("text-anchor", "end");
        textElement.setAttribute("x", maxWidth + Blockly.Bubble.BORDER_WIDTH)
      }
    }
    this.updateColour();
    var size = this.bubble_.getBubbleSize();
    this.bubble_.setBubbleSize(size.width, size.height)
  }else {
    this.bubble_.dispose();
    this.bubble_ = null;
    this.body_ = null;
    this.foreignObject_ = null
  }
};
Blockly.Warning.prototype.bodyFocus_ = function(e) {
  this.bubble_.promote_()
};
Blockly.Warning.prototype.setText = function(text) {
  this.text_ = text;
  if(this.isVisible()) {
    this.setVisible(false);
    this.setVisible(true)
  }
};
Blockly.Warning.prototype.dispose = function() {
  this.block_.warning = null;
  Blockly.Icon.prototype.dispose.call(this)
};
goog.provide("Blockly.Block");
goog.require("Blockly.BlockSvg");
goog.require("Blockly.BlockSvgFramed");
goog.require("Blockly.BlockSvgFunctional");
goog.require("Blockly.Blocks");
goog.require("Blockly.Comment");
goog.require("Blockly.Connection");
goog.require("Blockly.ContextMenu");
goog.require("Blockly.Input");
goog.require("Blockly.Msg");
goog.require("Blockly.Mutator");
goog.require("Blockly.Warning");
goog.require("Blockly.Workspace");
goog.require("Blockly.Xml");
goog.require("goog.asserts");
goog.require("goog.string");
goog.require("goog.Timer");
Blockly.uidCounter_ = 0;
Blockly.Block = function(workspace, prototypeName, htmlId) {
  this.id = ++Blockly.uidCounter_;
  this.htmlId = htmlId;
  this.outputConnection = null;
  this.nextConnection = null;
  this.previousConnection = null;
  this.inputList = [];
  this.inputsInline = false;
  this.rendered = false;
  this.disabled = false;
  this.tooltip = "";
  this.contextMenu = false;
  this.parentBlock_ = null;
  this.childBlocks_ = [];
  this.deletable_ = true;
  this.movable_ = true;
  this.editable_ = true;
  this.collapsed_ = false;
  this.dragging_ = false;
  this.workspace = workspace;
  this.isInFlyout = workspace.isFlyout;
  this.colourSaturation_ = 0.45;
  this.colourValue_ = 0.65;
  this.fillPattern_ = null;
  this.blockSvgClass_ = Blockly.BlockSvg;
  this.customOptions_ = {};
  workspace.addTopBlock(this);
  if(prototypeName) {
    this.type = prototypeName;
    var prototype = Blockly.Blocks[prototypeName];
    if(!prototype) {
      throw'Error: "' + prototypeName + '" is an unknown language block.';
    }
    goog.mixin(this, prototype)
  }
  if(goog.isFunction(this.init)) {
    this.init()
  }
  if(goog.isFunction(this.onchange)) {
    Blockly.bindEvent_(workspace.getCanvas(), "blocklyWorkspaceChange", this, this.onchange)
  }
};
Blockly.Block.prototype.svg_ = null;
Blockly.Block.prototype.mutator = null;
Blockly.Block.prototype.comment = null;
Blockly.Block.prototype.warning = null;
Blockly.Block.prototype.getIcons = function() {
  var icons = [];
  if(this.mutator) {
    icons.push(this.mutator)
  }
  if(this.comment) {
    icons.push(this.comment)
  }
  if(this.warning) {
    icons.push(this.warning)
  }
  return icons
};
Blockly.Block.prototype.initSvg = function() {
  this.svg_ = new this.blockSvgClass_(this, this.customOptions_);
  this.svg_.init();
  if(!Blockly.readOnly) {
    Blockly.bindEvent_(this.svg_.getRootElement(), "mousedown", this, this.onMouseDown_)
  }
  this.workspace.getCanvas().appendChild(this.svg_.getRootElement())
};
Blockly.Block.prototype.getSvgRoot = function() {
  return this.svg_ && this.svg_.getRootElement()
};
Blockly.Block.DRAG_MODE_NOT_DRAGGING = 0;
Blockly.Block.DRAG_MODE_INSIDE_STICKY_RADIUS = 1;
Blockly.Block.DRAG_MODE_FREELY_DRAGGING = 2;
Blockly.Block.dragMode_ = Blockly.Block.DRAG_MODE_NOT_DRAGGING;
Blockly.Block.isDragging = function() {
  return Blockly.Block.dragMode_ !== Blockly.Block.DRAG_MODE_NOT_DRAGGING
};
Blockly.Block.isFreelyDragging = function() {
  return Blockly.Block.dragMode_ === Blockly.Block.DRAG_MODE_FREELY_DRAGGING
};
Blockly.Block.onMouseUpWrapper_ = null;
Blockly.Block.onMouseMoveWrapper_ = null;
Blockly.Block.terminateDrag_ = function() {
  if(Blockly.Block.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Block.onMouseUpWrapper_);
    Blockly.Block.onMouseUpWrapper_ = null
  }
  if(Blockly.Block.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Block.onMouseMoveWrapper_);
    Blockly.Block.onMouseMoveWrapper_ = null
  }
  var selected = Blockly.selected;
  if(Blockly.Block.isFreelyDragging()) {
    if(selected) {
      var xy = selected.getRelativeToSurfaceXY();
      var dx = xy.x - selected.startDragX;
      var dy = xy.y - selected.startDragY;
      selected.moveConnections_(dx, dy);
      delete selected.draggedBubbles_;
      selected.setDragging_(false);
      selected.render();
      goog.Timer.callOnce(selected.bumpNeighbours_, Blockly.BUMP_DELAY, selected);
      Blockly.fireUiEvent(window, "resize")
    }
  }
  if(selected) {
    selected.workspace.fireChangeEvent()
  }
  Blockly.Block.dragMode_ = Blockly.Block.DRAG_MODE_NOT_DRAGGING
};
Blockly.Block.prototype.select = function(spotlight) {
  if(!this.svg_) {
    throw"Block is not rendered.";
  }
  if(Blockly.selected) {
    Blockly.selected.unselect()
  }
  Blockly.selected = this;
  this.svg_.addSelect();
  if(spotlight) {
    this.svg_.addSpotlight()
  }
  Blockly.fireUiEvent(this.workspace.getCanvas(), "blocklySelectChange")
};
Blockly.Block.prototype.unselect = function() {
  if(!this.svg_) {
    throw"Block is not rendered.";
  }
  Blockly.selected = null;
  this.svg_.removeSelect();
  this.svg_.removeSpotlight();
  Blockly.fireUiEvent(this.workspace.getCanvas(), "blocklySelectChange")
};
Blockly.Block.prototype.dispose = function(healStack, animate) {
  this.rendered = false;
  this.unplug(healStack);
  if(animate && this.svg_) {
    this.svg_.disposeUiEffect()
  }
  this.workspace.removeTopBlock(this);
  this.workspace = null;
  if(Blockly.selected == this) {
    Blockly.selected = null;
    Blockly.terminateDrag_()
  }
  if(Blockly.ContextMenu.currentBlock == this) {
    Blockly.ContextMenu.hide()
  }
  for(var x = this.childBlocks_.length - 1;x >= 0;x--) {
    this.childBlocks_[x].dispose(false)
  }
  var icons = this.getIcons();
  for(var x = 0;x < icons.length;x++) {
    icons[x].dispose()
  }
  for(var x = 0, input;input = this.inputList[x];x++) {
    input.dispose()
  }
  this.inputList = [];
  var connections = this.getConnections_(true);
  for(var x = 0;x < connections.length;x++) {
    var connection = connections[x];
    if(connection.targetConnection) {
      connection.disconnect()
    }
    connections[x].dispose()
  }
  if(this.svg_) {
    this.svg_.dispose();
    this.svg_ = null
  }
};
Blockly.Block.prototype.unplug = function(healStack, bump) {
  bump = bump && !!this.getParent();
  if(this.outputConnection) {
    if(this.outputConnection.targetConnection) {
      this.setParent(null)
    }
  }else {
    var previousTarget = null;
    if(this.previousConnection && this.previousConnection.targetConnection) {
      previousTarget = this.previousConnection.targetConnection;
      this.setParent(null)
    }
    if(healStack && (this.nextConnection && this.nextConnection.targetConnection)) {
      var nextTarget = this.nextConnection.targetConnection;
      var nextBlock = this.nextConnection.targetBlock();
      nextBlock.setParent(null);
      if(previousTarget) {
        previousTarget.connect(nextTarget)
      }
    }
  }
  if(bump) {
    var dx = Blockly.SNAP_RADIUS * (Blockly.RTL ? -1 : 1);
    var dy = Blockly.SNAP_RADIUS * 2;
    this.moveBy(dx, dy)
  }
};
Blockly.Block.prototype.getRelativeToSurfaceXY = function() {
  var x = 0;
  var y = 0;
  if(this.svg_) {
    var element = this.svg_.getRootElement();
    do {
      var xy = Blockly.getRelativeXY_(element);
      x += xy.x;
      y += xy.y;
      element = element.parentNode
    }while(element && element != this.workspace.getCanvas())
  }
  return{x:x, y:y}
};
Blockly.Block.prototype.moveBy = function(dx, dy) {
  var xy = this.getRelativeToSurfaceXY();
  this.svg_.getRootElement().setAttribute("transform", "translate(" + (xy.x + dx) + ", " + (xy.y + dy) + ")");
  this.moveConnections_(dx, dy)
};
Blockly.Block.prototype.getHeightWidth = function() {
  try {
    if(Blockly.ieVersion() && Blockly.ieVersion() <= 10) {
      this.getSvgRoot().style.display = "inline"
    }
    var bBox = goog.object.clone(this.getSvgRoot().getBBox())
  }catch(e) {
    return{height:0, width:0}
  }
  if(Blockly.BROKEN_CONTROL_POINTS) {
    bBox.height -= 10;
    if(this.nextConnection) {
      bBox.height += 4
    }
  }
  bBox.height -= 1;
  return bBox
};
Blockly.Block.prototype.onMouseDown_ = function(e) {
  e.preventDefault();
  if(this.isInFlyout) {
    return
  }
  Blockly.svgResize();
  Blockly.terminateDrag_();
  this.select();
  Blockly.hideChaff();
  if(Blockly.isRightButton(e)) {
  }else {
    if(!this.isMovable()) {
      return
    }else {
      Blockly.removeAllRanges();
      Blockly.setCursorHand_(true);
      var xy = this.getRelativeToSurfaceXY();
      this.startDragX = xy.x;
      this.startDragY = xy.y;
      if(e.startDragMouseX_ !== undefined && e.startDragMouseY_ !== undefined) {
        this.startDragMouseX = e.startDragMouseX_;
        this.startDragMouseY = e.startDragMouseY_;
        e.startDragMouseX_ = undefined;
        e.startDragMouseY_ = undefined
      }else {
        this.startDragMouseX = e.clientX;
        this.startDragMouseY = e.clientY
      }
      Blockly.Block.dragMode_ = Blockly.Block.DRAG_MODE_INSIDE_STICKY_RADIUS;
      Blockly.Block.onMouseUpWrapper_ = Blockly.bindEvent_(document, "mouseup", this, this.onMouseUp_);
      Blockly.Block.onMouseMoveWrapper_ = Blockly.bindEvent_(document, "mousemove", this, this.onMouseMove_);
      this.draggedBubbles_ = [];
      var descendants = this.getDescendants();
      for(var x = 0, descendant;descendant = descendants[x];x++) {
        var icons = descendant.getIcons();
        for(var y = 0;y < icons.length;y++) {
          var data = icons[y].getIconLocation();
          data.bubble = icons[y];
          this.draggedBubbles_.push(data)
        }
      }
    }
  }
  e.stopPropagation()
};
Blockly.Block.prototype.onMouseUp_ = function(e) {
  Blockly.terminateDrag_();
  if(Blockly.selected && Blockly.highlightedConnection_) {
    Blockly.localConnection_.connect(Blockly.highlightedConnection_);
    if(this.svg_) {
      var inferiorConnection;
      if(Blockly.localConnection_.isSuperior()) {
        inferiorConnection = Blockly.highlightedConnection_
      }else {
        inferiorConnection = Blockly.localConnection_
      }
      inferiorConnection.sourceBlock_.svg_.connectionUiEffect()
    }
    if(this.workspace.trashcan && this.workspace.trashcan.isOpen) {
      this.workspace.trashcan.close()
    }
  }else {
    if(this.workspace.trashcan && this.workspace.trashcan.isOpen) {
      var trashcan = this.workspace.trashcan;
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
      if(Blockly.selected) {
        Blockly.selected.dispose(false, true)
      }
      Blockly.fireUiEvent(window, "resize")
    }
  }
  if(Blockly.highlightedConnection_) {
    Blockly.highlightedConnection_.unhighlight();
    Blockly.highlightedConnection_ = null
  }
};
Blockly.Block.prototype.showHelp_ = function() {
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  if(url) {
    window.open(url)
  }
};
Blockly.Block.prototype.duplicate_ = function() {
  var xmlBlock = Blockly.Xml.blockToDom_(this);
  Blockly.Xml.deleteNext(xmlBlock);
  var newBlock = Blockly.Xml.domToBlock_((this.workspace), xmlBlock);
  var xy = this.getRelativeToSurfaceXY();
  if(Blockly.RTL) {
    xy.x -= Blockly.SNAP_RADIUS
  }else {
    xy.x += Blockly.SNAP_RADIUS
  }
  xy.y += Blockly.SNAP_RADIUS * 2;
  newBlock.moveBy(xy.x, xy.y);
  return newBlock
};
Blockly.Block.prototype.showContextMenu_ = function(e) {
  if(Blockly.readOnly || !this.contextMenu) {
    return
  }
  var block = this;
  var options = [];
  if(this.isDeletable() && !block.isInFlyout) {
    var duplicateOption = {text:Blockly.Msg.DUPLICATE_BLOCK, enabled:true, callback:function() {
      block.duplicate_()
    }};
    if(this.getDescendants().length > this.workspace.remainingCapacity()) {
      duplicateOption.enabled = false
    }
    options.push(duplicateOption);
    if(Blockly.Comment && !this.collapsed_) {
      var commentOption = {enabled:true};
      if(this.comment) {
        commentOption.text = Blockly.Msg.REMOVE_COMMENT;
        commentOption.callback = function() {
          block.setCommentText(null)
        }
      }else {
        commentOption.text = Blockly.Msg.ADD_COMMENT;
        commentOption.callback = function() {
          block.setCommentText("")
        }
      }
      options.push(commentOption)
    }
    if(!this.collapsed_) {
      for(var i = 0;i < this.inputList.length;i++) {
        if(this.inputList[i].type == Blockly.INPUT_VALUE) {
          var inlineOption = {enabled:true};
          inlineOption.text = this.inputsInline ? Blockly.Msg.EXTERNAL_INPUTS : Blockly.Msg.INLINE_INPUTS;
          inlineOption.callback = function() {
            block.setInputsInline(!block.inputsInline)
          };
          options.push(inlineOption);
          break
        }
      }
    }
    if(Blockly.collapse) {
      if(this.collapsed_) {
        var expandOption = {enabled:true};
        expandOption.text = Blockly.Msg.EXPAND_BLOCK;
        expandOption.callback = function() {
          block.setCollapsed(false)
        };
        options.push(expandOption)
      }else {
        var collapseOption = {enabled:true};
        collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
        collapseOption.callback = function() {
          block.setCollapsed(true)
        };
        options.push(collapseOption)
      }
    }
    var disableOption = {text:this.disabled ? Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK, enabled:!this.getInheritedDisabled(), callback:function() {
      block.setDisabled(!block.disabled)
    }};
    options.push(disableOption);
    var descendantCount = this.getDescendants().length;
    if(block.nextConnection && block.nextConnection.targetConnection) {
      descendantCount -= this.nextConnection.targetBlock().getDescendants().length
    }
    var deleteOption = {text:descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK : Blockly.Msg.DELETE_X_BLOCKS.replace("%1", descendantCount), enabled:true, callback:function() {
      block.dispose(true, true)
    }};
    options.push(deleteOption)
  }
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled:!!url};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
    block.showHelp_()
  };
  options.push(helpOption);
  if(this.customContextMenu && !block.isInFlyout) {
    this.customContextMenu(options)
  }
  Blockly.ContextMenu.show(e, options);
  Blockly.ContextMenu.currentBlock = this
};
Blockly.Block.prototype.getConnections_ = function(all) {
  var myConnections = [];
  if(all || this.rendered) {
    if(this.outputConnection) {
      myConnections.push(this.outputConnection)
    }
    if(this.nextConnection) {
      myConnections.push(this.nextConnection)
    }
    if(this.previousConnection) {
      myConnections.push(this.previousConnection)
    }
    if(all || !this.collapsed_) {
      for(var x = 0, input;input = this.inputList[x];x++) {
        if(input.connection) {
          myConnections.push(input.connection)
        }
      }
    }
  }
  return myConnections
};
Blockly.Block.prototype.getLeafConnections_ = function(source) {
  var self = this;
  var leaves = [];
  var allConnections = [this.outputConnection, this.nextConnection, this.previousConnection];
  this.inputList.forEach(function(input) {
    allConnections.push(input.connection)
  });
  allConnections.forEach(function(connection) {
    if(!connection) {
      return
    }
    var targetBlock = connection.targetBlock();
    if(!targetBlock) {
      leaves.push(connection)
    }else {
      if(targetBlock !== source) {
        leaves = leaves.concat(targetBlock.getLeafConnections_(self))
      }
    }
  });
  return leaves
};
Blockly.Block.prototype.moveConnections_ = function(dx, dy) {
  if(!this.rendered) {
    return
  }
  var myConnections = this.getConnections_(false);
  for(var x = 0;x < myConnections.length;x++) {
    myConnections[x].moveBy(dx, dy)
  }
  var icons = this.getIcons();
  for(var x = 0;x < icons.length;x++) {
    icons[x].computeIconLocation()
  }
  for(var x = 0;x < this.childBlocks_.length;x++) {
    this.childBlocks_[x].moveConnections_(dx, dy)
  }
};
Blockly.Block.prototype.setDragging_ = function(adding) {
  this.setDraggingHandleImmovable_(adding, null)
};
Blockly.Block.prototype.getDragging = function() {
  return this.dragging_
};
Blockly.Block.prototype.setDraggingHandleImmovable_ = function(adding, immovableBlockHandler) {
  if(adding) {
    this.dragging_ = true;
    this.svg_.addDragging()
  }else {
    this.dragging_ = false;
    this.svg_.removeDragging()
  }
  for(var x = 0;x < this.childBlocks_.length;x++) {
    var block = this.childBlocks_[x];
    if(adding && (immovableBlockHandler !== null && !block.isMovable())) {
      immovableBlockHandler(block);
      break
    }
    block.setDraggingHandleImmovable_(adding, immovableBlockHandler)
  }
};
Blockly.Block.prototype.moveToFrontOfCanvas_ = function() {
  this.workspace.getCanvas().appendChild(this.svg_.getRootElement())
};
Blockly.Block.prototype.onMouseMove_ = function(e) {
  if(e.type == "mousemove" && (e.clientX <= 1 && (e.clientY == 0 && e.button == 0))) {
    e.stopPropagation();
    return
  }
  Blockly.removeAllRanges();
  var dx = e.clientX - this.startDragMouseX;
  var dy = e.clientY - this.startDragMouseY;
  if(Blockly.Block.dragMode_ == Blockly.Block.DRAG_MODE_INSIDE_STICKY_RADIUS) {
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if(dr > Blockly.DRAG_RADIUS) {
      Blockly.Block.dragMode_ = Blockly.Block.DRAG_MODE_FREELY_DRAGGING;
      var firstImmovableBlockHandler = this.generateReconnector_(this.previousConnection);
      this.setParent(null);
      this.setDraggingHandleImmovable_(true, firstImmovableBlockHandler);
      this.moveToFrontOfCanvas_()
    }
  }
  if(Blockly.Block.dragMode_ == Blockly.Block.DRAG_MODE_FREELY_DRAGGING) {
    var x = this.startDragX + dx;
    var y = this.startDragY + dy;
    this.svg_.getRootElement().setAttribute("transform", "translate(" + x + ", " + y + ")");
    for(var i = 0;i < this.draggedBubbles_.length;i++) {
      var commentData = this.draggedBubbles_[i];
      commentData.bubble.setIconLocation(commentData.x + dx, commentData.y + dy)
    }
    var myConnections = this.getLeafConnections_(null);
    var closestConnection = null;
    var localConnection = null;
    var radiusConnection = Blockly.SNAP_RADIUS;
    for(var i = 0;i < myConnections.length;i++) {
      var myConnection = myConnections[i];
      var neighbour = myConnection.closest(radiusConnection, dx, dy);
      if(neighbour.connection) {
        closestConnection = neighbour.connection;
        localConnection = myConnection;
        radiusConnection = neighbour.radius
      }
    }
    if(Blockly.highlightedConnection_ && Blockly.highlightedConnection_ != closestConnection) {
      Blockly.highlightedConnection_.unhighlight();
      Blockly.highlightedConnection_ = null;
      Blockly.localConnection_ = null
    }
    if(closestConnection && closestConnection != Blockly.highlightedConnection_) {
      closestConnection.highlight();
      Blockly.highlightedConnection_ = closestConnection;
      Blockly.localConnection_ = localConnection
    }
    if(this.workspace.trashcan && this.isDeletable()) {
      this.workspace.trashcan.onMouseMove(e)
    }
  }
  e.stopPropagation()
};
Blockly.Block.prototype.generateReconnector_ = function(earlierConnection) {
  var earlierNextConnection;
  if(earlierConnection && earlierConnection.targetConnection) {
    earlierNextConnection = earlierConnection.targetConnection
  }
  return function(block) {
    if(block.previousConnection) {
      block.setParent(null);
      earlierNextConnection && earlierNextConnection.connect(block.previousConnection)
    }
  }
};
Blockly.Block.prototype.bumpNeighbours_ = function() {
  if(Blockly.Block.isDragging() || !Blockly.BUMP_UNCONNECTED) {
    return
  }
  var rootBlock = this.getRootBlock();
  if(rootBlock.isInFlyout) {
    return
  }
  var myConnections = this.getConnections_(false);
  for(var x = 0;x < myConnections.length;x++) {
    var connection = myConnections[x];
    if(connection.targetConnection && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours_()
    }
    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for(var y = 0;y < neighbours.length;y++) {
      var otherConnection = neighbours[y];
      if(!connection.targetConnection || !otherConnection.targetConnection) {
        if(otherConnection.sourceBlock_.getRootBlock() != rootBlock) {
          if(connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection)
          }else {
            connection.bumpAwayFrom_(otherConnection)
          }
        }
      }
    }
  }
};
Blockly.Block.prototype.getParent = function() {
  return this.parentBlock_
};
Blockly.Block.prototype.getSurroundParent = function() {
  var block = this;
  while(true) {
    do {
      var prevBlock = block;
      block = block.getParent();
      if(!block) {
        return null
      }
    }while(block.nextConnection && block.nextConnection.targetBlock() == prevBlock);
    return block
  }
};
Blockly.Block.prototype.getRootBlock = function() {
  var rootBlock;
  var block = this;
  do {
    rootBlock = block;
    block = rootBlock.parentBlock_
  }while(block);
  return rootBlock
};
Blockly.Block.prototype.getChildren = function() {
  return this.childBlocks_
};
Blockly.Block.prototype.setParent = function(newParent) {
  if(this.parentBlock_) {
    var children = this.parentBlock_.childBlocks_;
    for(var child, x = 0;child = children[x];x++) {
      if(child == this) {
        children.splice(x, 1);
        break
      }
    }
    var xy = this.getRelativeToSurfaceXY();
    this.moveToFrontOfCanvas_();
    this.svg_.getRootElement().setAttribute("transform", "translate(" + xy.x + ", " + xy.y + ")");
    this.parentBlock_ = null;
    if(this.previousConnection && this.previousConnection.targetConnection) {
      this.previousConnection.disconnect()
    }
    if(this.outputConnection && this.outputConnection.targetConnection) {
      this.outputConnection.disconnect()
    }
  }else {
    this.workspace.removeTopBlock(this)
  }
  this.parentBlock_ = newParent;
  if(newParent) {
    newParent.childBlocks_.push(this);
    var oldXY = this.getRelativeToSurfaceXY();
    if(newParent.svg_ && this.svg_) {
      newParent.svg_.getRootElement().appendChild(this.svg_.getRootElement())
    }
    var newXY = this.getRelativeToSurfaceXY();
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y)
  }else {
    this.workspace.addTopBlock(this)
  }
};
Blockly.Block.prototype.getDescendants = function() {
  var blocks = [this];
  for(var child, x = 0;child = this.childBlocks_[x];x++) {
    blocks = blocks.concat(child.getDescendants())
  }
  return blocks
};
Blockly.Block.prototype.isDeletable = function() {
  return this.deletable_ && !Blockly.readOnly
};
Blockly.Block.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
  this.svg_ && this.svg_.updateGrayOutCSS()
};
Blockly.Block.prototype.isMovable = function() {
  return this.movable_ && !Blockly.readOnly
};
Blockly.Block.prototype.setMovable = function(movable) {
  this.movable_ = movable;
  this.svg_ && this.svg_.updateMovable()
};
Blockly.Block.prototype.isEditable = function() {
  return this.editable_ && !Blockly.readOnly
};
Blockly.Block.prototype.setEditable = function(editable) {
  this.editable_ = editable;
  for(var x = 0, input;input = this.inputList[x];x++) {
    for(var y = 0, title;title = input.titleRow[y];y++) {
      title.updateEditable()
    }
  }
  var icons = this.getIcons();
  for(var x = 0;x < icons.length;x++) {
    icons[x].updateEditable()
  }
};
Blockly.Block.prototype.setHelpUrl = function(url) {
  this.helpUrl = url
};
Blockly.Block.prototype.getHexColour = function() {
  return Blockly.makeColour(this.getColour(), this.getSaturation(), this.getValue())
};
Blockly.Block.prototype.getColour = function() {
  return this.colourHue_
};
Blockly.Block.prototype.getSaturation = function() {
  return this.colourSaturation_
};
Blockly.Block.prototype.getFillPattern = function() {
  return this.fillPattern_
};
Blockly.Block.prototype.isFramed = function() {
  return this.blockSvgClass_ === Blockly.BlockSvgFramed
};
Blockly.Block.prototype.getValue = function() {
  return this.colourValue_
};
Blockly.Block.prototype.setColour = function(colourHue) {
  this.colourHue_ = colourHue;
  if(this.svg_) {
    this.svg_.updateColour()
  }
  var icons = this.getIcons();
  for(var x = 0;x < icons.length;x++) {
    icons[x].updateColour()
  }
  if(this.rendered) {
    for(var x = 0, input;input = this.inputList[x];x++) {
      for(var y = 0, title;title = input.titleRow[y];y++) {
        title.setText(null)
      }
    }
    this.render()
  }
};
Blockly.Block.prototype.setFillPattern = function(pattern) {
  this.fillPattern_ = pattern
};
Blockly.Block.prototype.setFramed = function(isFramed) {
  this.blockSvgClass_ = isFramed ? Blockly.BlockSvgFramed : Blockly.BlockSvg
};
Blockly.Block.prototype.setFunctional = function(isFunctional, options) {
  this.blockSvgClass_ = isFunctional ? Blockly.BlockSvgFunctional : Blockly.BlockSvg;
  this.customOptions_ = isFunctional ? options : {}
};
Blockly.Block.prototype.setHSV = function(colourHue, colourSaturation, colourValue) {
  this.colourHue_ = colourHue;
  this.colourSaturation_ = colourSaturation;
  this.colourValue_ = colourValue;
  if(this.svg_) {
    this.svg_.updateColour()
  }
  var icons = this.getIcons();
  for(var x = 0;x < icons.length;x++) {
    icons[x].updateColour()
  }
  if(this.rendered) {
    for(var x = 0, input;input = this.inputList[x];x++) {
      for(var y = 0, title;title = input.titleRow[y];y++) {
        title.setText(null)
      }
    }
    this.render()
  }
};
Blockly.Block.prototype.getTitle_ = function(name) {
  for(var x = 0, input;input = this.inputList[x];x++) {
    for(var y = 0, title;title = input.titleRow[y];y++) {
      if(title.name === name) {
        return title
      }
    }
  }
  return null
};
Blockly.Block.prototype.getTitles = function() {
  var titles = [];
  for(var x = 0, input;input = this.inputList[x];x++) {
    for(var y = 0, title;title = input.titleRow[y];y++) {
      titles.push(title)
    }
  }
  return titles
};
Blockly.Block.prototype.getTitleValue = function(name) {
  var title = this.getTitle_(name);
  if(title) {
    return title.getValue()
  }
  return null
};
Blockly.Block.prototype.setTitleValue = function(newValue, name) {
  var title = this.getTitle_(name);
  if(title) {
    title.setValue(newValue)
  }else {
    throw'Title "' + name + '" not found.';
  }
};
Blockly.Block.prototype.setFieldConfig = function(fieldName, configString) {
  var field = this.getTitle_(fieldName);
  if(!field) {
    throw'Title "' + name + '" not found.';
  }
  if(field.setConfig) {
    field.setConfig(configString)
  }
};
Blockly.Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip
};
Blockly.Block.prototype.setPreviousStatement = function(hasPrevious, opt_check) {
  if(this.previousConnection) {
    if(this.previousConnection.targetConnection) {
      throw"Must disconnect previous statement before removing connection.";
    }
    this.previousConnection.dispose();
    this.previousConnection = null
  }
  if(hasPrevious) {
    if(this.outputConnection) {
      throw"Remove output connection prior to adding previous connection.";
    }
    if(opt_check === undefined) {
      opt_check = null
    }
    this.previousConnection = new Blockly.Connection(this, Blockly.PREVIOUS_STATEMENT);
    this.previousConnection.setCheck(opt_check)
  }
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.setNextStatement = function(hasNext, opt_check) {
  if(this.nextConnection) {
    if(this.nextConnection.targetConnection) {
      throw"Must disconnect next statement before removing connection.";
    }
    this.nextConnection.dispose();
    this.nextConnection = null
  }
  if(hasNext) {
    if(opt_check === undefined) {
      opt_check = null
    }
    this.nextConnection = new Blockly.Connection(this, Blockly.NEXT_STATEMENT);
    this.nextConnection.setCheck(opt_check)
  }
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.setOutput = function(hasOutput, opt_check) {
  if(this.outputConnection) {
    if(this.outputConnection.targetConnection) {
      throw"Must disconnect output value before removing connection.";
    }
    this.outputConnection.dispose();
    this.outputConnection = null
  }
  if(hasOutput) {
    if(this.previousConnection) {
      throw"Remove previous connection prior to adding output connection.";
    }
    if(opt_check === undefined) {
      opt_check = null
    }
    this.outputConnection = new Blockly.Connection(this, Blockly.OUTPUT_VALUE);
    this.outputConnection.setCheck(opt_check)
  }
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.setFunctionalOutput = function(hasOutput, opt_check) {
  if(this.previousConnection) {
    if(this.previousConnection.targetConnection) {
      throw"Must disconnect output value before removing connection.";
    }
    this.previousConnection.dispose();
    this.previousConnection = null
  }
  if(hasOutput) {
    if(this.previousConnection) {
      throw"Remove previous connection prior to adding output connection.";
    }
    if(opt_check === undefined) {
      opt_check = null
    }
    this.previousConnection = new Blockly.Connection(this, Blockly.FUNCTIONAL_OUTPUT);
    this.previousConnection.setCheck(opt_check)
  }
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.setInputsInline = function(inputsInline) {
  this.inputsInline = inputsInline;
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_();
    this.workspace.fireChangeEvent()
  }
};
Blockly.Block.prototype.setDisabled = function(disabled) {
  if(this.disabled == disabled) {
    return
  }
  this.disabled = disabled;
  this.svg_.updateDisabled();
  this.workspace.fireChangeEvent()
};
Blockly.Block.prototype.getInheritedDisabled = function() {
  var block = this;
  while(true) {
    block = block.getSurroundParent();
    if(!block) {
      return false
    }else {
      if(block.disabled) {
        return true
      }
    }
  }
};
Blockly.Block.prototype.isCollapsed = function() {
  return this.collapsed_
};
Blockly.Block.prototype.setCollapsed = function(collapsed) {
  if(this.collapsed_ == collapsed) {
    return
  }
  this.collapsed_ = collapsed;
  var renderList = [];
  for(var x = 0, input;input = this.inputList[x];x++) {
    renderList = renderList.concat(input.setVisible(!collapsed))
  }
  var COLLAPSED_INPUT_NAME = "_TEMP_COLLAPSED_INPUT";
  if(collapsed) {
    var icons = this.getIcons();
    for(var x = 0;x < icons.length;x++) {
      icons[x].setVisible(false)
    }
    var text = this.toString(Blockly.COLLAPSE_CHARS);
    this.appendDummyInput(COLLAPSED_INPUT_NAME).appendTitle(text)
  }else {
    this.removeInput(COLLAPSED_INPUT_NAME)
  }
  if(!renderList.length) {
    renderList[0] = this
  }
  if(this.rendered) {
    for(var x = 0, block;block = renderList[x];x++) {
      block.render()
    }
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.toString = function(opt_maxLength) {
  var text = [];
  for(var x = 0, input;input = this.inputList[x];x++) {
    for(var y = 0, title;title = input.titleRow[y];y++) {
      text.push(title.getText())
    }
    if(input.connection) {
      var child = input.connection.targetBlock();
      if(child) {
        text.push(child.toString())
      }else {
        text.push("?")
      }
    }
  }
  text = goog.string.trim(text.join(" ")) || "???";
  if(opt_maxLength) {
    text = goog.string.truncate(text, opt_maxLength)
  }
  return text
};
Blockly.Block.prototype.appendValueInput = function(name) {
  return this.appendInput_(Blockly.INPUT_VALUE, name)
};
Blockly.Block.prototype.appendStatementInput = function(name) {
  return this.appendInput_(Blockly.NEXT_STATEMENT, name)
};
Blockly.Block.prototype.appendDummyInput = function(opt_name) {
  return this.appendInput_(Blockly.DUMMY_INPUT, opt_name || "")
};
Blockly.Block.prototype.appendFunctionalInput = function(name) {
  return this.appendInput_(Blockly.FUNCTIONAL_INPUT, name)
};
Blockly.Block.prototype.interpolateMsg = function(msg, var_args) {
  goog.asserts.assertString(msg);
  var dummyAlign = arguments.length - 1;
  goog.asserts.assertNumber(dummyAlign);
  var tokens = msg.split(/(%\d)/);
  for(var i = 0;i < tokens.length;i += 2) {
    var text = goog.string.trim(tokens[i]);
    var symbol = tokens[i + 1];
    if(symbol) {
      var digit = window.parseInt(symbol.charAt(1), 10);
      var tuple = arguments[digit];
      goog.asserts.assertArray(tuple, 'Message symbol "%s" is out of range.', symbol);
      this.appendValueInput(tuple[0]).setCheck(tuple[1]).setAlign(tuple[2]).appendTitle(text);
      arguments[digit] = null
    }else {
      if(text) {
        this.appendDummyInput().setAlign(dummyAlign).appendTitle(text)
      }
    }
  }
  for(var i = 1;i < arguments.length - 1;i++) {
    goog.asserts.assert(arguments[i] === null, 'Input "%%s" not used in message: "%s"', i, msg)
  }
  this.setInputsInline(!msg.match(/%1\s*$/))
};
Blockly.Block.prototype.appendInput_ = function(type, name) {
  var connection = null;
  if(type === Blockly.INPUT_VALUE || (type === Blockly.NEXT_STATEMENT || type === Blockly.FUNCTIONAL_INPUT)) {
    connection = new Blockly.Connection(this, type)
  }
  var input = new Blockly.Input(type, name, this, connection);
  this.inputList.push(input);
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
  return input
};
Blockly.Block.prototype.moveInputBefore = function(name, refName) {
  if(name == refName) {
    throw"Can't move \"" + name + '" to itself.';
  }
  var inputIndex = -1;
  var refIndex = -1;
  for(var x = 0, input;input = this.inputList[x];x++) {
    if(input.name == name) {
      inputIndex = x;
      if(refIndex != -1) {
        break
      }
    }else {
      if(input.name == refName) {
        refIndex = x;
        if(inputIndex != -1) {
          break
        }
      }
    }
  }
  if(inputIndex == -1) {
    throw'Named input "' + name + '" not found.';
  }
  if(refIndex == -1) {
    throw'Reference input "' + name + '" not found.';
  }
  this.inputList.splice(inputIndex, 1);
  if(inputIndex < refIndex) {
    refIndex--
  }
  this.inputList.splice(refIndex, 0, input);
  if(this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.removeInput = function(name, opt_quiet) {
  for(var x = 0, input;input = this.inputList[x];x++) {
    if(input.name == name) {
      if(input.connection && input.connection.targetConnection) {
        input.connection.targetBlock().setParent(null)
      }
      input.dispose();
      this.inputList.splice(x, 1);
      if(this.rendered) {
        this.render();
        this.bumpNeighbours_()
      }
      return
    }
  }
  if(!opt_quiet) {
    goog.asserts.fail('Input "%s" not found.', name)
  }
};
Blockly.Block.prototype.getInput = function(name) {
  for(var x = 0, input;input = this.inputList[x];x++) {
    if(input.name == name) {
      return input
    }
  }
  return null
};
Blockly.Block.prototype.getInputTargetBlock = function(name) {
  var input = this.getInput(name);
  return input && (input.connection && input.connection.targetBlock())
};
Blockly.Block.prototype.setMutator = function(mutator) {
  if(this.mutator && this.mutator !== mutator) {
    this.mutator.dispose()
  }
  if(mutator) {
    mutator.block_ = this;
    this.mutator = mutator;
    if(this.svg_) {
      mutator.createIcon()
    }
  }
};
Blockly.Block.prototype.getCommentText = function() {
  if(this.comment) {
    var comment = this.comment.getText();
    return comment.replace(/\s+$/, "").replace(/ +\n/g, "\n")
  }
  return""
};
Blockly.Block.prototype.setCommentText = function(text) {
  if(!Blockly.Comment) {
    throw"Comments not supported.";
  }
  var changedState = false;
  if(goog.isString(text)) {
    if(!this.comment) {
      this.comment = new Blockly.Comment(this);
      changedState = true
    }
    this.comment.setText((text))
  }else {
    if(this.comment) {
      this.comment.dispose();
      changedState = true
    }
  }
  if(this.rendered) {
    this.render();
    if(changedState) {
      this.bumpNeighbours_()
    }
  }
};
Blockly.Block.prototype.setWarningText = function(text) {
  if(!Blockly.Warning) {
    throw"Warnings not supported.";
  }
  if(this.isInFlyout) {
    text = null
  }
  var changedState = false;
  if(goog.isString(text)) {
    if(!this.warning) {
      this.warning = new Blockly.Warning(this);
      changedState = true
    }
    this.warning.setText((text))
  }else {
    if(this.warning) {
      this.warning.dispose();
      changedState = true
    }
  }
  if(changedState && this.rendered) {
    this.render();
    this.bumpNeighbours_()
  }
};
Blockly.Block.prototype.render = function() {
  if(!this.svg_) {
    throw"Uninitialized block cannot be rendered.  Call block.initSvg()";
  }
  this.svg_.render()
};
Blockly.Block.prototype.setVisible = function(visible) {
  if(!this.svg_) {
    throw"Uninitialized block cannot set visibility.  Call block.initSvg()";
  }
  this.svg_.setVisible(visible)
};
goog.provide("Blockly.Flyout");
goog.require("Blockly.Block");
goog.require("Blockly.Comment");
Blockly.Flyout = function() {
  var flyout = this;
  this.workspace_ = new Blockly.Workspace(function() {
    return flyout.getMetrics_()
  }, function(ratio) {
    return flyout.setMetrics_(ratio)
  });
  this.workspace_.isFlyout = true;
  this.changeWrapper_ = null;
  this.width_ = 0;
  this.height_ = 0;
  this.buttons_ = [];
  this.listeners_ = [];
  this.enabled_ = true
};
Blockly.Flyout.prototype.autoClose = true;
Blockly.Flyout.prototype.CORNER_RADIUS = 8;
Blockly.Flyout.prototype.onResizeWrapper_ = null;
Blockly.Flyout.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement("g", {}, null);
  this.svgBackground_ = Blockly.createSvgElement("path", {"class":"blocklyFlyoutBackground"}, this.svgGroup_);
  this.svgGroup_.appendChild(this.workspace_.createDom());
  return this.svgGroup_
};
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  if(this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null
  }
  if(this.changeWrapper_) {
    Blockly.unbindEvent_(this.changeWrapper_);
    this.changeWrapper_ = null
  }
  if(this.scrollbar_) {
    this.scrollbar_.dispose();
    this.scrollbar_ = null
  }
  this.workspace_ = null;
  if(this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null
  }
  this.svgBackground_ = null;
  this.targetWorkspace_ = null
};
Blockly.Flyout.prototype.getMetrics_ = function() {
  if(!this.isVisible()) {
    return null
  }
  var viewHeight = this.height_ - 2 * this.CORNER_RADIUS;
  var viewWidth = this.width_;
  try {
    if(Blockly.isMsie() || Blockly.isTrident()) {
      this.workspace_.getCanvas().style.display = "inline";
      var optionBox = {x:this.workspace_.getCanvas().getBBox().x, y:this.workspace_.getCanvas().getBBox().y, width:this.workspace_.getCanvas().scrollWidth, height:this.workspace_.getCanvas().scrollHeight}
    }else {
      var optionBox = this.workspace_.getCanvas().getBBox()
    }
  }catch(e) {
    var optionBox = {height:0, y:0}
  }
  return{viewHeight:viewHeight, viewWidth:viewWidth, contentHeight:optionBox.height + optionBox.y, viewTop:-this.workspace_.pageYOffset, contentTop:0, absoluteTop:this.CORNER_RADIUS, absoluteLeft:0}
};
Blockly.Flyout.prototype.setMetrics_ = function(yRatio) {
  var metrics = this.getMetrics_();
  if(goog.isNumber(yRatio.y)) {
    this.workspace_.pageYOffset = -metrics.contentHeight * yRatio.y - metrics.contentTop
  }
  var y = this.workspace_.pageYOffset + metrics.absoluteTop;
  this.workspace_.getCanvas().setAttribute("transform", "translate(0," + y + ")")
};
Blockly.Flyout.prototype.init = function(workspace, withScrollbar) {
  this.targetWorkspace_ = workspace;
  var flyout = this;
  if(withScrollbar) {
    this.scrollbar_ = new Blockly.Scrollbar(flyout.workspace_, false, false)
  }
  this.hide();
  this.onResizeWrapper_ = Blockly.bindEvent_(window, goog.events.EventType.RESIZE, this, this.position_);
  this.position_();
  this.changeWrapper_ = Blockly.bindEvent_(this.targetWorkspace_.getCanvas(), "blocklyWorkspaceChange", this, this.filterForCapacity_)
};
Blockly.Flyout.prototype.position_ = function() {
  if(!this.isVisible()) {
    return
  }
  var metrics = this.targetWorkspace_.getMetrics();
  if(!metrics) {
    return
  }
  var edgeWidth = this.width_ - this.CORNER_RADIUS;
  if(Blockly.RTL) {
    edgeWidth *= -1
  }
  var path = ["M " + (Blockly.RTL ? this.width_ : 0) + ",0"];
  path.push("h", edgeWidth);
  path.push("a", this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, Blockly.RTL ? 0 : 1, Blockly.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS, this.CORNER_RADIUS);
  path.push("v", Math.max(0, metrics.viewHeight - this.CORNER_RADIUS * 2));
  path.push("a", this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, Blockly.RTL ? 0 : 1, Blockly.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS, this.CORNER_RADIUS);
  path.push("h", -edgeWidth);
  path.push("z");
  this.svgBackground_.setAttribute("d", path.join(" "));
  var x = metrics.absoluteLeft;
  if(Blockly.RTL) {
    x += metrics.viewWidth;
    x -= this.width_
  }
  this.svgGroup_.setAttribute("transform", "translate(" + x + "," + metrics.absoluteTop + ")");
  this.height_ = metrics.viewHeight;
  if(this.scrollbar_) {
    this.scrollbar_.resize()
  }
};
Blockly.Flyout.prototype.isVisible = function() {
  return this.svgGroup_.style.display == "block"
};
Blockly.Flyout.prototype.hide = function() {
  if(!this.isVisible()) {
    return
  }
  this.svgGroup_.style.display = "none";
  for(var x = 0, listen;listen = this.listeners_[x];x++) {
    Blockly.unbindEvent_(listen)
  }
  this.listeners_.splice(0);
  if(this.reflowWrapper_) {
    Blockly.unbindEvent_(this.reflowWrapper_);
    this.reflowWrapper_ = null
  }
  var blocks = this.workspace_.getTopBlocks(false);
  for(var x = 0, block;block = blocks[x];x++) {
    if(block.workspace == this.workspace_) {
      block.dispose(false, false)
    }
  }
  for(var x = 0, rect;rect = this.buttons_[x];x++) {
    goog.dom.removeNode(rect)
  }
  this.buttons_.splice(0)
};
Blockly.Flyout.prototype.show = function(xmlList) {
  this.hide();
  var margin = this.CORNER_RADIUS;
  this.svgGroup_.style.display = "block";
  var blocks = [];
  var gaps = [];
  var i = 0;
  var firstBlock = xmlList && xmlList[0];
  if(firstBlock === Blockly.Variables.NAME_TYPE) {
    Blockly.Variables.flyoutCategory(blocks, gaps, margin, (this.workspace_));
    i++
  }else {
    if(firstBlock === Blockly.Procedures.NAME_TYPE) {
      Blockly.Procedures.flyoutCategory(blocks, gaps, margin, (this.workspace_));
      i++
    }
  }
  for(var xml;xml = xmlList[i];i++) {
    if(xml.tagName && xml.tagName.toUpperCase() == "BLOCK") {
      var block = Blockly.Xml.domToBlock_((this.workspace_), xml);
      blocks.push(block);
      gaps.push(margin * 3)
    }
  }
  var cursorY = margin;
  for(var i = 0, block;block = blocks[i];i++) {
    var allBlocks = block.getDescendants();
    for(var j = 0, child;child = allBlocks[j];j++) {
      child.isInFlyout = true;
      child.setCommentText(null)
    }
    block.render();
    var root = block.getSvgRoot();
    var blockHW = block.getHeightWidth();
    var x = Blockly.RTL ? 0 : margin + Blockly.BlockSvg.TAB_WIDTH;
    block.moveBy(x, cursorY);
    cursorY += blockHW.height + gaps[i];
    var rect = Blockly.createSvgElement("rect", {"fill-opacity":0}, null);
    this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
    block.flyoutRect_ = rect;
    this.buttons_[i] = rect;
    if(this.autoClose) {
      this.listeners_.push(Blockly.bindEvent_(root, "mousedown", null, this.createBlockFunc_(block)))
    }else {
      this.listeners_.push(Blockly.bindEvent_(root, "mousedown", null, this.blockMouseDown_(block)))
    }
    this.listeners_.push(Blockly.bindEvent_(root, "mouseover", block.svg_, block.svg_.addSelectNoMove));
    this.listeners_.push(Blockly.bindEvent_(root, "mouseout", block.svg_, block.svg_.removeSelect));
    this.listeners_.push(Blockly.bindEvent_(rect, "mousedown", null, this.createBlockFunc_(block)));
    this.listeners_.push(Blockly.bindEvent_(rect, "mouseover", block.svg_, block.svg_.addSelectNoMove));
    this.listeners_.push(Blockly.bindEvent_(rect, "mouseout", block.svg_, block.svg_.removeSelect))
  }
  this.width_ = 0;
  this.reflow();
  this.filterForCapacity_();
  Blockly.fireUiEvent(window, "resize");
  this.reflowWrapper_ = Blockly.bindEvent_(this.workspace_.getCanvas(), "blocklyWorkspaceChange", this, this.reflow);
  this.workspace_.fireChangeEvent()
};
Blockly.Flyout.prototype.reflow = function() {
  var flyoutWidth = 0;
  var margin = this.CORNER_RADIUS;
  var blocks = this.workspace_.getTopBlocks(false);
  for(var x = 0, block;block = blocks[x];x++) {
    var root = block.getSvgRoot();
    var blockHW = block.getHeightWidth();
    flyoutWidth = Math.max(flyoutWidth, blockHW.width)
  }
  flyoutWidth += margin + Blockly.BlockSvg.TAB_WIDTH + margin / 2 + Blockly.Scrollbar.scrollbarThickness;
  if(this.width_ != flyoutWidth) {
    for(var x = 0, block;block = blocks[x];x++) {
      var blockHW = block.getHeightWidth();
      var blockXY = block.getRelativeToSurfaceXY();
      if(Blockly.RTL) {
        var dx = flyoutWidth - margin - Blockly.BlockSvg.TAB_WIDTH - blockXY.x;
        block.moveBy(dx, 0);
        blockXY.x += dx
      }
      if(block.flyoutRect_) {
        block.flyoutRect_.setAttribute("width", blockHW.width);
        block.flyoutRect_.setAttribute("height", blockHW.height);
        block.flyoutRect_.setAttribute("x", Blockly.RTL ? blockXY.x - blockHW.width : blockXY.x);
        block.flyoutRect_.setAttribute("y", blockXY.y)
      }
    }
    this.width_ = flyoutWidth;
    Blockly.fireUiEvent(window, "resize")
  }
};
Blockly.Block.prototype.moveTo = function(x, y) {
  var oldXY = this.getRelativeToSurfaceXY();
  this.svg_.getRootElement().setAttribute("transform", "translate(" + x + ", " + y + ")");
  this.moveConnections_(x - oldXY.x, y - oldXY.y)
};
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    if(!flyout.enabled_) {
      return
    }
    Blockly.terminateDrag_();
    Blockly.hideChaff();
    if(Blockly.isRightButton(e)) {
    }else {
      Blockly.removeAllRanges();
      Blockly.setCursorHand_(true);
      Blockly.Flyout.startDragMouseX_ = e.clientX;
      Blockly.Flyout.startDragMouseY_ = e.clientY;
      Blockly.Flyout.startBlock_ = block;
      Blockly.Flyout.startFlyout_ = flyout;
      Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document, "mouseup", this, Blockly.terminateDrag_);
      Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEvent_(document, "mousemove", this, flyout.onMouseMove_)
    }
    e.stopPropagation()
  }
};
Blockly.Flyout.prototype.onMouseMove_ = function(e) {
  if(e.type == "mousemove" && (e.clientX <= 1 && (e.clientY == 0 && e.button == 0))) {
    e.stopPropagation();
    return
  }
  Blockly.removeAllRanges();
  var dx = e.clientX - Blockly.Flyout.startDragMouseX_;
  var dy = e.clientY - Blockly.Flyout.startDragMouseY_;
  var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  if(dr > Blockly.DRAG_RADIUS) {
    e.startDragMouseX_ = Blockly.Flyout.startDragMouseX_;
    e.startDragMouseY_ = Blockly.Flyout.startDragMouseY_;
    Blockly.Flyout.startFlyout_.createBlockFunc_(Blockly.Flyout.startBlock_)(e)
  }
};
Blockly.Flyout.prototype.createBlockFunc_ = function(originBlock) {
  var flyout = this;
  return function(e) {
    if(!flyout.enabled_) {
      return
    }
    if(Blockly.isRightButton(e)) {
      return
    }
    if(originBlock.disabled) {
      return
    }
    var xml = Blockly.Xml.blockToDom_(originBlock);
    var block = Blockly.Xml.domToBlock_(flyout.targetWorkspace_, xml);
    var svgRootOld = originBlock.getSvgRoot();
    if(!svgRootOld) {
      throw"originBlock is not rendered.";
    }
    var xyOld = Blockly.getSvgXY_(svgRootOld);
    var svgRootNew = block.getSvgRoot();
    if(!svgRootNew) {
      throw"block is not rendered.";
    }
    var xyNew = Blockly.getSvgXY_(svgRootNew);
    block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
    if(flyout.autoClose) {
      flyout.hide()
    }else {
      flyout.filterForCapacity_();
      if(Blockly.hasConcreteBlocks) {
        originBlock.setVisible(false);
        originBlock.setDisabled(true)
      }
    }
    block.onMouseDown_(e)
  }
};
Blockly.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetWorkspace_.remainingCapacity();
  var blocks = this.workspace_.getTopBlocks(false);
  for(var i = 0, block;block = blocks[i];i++) {
    var allBlocks = block.getDescendants();
    var disabled = allBlocks.length > remainingCapacity;
    if(Blockly.hasConcreteBlocks && !disabled) {
    }else {
      block.setDisabled(disabled)
    }
  }
};
Blockly.Flyout.terminateDrag_ = function() {
  if(Blockly.Flyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
    Blockly.Flyout.onMouseUpWrapper_ = null
  }
  if(Blockly.Flyout.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveWrapper_);
    Blockly.Flyout.onMouseMoveWrapper_ = null
  }
  Blockly.Flyout.startDragMouseX_ = 0;
  Blockly.Flyout.startDragMouseY_ = 0;
  Blockly.Flyout.startBlock_ = null;
  Blockly.Flyout.startFlyout_ = null
};
Blockly.Flyout.prototype.onBlockDropped = function(originBlock) {
  var self = this;
  if(Blockly.hasConcreteBlocks) {
    originBlock.getChildren().forEach(function(child) {
      self.onBlockDropped(child)
    });
    var blocks = this.workspace_.getAllBlocks();
    for(var i = 0, block;block = blocks[i];i++) {
      if(block.type === originBlock.type) {
        block.setVisible(true);
        block.setDisabled(false);
        break
      }
    }
  }
  originBlock.dispose(false, true)
};
Blockly.Flyout.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled
};
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if(typeof col.getCount == "function") {
    return col.getCount()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return col.length
  }
  return goog.object.getCount(col)
};
goog.structs.getValues = function(col) {
  if(typeof col.getValues == "function") {
    return col.getValues()
  }
  if(goog.isString(col)) {
    return col.split("")
  }
  if(goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(col[i])
    }
    return rv
  }
  return goog.object.getValues(col)
};
goog.structs.getKeys = function(col) {
  if(typeof col.getKeys == "function") {
    return col.getKeys()
  }
  if(typeof col.getValues == "function") {
    return undefined
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(i)
    }
    return rv
  }
  return goog.object.getKeys(col)
};
goog.structs.contains = function(col, val) {
  if(typeof col.contains == "function") {
    return col.contains(val)
  }
  if(typeof col.containsValue == "function") {
    return col.containsValue(val)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains((col), val)
  }
  return goog.object.containsValue(col, val)
};
goog.structs.isEmpty = function(col) {
  if(typeof col.isEmpty == "function") {
    return col.isEmpty()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty((col))
  }
  return goog.object.isEmpty(col)
};
goog.structs.clear = function(col) {
  if(typeof col.clear == "function") {
    col.clear()
  }else {
    if(goog.isArrayLike(col)) {
      goog.array.clear((col))
    }else {
      goog.object.clear(col)
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if(typeof col.forEach == "function") {
    col.forEach(f, opt_obj)
  }else {
    if(goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach((col), f, opt_obj)
    }else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for(var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col)
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if(typeof col.filter == "function") {
    return col.filter(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter((col), f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i]
      }
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i])
      }
    }
  }
  return rv
};
goog.structs.map = function(col, f, opt_obj) {
  if(typeof col.map == "function") {
    return col.map(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map((col), f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col)
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col)
    }
  }
  return rv
};
goog.structs.some = function(col, f, opt_obj) {
  if(typeof col.some == "function") {
    return col.some(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some((col), f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true
    }
  }
  return false
};
goog.structs.every = function(col, f, opt_obj) {
  if(typeof col.every == "function") {
    return col.every(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every((col), f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false
    }
  }
  return true
};
goog.provide("goog.structs.Trie");
goog.require("goog.object");
goog.require("goog.structs");
goog.structs.Trie = function(opt_trie) {
  this.value_ = undefined;
  this.childNodes_ = {};
  if(opt_trie) {
    this.setAll(opt_trie)
  }
};
goog.structs.Trie.prototype.set = function(key, value) {
  this.setOrAdd_(key, value, false)
};
goog.structs.Trie.prototype.add = function(key, value) {
  this.setOrAdd_(key, value, true)
};
goog.structs.Trie.prototype.setOrAdd_ = function(key, value, opt_add) {
  var node = this;
  for(var characterPosition = 0;characterPosition < key.length;characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if(!node.childNodes_[currentCharacter]) {
      node.childNodes_[currentCharacter] = new goog.structs.Trie
    }
    node = node.childNodes_[currentCharacter]
  }
  if(opt_add && node.value_ !== undefined) {
    throw Error('The collection already contains the key "' + key + '"');
  }else {
    node.value_ = value
  }
};
goog.structs.Trie.prototype.setAll = function(trie) {
  var keys = goog.structs.getKeys(trie);
  var values = goog.structs.getValues(trie);
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Trie.prototype.getChildNode_ = function(path) {
  var node = this;
  for(var characterPosition = 0;characterPosition < path.length;characterPosition++) {
    var currentCharacter = path.charAt(characterPosition);
    node = node.childNodes_[currentCharacter];
    if(!node) {
      return undefined
    }
  }
  return node
};
goog.structs.Trie.prototype.get = function(key) {
  var node = this.getChildNode_(key);
  return node ? node.value_ : undefined
};
goog.structs.Trie.prototype.getKeyAndPrefixes = function(key, opt_keyStartIndex) {
  var node = this;
  var matches = {};
  var characterPosition = opt_keyStartIndex || 0;
  if(node.value_ !== undefined) {
    matches[characterPosition] = node.value_
  }
  for(;characterPosition < key.length;characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if(!(currentCharacter in node.childNodes_)) {
      break
    }
    node = node.childNodes_[currentCharacter];
    if(node.value_ !== undefined) {
      matches[characterPosition] = node.value_
    }
  }
  return matches
};
goog.structs.Trie.prototype.getValues = function() {
  var allValues = [];
  this.getValuesInternal_(allValues);
  return allValues
};
goog.structs.Trie.prototype.getValuesInternal_ = function(allValues) {
  if(this.value_ !== undefined) {
    allValues.push(this.value_)
  }
  for(var childNode in this.childNodes_) {
    this.childNodes_[childNode].getValuesInternal_(allValues)
  }
};
goog.structs.Trie.prototype.getKeys = function(opt_prefix) {
  var allKeys = [];
  if(opt_prefix) {
    var node = this;
    for(var characterPosition = 0;characterPosition < opt_prefix.length;characterPosition++) {
      var currentCharacter = opt_prefix.charAt(characterPosition);
      if(!node.childNodes_[currentCharacter]) {
        return[]
      }
      node = node.childNodes_[currentCharacter]
    }
    node.getKeysInternal_(opt_prefix, allKeys)
  }else {
    this.getKeysInternal_("", allKeys)
  }
  return allKeys
};
goog.structs.Trie.prototype.getKeysInternal_ = function(keySoFar, allKeys) {
  if(this.value_ !== undefined) {
    allKeys.push(keySoFar)
  }
  for(var childNode in this.childNodes_) {
    this.childNodes_[childNode].getKeysInternal_(keySoFar + childNode, allKeys)
  }
};
goog.structs.Trie.prototype.containsKey = function(key) {
  return this.get(key) !== undefined
};
goog.structs.Trie.prototype.containsPrefix = function(prefix) {
  if(prefix.length == 0) {
    return!this.isEmpty()
  }
  return!!this.getChildNode_(prefix)
};
goog.structs.Trie.prototype.containsValue = function(value) {
  if(this.value_ === value) {
    return true
  }
  for(var childNode in this.childNodes_) {
    if(this.childNodes_[childNode].containsValue(value)) {
      return true
    }
  }
  return false
};
goog.structs.Trie.prototype.clear = function() {
  this.childNodes_ = {};
  this.value_ = undefined
};
goog.structs.Trie.prototype.remove = function(key) {
  var node = this;
  var parents = [];
  for(var characterPosition = 0;characterPosition < key.length;characterPosition++) {
    var currentCharacter = key.charAt(characterPosition);
    if(!node.childNodes_[currentCharacter]) {
      throw Error('The collection does not have the key "' + key + '"');
    }
    parents.push([node, currentCharacter]);
    node = node.childNodes_[currentCharacter]
  }
  var oldValue = node.value_;
  delete node.value_;
  while(parents.length > 0) {
    var currentParentAndCharacter = parents.pop();
    var currentParent = currentParentAndCharacter[0];
    var currentCharacter = currentParentAndCharacter[1];
    if(currentParent.childNodes_[currentCharacter].isEmpty()) {
      delete currentParent.childNodes_[currentCharacter]
    }else {
      break
    }
  }
  return oldValue
};
goog.structs.Trie.prototype.clone = function() {
  return new goog.structs.Trie(this)
};
goog.structs.Trie.prototype.getCount = function() {
  return goog.structs.getCount(this.getValues())
};
goog.structs.Trie.prototype.isEmpty = function() {
  return this.value_ === undefined && goog.object.isEmpty(this.childNodes_)
};
goog.provide("goog.ui.tree.TypeAhead");
goog.provide("goog.ui.tree.TypeAhead.Offset");
goog.require("goog.array");
goog.require("goog.events.KeyCodes");
goog.require("goog.string");
goog.require("goog.structs.Trie");
goog.ui.tree.TypeAhead = function() {
  this.nodeMap_ = new goog.structs.Trie
};
goog.ui.tree.TypeAhead.prototype.nodeMap_;
goog.ui.tree.TypeAhead.prototype.buffer_ = "";
goog.ui.tree.TypeAhead.prototype.matchingLabels_ = null;
goog.ui.tree.TypeAhead.prototype.matchingNodes_ = null;
goog.ui.tree.TypeAhead.prototype.matchingLabelIndex_ = 0;
goog.ui.tree.TypeAhead.prototype.matchingNodeIndex_ = 0;
goog.ui.tree.TypeAhead.Offset = {DOWN:1, UP:-1};
goog.ui.tree.TypeAhead.prototype.handleNavigation = function(e) {
  var handled = false;
  switch(e.keyCode) {
    case goog.events.KeyCodes.DOWN:
    ;
    case goog.events.KeyCodes.UP:
      if(e.ctrlKey) {
        this.jumpTo_(e.keyCode == goog.events.KeyCodes.DOWN ? goog.ui.tree.TypeAhead.Offset.DOWN : goog.ui.tree.TypeAhead.Offset.UP);
        handled = true
      }
      break;
    case goog.events.KeyCodes.BACKSPACE:
      var length = this.buffer_.length - 1;
      handled = true;
      if(length > 0) {
        this.buffer_ = this.buffer_.substring(0, length);
        this.jumpToLabel_(this.buffer_)
      }else {
        if(length == 0) {
          this.buffer_ = ""
        }else {
          handled = false
        }
      }
      break;
    case goog.events.KeyCodes.ESC:
      this.buffer_ = "";
      handled = true;
      break
  }
  return handled
};
goog.ui.tree.TypeAhead.prototype.handleTypeAheadChar = function(e) {
  var handled = false;
  if(!e.ctrlKey && !e.altKey) {
    var ch = String.fromCharCode(e.charCode || e.keyCode).toLowerCase();
    if(goog.string.isUnicodeChar(ch) && (ch != " " || this.buffer_)) {
      this.buffer_ += ch;
      handled = this.jumpToLabel_(this.buffer_)
    }
  }
  return handled
};
goog.ui.tree.TypeAhead.prototype.setNodeInMap = function(node) {
  var labelText = node.getText();
  if(labelText && !goog.string.isEmptySafe(labelText)) {
    labelText = labelText.toLowerCase();
    var previousValue = this.nodeMap_.get(labelText);
    if(previousValue) {
      previousValue.push(node)
    }else {
      var nodeList = [node];
      this.nodeMap_.set(labelText, nodeList)
    }
  }
};
goog.ui.tree.TypeAhead.prototype.removeNodeFromMap = function(node) {
  var labelText = node.getText();
  if(labelText && !goog.string.isEmptySafe(labelText)) {
    labelText = labelText.toLowerCase();
    var nodeList = (this.nodeMap_.get(labelText));
    if(nodeList) {
      goog.array.remove(nodeList, node);
      if(!!nodeList.length) {
        this.nodeMap_.remove(labelText)
      }
    }
  }
};
goog.ui.tree.TypeAhead.prototype.jumpToLabel_ = function(typeAhead) {
  var handled = false;
  var labels = this.nodeMap_.getKeys(typeAhead);
  if(labels && labels.length) {
    this.matchingNodeIndex_ = 0;
    this.matchingLabelIndex_ = 0;
    var nodes = (this.nodeMap_.get(labels[0]));
    if(handled = this.selectMatchingNode_(nodes)) {
      this.matchingLabels_ = labels
    }
  }
  return handled
};
goog.ui.tree.TypeAhead.prototype.jumpTo_ = function(offset) {
  var handled = false;
  var labels = this.matchingLabels_;
  if(labels) {
    var nodes = null;
    var nodeIndexOutOfRange = false;
    if(this.matchingNodes_) {
      var newNodeIndex = this.matchingNodeIndex_ + offset;
      if(newNodeIndex >= 0 && newNodeIndex < this.matchingNodes_.length) {
        this.matchingNodeIndex_ = newNodeIndex;
        nodes = this.matchingNodes_
      }else {
        nodeIndexOutOfRange = true
      }
    }
    if(!nodes) {
      var newLabelIndex = this.matchingLabelIndex_ + offset;
      if(newLabelIndex >= 0 && newLabelIndex < labels.length) {
        this.matchingLabelIndex_ = newLabelIndex
      }
      if(labels.length > this.matchingLabelIndex_) {
        nodes = (this.nodeMap_.get(labels[this.matchingLabelIndex_]))
      }
      if(nodes && (nodes.length && nodeIndexOutOfRange)) {
        this.matchingNodeIndex_ = offset == goog.ui.tree.TypeAhead.Offset.UP ? nodes.length - 1 : 0
      }
    }
    if(handled = this.selectMatchingNode_(nodes)) {
      this.matchingLabels_ = labels
    }
  }
  return handled
};
goog.ui.tree.TypeAhead.prototype.selectMatchingNode_ = function(nodes) {
  var node;
  if(nodes) {
    if(this.matchingNodeIndex_ < nodes.length) {
      node = nodes[this.matchingNodeIndex_];
      this.matchingNodes_ = nodes
    }
    if(node) {
      node.reveal();
      node.select()
    }
  }
  return!!node
};
goog.ui.tree.TypeAhead.prototype.clear = function() {
  this.buffer_ = ""
};
goog.provide("goog.structs.Collection");
goog.structs.Collection = function() {
};
goog.structs.Collection.prototype.add;
goog.structs.Collection.prototype.remove;
goog.structs.Collection.prototype.contains;
goog.structs.Collection.prototype.getCount;
goog.provide("goog.iter");
goog.provide("goog.iter.Iterable");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.functions");
goog.require("goog.math");
goog.iter.Iterable;
if("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"]
}else {
  goog.iter.StopIteration = Error("StopIteration")
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this
};
goog.iter.toIterator = function(iterable) {
  if(iterable instanceof goog.iter.Iterator) {
    return iterable
  }
  if(typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false)
  }
  if(goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while(true) {
        if(i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if(!(i in iterable)) {
          i++;
          continue
        }
        return iterable[i++]
      }
    };
    return newIter
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if(goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach((iterable), f, opt_obj)
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while(true) {
        f.call(opt_obj, iterable.next(), undefined, iterable)
      }
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterator.next();
      if(f.call(opt_obj, val, undefined, iterator)) {
        return val
      }
    }
  };
  return newIter
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if(arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop
  }
  if(step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv
  };
  return newIter
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator)
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    var val = iterator.next();
    return f.call(opt_obj, val, undefined, iterator)
  };
  return newIter
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val)
  });
  return rval
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true
};
goog.iter.chain = function(var_args) {
  var iterator = goog.iter.toIterator(arguments);
  var iter = new goog.iter.Iterator;
  var current = null;
  iter.next = function() {
    while(true) {
      if(current == null) {
        var it = iterator.next();
        current = goog.iter.toIterator(it)
      }
      try {
        return current.next()
      }catch(ex) {
        if(ex !== goog.iter.StopIteration) {
          throw ex;
        }
        current = null
      }
    }
  };
  return iter
};
goog.iter.chainFromIterable = function(iterable) {
  return goog.iter.chain.apply(undefined, iterable)
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while(true) {
      var val = iterator.next();
      if(dropping && f.call(opt_obj, val, undefined, iterator)) {
        continue
      }else {
        dropping = false
      }
      return val
    }
  };
  return newIter
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while(true) {
      if(taking) {
        var val = iterator.next();
        if(f.call(opt_obj, val, undefined, iterator)) {
          return val
        }else {
          taking = false
        }
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter
};
goog.iter.toArray = function(iterable) {
  if(goog.isArrayLike(iterable)) {
    return goog.array.toArray((iterable))
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val)
  });
  return array
};
goog.iter.equals = function(iterable1, iterable2) {
  var fillValue = {};
  var pairs = goog.iter.zipLongest(fillValue, iterable1, iterable2);
  return goog.iter.every(pairs, function(pair) {
    return pair[0] == pair[1]
  })
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next()
  }catch(e) {
    if(e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length
  });
  if(someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if(indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex]
      });
      for(var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if(indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break
        }
        if(i == 0) {
          indicies = null;
          break
        }
        indicies[i] = 0
      }
      return retVal
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator;
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if(!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement
      }catch(e) {
        if(e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement
  };
  return iter
};
goog.iter.count = function(opt_start, opt_step) {
  var counter = opt_start || 0;
  var step = goog.isDef(opt_step) ? opt_step : 1;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    var returnValue = counter;
    counter += step;
    return returnValue
  };
  return iter
};
goog.iter.repeat = function(value) {
  var iter = new goog.iter.Iterator;
  iter.next = goog.functions.constant(value);
  return iter
};
goog.iter.accumulate = function(iterable) {
  var iterator = goog.iter.toIterator(iterable);
  var total = 0;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    total += iterator.next();
    return total
  };
  return iter
};
goog.iter.zip = function(var_args) {
  var args = arguments;
  var iter = new goog.iter.Iterator;
  if(args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var arr = goog.array.map(iterators, function(it) {
        return it.next()
      });
      return arr
    }
  }
  return iter
};
goog.iter.zipLongest = function(fillValue, var_args) {
  var args = goog.array.slice(arguments, 1);
  var iter = new goog.iter.Iterator;
  if(args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var iteratorsHaveValues = false;
      var arr = goog.array.map(iterators, function(it) {
        var returnValue;
        try {
          returnValue = it.next();
          iteratorsHaveValues = true
        }catch(ex) {
          if(ex !== goog.iter.StopIteration) {
            throw ex;
          }
          returnValue = fillValue
        }
        return returnValue
      });
      if(!iteratorsHaveValues) {
        throw goog.iter.StopIteration;
      }
      return arr
    }
  }
  return iter
};
goog.iter.compress = function(iterable, selectors) {
  var selectorIterator = goog.iter.toIterator(selectors);
  return goog.iter.filter(iterable, function() {
    return!!selectorIterator.next()
  })
};
goog.iter.GroupByIterator_ = function(iterable, opt_keyFunc) {
  this.iterator = goog.iter.toIterator(iterable);
  this.keyFunc = opt_keyFunc || goog.functions.identity;
  this.targetKey;
  this.currentKey;
  this.currentValue
};
goog.inherits(goog.iter.GroupByIterator_, goog.iter.Iterator);
goog.iter.GroupByIterator_.prototype.next = function() {
  while(this.currentKey == this.targetKey) {
    this.currentValue = this.iterator.next();
    this.currentKey = this.keyFunc(this.currentValue)
  }
  this.targetKey = this.currentKey;
  return[this.currentKey, this.groupItems_(this.targetKey)]
};
goog.iter.GroupByIterator_.prototype.groupItems_ = function(targetKey) {
  var arr = [];
  while(this.currentKey == targetKey) {
    arr.push(this.currentValue);
    try {
      this.currentValue = this.iterator.next()
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
      break
    }
    this.currentKey = this.keyFunc(this.currentValue)
  }
  return arr
};
goog.iter.groupBy = function(iterable, opt_keyFunc) {
  return new goog.iter.GroupByIterator_(iterable, opt_keyFunc)
};
goog.iter.tee = function(iterable, opt_num) {
  var iterator = goog.iter.toIterator(iterable);
  var num = goog.isNumber(opt_num) ? opt_num : 2;
  var buffers = goog.array.map(goog.array.range(num), function() {
    return[]
  });
  var addNextIteratorValueToBuffers = function() {
    var val = iterator.next();
    goog.array.forEach(buffers, function(buffer) {
      buffer.push(val)
    })
  };
  var createIterator = function(buffer) {
    var iter = new goog.iter.Iterator;
    iter.next = function() {
      if(goog.array.isEmpty(buffer)) {
        addNextIteratorValueToBuffers()
      }
      goog.asserts.assert(!goog.array.isEmpty(buffer));
      return buffer.shift()
    };
    return iter
  };
  return goog.array.map(buffers, createIterator)
};
goog.iter.enumerate = function(iterable, opt_start) {
  return goog.iter.zip(goog.iter.count(opt_start), iterable)
};
goog.iter.limit = function(iterable, limitSize) {
  goog.asserts.assert(goog.math.isInt(limitSize) && limitSize >= 0);
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  var remaining = limitSize;
  iter.next = function() {
    if(remaining-- > 0) {
      return iterator.next()
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.iter.consume = function(iterable, count) {
  goog.asserts.assert(goog.math.isInt(count) && count >= 0);
  var iterator = goog.iter.toIterator(iterable);
  while(count-- > 0) {
    goog.iter.nextOrValue(iterator, null)
  }
  return iterator
};
goog.iter.slice = function(iterable, start, opt_end) {
  goog.asserts.assert(goog.math.isInt(start) && start >= 0);
  var iterator = goog.iter.consume(iterable, start);
  if(goog.isNumber(opt_end)) {
    goog.asserts.assert(goog.math.isInt((opt_end)) && opt_end >= start);
    iterator = goog.iter.limit(iterator, opt_end - start)
  }
  return iterator
};
goog.iter.hasDuplicates_ = function(arr) {
  var deduped = [];
  goog.array.removeDuplicates(arr, deduped);
  return arr.length != deduped.length
};
goog.iter.permutations = function(iterable, opt_length) {
  var elements = goog.iter.toArray(iterable);
  var length = goog.isNumber(opt_length) ? opt_length : elements.length;
  var sets = goog.array.repeat(elements, length);
  var product = goog.iter.product.apply(undefined, sets);
  return goog.iter.filter(product, function(arr) {
    return!goog.iter.hasDuplicates_(arr)
  })
};
goog.iter.combinations = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.iter.range(elements.length);
  var indexIterator = goog.iter.permutations(indexes, length);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr)
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index]
  }
  iter.next = function() {
    return goog.array.map((sortedIndexIterator.next()), getIndexFromElements)
  };
  return iter
};
goog.iter.combinationsWithReplacement = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.array.range(elements.length);
  var sets = goog.array.repeat(indexes, length);
  var indexIterator = goog.iter.product.apply(undefined, sets);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr)
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index]
  }
  iter.next = function() {
    return goog.array.map((sortedIndexIterator.next()), getIndexFromElements)
  };
  return iter
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  this.count_ = 0;
  this.version_ = 0;
  var argLength = arguments.length;
  if(argLength > 1) {
    if(argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1])
    }
  }else {
    if(opt_map) {
      this.addAll((opt_map))
    }
  }
};
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key])
  }
  return rv
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return(this.keys_.concat())
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key)
};
goog.structs.Map.prototype.containsValue = function(val) {
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if(goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true
    }
  }
  return false
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if(this === otherMap) {
    return true
  }
  if(this.count_ != otherMap.getCount()) {
    return false
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for(var key, i = 0;key = this.keys_[i];i++) {
    if(!equalityFn(this.get(key), otherMap.get(key))) {
      return false
    }
  }
  return true
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0
};
goog.structs.Map.prototype.remove = function(key) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if(this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_()
    }
    return true
  }
  return false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if(this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
  if(this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key]
  }
  return opt_val
};
goog.structs.Map.prototype.set = function(key, value) {
  if(!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++
  }
  this.map_[key] = value
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if(map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues()
  }else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map)
  }
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key)
  }
  return transposed
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key]
  }
  return obj
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      if(version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key]
    }
  };
  return newIter
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
};
goog.provide("goog.structs.Set");
goog.require("goog.structs");
goog.require("goog.structs.Collection");
goog.require("goog.structs.Map");
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if(opt_values) {
    this.addAll(opt_values)
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if(type == "object" && val || type == "function") {
    return"o" + goog.getUid((val))
  }else {
    return type.substr(0, 1) + val
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount()
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element)
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.add(values[i])
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.remove(values[i])
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear()
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty()
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this)
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set;
  var values = goog.structs.getValues(col);
  for(var i = 0;i < values.length;i++) {
    var value = values[i];
    if(this.contains(value)) {
      result.add(value)
    }
  }
  return result
};
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues()
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this)
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col)
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if(this.getCount() > colCount) {
    return false
  }
  if(!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col)
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value)
  })
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false)
};
goog.provide("goog.debug");
goog.require("goog.array");
goog.require("goog.string");
goog.require("goog.structs.Set");
goog.require("goog.userAgent");
goog.define("goog.debug.LOGGING_ENABLED", goog.DEBUG);
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher("535.3")) {
    retVal = !retVal
  }
  target.onerror = function(message, url, line, opt_col, opt_error) {
    if(oldErrorHandler) {
      oldErrorHandler(message, url, line, opt_col, opt_error)
    }
    logFunc({message:message, fileName:url, line:line, col:opt_col, error:opt_error});
    return retVal
  }
};
goog.debug.expose = function(obj, opt_showFn) {
  if(typeof obj == "undefined") {
    return"undefined"
  }
  if(obj == null) {
    return"NULL"
  }
  var str = [];
  for(var x in obj) {
    if(!opt_showFn && goog.isFunction(obj[x])) {
      continue
    }
    var s = x + " = ";
    try {
      s += obj[x]
    }catch(e) {
      s += "*** " + e + " ***"
    }
    str.push(s)
  }
  return str.join("\n")
};
goog.debug.deepExpose = function(obj, opt_showFn) {
  var str = [];
  var helper = function(obj, space, parentSeen) {
    var nestspace = space + "  ";
    var seen = new goog.structs.Set(parentSeen);
    var indentMultiline = function(str) {
      return str.replace(/\n/g, "\n" + space)
    };
    try {
      if(!goog.isDef(obj)) {
        str.push("undefined")
      }else {
        if(goog.isNull(obj)) {
          str.push("NULL")
        }else {
          if(goog.isString(obj)) {
            str.push('"' + indentMultiline(obj) + '"')
          }else {
            if(goog.isFunction(obj)) {
              str.push(indentMultiline(String(obj)))
            }else {
              if(goog.isObject(obj)) {
                if(seen.contains(obj)) {
                  str.push("*** reference loop detected ***")
                }else {
                  seen.add(obj);
                  str.push("{");
                  for(var x in obj) {
                    if(!opt_showFn && goog.isFunction(obj[x])) {
                      continue
                    }
                    str.push("\n");
                    str.push(nestspace);
                    str.push(x + " = ");
                    helper(obj[x], nestspace, seen)
                  }
                  str.push("\n" + space + "}")
                }
              }else {
                str.push(obj)
              }
            }
          }
        }
      }
    }catch(e) {
      str.push("*** " + e + " ***")
    }
  };
  helper(obj, "", new goog.structs.Set);
  return str.join("")
};
goog.debug.exposeArray = function(arr) {
  var str = [];
  for(var i = 0;i < arr.length;i++) {
    if(goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]))
    }else {
      str.push(arr[i])
    }
  }
  return"[ " + str.join(", ") + " ]"
};
goog.debug.exposeException = function(err, opt_fn) {
  try {
    var e = goog.debug.normalizeErrorObject(err);
    var error = "Message: " + goog.string.htmlEscape(e.message) + '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' + e.fileName + "</a>\nLine: " + e.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(e.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(opt_fn) + "-> ");
    return error
  }catch(e2) {
    return"Exception trying to expose exception! You win, we lose. " + e2
  }
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  if(goog.isString(err)) {
    return{"message":err, "name":"Unknown error", "lineNumber":"Not available", "fileName":href, "stack":"Not available"}
  }
  var lineNumber, fileName;
  var threwError = false;
  try {
    lineNumber = err.lineNumber || (err.line || "Not available")
  }catch(e) {
    lineNumber = "Not available";
    threwError = true
  }
  try {
    fileName = err.fileName || (err.filename || (err.sourceURL || (goog.global["$googDebugFname"] || href)))
  }catch(e) {
    fileName = "Not available";
    threwError = true
  }
  if(threwError || (!err.lineNumber || (!err.fileName || (!err.stack || (!err.message || !err.name))))) {
    return{"message":err.message || "Not available", "name":err.name || "UnknownError", "lineNumber":lineNumber, "fileName":fileName, "stack":err.stack || "Not available"}
  }
  return err
};
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == "string" ? Error(err) : err;
  if(!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller)
  }
  if(opt_message) {
    var x = 0;
    while(error["message" + x]) {
      ++x
    }
    error["message" + x] = String(opt_message)
  }
  return error
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;
  while(fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller
    }catch(e) {
      sb.push("[exception trying to get caller]\n");
      break
    }
    depth++;
    if(depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break
    }
  }
  if(opt_depth && depth >= opt_depth) {
    sb.push("[...reached max depth limit...]")
  }else {
    sb.push("[end]")
  }
  return sb.join("")
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, [])
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if(goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]")
  }else {
    if(fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      var args = fn.arguments;
      for(var i = 0;args && i < args.length;i++) {
        if(i > 0) {
          sb.push(", ")
        }
        var argDesc;
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = goog.debug.getFunctionName(arg);
            argDesc = argDesc ? argDesc : "[fn]";
            break;
          case "undefined":
          ;
          default:
            argDesc = typeof arg;
            break
        }
        if(argDesc.length > 40) {
          argDesc = argDesc.substr(0, 40) + "..."
        }
        sb.push(argDesc)
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited))
      }catch(e) {
        sb.push("[exception trying to get caller]\n")
      }
    }else {
      if(fn) {
        sb.push("[...long stack...]")
      }else {
        sb.push("[end]")
      }
    }
  }
  return sb.join("")
};
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver
};
goog.debug.getFunctionName = function(fn) {
  if(goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn]
  }
  if(goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if(name) {
      goog.debug.fnNameCache_[fn] = name;
      return name
    }
  }
  var functionSource = String(fn);
  if(!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if(matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method
    }else {
      goog.debug.fnNameCache_[functionSource] = "[Anonymous]"
    }
  }
  return goog.debug.fnNameCache_[functionSource]
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]")
};
goog.debug.fnNameCache_ = {};
goog.debug.fnNameResolver_;
goog.provide("goog.debug.LogRecord");
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber)
};
goog.debug.LogRecord.prototype.time_;
goog.debug.LogRecord.prototype.level_;
goog.debug.LogRecord.prototype.msg_;
goog.debug.LogRecord.prototype.loggerName_;
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.debug.LogRecord.prototype.exceptionText_ = null;
goog.define("goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS", true);
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  if(goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == "number" ? opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++
  }
  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_
};
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception
};
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_
};
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text
};
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_
};
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_
};
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_
};
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_
};
goog.provide("goog.debug.LogBuffer");
goog.require("goog.asserts");
goog.require("goog.debug.LogRecord");
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining " + "goog.debug.LogBuffer.CAPACITY.");
  this.clear()
};
goog.debug.LogBuffer.getInstance = function() {
  if(!goog.debug.LogBuffer.instance_) {
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer
  }
  return goog.debug.LogBuffer.instance_
};
goog.define("goog.debug.LogBuffer.CAPACITY", 0);
goog.debug.LogBuffer.prototype.buffer_;
goog.debug.LogBuffer.prototype.curIndex_;
goog.debug.LogBuffer.prototype.isFull_;
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if(this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] = new goog.debug.LogRecord(level, msg, loggerName)
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false
};
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  if(!buffer[0]) {
    return
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func((buffer[i]))
  }while(i != curIndex)
};
goog.provide("goog.debug.LogManager");
goog.provide("goog.debug.Loggable");
goog.provide("goog.debug.Logger");
goog.provide("goog.debug.Logger.Level");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.debug.LogBuffer");
goog.require("goog.debug.LogRecord");
goog.debug.Loggable;
goog.debug.Logger = function(name) {
  this.name_ = name;
  this.parent_ = null;
  this.level_ = null;
  this.children_ = null;
  this.handlers_ = null
};
goog.define("goog.debug.Logger.ENABLE_HIERARCHY", true);
if(!goog.debug.Logger.ENABLE_HIERARCHY) {
  goog.debug.Logger.rootHandlers_ = [];
  goog.debug.Logger.rootLevel_
}
goog.debug.Logger.Level = function(name, value) {
  this.name = name;
  this.value = value
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for(var i = 0, level;level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  if(value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value]
  }
  for(var i = 0;i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if(level.value <= value) {
      return level
    }
  }
  return null
};
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name)
};
goog.debug.Logger.logToProfilers = function(msg) {
  if(goog.global["console"]) {
    if(goog.global["console"]["timeStamp"]) {
      goog.global["console"]["timeStamp"](msg)
    }else {
      if(goog.global["console"]["markTimeline"]) {
        goog.global["console"]["markTimeline"](msg)
      }
    }
  }
  if(goog.global["msWriteProfilerMark"]) {
    goog.global["msWriteProfilerMark"](msg)
  }
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_
};
goog.debug.Logger.prototype.addHandler = function(handler) {
  if(goog.debug.LOGGING_ENABLED) {
    if(goog.debug.Logger.ENABLE_HIERARCHY) {
      if(!this.handlers_) {
        this.handlers_ = []
      }
      this.handlers_.push(handler)
    }else {
      goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootHandlers_.push(handler)
    }
  }
};
goog.debug.Logger.prototype.removeHandler = function(handler) {
  if(goog.debug.LOGGING_ENABLED) {
    var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
    return!!handlers && goog.array.remove(handlers, handler)
  }else {
    return false
  }
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_
};
goog.debug.Logger.prototype.getChildren = function() {
  if(!this.children_) {
    this.children_ = {}
  }
  return this.children_
};
goog.debug.Logger.prototype.setLevel = function(level) {
  if(goog.debug.LOGGING_ENABLED) {
    if(goog.debug.Logger.ENABLE_HIERARCHY) {
      this.level_ = level
    }else {
      goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootLevel_ = level
    }
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return goog.debug.LOGGING_ENABLED ? this.level_ : goog.debug.Logger.Level.OFF
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if(!goog.debug.LOGGING_ENABLED) {
    return goog.debug.Logger.Level.OFF
  }
  if(!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_
  }
  if(this.level_) {
    return this.level_
  }
  if(this.parent_) {
    return this.parent_.getEffectiveLevel()
  }
  goog.asserts.fail("Root logger has no level set.");
  return null
};
goog.debug.Logger.prototype.isLoggable = function(level) {
  return goog.debug.LOGGING_ENABLED && level.value >= this.getEffectiveLevel().value
};
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED && this.isLoggable(level)) {
    if(goog.isFunction(msg)) {
      msg = msg()
    }
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception))
  }
};
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if(goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_)
  }else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_)
  }
  if(opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(goog.debug.exposeException(opt_exception, arguments.callee.caller))
  }
  return logRecord
};
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.INFO, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINE, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINER, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if(goog.debug.LOGGING_ENABLED && this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord)
  }
};
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers("log:" + logRecord.getMessage());
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while(target) {
      target.callPublish_(logRecord);
      target = target.getParent()
    }
  }else {
    for(var i = 0, handler;handler = goog.debug.Logger.rootHandlers_[i++];) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if(this.handlers_) {
    for(var i = 0, handler;handler = this.handlers_[i];i++) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent
};
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if(!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger("");
    goog.debug.LogManager.loggers_[""] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG)
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return(goog.debug.LogManager.rootLogger_)
};
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name)
};
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe("Error: " + info.message + " (" + info.fileName + " @ Line: " + info.line + ")")
  }
};
goog.debug.LogManager.createLogger_ = function(name) {
  var logger = new goog.debug.Logger(name);
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf(".");
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger)
  }
  goog.debug.LogManager.loggers_[name] = logger;
  return logger
};
goog.provide("goog.log");
goog.provide("goog.log.Level");
goog.provide("goog.log.LogRecord");
goog.provide("goog.log.Logger");
goog.require("goog.debug");
goog.require("goog.debug.LogManager");
goog.require("goog.debug.LogRecord");
goog.require("goog.debug.Logger");
goog.define("goog.log.ENABLED", goog.debug.LOGGING_ENABLED);
goog.log.Logger = goog.debug.Logger;
goog.log.Level = goog.debug.Logger.Level;
goog.log.LogRecord = goog.debug.LogRecord;
goog.log.getLogger = function(name, opt_level) {
  if(goog.log.ENABLED) {
    var logger = goog.debug.LogManager.getLogger(name);
    if(opt_level && logger) {
      logger.setLevel(opt_level)
    }
    return logger
  }else {
    return null
  }
};
goog.log.addHandler = function(logger, handler) {
  if(goog.log.ENABLED && logger) {
    logger.addHandler(handler)
  }
};
goog.log.removeHandler = function(logger, handler) {
  if(goog.log.ENABLED && logger) {
    return logger.removeHandler(handler)
  }else {
    return false
  }
};
goog.log.log = function(logger, level, msg, opt_exception) {
  if(goog.log.ENABLED && logger) {
    logger.log(level, msg, opt_exception)
  }
};
goog.log.error = function(logger, msg, opt_exception) {
  if(goog.log.ENABLED && logger) {
    logger.severe(msg, opt_exception)
  }
};
goog.log.warning = function(logger, msg, opt_exception) {
  if(goog.log.ENABLED && logger) {
    logger.warning(msg, opt_exception)
  }
};
goog.log.info = function(logger, msg, opt_exception) {
  if(goog.log.ENABLED && logger) {
    logger.info(msg, opt_exception)
  }
};
goog.log.fine = function(logger, msg, opt_exception) {
  if(goog.log.ENABLED && logger) {
    logger.fine(msg, opt_exception)
  }
};
goog.provide("goog.events.FocusHandler");
goog.provide("goog.events.FocusHandler.EventType");
goog.require("goog.events");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.EventTarget");
goog.require("goog.userAgent");
goog.events.FocusHandler = function(element) {
  goog.events.EventTarget.call(this);
  this.element_ = element;
  var typeIn = goog.userAgent.IE ? "focusin" : "focus";
  var typeOut = goog.userAgent.IE ? "focusout" : "blur";
  this.listenKeyIn_ = goog.events.listen(this.element_, typeIn, this, !goog.userAgent.IE);
  this.listenKeyOut_ = goog.events.listen(this.element_, typeOut, this, !goog.userAgent.IE)
};
goog.inherits(goog.events.FocusHandler, goog.events.EventTarget);
goog.events.FocusHandler.EventType = {FOCUSIN:"focusin", FOCUSOUT:"focusout"};
goog.events.FocusHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var event = new goog.events.BrowserEvent(be);
  event.type = e.type == "focusin" || e.type == "focus" ? goog.events.FocusHandler.EventType.FOCUSIN : goog.events.FocusHandler.EventType.FOCUSOUT;
  this.dispatchEvent(event)
};
goog.events.FocusHandler.prototype.disposeInternal = function() {
  goog.events.FocusHandler.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKeyIn_);
  goog.events.unlistenByKey(this.listenKeyOut_);
  delete this.element_
};
goog.provide("goog.ui.tree.TreeControl");
goog.require("goog.a11y.aria");
goog.require("goog.asserts");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventType");
goog.require("goog.events.FocusHandler");
goog.require("goog.events.KeyHandler");
goog.require("goog.log");
goog.require("goog.ui.tree.BaseNode");
goog.require("goog.ui.tree.TreeNode");
goog.require("goog.ui.tree.TypeAhead");
goog.require("goog.userAgent");
goog.ui.tree.TreeControl = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.BaseNode.call(this, html, opt_config, opt_domHelper);
  this.setExpandedInternal(true);
  this.setSelectedInternal(true);
  this.selectedItem_ = this;
  this.typeAhead_ = new goog.ui.tree.TypeAhead;
  if(goog.userAgent.IE) {
    try {
      document.execCommand("BackgroundImageCache", false, true)
    }catch(e) {
      goog.log.warning(this.logger_, "Failed to enable background image cache")
    }
  }
};
goog.inherits(goog.ui.tree.TreeControl, goog.ui.tree.BaseNode);
goog.ui.tree.TreeControl.prototype.keyHandler_ = null;
goog.ui.tree.TreeControl.prototype.focusHandler_ = null;
goog.ui.tree.TreeControl.prototype.logger_ = goog.log.getLogger("goog.ui.tree.TreeControl");
goog.ui.tree.TreeControl.prototype.focused_ = false;
goog.ui.tree.TreeControl.prototype.focusedNode_ = null;
goog.ui.tree.TreeControl.prototype.showLines_ = true;
goog.ui.tree.TreeControl.prototype.showExpandIcons_ = true;
goog.ui.tree.TreeControl.prototype.showRootNode_ = true;
goog.ui.tree.TreeControl.prototype.showRootLines_ = true;
goog.ui.tree.TreeControl.prototype.getTree = function() {
  return this
};
goog.ui.tree.TreeControl.prototype.getDepth = function() {
  return 0
};
goog.ui.tree.TreeControl.prototype.reveal = function() {
};
goog.ui.tree.TreeControl.prototype.handleFocus_ = function(e) {
  this.focused_ = true;
  goog.dom.classlist.add(this.getElement(), goog.getCssName("focused"));
  if(this.selectedItem_) {
    this.selectedItem_.select()
  }
};
goog.ui.tree.TreeControl.prototype.handleBlur_ = function(e) {
  this.focused_ = false;
  goog.dom.classlist.remove(this.getElement(), goog.getCssName("focused"))
};
goog.ui.tree.TreeControl.prototype.hasFocus = function() {
  return this.focused_
};
goog.ui.tree.TreeControl.prototype.getExpanded = function() {
  return!this.showRootNode_ || goog.ui.tree.TreeControl.superClass_.getExpanded.call(this)
};
goog.ui.tree.TreeControl.prototype.setExpanded = function(expanded) {
  if(!this.showRootNode_) {
    this.setExpandedInternal(expanded)
  }else {
    goog.ui.tree.TreeControl.superClass_.setExpanded.call(this, expanded)
  }
};
goog.ui.tree.TreeControl.prototype.getExpandIconHtml = function() {
  return""
};
goog.ui.tree.TreeControl.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? (el.firstChild) : null
};
goog.ui.tree.TreeControl.prototype.getExpandIconElement = function() {
  return null
};
goog.ui.tree.TreeControl.prototype.updateExpandIcon = function() {
};
goog.ui.tree.TreeControl.prototype.getRowClassName = function() {
  return goog.ui.tree.TreeControl.superClass_.getRowClassName.call(this) + (this.showRootNode_ ? "" : " " + this.getConfig().cssHideRoot)
};
goog.ui.tree.TreeControl.prototype.getCalculatedIconClass = function() {
  var expanded = this.getExpanded();
  if(expanded && this.expandedIconClass_) {
    return this.expandedIconClass_
  }
  if(!expanded && this.iconClass_) {
    return this.iconClass_
  }
  var config = this.getConfig();
  if(expanded && config.cssExpandedRootIcon) {
    return config.cssTreeIcon + " " + config.cssExpandedRootIcon
  }else {
    if(!expanded && config.cssCollapsedRootIcon) {
      return config.cssTreeIcon + " " + config.cssCollapsedRootIcon
    }
  }
  return""
};
goog.ui.tree.TreeControl.prototype.setSelectedItem = function(node) {
  if(this.selectedItem_ == node) {
    return
  }
  var hadFocus = false;
  if(this.selectedItem_) {
    hadFocus = this.selectedItem_ == this.focusedNode_;
    this.selectedItem_.setSelectedInternal(false)
  }
  this.selectedItem_ = node;
  if(node) {
    node.setSelectedInternal(true);
    if(hadFocus) {
      node.select()
    }
  }
  this.dispatchEvent(goog.events.EventType.CHANGE)
};
goog.ui.tree.TreeControl.prototype.getSelectedItem = function() {
  return this.selectedItem_
};
goog.ui.tree.TreeControl.prototype.setShowLines = function(b) {
  if(this.showLines_ != b) {
    this.showLines_ = b;
    if(this.isInDocument()) {
      this.updateLinesAndExpandIcons_()
    }
  }
};
goog.ui.tree.TreeControl.prototype.getShowLines = function() {
  return this.showLines_
};
goog.ui.tree.TreeControl.prototype.updateLinesAndExpandIcons_ = function() {
  var tree = this;
  var showLines = tree.getShowLines();
  var showRootLines = tree.getShowRootLines();
  function updateShowLines(node) {
    var childrenEl = node.getChildrenElement();
    if(childrenEl) {
      var hideLines = !showLines || tree == node.getParent() && !showRootLines;
      var childClass = hideLines ? node.getConfig().cssChildrenNoLines : node.getConfig().cssChildren;
      childrenEl.className = childClass;
      var expandIconEl = node.getExpandIconElement();
      if(expandIconEl) {
        expandIconEl.className = node.getExpandIconClass()
      }
    }
    node.forEachChild(updateShowLines)
  }
  updateShowLines(this)
};
goog.ui.tree.TreeControl.prototype.setShowRootLines = function(b) {
  if(this.showRootLines_ != b) {
    this.showRootLines_ = b;
    if(this.isInDocument()) {
      this.updateLinesAndExpandIcons_()
    }
  }
};
goog.ui.tree.TreeControl.prototype.getShowRootLines = function() {
  return this.showRootLines_
};
goog.ui.tree.TreeControl.prototype.setShowExpandIcons = function(b) {
  if(this.showExpandIcons_ != b) {
    this.showExpandIcons_ = b;
    if(this.isInDocument()) {
      this.updateLinesAndExpandIcons_()
    }
  }
};
goog.ui.tree.TreeControl.prototype.getShowExpandIcons = function() {
  return this.showExpandIcons_
};
goog.ui.tree.TreeControl.prototype.setShowRootNode = function(b) {
  if(this.showRootNode_ != b) {
    this.showRootNode_ = b;
    if(this.isInDocument()) {
      var el = this.getRowElement();
      if(el) {
        el.className = this.getRowClassName()
      }
    }
    if(!b && (this.getSelectedItem() == this && this.getFirstChild())) {
      this.setSelectedItem(this.getFirstChild())
    }
  }
};
goog.ui.tree.TreeControl.prototype.getShowRootNode = function() {
  return this.showRootNode_
};
goog.ui.tree.TreeControl.prototype.initAccessibility = function() {
  goog.ui.tree.TreeControl.superClass_.initAccessibility.call(this);
  var elt = this.getElement();
  goog.asserts.assert(elt, "The DOM element for the tree cannot be null.");
  goog.a11y.aria.setRole(elt, "tree");
  goog.a11y.aria.setState(elt, "labelledby", this.getLabelElement().id)
};
goog.ui.tree.TreeControl.prototype.enterDocument = function() {
  goog.ui.tree.TreeControl.superClass_.enterDocument.call(this);
  var el = this.getElement();
  el.className = this.getConfig().cssRoot;
  el.setAttribute("hideFocus", "true");
  this.attachEvents_();
  this.initAccessibility()
};
goog.ui.tree.TreeControl.prototype.exitDocument = function() {
  goog.ui.tree.TreeControl.superClass_.exitDocument.call(this);
  this.detachEvents_()
};
goog.ui.tree.TreeControl.prototype.attachEvents_ = function() {
  var el = this.getElement();
  el.tabIndex = 0;
  var kh = this.keyHandler_ = new goog.events.KeyHandler(el);
  var fh = this.focusHandler_ = new goog.events.FocusHandler(el);
  this.getHandler().listen(fh, goog.events.FocusHandler.EventType.FOCUSOUT, this.handleBlur_).listen(fh, goog.events.FocusHandler.EventType.FOCUSIN, this.handleFocus_).listen(kh, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent).listen(el, goog.events.EventType.MOUSEDOWN, this.handleMouseEvent_).listen(el, goog.events.EventType.CLICK, this.handleMouseEvent_).listen(el, goog.events.EventType.DBLCLICK, this.handleMouseEvent_)
};
goog.ui.tree.TreeControl.prototype.detachEvents_ = function() {
  this.keyHandler_.dispose();
  this.keyHandler_ = null;
  this.focusHandler_.dispose();
  this.focusHandler_ = null
};
goog.ui.tree.TreeControl.prototype.handleMouseEvent_ = function(e) {
  goog.log.fine(this.logger_, "Received event " + e.type);
  var node = this.getNodeFromEvent_(e);
  if(node) {
    switch(e.type) {
      case goog.events.EventType.MOUSEDOWN:
        node.onMouseDown(e);
        break;
      case goog.events.EventType.CLICK:
        node.onClick_(e);
        break;
      case goog.events.EventType.DBLCLICK:
        node.onDoubleClick_(e);
        break
    }
  }
};
goog.ui.tree.TreeControl.prototype.handleKeyEvent = function(e) {
  var handled = false;
  handled = this.typeAhead_.handleNavigation(e) || (this.selectedItem_ && this.selectedItem_.onKeyDown(e) || this.typeAhead_.handleTypeAheadChar(e));
  if(handled) {
    e.preventDefault()
  }
  return handled
};
goog.ui.tree.TreeControl.prototype.getNodeFromEvent_ = function(e) {
  var node = null;
  var target = e.target;
  while(target != null) {
    var id = target.id;
    node = goog.ui.tree.BaseNode.allNodes[id];
    if(node) {
      return node
    }
    if(target == this.getElement()) {
      break
    }
    target = target.parentNode
  }
  return null
};
goog.ui.tree.TreeControl.prototype.createNode = function(html) {
  return new goog.ui.tree.TreeNode(html || "", this.getConfig(), this.getDomHelper())
};
goog.ui.tree.TreeControl.prototype.setNode = function(node) {
  this.typeAhead_.setNodeInMap(node)
};
goog.ui.tree.TreeControl.prototype.removeNode = function(node) {
  this.typeAhead_.removeNodeFromMap(node)
};
goog.ui.tree.TreeControl.prototype.clearTypeAhead = function() {
  this.typeAhead_.clear()
};
goog.ui.tree.TreeControl.defaultConfig = {indentWidth:19, cssRoot:goog.getCssName("goog-tree-root") + " " + goog.getCssName("goog-tree-item"), cssHideRoot:goog.getCssName("goog-tree-hide-root"), cssItem:goog.getCssName("goog-tree-item"), cssChildren:goog.getCssName("goog-tree-children"), cssChildrenNoLines:goog.getCssName("goog-tree-children-nolines"), cssTreeRow:goog.getCssName("goog-tree-row"), cssItemLabel:goog.getCssName("goog-tree-item-label"), cssTreeIcon:goog.getCssName("goog-tree-icon"), 
cssExpandTreeIcon:goog.getCssName("goog-tree-expand-icon"), cssExpandTreeIconPlus:goog.getCssName("goog-tree-expand-icon-plus"), cssExpandTreeIconMinus:goog.getCssName("goog-tree-expand-icon-minus"), cssExpandTreeIconTPlus:goog.getCssName("goog-tree-expand-icon-tplus"), cssExpandTreeIconTMinus:goog.getCssName("goog-tree-expand-icon-tminus"), cssExpandTreeIconLPlus:goog.getCssName("goog-tree-expand-icon-lplus"), cssExpandTreeIconLMinus:goog.getCssName("goog-tree-expand-icon-lminus"), cssExpandTreeIconT:goog.getCssName("goog-tree-expand-icon-t"), 
cssExpandTreeIconL:goog.getCssName("goog-tree-expand-icon-l"), cssExpandTreeIconBlank:goog.getCssName("goog-tree-expand-icon-blank"), cssExpandedFolderIcon:goog.getCssName("goog-tree-expanded-folder-icon"), cssCollapsedFolderIcon:goog.getCssName("goog-tree-collapsed-folder-icon"), cssFileIcon:goog.getCssName("goog-tree-file-icon"), cssExpandedRootIcon:goog.getCssName("goog-tree-expanded-folder-icon"), cssCollapsedRootIcon:goog.getCssName("goog-tree-collapsed-folder-icon"), cssSelectedRow:goog.getCssName("selected")};
goog.provide("Blockly.Toolbox");
goog.require("Blockly.Flyout");
goog.require("goog.events.BrowserFeature");
goog.require("goog.style");
goog.require("goog.ui.tree.TreeControl");
goog.require("goog.ui.tree.TreeNode");
Blockly.Toolbox.width = 0;
Blockly.Toolbox.selectedOption_ = null;
Blockly.Toolbox.CONFIG_ = {indentWidth:19, cssRoot:"blocklyTreeRoot", cssHideRoot:"blocklyHidden", cssItem:"", cssTreeRow:"blocklyTreeRow", cssItemLabel:"blocklyTreeLabel", cssTreeIcon:"blocklyTreeIcon", cssExpandedFolderIcon:"blocklyTreeIconOpen", cssFileIcon:"blocklyTreeIconNone", cssSelectedRow:"blocklyTreeSelected"};
Blockly.Toolbox.createDom = function(svg, container) {
  Blockly.Toolbox.HtmlDiv = goog.dom.createDom("div", "blocklyToolboxDiv");
  Blockly.Toolbox.HtmlDiv.setAttribute("dir", Blockly.RTL ? "RTL" : "LTR");
  container.appendChild(Blockly.Toolbox.HtmlDiv);
  Blockly.Toolbox.flyout_ = new Blockly.Flyout;
  svg.appendChild(Blockly.Toolbox.flyout_.createDom());
  Blockly.bindEvent_(Blockly.Toolbox.HtmlDiv, "mousedown", null, function(e) {
    Blockly.fireUiEvent(window, "resize");
    if(Blockly.isRightButton(e) || e.target == Blockly.Toolbox.HtmlDiv) {
      Blockly.hideChaff(false)
    }else {
      Blockly.hideChaff(true)
    }
  })
};
Blockly.Toolbox.init = function() {
  Blockly.Toolbox.CONFIG_["cleardotPath"] = Blockly.assetUrl("media/1x1.gif");
  Blockly.Toolbox.CONFIG_["cssCollapsedFolderIcon"] = "blocklyTreeIconClosed" + (Blockly.RTL ? "Rtl" : "Ltr");
  var tree = new Blockly.Toolbox.TreeControl("root", Blockly.Toolbox.CONFIG_);
  Blockly.Toolbox.tree_ = tree;
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setShowExpandIcons(false);
  tree.setSelectedItem(null);
  Blockly.Toolbox.HtmlDiv.style.display = "block";
  Blockly.Toolbox.flyout_.init(Blockly.mainWorkspace, true);
  Blockly.Toolbox.populate_();
  tree.render(Blockly.Toolbox.HtmlDiv);
  goog.events.listen(window, goog.events.EventType.RESIZE, Blockly.Toolbox.position_);
  Blockly.Toolbox.position_();
  Blockly.Toolbox.enabled = true
};
Blockly.Toolbox.position_ = function() {
  var treeDiv = Blockly.Toolbox.HtmlDiv;
  var svgBox = goog.style.getBorderBox(Blockly.svg);
  var svgSize = Blockly.svgSize();
  if(Blockly.RTL) {
    treeDiv.style.right = svgBox.right + "px"
  }else {
    treeDiv.style.marginLeft = svgBox.left
  }
  treeDiv.style.height = svgSize.height + 1 + "px";
  Blockly.Toolbox.width = treeDiv.offsetWidth;
  if(!Blockly.RTL) {
    Blockly.Toolbox.width -= 1
  }
};
Blockly.Toolbox.populate_ = function() {
  var rootOut = Blockly.Toolbox.tree_;
  rootOut.blocks = [];
  function syncTrees(treeIn, treeOut) {
    for(var i = 0, childIn;childIn = treeIn.childNodes[i];i++) {
      if(!childIn.tagName) {
        continue
      }
      var name = childIn.tagName.toUpperCase();
      if(name === "CATEGORY") {
        var childOut = rootOut.createNode(childIn.getAttribute("name"));
        childOut.blocks = [];
        treeOut.add(childOut);
        var custom = childIn.getAttribute("custom");
        if(custom) {
          childOut.blocks[0] = custom
        }
        syncTrees(childIn, childOut)
      }else {
        if(name === "BLOCK") {
          treeOut.blocks.push(childIn)
        }
      }
    }
  }
  syncTrees(Blockly.languageTree, Blockly.Toolbox.tree_);
  if(rootOut.blocks.length) {
    throw"Toolbox cannot have both blocks and categories in the root level.";
  }
  Blockly.fireUiEvent(window, "resize")
};
Blockly.Toolbox.clearSelection = function() {
  Blockly.Toolbox.tree_.setSelectedItem(null)
};
Blockly.Toolbox.TreeControl = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeControl.call(this, html, opt_config, opt_domHelper)
};
goog.inherits(Blockly.Toolbox.TreeControl, goog.ui.tree.TreeControl);
Blockly.Toolbox.TreeControl.prototype.enterDocument = function() {
  Blockly.Toolbox.TreeControl.superClass_.enterDocument.call(this);
  if(goog.events.BrowserFeature.TOUCH_ENABLED || ("onpointerdown" in window || "onmspointerdown" in window)) {
    var el = this.getElement();
    Blockly.bindEvent_(el, goog.events.EventType.TOUCHSTART, this, this.handleTouchEvent_);
    Blockly.bindEvent_(el, goog.events.EventType.POINTERDOWN, this, this.handleTouchEvent_);
    Blockly.bindEvent_(el, goog.events.EventType.MSPOINTERDOWN, this, this.handleTouchEvent_)
  }
};
Blockly.Toolbox.TreeControl.prototype.handleTouchEvent_ = function(e) {
  e.preventDefault();
  var node = this.getNodeFromEvent_(e);
  if(node && (e.type === goog.events.EventType.TOUCHSTART || (e.type === goog.events.EventType.POINTERDOWN || e.type === goog.events.EventType.MSPOINTERDOWN))) {
    e.stopImmediatePropagation();
    window.setTimeout(function() {
      node.onMouseDown(e)
    }, 1)
  }
};
Blockly.Toolbox.TreeControl.prototype.createNode = function(html) {
  return new Blockly.Toolbox.TreeNode(html || "", this.getConfig(), this.getDomHelper())
};
Blockly.Toolbox.TreeControl.prototype.setSelectedItem = function(node) {
  if(this.selectedItem_ == node) {
    return
  }
  goog.ui.tree.TreeControl.prototype.setSelectedItem.call(this, node);
  if(node && (node.blocks && node.blocks.length)) {
    Blockly.Toolbox.flyout_.show(node.blocks)
  }else {
    Blockly.Toolbox.flyout_.hide()
  }
};
Blockly.Toolbox.TreeNode = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeNode.call(this, html, opt_config, opt_domHelper);
  var resize = function() {
    Blockly.fireUiEvent(window, "resize")
  };
  goog.events.listen(Blockly.Toolbox.tree_, goog.ui.tree.BaseNode.EventType.EXPAND, resize);
  goog.events.listen(Blockly.Toolbox.tree_, goog.ui.tree.BaseNode.EventType.COLLAPSE, resize)
};
goog.inherits(Blockly.Toolbox.TreeNode, goog.ui.tree.TreeNode);
Blockly.Toolbox.TreeNode.prototype.getExpandIconHtml = function() {
  return"<span></span>"
};
Blockly.Toolbox.TreeNode.prototype.getExpandIconElement = function() {
  return null
};
Blockly.Toolbox.TreeNode.prototype.onMouseDown = function(e) {
  if(!Blockly.Toolbox.enabled) {
    return
  }
  if(this.hasChildren() && this.isUserCollapsible_) {
    this.toggle();
    this.select()
  }else {
    if(this.isSelected()) {
      this.getTree().setSelectedItem(null)
    }else {
      this.select()
    }
  }
  this.updateRow()
};
Blockly.Toolbox.TreeNode.prototype.onDoubleClick_ = function(e) {
};
goog.provide("Blockly.Variables");
goog.require("Blockly.Toolbox");
goog.require("Blockly.Workspace");
Blockly.Variables.NAME_TYPE = "VARIABLE";
Blockly.Variables.NAME_TYPE_LOCAL = "LOCALVARIABLE";
Blockly.Variables.allVariables = function(opt_block) {
  var blocks;
  if(opt_block) {
    blocks = opt_block.getDescendants()
  }else {
    blocks = Blockly.mainWorkspace.getAllBlocks()
  }
  var variableHash = {};
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].getVars;
    if(func) {
      var blockVariables = func.call(blocks[x]);
      for(var y = 0;y < blockVariables.length;y++) {
        var varName = blockVariables[y];
        if(varName) {
          variableHash[Blockly.Names.PREFIX_ + varName.toLowerCase()] = varName
        }
      }
    }
  }
  var variableList = [];
  for(var name in variableHash) {
    variableList.push(variableHash[name])
  }
  return variableList
};
Blockly.Variables.renameVariable = function(oldName, newName) {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].renameVar;
    if(func) {
      func.call(blocks[x], oldName, newName)
    }
  }
};
Blockly.Variables.flyoutCategory = function(blocks, gaps, margin, workspace) {
  var variableList = Blockly.Variables.allVariables();
  variableList.sort(goog.string.caseInsensitiveCompare);
  variableList.unshift(null);
  var defaultVariable = undefined;
  for(var i = 0;i < variableList.length;i++) {
    if(variableList[i] === defaultVariable) {
      continue
    }
    var getBlock = Blockly.Blocks.variables_get ? new Blockly.Block(workspace, "variables_get") : null;
    getBlock && getBlock.initSvg();
    var setBlock = Blockly.Blocks.variables_set ? new Blockly.Block(workspace, "variables_set") : null;
    setBlock && setBlock.initSvg();
    if(variableList[i] === null) {
      defaultVariable = (getBlock || setBlock).getVars()[0]
    }else {
      getBlock && getBlock.setTitleValue(variableList[i], "VAR");
      setBlock && setBlock.setTitleValue(variableList[i], "VAR")
    }
    setBlock && blocks.push(setBlock);
    getBlock && blocks.push(getBlock);
    if(getBlock && setBlock) {
      gaps.push(margin, margin * 3)
    }else {
      gaps.push(margin * 2)
    }
  }
};
Blockly.Variables.generateUniqueName = function() {
  var variableList = Blockly.Variables.allVariables();
  var newName = "";
  if(variableList.length) {
    variableList.sort(goog.string.caseInsensitiveCompare);
    var nameSuffix = 0, potName = "i", i = 0, inUse = false;
    while(!newName) {
      i = 0;
      inUse = false;
      while(i < variableList.length && !inUse) {
        if(variableList[i].toLowerCase() == potName) {
          inUse = true
        }
        i++
      }
      if(inUse) {
        if(potName[0] === "z") {
          nameSuffix++;
          potName = "a"
        }else {
          potName = String.fromCharCode(potName.charCodeAt(0) + 1);
          if(potName[0] == "l") {
            potName = String.fromCharCode(potName.charCodeAt(0) + 1)
          }
        }
        if(nameSuffix > 0) {
          potName += nameSuffix
        }
      }else {
        newName = potName
      }
    }
  }else {
    newName = "i"
  }
  return newName
};
goog.provide("Blockly.FieldVariable");
goog.require("Blockly.FieldDropdown");
goog.require("Blockly.Msg");
goog.require("Blockly.Variables");
Blockly.FieldVariable = function(varname, opt_changeHandler) {
  var changeHandler;
  if(opt_changeHandler) {
    var thisObj = this;
    changeHandler = function(value) {
      var retVal = Blockly.FieldVariable.dropdownChange.call(thisObj, value);
      var newVal;
      if(retVal === undefined) {
        newVal = value
      }else {
        if(retVal === null) {
          newVal = thisObj.getValue()
        }else {
          newVal = retVal
        }
      }
      opt_changeHandler.call(thisObj, newVal);
      return retVal
    }
  }else {
    changeHandler = Blockly.FieldVariable.dropdownChange
  }
  Blockly.FieldVariable.superClass_.constructor.call(this, Blockly.FieldVariable.dropdownCreate, changeHandler);
  if(varname) {
    this.setValue(varname)
  }else {
    this.setValue(Blockly.Variables.generateUniqueName())
  }
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);
Blockly.FieldVariable.prototype.getValue = function() {
  return this.getText()
};
Blockly.FieldVariable.prototype.setValue = function(text) {
  this.value_ = text;
  this.setText(text)
};
Blockly.FieldVariable.dropdownCreate = function() {
  var variableList = Blockly.Variables.allVariables();
  var name = this.getText();
  if(name && variableList.indexOf(name) == -1) {
    variableList.push(name)
  }
  variableList.sort(goog.string.caseInsensitiveCompare);
  variableList.push(Blockly.Msg.RENAME_VARIABLE);
  variableList.push(Blockly.Msg.NEW_VARIABLE);
  var options = [];
  for(var x = 0;x < variableList.length;x++) {
    options[x] = [variableList[x], variableList[x]]
  }
  return options
};
Blockly.FieldVariable.dropdownChange = function(text) {
  function promptName(promptText, defaultText) {
    Blockly.hideChaff();
    var newVar = window.prompt(promptText, defaultText);
    return newVar && newVar.replace(/[\s\xa0]+/g, " ").replace(/^ | $/g, "")
  }
  if(text == Blockly.Msg.RENAME_VARIABLE) {
    var oldVar = this.getText();
    text = promptName(Blockly.Msg.RENAME_VARIABLE_TITLE.replace("%1", oldVar), oldVar);
    if(text) {
      Blockly.Variables.renameVariable(oldVar, text)
    }
    return null
  }else {
    if(text == Blockly.Msg.NEW_VARIABLE) {
      text = promptName(Blockly.Msg.NEW_VARIABLE_TITLE, "");
      if(text) {
        Blockly.Variables.renameVariable(text, text);
        return text
      }
      return null
    }
  }
  return undefined
};
goog.provide("Blockly.Procedures");
goog.require("Blockly.FieldVariable");
goog.require("Blockly.Names");
goog.require("Blockly.Workspace");
Blockly.Procedures.NAME_TYPE = "PROCEDURE";
Blockly.Procedures.allProcedures = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].getProcedureDef;
    if(func) {
      var tuple = func.call(blocks[x]);
      if(tuple) {
        if(tuple[2]) {
          proceduresReturn.push(tuple)
        }else {
          proceduresNoReturn.push(tuple)
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.Procedures.procTupleComparator_);
  proceduresReturn.sort(Blockly.Procedures.procTupleComparator_);
  return[proceduresNoReturn, proceduresReturn]
};
Blockly.Procedures.procTupleComparator_ = function(ta, tb) {
  var a = ta[0].toLowerCase();
  var b = tb[0].toLowerCase();
  if(a > b) {
    return 1
  }
  if(a < b) {
    return-1
  }
  return 0
};
Blockly.Procedures.findLegalName = function(name, block) {
  if(block.isInFlyout) {
    return name
  }
  while(!Blockly.Procedures.isLegalName(name, block.workspace, block)) {
    var r = name.match(/^(.*?)(\d+)$/);
    if(!r) {
      name += "2"
    }else {
      name = r[1] + (parseInt(r[2], 10) + 1)
    }
  }
  return name
};
Blockly.Procedures.isLegalName = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks();
  for(var x = 0;x < blocks.length;x++) {
    if(blocks[x] == opt_exclude) {
      continue
    }
    var func = blocks[x].getProcedureDef;
    if(func) {
      var procName = func.call(blocks[x]);
      if(Blockly.Names.equals(procName[0], name)) {
        return false
      }
    }
  }
  return true
};
Blockly.Procedures.rename = function(text) {
  text = text.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
  text = Blockly.Procedures.findLegalName(text, this.sourceBlock_);
  var blocks = this.sourceBlock_.workspace.getAllBlocks();
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].renameProcedure;
    if(func) {
      func.call(blocks[x], this.text_, text)
    }
  }
  return text
};
Blockly.Procedures.flyoutCategory = function(blocks, gaps, margin, workspace) {
  if(Blockly.Blocks.procedures_defnoreturn) {
    var block = new Blockly.Block(workspace, "procedures_defnoreturn");
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2)
  }
  if(Blockly.Blocks.procedures_defreturn) {
    var block = new Blockly.Block(workspace, "procedures_defreturn");
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2)
  }
  if(Blockly.Blocks.procedures_ifreturn) {
    var block = new Blockly.Block(workspace, "procedures_ifreturn");
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2)
  }
  if(gaps.length) {
    gaps[gaps.length - 1] = margin * 3
  }
  function populateProcedures(procedureList, templateName) {
    for(var x = 0;x < procedureList.length;x++) {
      var block = new Blockly.Block(workspace, templateName);
      block.setTitleValue(procedureList[x][0], "NAME");
      var tempIds = [];
      for(var t = 0;t < procedureList[x][1].length;t++) {
        tempIds[t] = "ARG" + t
      }
      block.setProcedureParameters(procedureList[x][1], tempIds);
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2)
    }
  }
  var tuple = Blockly.Procedures.allProcedures();
  populateProcedures(tuple[0], "procedures_callnoreturn");
  populateProcedures(tuple[1], "procedures_callreturn")
};
Blockly.Procedures.getCallers = function(name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks();
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].getProcedureCall;
    if(func) {
      var procName = func.call(blocks[x]);
      if(procName && Blockly.Names.equals(procName, name)) {
        callers.push(blocks[x])
      }
    }
  }
  return callers
};
Blockly.Procedures.disposeCallers = function(name, workspace) {
  var callers = Blockly.Procedures.getCallers(name, workspace);
  for(var x = 0;x < callers.length;x++) {
    callers[x].dispose(true, false)
  }
};
Blockly.Procedures.mutateCallers = function(name, workspace, paramNames, paramIds) {
  var callers = Blockly.Procedures.getCallers(name, workspace);
  for(var x = 0;x < callers.length;x++) {
    callers[x].setProcedureParameters(paramNames, paramIds)
  }
};
Blockly.Procedures.getDefinition = function(name, workspace) {
  var blocks = workspace.getAllBlocks();
  for(var x = 0;x < blocks.length;x++) {
    var func = blocks[x].getProcedureDef;
    if(func) {
      var tuple = func.call(blocks[x]);
      if(tuple && Blockly.Names.equals(tuple[0], name)) {
        return blocks[x]
      }
    }
  }
  return null
};
goog.provide("goog.color.names");
goog.color.names = {"aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff", "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887", "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff", "darkblue":"#00008b", "darkcyan":"#008b8b", 
"darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkgrey":"#a9a9a9", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f", "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkslategrey":"#2f4f4f", "darkturquoise":"#00ced1", "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dimgrey":"#696969", 
"dodgerblue":"#1e90ff", "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff", "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f", "grey":"#808080", "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c", "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", 
"lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2", "lightgray":"#d3d3d3", "lightgreen":"#90ee90", "lightgrey":"#d3d3d3", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightslategrey":"#778899", "lightsteelblue":"#b0c4de", "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6", "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", 
"mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370db", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee", "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080", "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6", "palegoldenrod":"#eee8aa", 
"palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#db7093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1", "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", 
"slategrey":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4", "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee", "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32"};
goog.provide("goog.color");
goog.provide("goog.color.Hsl");
goog.provide("goog.color.Hsv");
goog.provide("goog.color.Rgb");
goog.require("goog.color.names");
goog.require("goog.math");
goog.color.Rgb;
goog.color.Hsv;
goog.color.Hsl;
goog.color.parse = function(str) {
  var result = {};
  str = String(str);
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if(goog.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = "hex";
    return result
  }else {
    var rgb = goog.color.isValidRgbColor_(str);
    if(rgb.length) {
      result.hex = goog.color.rgbArrayToHex(rgb);
      result.type = "rgb";
      return result
    }else {
      if(goog.color.names) {
        var hex = goog.color.names[str.toLowerCase()];
        if(hex) {
          result.hex = hex;
          result.type = "named";
          return result
        }
      }
    }
  }
  throw Error(str + " is not a valid color string");
};
goog.color.isValidColor = function(str) {
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  return!!(goog.color.isValidHexColor_(maybeHex) || (goog.color.isValidRgbColor_(str).length || goog.color.names && goog.color.names[str.toLowerCase()]))
};
goog.color.parseRgb = function(str) {
  var rgb = goog.color.isValidRgbColor_(str);
  if(!rgb.length) {
    throw Error(str + " is not a valid RGB color");
  }
  return rgb
};
goog.color.hexToRgbStyle = function(hexColor) {
  return goog.color.rgbStyle_(goog.color.hexToRgb(hexColor))
};
goog.color.hexTripletRe_ = /#(.)(.)(.)/;
goog.color.normalizeHex = function(hexColor) {
  if(!goog.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if(hexColor.length == 4) {
    hexColor = hexColor.replace(goog.color.hexTripletRe_, "#$1$1$2$2$3$3")
  }
  return hexColor.toLowerCase()
};
goog.color.hexToRgb = function(hexColor) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);
  var b = parseInt(hexColor.substr(5, 2), 16);
  return[r, g, b]
};
goog.color.rgbToHex = function(r, g, b) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if(isNaN(r) || (r < 0 || (r > 255 || (isNaN(g) || (g < 0 || (g > 255 || (isNaN(b) || (b < 0 || b > 255)))))))) {
    throw Error('"(' + r + "," + g + "," + b + '") is not a valid RGB color');
  }
  var hexR = goog.color.prependZeroIfNecessaryHelper(r.toString(16));
  var hexG = goog.color.prependZeroIfNecessaryHelper(g.toString(16));
  var hexB = goog.color.prependZeroIfNecessaryHelper(b.toString(16));
  return"#" + hexR + hexG + hexB
};
goog.color.rgbArrayToHex = function(rgb) {
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2])
};
goog.color.rgbToHsl = function(r, g, b) {
  var normR = r / 255;
  var normG = g / 255;
  var normB = b / 255;
  var max = Math.max(normR, normG, normB);
  var min = Math.min(normR, normG, normB);
  var h = 0;
  var s = 0;
  var l = 0.5 * (max + min);
  if(max != min) {
    if(max == normR) {
      h = 60 * (normG - normB) / (max - min)
    }else {
      if(max == normG) {
        h = 60 * (normB - normR) / (max - min) + 120
      }else {
        if(max == normB) {
          h = 60 * (normR - normG) / (max - min) + 240
        }
      }
    }
    if(0 < l && l <= 0.5) {
      s = (max - min) / (2 * l)
    }else {
      s = (max - min) / (2 - 2 * l)
    }
  }
  return[Math.round(h + 360) % 360, s, l]
};
goog.color.rgbArrayToHsl = function(rgb) {
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2])
};
goog.color.hueToRgb_ = function(v1, v2, vH) {
  if(vH < 0) {
    vH += 1
  }else {
    if(vH > 1) {
      vH -= 1
    }
  }
  if(6 * vH < 1) {
    return v1 + (v2 - v1) * 6 * vH
  }else {
    if(2 * vH < 1) {
      return v2
    }else {
      if(3 * vH < 2) {
        return v1 + (v2 - v1) * (2 / 3 - vH) * 6
      }
    }
  }
  return v1
};
goog.color.hslToRgb = function(h, s, l) {
  var r = 0;
  var g = 0;
  var b = 0;
  var normH = h / 360;
  if(s == 0) {
    r = g = b = l * 255
  }else {
    var temp1 = 0;
    var temp2 = 0;
    if(l < 0.5) {
      temp2 = l * (1 + s)
    }else {
      temp2 = l + s - s * l
    }
    temp1 = 2 * l - temp2;
    r = 255 * goog.color.hueToRgb_(temp1, temp2, normH + 1 / 3);
    g = 255 * goog.color.hueToRgb_(temp1, temp2, normH);
    b = 255 * goog.color.hueToRgb_(temp1, temp2, normH - 1 / 3)
  }
  return[Math.round(r), Math.round(g), Math.round(b)]
};
goog.color.hslArrayToRgb = function(hsl) {
  return goog.color.hslToRgb(hsl[0], hsl[1], hsl[2])
};
goog.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;
goog.color.isValidHexColor_ = function(str) {
  return goog.color.validHexColorRe_.test(str)
};
goog.color.normalizedHexColorRe_ = /^#[0-9a-f]{6}$/;
goog.color.isNormalizedHexColor_ = function(str) {
  return goog.color.normalizedHexColorRe_.test(str)
};
goog.color.rgbColorRe_ = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
goog.color.isValidRgbColor_ = function(str) {
  var regExpResultArray = str.match(goog.color.rgbColorRe_);
  if(regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    if(r >= 0 && (r <= 255 && (g >= 0 && (g <= 255 && (b >= 0 && b <= 255))))) {
      return[r, g, b]
    }
  }
  return[]
};
goog.color.prependZeroIfNecessaryHelper = function(hex) {
  return hex.length == 1 ? "0" + hex : hex
};
goog.color.prependHashIfNecessaryHelper = function(str) {
  return str.charAt(0) == "#" ? str : "#" + str
};
goog.color.rgbStyle_ = function(rgb) {
  return"rgb(" + rgb.join(",") + ")"
};
goog.color.hsvToRgb = function(h, s, brightness) {
  var red = 0;
  var green = 0;
  var blue = 0;
  if(s == 0) {
    red = brightness;
    green = brightness;
    blue = brightness
  }else {
    var sextant = Math.floor(h / 60);
    var remainder = h / 60 - sextant;
    var val1 = brightness * (1 - s);
    var val2 = brightness * (1 - s * remainder);
    var val3 = brightness * (1 - s * (1 - remainder));
    switch(sextant) {
      case 1:
        red = val2;
        green = brightness;
        blue = val1;
        break;
      case 2:
        red = val1;
        green = brightness;
        blue = val3;
        break;
      case 3:
        red = val1;
        green = val2;
        blue = brightness;
        break;
      case 4:
        red = val3;
        green = val1;
        blue = brightness;
        break;
      case 5:
        red = brightness;
        green = val1;
        blue = val2;
        break;
      case 6:
      ;
      case 0:
        red = brightness;
        green = val3;
        blue = val1;
        break
    }
  }
  return[Math.floor(red), Math.floor(green), Math.floor(blue)]
};
goog.color.rgbToHsv = function(red, green, blue) {
  var max = Math.max(Math.max(red, green), blue);
  var min = Math.min(Math.min(red, green), blue);
  var hue;
  var saturation;
  var value = max;
  if(min == max) {
    hue = 0;
    saturation = 0
  }else {
    var delta = max - min;
    saturation = delta / max;
    if(red == max) {
      hue = (green - blue) / delta
    }else {
      if(green == max) {
        hue = 2 + (blue - red) / delta
      }else {
        hue = 4 + (red - green) / delta
      }
    }
    hue *= 60;
    if(hue < 0) {
      hue += 360
    }
    if(hue > 360) {
      hue -= 360
    }
  }
  return[hue, saturation, value]
};
goog.color.rgbArrayToHsv = function(rgb) {
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2])
};
goog.color.hsvArrayToRgb = function(hsv) {
  return goog.color.hsvToRgb(hsv[0], hsv[1], hsv[2])
};
goog.color.hexToHsl = function(hex) {
  var rgb = goog.color.hexToRgb(hex);
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2])
};
goog.color.hslToHex = function(h, s, l) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(h, s, l))
};
goog.color.hslArrayToHex = function(hsl) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]))
};
goog.color.hexToHsv = function(hex) {
  return goog.color.rgbArrayToHsv(goog.color.hexToRgb(hex))
};
goog.color.hsvToHex = function(h, s, v) {
  return goog.color.rgbArrayToHex(goog.color.hsvToRgb(h, s, v))
};
goog.color.hsvArrayToHex = function(hsv) {
  return goog.color.hsvToHex(hsv[0], hsv[1], hsv[2])
};
goog.color.hslDistance = function(hsl1, hsl2) {
  var sl1, sl2;
  if(hsl1[2] <= 0.5) {
    sl1 = hsl1[1] * hsl1[2]
  }else {
    sl1 = hsl1[1] * (1 - hsl1[2])
  }
  if(hsl2[2] <= 0.5) {
    sl2 = hsl2[1] * hsl2[2]
  }else {
    sl2 = hsl2[1] * (1 - hsl2[2])
  }
  var h1 = hsl1[0] / 360;
  var h2 = hsl2[0] / 360;
  var dh = (h1 - h2) * 2 * Math.PI;
  return(hsl1[2] - hsl2[2]) * (hsl1[2] - hsl2[2]) + sl1 * sl1 + sl2 * sl2 - 2 * sl1 * sl2 * Math.cos(dh)
};
goog.color.blend = function(rgb1, rgb2, factor) {
  factor = goog.math.clamp(factor, 0, 1);
  return[Math.round(factor * rgb1[0] + (1 - factor) * rgb2[0]), Math.round(factor * rgb1[1] + (1 - factor) * rgb2[1]), Math.round(factor * rgb1[2] + (1 - factor) * rgb2[2])]
};
goog.color.darken = function(rgb, factor) {
  var black = [0, 0, 0];
  return goog.color.blend(black, rgb, factor)
};
goog.color.lighten = function(rgb, factor) {
  var white = [255, 255, 255];
  return goog.color.blend(white, rgb, factor)
};
goog.color.highContrast = function(prime, suggestions) {
  var suggestionsWithDiff = [];
  for(var i = 0;i < suggestions.length;i++) {
    suggestionsWithDiff.push({color:suggestions[i], diff:goog.color.yiqBrightnessDiff_(suggestions[i], prime) + goog.color.colorDiff_(suggestions[i], prime)})
  }
  suggestionsWithDiff.sort(function(a, b) {
    return b.diff - a.diff
  });
  return suggestionsWithDiff[0].color
};
goog.color.yiqBrightness_ = function(rgb) {
  return Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1E3)
};
goog.color.yiqBrightnessDiff_ = function(rgb1, rgb2) {
  return Math.abs(goog.color.yiqBrightness_(rgb1) - goog.color.yiqBrightness_(rgb2))
};
goog.color.colorDiff_ = function(rgb1, rgb2) {
  return Math.abs(rgb1[0] - rgb2[0]) + Math.abs(rgb1[1] - rgb2[1]) + Math.abs(rgb1[2] - rgb2[2])
};
goog.provide("Blockly.utils");
goog.require("goog.array");
Blockly.addClass_ = function(element, className) {
  var classes = element.getAttribute("class") || "";
  if(Blockly.stringContainsClass_(classes, className)) {
    if(classes) {
      classes += " "
    }
    element.setAttribute("class", classes + className)
  }
};
Blockly.elementHasClass_ = function(element, className) {
  return Blockly.stringContainsClass_(element.getAttribute("class") || "", className)
};
Blockly.stringContainsClass_ = function(classes, className) {
  return(" " + classes + " ").indexOf(" " + className + " ") == -1
};
Blockly.removeClass_ = function(element, className) {
  var classes = element.getAttribute("class");
  if((" " + classes + " ").indexOf(" " + className + " ") != -1) {
    var classList = classes.split(/\s+/);
    for(var i = 0;i < classList.length;i++) {
      if(!classList[i] || classList[i] == className) {
        classList.splice(i, 1);
        i--
      }
    }
    if(classList.length) {
      element.setAttribute("class", classList.join(" "))
    }else {
      element.removeAttribute("class")
    }
  }
};
Blockly.bindEvent_ = function(element, name, thisObject, func) {
  var bindData = [];
  var wrapFunc;
  if(!element.addEventListener) {
    throw"Element is not a DOM node with addEventListener.";
  }
  wrapFunc = function(e) {
    func.apply(thisObject, arguments)
  };
  element.addEventListener(name, wrapFunc, false);
  bindData.push([element, name, wrapFunc]);
  if(name in Blockly.bindEvent_.TOUCH_MAP) {
    wrapFunc = function(e) {
      if(e.target && e.target.style) {
        var targetStyle = e.target.style;
        if(targetStyle.touchAction) {
          targetStyle.touchAction = "none"
        }else {
          if(targetStyle.msTouchAction) {
            targetStyle.msTouchAction = "none"
          }
        }
      }
      var touchPoints = e.changedTouches || [e];
      for(var i = 0;i < touchPoints.length;++i) {
        e.clientX = touchPoints[i].clientX;
        e.clientY = touchPoints[i].clientY;
        func.apply(thisObject, arguments)
      }
    };
    element.addEventListener(Blockly.bindEvent_.TOUCH_MAP[name], wrapFunc, false);
    bindData.push([element, Blockly.bindEvent_.TOUCH_MAP[name], wrapFunc])
  }
  return bindData
};
Blockly.bindEvent_.TOUCH_MAP = {};
if("ontouchstart" in document.documentElement) {
  Blockly.bindEvent_.TOUCH_MAP = {mousedown:"touchstart", mousemove:"touchmove", mouseup:"touchend"}
}else {
  if(window.navigator.pointerEnabled) {
    Blockly.bindEvent_.TOUCH_MAP = {mousedown:"pointerdown", mousemove:"pointermove", mouseup:"pointerup"}
  }else {
    if(window.navigator.msPointerEnabled) {
      Blockly.bindEvent_.TOUCH_MAP = {mousedown:"MSPointerDown", mousemove:"MSPointerMove", mouseup:"MSPointerUp"}
    }
  }
}
Blockly.unbindEvent_ = function(bindData) {
  while(bindData.length) {
    var bindDatum = bindData.pop();
    var element = bindDatum[0];
    var name = bindDatum[1];
    var func = bindDatum[2];
    element.removeEventListener(name, func, false)
  }
  return func
};
Blockly.fireUiEvent = function(element, eventName) {
  var doc = document;
  if(doc.createEvent) {
    var evt = doc.createEvent("UIEvents");
    evt.initEvent(eventName, true, true);
    element.dispatchEvent(evt)
  }else {
    if(doc.createEventObject) {
      var evt = doc.createEventObject();
      element.fireEvent("on" + eventName, evt)
    }else {
      throw"FireEvent: No event creation mechanism.";
    }
  }
};
Blockly.noEvent = function(e) {
  e.preventDefault();
  e.stopPropagation()
};
Blockly.getRelativeXY_ = function(element) {
  var xy = {x:0, y:0};
  var x = element.getAttribute("x");
  if(x) {
    xy.x = parseInt(x, 10)
  }
  var y = element.getAttribute("y");
  if(y) {
    xy.y = parseInt(y, 10)
  }
  var transform = element.getAttribute("transform");
  var r = transform && transform.match(/translate\(\s*([-\d.]+)([ ,]\s*([-\d.]+)\s*\))?/);
  if(r) {
    xy.x += parseInt(r[1], 10);
    if(r[3]) {
      xy.y += parseInt(r[3], 10)
    }
  }
  return xy
};
Blockly.getSvgXY_ = function(element) {
  var x = 0;
  var y = 0;
  do {
    var xy = Blockly.getRelativeXY_(element);
    x += xy.x;
    y += xy.y;
    element = element.parentNode
  }while(element && element != Blockly.svg);
  return{x:x, y:y}
};
Blockly.getAbsoluteXY_ = function(element) {
  var xy = Blockly.getSvgXY_(element);
  return Blockly.convertCoordinates(xy.x, xy.y, false)
};
Blockly.createSvgElement = function(name, attrs, opt_parent) {
  var e = (document.createElementNS(Blockly.SVG_NS, name));
  for(var key in attrs) {
    e.setAttribute(key, attrs[key])
  }
  if(document.body.runtimeStyle) {
    e.runtimeStyle = e.currentStyle = e.style
  }
  if(opt_parent) {
    opt_parent.appendChild(e)
  }
  return e
};
Blockly.isRightButton = function(e) {
  return e.button == 2 || e.ctrlKey
};
Blockly.convertCoordinates = function(x, y, toSvg) {
  if(toSvg) {
    x -= window.pageXOffset;
    y -= window.pageYOffset
  }
  var svgPoint = Blockly.svg.createSVGPoint();
  svgPoint.x = x;
  svgPoint.y = y;
  var matrix = Blockly.svg.getScreenCTM();
  if(toSvg) {
    matrix = matrix.inverse()
  }
  var xy = svgPoint.matrixTransform(matrix);
  if(!toSvg) {
    if(!((goog.userAgent.IPAD || goog.userAgent.IPHONE) && !goog.userAgent.isVersionOrHigher(538))) {
      xy.x += window.pageXOffset;
      xy.y += window.pageYOffset
    }
  }
  return xy
};
Blockly.mouseToSvg = function(e) {
  return Blockly.convertCoordinates(e.clientX + window.pageXOffset, e.clientY + window.pageYOffset, true)
};
Blockly.shortestStringLength = function(array) {
  if(!array.length) {
    return 0
  }
  var len = array[0].length;
  for(var i = 1;i < array.length;i++) {
    len = Math.min(len, array[i].length)
  }
  return len
};
Blockly.commonWordPrefix = function(array, opt_shortest) {
  if(!array.length) {
    return 0
  }else {
    if(array.length == 1) {
      return array[0].length
    }
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for(var len = 0;len < max;len++) {
    var letter = array[0][len];
    for(var i = 1;i < array.length;i++) {
      if(letter != array[i][len]) {
        return wordPrefix
      }
    }
    if(letter == " ") {
      wordPrefix = len + 1
    }
  }
  for(var i = 1;i < array.length;i++) {
    var letter = array[i][len];
    if(letter && letter != " ") {
      return wordPrefix
    }
  }
  return max
};
Blockly.commonWordSuffix = function(array, opt_shortest) {
  if(!array.length) {
    return 0
  }else {
    if(array.length == 1) {
      return array[0].length
    }
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for(var len = 0;len < max;len++) {
    var letter = array[0].substr(-len - 1, 1);
    for(var i = 1;i < array.length;i++) {
      if(letter != array[i].substr(-len - 1, 1)) {
        return wordPrefix
      }
    }
    if(letter == " ") {
      wordPrefix = len + 1
    }
  }
  for(var i = 1;i < array.length;i++) {
    var letter = array[i].charAt(array[i].length - len - 1);
    if(letter && letter != " ") {
      return wordPrefix
    }
  }
  return max
};
Blockly.isNumber = function(str) {
  return!!str.match(/^\s*-?\d+(\.\d+)?\s*$/)
};
Blockly.isMsie = function() {
  return window.navigator.userAgent.indexOf("MSIE") >= 0
};
Blockly.isTrident = function() {
  return window.navigator.userAgent.indexOf("Trident") >= 0
};
Blockly.isIOS = function() {
  return/iP(hone|od|ad)/.test(navigator.platform)
};
Blockly.ieVersion = function() {
  return document.documentMode
};
Blockly.mixColoursWithForegroundOpacity = function(foregroundColor, backgroundColor, foregroundOpacity) {
  var foregroundRGB = goog.color.hexToRgb(foregroundColor);
  var backgroundRGB = goog.color.hexToRgb(backgroundColor);
  var resultRed = Math.round(backgroundRGB[0] * (1 - foregroundOpacity) + foregroundRGB[0] * foregroundOpacity);
  var resultGreen = Math.round(backgroundRGB[1] * (1 - foregroundOpacity) + foregroundRGB[1] * foregroundOpacity);
  var resultBlue = Math.round(backgroundRGB[2] * (1 - foregroundOpacity) + foregroundRGB[2] * foregroundOpacity);
  return goog.color.rgbToHex(resultRed, resultGreen, resultBlue)
};
Blockly.printerRangeToNumbers = function(rangeString) {
  var rangeStringNoSpaces = rangeString.replace(/ /g, "");
  var rangeItems = rangeStringNoSpaces.split(",");
  var fullNumberList = [];
  var rangeRegexp = /^(\d+)\-(\d+)$/;
  var numberRegexp = /^(\d+)$/;
  for(var i = 0;i < rangeItems.length;i++) {
    var numberOrRange = rangeItems[i];
    var rangeResult = rangeRegexp.exec(numberOrRange);
    var numberResult = numberRegexp.exec(numberOrRange);
    if(rangeResult) {
      var lowerRange = Number(rangeResult[1]);
      var upperNonInclusive = Number(rangeResult[2]) + 1;
      var rangeArray = goog.array.range(lowerRange, upperNonInclusive);
      fullNumberList = fullNumberList.concat(rangeArray)
    }else {
      if(numberResult) {
        fullNumberList.push(Number(numberResult[1]))
      }
    }
  }
  return fullNumberList
};
goog.provide("Blockly.FieldCheckbox");
goog.require("Blockly.Field");
Blockly.FieldCheckbox = function(state, opt_changeHandler) {
  Blockly.FieldCheckbox.superClass_.constructor.call(this, "");
  this.changeHandler_ = opt_changeHandler;
  this.checkElement_ = Blockly.createSvgElement("text", {"class":"blocklyText", "x":-3}, this.fieldGroup_);
  var textNode = document.createTextNode("\u2713");
  this.checkElement_.appendChild(textNode);
  this.setValue(state)
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);
Blockly.FieldCheckbox.prototype.CURSOR = "default";
Blockly.FieldCheckbox.prototype.getValue = function() {
  return String(this.state_).toUpperCase()
};
Blockly.FieldCheckbox.prototype.setValue = function(strBool) {
  var newState = strBool == "TRUE";
  if(this.state_ !== newState) {
    this.state_ = newState;
    this.checkElement_.style.display = newState ? "block" : "none";
    if(this.sourceBlock_ && this.sourceBlock_.rendered) {
      this.sourceBlock_.workspace.fireChangeEvent()
    }
  }
};
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if(this.changeHandler_) {
    var override = this.changeHandler_(newState);
    if(override !== undefined) {
      newState = override
    }
  }
  if(newState !== null) {
    this.setValue(String(newState).toUpperCase())
  }
};
goog.provide("Blockly.FieldImageDropdown");
goog.require("Blockly.Field");
goog.require("Blockly.FieldRectangularDropdown");
goog.require("Blockly.ImageDimensionCache");
Blockly.FieldImageDropdown = function(choices, width, height) {
  this.width_ = width;
  this.height_ = height;
  Blockly.FieldImageDropdown.superClass_.constructor.call(this, choices);
  if(this.hasForcedDimensions_()) {
    this.updateDimensions_(this.width_, this.height_)
  }
};
goog.inherits(Blockly.FieldImageDropdown, Blockly.FieldRectangularDropdown);
Blockly.FieldImageDropdown.prototype.hasForcedDimensions_ = function() {
  return!!this.width_
};
Blockly.FieldImageDropdown.prototype.addPreviewElementTo_ = function(parentElement) {
  this.previewElement_ = Blockly.createSvgElement("image", {"height":Blockly.FieldImage.IMAGE_LOADING_HEIGHT + "px", "width":Blockly.FieldImage.IMAGE_LOADING_WIDTH + "px", "y":Blockly.FieldImage.IMAGE_OFFSET_Y, "preserveAspectRatio":"xMidYMid slice"}, parentElement)
};
Blockly.FieldImageDropdown.prototype.updatePreviewData_ = function(previewData) {
  this.previewElement_.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", previewData);
  if(this.hasForcedDimensions_()) {
    return
  }
  this.getUpdatedDimensions_(previewData)
};
Blockly.FieldImageDropdown.prototype.createDropdownPreviewElement_ = function(imagePath) {
  if(this.hasForcedDimensions_()) {
    return this.createAutoSizedDropdownPreviewElement_(imagePath, this.width_, this.height_)
  }
  return this.createImageDropdownPreviewElement_(imagePath)
};
Blockly.FieldImageDropdown.prototype.createAutoSizedDropdownPreviewElement_ = function(imagePath, width, height) {
  var dropdownPreviewElement = document.createElement("div");
  dropdownPreviewElement.style.backgroundImage = "url('" + imagePath + "')";
  dropdownPreviewElement.style.backgroundSize = "cover";
  dropdownPreviewElement.style.backgroundRepeat = "no-repeat";
  dropdownPreviewElement.style.backgroundPosition = "50% 50%";
  dropdownPreviewElement.style.width = width + "px";
  dropdownPreviewElement.style.height = height + "px";
  return dropdownPreviewElement
};
Blockly.FieldImageDropdown.prototype.createImageDropdownPreviewElement_ = function(imagePath) {
  var dropdownPreviewElement = document.createElement("img");
  dropdownPreviewElement.setAttribute("src", imagePath);
  return dropdownPreviewElement
};
Blockly.FieldImageDropdown.prototype.getUpdatedDimensions_ = function(src) {
  var self = this;
  var dimensions = Blockly.ImageDimensionCache.getCachedDimensionsOrDefaultAndUpdate(src, function(width, height) {
    self.updateDimensions_(width, height)
  });
  this.updateDimensions_(dimensions.width, dimensions.height)
};
Blockly.FieldImageDropdown.prototype.updatePreviewDimensions_ = function(previewWidth, previewHeight) {
  this.previewElement_.setAttribute("width", previewWidth + "px");
  this.previewElement_.setAttribute("height", previewHeight + "px")
};
goog.provide("goog.ui.SelectionModel");
goog.require("goog.array");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.ui.SelectionModel = function(opt_items) {
  goog.events.EventTarget.call(this);
  this.items_ = [];
  this.addItems(opt_items)
};
goog.inherits(goog.ui.SelectionModel, goog.events.EventTarget);
goog.ui.SelectionModel.prototype.selectedItem_ = null;
goog.ui.SelectionModel.prototype.selectionHandler_ = null;
goog.ui.SelectionModel.prototype.getSelectionHandler = function() {
  return this.selectionHandler_
};
goog.ui.SelectionModel.prototype.setSelectionHandler = function(handler) {
  this.selectionHandler_ = handler
};
goog.ui.SelectionModel.prototype.getItemCount = function() {
  return this.items_.length
};
goog.ui.SelectionModel.prototype.indexOfItem = function(item) {
  return item ? goog.array.indexOf(this.items_, item) : -1
};
goog.ui.SelectionModel.prototype.getFirst = function() {
  return this.items_[0]
};
goog.ui.SelectionModel.prototype.getLast = function() {
  return this.items_[this.items_.length - 1]
};
goog.ui.SelectionModel.prototype.getItemAt = function(index) {
  return this.items_[index] || null
};
goog.ui.SelectionModel.prototype.addItems = function(items) {
  if(items) {
    goog.array.forEach(items, function(item) {
      this.selectItem_(item, false)
    }, this);
    goog.array.extend(this.items_, items)
  }
};
goog.ui.SelectionModel.prototype.addItem = function(item) {
  this.addItemAt(item, this.getItemCount())
};
goog.ui.SelectionModel.prototype.addItemAt = function(item, index) {
  if(item) {
    this.selectItem_(item, false);
    goog.array.insertAt(this.items_, item, index)
  }
};
goog.ui.SelectionModel.prototype.removeItem = function(item) {
  if(item && goog.array.remove(this.items_, item)) {
    if(item == this.selectedItem_) {
      this.selectedItem_ = null;
      this.dispatchEvent(goog.events.EventType.SELECT)
    }
  }
};
goog.ui.SelectionModel.prototype.removeItemAt = function(index) {
  this.removeItem(this.getItemAt(index))
};
goog.ui.SelectionModel.prototype.getSelectedItem = function() {
  return this.selectedItem_
};
goog.ui.SelectionModel.prototype.getItems = function() {
  return goog.array.clone(this.items_)
};
goog.ui.SelectionModel.prototype.setSelectedItem = function(item) {
  if(item != this.selectedItem_) {
    this.selectItem_(this.selectedItem_, false);
    this.selectedItem_ = item;
    this.selectItem_(item, true)
  }
  this.dispatchEvent(goog.events.EventType.SELECT)
};
goog.ui.SelectionModel.prototype.getSelectedIndex = function() {
  return this.indexOfItem(this.selectedItem_)
};
goog.ui.SelectionModel.prototype.setSelectedIndex = function(index) {
  this.setSelectedItem(this.getItemAt(index))
};
goog.ui.SelectionModel.prototype.clear = function() {
  goog.array.clear(this.items_);
  this.selectedItem_ = null
};
goog.ui.SelectionModel.prototype.disposeInternal = function() {
  goog.ui.SelectionModel.superClass_.disposeInternal.call(this);
  delete this.items_;
  this.selectedItem_ = null
};
goog.ui.SelectionModel.prototype.selectItem_ = function(item, select) {
  if(item) {
    if(typeof this.selectionHandler_ == "function") {
      this.selectionHandler_(item, select)
    }else {
      if(typeof item.setSelected == "function") {
        item.setSelected(select)
      }
    }
  }
};
goog.provide("goog.dom.TagIterator");
goog.provide("goog.dom.TagWalkType");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.dom.TagWalkType = {START_TAG:1, OTHER:0, END_TAG:-1};
goog.dom.TagIterator = function(opt_node, opt_reversed, opt_unconstrained, opt_tagType, opt_depth) {
  this.reversed = !!opt_reversed;
  if(opt_node) {
    this.setPosition(opt_node, opt_tagType)
  }
  this.depth = opt_depth != undefined ? opt_depth : this.tagType || 0;
  if(this.reversed) {
    this.depth *= -1
  }
  this.constrained = !opt_unconstrained
};
goog.inherits(goog.dom.TagIterator, goog.iter.Iterator);
goog.dom.TagIterator.prototype.node = null;
goog.dom.TagIterator.prototype.tagType = goog.dom.TagWalkType.OTHER;
goog.dom.TagIterator.prototype.depth;
goog.dom.TagIterator.prototype.reversed;
goog.dom.TagIterator.prototype.constrained;
goog.dom.TagIterator.prototype.started_ = false;
goog.dom.TagIterator.prototype.setPosition = function(node, opt_tagType, opt_depth) {
  this.node = node;
  if(node) {
    if(goog.isNumber(opt_tagType)) {
      this.tagType = opt_tagType
    }else {
      this.tagType = this.node.nodeType != goog.dom.NodeType.ELEMENT ? goog.dom.TagWalkType.OTHER : this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG
    }
  }
  if(goog.isNumber(opt_depth)) {
    this.depth = opt_depth
  }
};
goog.dom.TagIterator.prototype.copyFrom = function(other) {
  this.node = other.node;
  this.tagType = other.tagType;
  this.depth = other.depth;
  this.reversed = other.reversed;
  this.constrained = other.constrained
};
goog.dom.TagIterator.prototype.clone = function() {
  return new goog.dom.TagIterator(this.node, this.reversed, !this.constrained, this.tagType, this.depth)
};
goog.dom.TagIterator.prototype.skipTag = function() {
  var check = this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG;
  if(this.tagType == check) {
    this.tagType = (check * -1);
    this.depth += this.tagType * (this.reversed ? -1 : 1)
  }
};
goog.dom.TagIterator.prototype.restartTag = function() {
  var check = this.reversed ? goog.dom.TagWalkType.START_TAG : goog.dom.TagWalkType.END_TAG;
  if(this.tagType == check) {
    this.tagType = (check * -1);
    this.depth += this.tagType * (this.reversed ? -1 : 1)
  }
};
goog.dom.TagIterator.prototype.next = function() {
  var node;
  if(this.started_) {
    if(!this.node || this.constrained && this.depth == 0) {
      throw goog.iter.StopIteration;
    }
    node = this.node;
    var startType = this.reversed ? goog.dom.TagWalkType.END_TAG : goog.dom.TagWalkType.START_TAG;
    if(this.tagType == startType) {
      var child = this.reversed ? node.lastChild : node.firstChild;
      if(child) {
        this.setPosition(child)
      }else {
        this.setPosition(node, (startType * -1))
      }
    }else {
      var sibling = this.reversed ? node.previousSibling : node.nextSibling;
      if(sibling) {
        this.setPosition(sibling)
      }else {
        this.setPosition(node.parentNode, (startType * -1))
      }
    }
    this.depth += this.tagType * (this.reversed ? -1 : 1)
  }else {
    this.started_ = true
  }
  node = this.node;
  if(!this.node) {
    throw goog.iter.StopIteration;
  }
  return node
};
goog.dom.TagIterator.prototype.isStarted = function() {
  return this.started_
};
goog.dom.TagIterator.prototype.isStartTag = function() {
  return this.tagType == goog.dom.TagWalkType.START_TAG
};
goog.dom.TagIterator.prototype.isEndTag = function() {
  return this.tagType == goog.dom.TagWalkType.END_TAG
};
goog.dom.TagIterator.prototype.isNonElement = function() {
  return this.tagType == goog.dom.TagWalkType.OTHER
};
goog.dom.TagIterator.prototype.equals = function(other) {
  return other.node == this.node && (!this.node || other.tagType == this.tagType)
};
goog.dom.TagIterator.prototype.splice = function(var_args) {
  var node = this.node;
  this.restartTag();
  this.reversed = !this.reversed;
  goog.dom.TagIterator.prototype.next.call(this);
  this.reversed = !this.reversed;
  var arr = goog.isArrayLike(arguments[0]) ? arguments[0] : arguments;
  for(var i = arr.length - 1;i >= 0;i--) {
    goog.dom.insertSiblingAfter(arr[i], node)
  }
  goog.dom.removeNode(node)
};
goog.provide("goog.dom.NodeIterator");
goog.require("goog.dom.TagIterator");
goog.dom.NodeIterator = function(opt_node, opt_reversed, opt_unconstrained, opt_depth) {
  goog.dom.TagIterator.call(this, opt_node, opt_reversed, opt_unconstrained, null, opt_depth)
};
goog.inherits(goog.dom.NodeIterator, goog.dom.TagIterator);
goog.dom.NodeIterator.prototype.next = function() {
  do {
    goog.dom.NodeIterator.superClass_.next.call(this)
  }while(this.isEndTag());
  return this.node
};
goog.provide("goog.ui.PaletteRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.NodeIterator");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classlist");
goog.require("goog.iter");
goog.require("goog.style");
goog.require("goog.ui.ControlRenderer");
goog.require("goog.userAgent");
goog.ui.PaletteRenderer = function() {
  goog.ui.ControlRenderer.call(this)
};
goog.inherits(goog.ui.PaletteRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.PaletteRenderer);
goog.ui.PaletteRenderer.cellId_ = 0;
goog.ui.PaletteRenderer.CSS_CLASS = goog.getCssName("goog-palette");
goog.ui.PaletteRenderer.prototype.createDom = function(palette) {
  var classNames = this.getClassNames(palette);
  var element = palette.getDomHelper().createDom(goog.dom.TagName.DIV, classNames ? classNames.join(" ") : null, this.createGrid((palette.getContent()), palette.getSize(), palette.getDomHelper()));
  goog.a11y.aria.setRole(element, goog.a11y.aria.Role.GRID);
  return element
};
goog.ui.PaletteRenderer.prototype.createGrid = function(items, size, dom) {
  var rows = [];
  for(var row = 0, index = 0;row < size.height;row++) {
    var cells = [];
    for(var column = 0;column < size.width;column++) {
      var item = items && items[index++];
      cells.push(this.createCell(item, dom))
    }
    rows.push(this.createRow(cells, dom))
  }
  return this.createTable(rows, dom)
};
goog.ui.PaletteRenderer.prototype.createTable = function(rows, dom) {
  var table = dom.createDom(goog.dom.TagName.TABLE, goog.getCssName(this.getCssClass(), "table"), dom.createDom(goog.dom.TagName.TBODY, goog.getCssName(this.getCssClass(), "body"), rows));
  table.cellSpacing = 0;
  table.cellPadding = 0;
  return table
};
goog.ui.PaletteRenderer.prototype.createRow = function(cells, dom) {
  var row = dom.createDom(goog.dom.TagName.TR, goog.getCssName(this.getCssClass(), "row"), cells);
  goog.a11y.aria.setRole(row, goog.a11y.aria.Role.ROW);
  return row
};
goog.ui.PaletteRenderer.prototype.createCell = function(node, dom) {
  var cell = dom.createDom(goog.dom.TagName.TD, {"class":goog.getCssName(this.getCssClass(), "cell"), "id":goog.getCssName(this.getCssClass(), "cell-") + goog.ui.PaletteRenderer.cellId_++}, node);
  goog.a11y.aria.setRole(cell, goog.a11y.aria.Role.GRIDCELL);
  goog.a11y.aria.setState(cell, goog.a11y.aria.State.SELECTED, false);
  if(!goog.dom.getTextContent(cell) && !goog.a11y.aria.getLabel(cell)) {
    var ariaLabelForCell = this.findAriaLabelForCell_(cell);
    if(ariaLabelForCell) {
      goog.a11y.aria.setLabel(cell, ariaLabelForCell)
    }
  }
  return cell
};
goog.ui.PaletteRenderer.prototype.findAriaLabelForCell_ = function(cell) {
  var iter = new goog.dom.NodeIterator(cell);
  var label = "";
  var node;
  while(!label && (node = goog.iter.nextOrValue(iter, null))) {
    if(node.nodeType == goog.dom.NodeType.ELEMENT) {
      label = goog.a11y.aria.getLabel((node)) || node.title
    }
  }
  return label
};
goog.ui.PaletteRenderer.prototype.canDecorate = function(element) {
  return false
};
goog.ui.PaletteRenderer.prototype.decorate = function(palette, element) {
  return null
};
goog.ui.PaletteRenderer.prototype.setContent = function(element, content) {
  var items = (content);
  if(element) {
    var tbody = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.TBODY, goog.getCssName(this.getCssClass(), "body"), element)[0];
    if(tbody) {
      var index = 0;
      goog.array.forEach(tbody.rows, function(row) {
        goog.array.forEach(row.cells, function(cell) {
          goog.dom.removeChildren(cell);
          if(items) {
            var item = items[index++];
            if(item) {
              goog.dom.appendChild(cell, item)
            }
          }
        })
      });
      if(index < items.length) {
        var cells = [];
        var dom = goog.dom.getDomHelper(element);
        var width = tbody.rows[0].cells.length;
        while(index < items.length) {
          var item = items[index++];
          cells.push(this.createCell(item, dom));
          if(cells.length == width) {
            var row = this.createRow(cells, dom);
            goog.dom.appendChild(tbody, row);
            cells.length = 0
          }
        }
        if(cells.length > 0) {
          while(cells.length < width) {
            cells.push(this.createCell("", dom))
          }
          var row = this.createRow(cells, dom);
          goog.dom.appendChild(tbody, row)
        }
      }
    }
    goog.style.setUnselectable(element, true, goog.userAgent.GECKO)
  }
};
goog.ui.PaletteRenderer.prototype.getContainingItem = function(palette, node) {
  var root = palette.getElement();
  while(node && (node.nodeType == goog.dom.NodeType.ELEMENT && node != root)) {
    if(node.tagName == goog.dom.TagName.TD && goog.dom.classlist.contains((node), goog.getCssName(this.getCssClass(), "cell"))) {
      return node.firstChild
    }
    node = node.parentNode
  }
  return null
};
goog.ui.PaletteRenderer.prototype.highlightCell = function(palette, node, highlight) {
  if(node) {
    var cell = this.getCellForItem(node);
    goog.dom.classlist.enable(cell, goog.getCssName(this.getCssClass(), "cell-hover"), highlight);
    goog.a11y.aria.setState(palette.getElementStrict(), goog.a11y.aria.State.ACTIVEDESCENDANT, cell.id)
  }
};
goog.ui.PaletteRenderer.prototype.getCellForItem = function(node) {
  return(node ? node.parentNode : null)
};
goog.ui.PaletteRenderer.prototype.selectCell = function(palette, node, select) {
  if(node) {
    var cell = (node.parentNode);
    goog.dom.classlist.enable(cell, goog.getCssName(this.getCssClass(), "cell-selected"), select);
    goog.a11y.aria.setState(cell, goog.a11y.aria.State.SELECTED, select)
  }
};
goog.ui.PaletteRenderer.prototype.getCssClass = function() {
  return goog.ui.PaletteRenderer.CSS_CLASS
};
goog.provide("goog.ui.Palette");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.math.Size");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.PaletteRenderer");
goog.require("goog.ui.SelectionModel");
goog.ui.Palette = function(items, opt_renderer, opt_domHelper) {
  goog.ui.Palette.base(this, "constructor", items, opt_renderer || goog.ui.PaletteRenderer.getInstance(), opt_domHelper);
  this.setAutoStates(goog.ui.Component.State.CHECKED | goog.ui.Component.State.SELECTED | goog.ui.Component.State.OPENED, false);
  this.currentCellControl_ = new goog.ui.Palette.CurrentCell_;
  this.currentCellControl_.setParentEventTarget(this);
  this.lastHighlightedIndex_ = -1
};
goog.inherits(goog.ui.Palette, goog.ui.Control);
goog.ui.Palette.EventType = {AFTER_HIGHLIGHT:goog.events.getUniqueId("afterhighlight")};
goog.ui.Palette.prototype.size_ = null;
goog.ui.Palette.prototype.highlightedIndex_ = -1;
goog.ui.Palette.prototype.selectionModel_ = null;
goog.ui.Palette.prototype.disposeInternal = function() {
  goog.ui.Palette.superClass_.disposeInternal.call(this);
  if(this.selectionModel_) {
    this.selectionModel_.dispose();
    this.selectionModel_ = null
  }
  this.size_ = null;
  this.currentCellControl_.dispose()
};
goog.ui.Palette.prototype.setContentInternal = function(content) {
  var items = (content);
  goog.ui.Palette.superClass_.setContentInternal.call(this, items);
  this.adjustSize_();
  if(this.selectionModel_) {
    this.selectionModel_.clear();
    this.selectionModel_.addItems(items)
  }else {
    this.selectionModel_ = new goog.ui.SelectionModel(items);
    this.selectionModel_.setSelectionHandler(goog.bind(this.selectItem_, this));
    this.getHandler().listen(this.selectionModel_, goog.events.EventType.SELECT, this.handleSelectionChange)
  }
  this.highlightedIndex_ = -1
};
goog.ui.Palette.prototype.getCaption = function() {
  return""
};
goog.ui.Palette.prototype.setCaption = function(caption) {
};
goog.ui.Palette.prototype.handleMouseOver = function(e) {
  goog.ui.Palette.superClass_.handleMouseOver.call(this, e);
  var item = this.getRenderer().getContainingItem(this, e.target);
  if(item && (e.relatedTarget && goog.dom.contains(item, e.relatedTarget))) {
    return
  }
  if(item != this.getHighlightedItem()) {
    this.setHighlightedItem(item)
  }
};
goog.ui.Palette.prototype.handleMouseDown = function(e) {
  goog.ui.Palette.superClass_.handleMouseDown.call(this, e);
  if(this.isActive()) {
    var item = this.getRenderer().getContainingItem(this, e.target);
    if(item != this.getHighlightedItem()) {
      this.setHighlightedItem(item)
    }
  }
};
goog.ui.Palette.prototype.performActionInternal = function(e) {
  var item = this.getHighlightedItem();
  if(item) {
    this.setSelectedItem(item);
    return goog.ui.Palette.base(this, "performActionInternal", e)
  }
  return false
};
goog.ui.Palette.prototype.handleKeyEvent = function(e) {
  var items = this.getContent();
  var numItems = items ? items.length : 0;
  var numColumns = this.size_.width;
  if(numItems == 0 || !this.isEnabled()) {
    return false
  }
  if(e.keyCode == goog.events.KeyCodes.ENTER || e.keyCode == goog.events.KeyCodes.SPACE) {
    return this.performActionInternal(e)
  }
  if(e.keyCode == goog.events.KeyCodes.HOME) {
    this.setHighlightedIndex(0);
    return true
  }else {
    if(e.keyCode == goog.events.KeyCodes.END) {
      this.setHighlightedIndex(numItems - 1);
      return true
    }
  }
  var highlightedIndex = this.highlightedIndex_ < 0 ? this.getSelectedIndex() : this.highlightedIndex_;
  switch(e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      if(highlightedIndex == -1 || highlightedIndex == 0) {
        highlightedIndex = numItems
      }
      this.setHighlightedIndex(highlightedIndex - 1);
      e.preventDefault();
      return true;
      break;
    case goog.events.KeyCodes.RIGHT:
      if(highlightedIndex == numItems - 1) {
        highlightedIndex = -1
      }
      this.setHighlightedIndex(highlightedIndex + 1);
      e.preventDefault();
      return true;
      break;
    case goog.events.KeyCodes.UP:
      if(highlightedIndex == -1) {
        highlightedIndex = numItems + numColumns - 1
      }
      if(highlightedIndex >= numColumns) {
        this.setHighlightedIndex(highlightedIndex - numColumns);
        e.preventDefault();
        return true
      }
      break;
    case goog.events.KeyCodes.DOWN:
      if(highlightedIndex == -1) {
        highlightedIndex = -numColumns
      }
      if(highlightedIndex < numItems - numColumns) {
        this.setHighlightedIndex(highlightedIndex + numColumns);
        e.preventDefault();
        return true
      }
      break
  }
  return false
};
goog.ui.Palette.prototype.handleSelectionChange = function(e) {
};
goog.ui.Palette.prototype.getSize = function() {
  return this.size_
};
goog.ui.Palette.prototype.setSize = function(size, opt_rows) {
  if(this.getElement()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.size_ = goog.isNumber(size) ? new goog.math.Size(size, (opt_rows)) : size;
  this.adjustSize_()
};
goog.ui.Palette.prototype.getHighlightedIndex = function() {
  return this.highlightedIndex_
};
goog.ui.Palette.prototype.getHighlightedItem = function() {
  var items = this.getContent();
  return items && items[this.highlightedIndex_]
};
goog.ui.Palette.prototype.getHighlightedCellElement_ = function() {
  return this.getRenderer().getCellForItem(this.getHighlightedItem())
};
goog.ui.Palette.prototype.setHighlightedIndex = function(index) {
  if(index != this.highlightedIndex_) {
    this.highlightIndex_(this.highlightedIndex_, false);
    this.lastHighlightedIndex_ = this.highlightedIndex_;
    this.highlightedIndex_ = index;
    this.highlightIndex_(index, true);
    this.dispatchEvent(goog.ui.Palette.EventType.AFTER_HIGHLIGHT)
  }
};
goog.ui.Palette.prototype.setHighlightedItem = function(item) {
  var items = (this.getContent());
  this.setHighlightedIndex(items ? goog.array.indexOf(items, item) : -1)
};
goog.ui.Palette.prototype.getSelectedIndex = function() {
  return this.selectionModel_ ? this.selectionModel_.getSelectedIndex() : -1
};
goog.ui.Palette.prototype.getSelectedItem = function() {
  return this.selectionModel_ ? (this.selectionModel_.getSelectedItem()) : null
};
goog.ui.Palette.prototype.setSelectedIndex = function(index) {
  if(this.selectionModel_) {
    this.selectionModel_.setSelectedIndex(index)
  }
};
goog.ui.Palette.prototype.setSelectedItem = function(item) {
  if(this.selectionModel_) {
    this.selectionModel_.setSelectedItem(item)
  }
};
goog.ui.Palette.prototype.highlightIndex_ = function(index, highlight) {
  if(this.getElement()) {
    var items = this.getContent();
    if(items && (index >= 0 && index < items.length)) {
      var cellEl = this.getHighlightedCellElement_();
      if(this.currentCellControl_.getElement() != cellEl) {
        this.currentCellControl_.setElementInternal(cellEl)
      }
      if(this.currentCellControl_.tryHighlight(highlight)) {
        this.getRenderer().highlightCell(this, items[index], highlight)
      }
    }
  }
};
goog.ui.Palette.prototype.setHighlighted = function(highlight) {
  goog.ui.Palette.base(this, "setHighlighted", highlight);
  if(highlight && this.highlightedIndex_ == -1) {
    this.setHighlightedIndex(this.lastHighlightedIndex_ > -1 ? this.lastHighlightedIndex_ : 0)
  }else {
    if(!highlight) {
      this.setHighlightedIndex(-1)
    }
  }
};
goog.ui.Palette.prototype.selectItem_ = function(item, select) {
  if(this.getElement()) {
    this.getRenderer().selectCell(this, item, select)
  }
};
goog.ui.Palette.prototype.adjustSize_ = function() {
  var items = this.getContent();
  if(items) {
    if(this.size_ && this.size_.width) {
      var minRows = Math.ceil(items.length / this.size_.width);
      if(!goog.isNumber(this.size_.height) || this.size_.height < minRows) {
        this.size_.height = minRows
      }
    }else {
      var length = Math.ceil(Math.sqrt(items.length));
      this.size_ = new goog.math.Size(length, length)
    }
  }else {
    this.size_ = new goog.math.Size(0, 0)
  }
};
goog.ui.Palette.CurrentCell_ = function() {
  goog.ui.Palette.CurrentCell_.base(this, "constructor", null);
  this.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true)
};
goog.inherits(goog.ui.Palette.CurrentCell_, goog.ui.Control);
goog.ui.Palette.CurrentCell_.prototype.tryHighlight = function(highlight) {
  this.setHighlighted(highlight);
  return this.isHighlighted() == highlight
};
goog.provide("goog.ui.ColorPalette");
goog.require("goog.array");
goog.require("goog.color");
goog.require("goog.style");
goog.require("goog.ui.Palette");
goog.require("goog.ui.PaletteRenderer");
goog.ui.ColorPalette = function(opt_colors, opt_renderer, opt_domHelper) {
  this.colors_ = opt_colors || [];
  goog.ui.Palette.call(this, null, opt_renderer || goog.ui.PaletteRenderer.getInstance(), opt_domHelper);
  this.setColors(this.colors_)
};
goog.inherits(goog.ui.ColorPalette, goog.ui.Palette);
goog.ui.ColorPalette.prototype.normalizedColors_ = null;
goog.ui.ColorPalette.prototype.labels_ = null;
goog.ui.ColorPalette.prototype.getColors = function() {
  return this.colors_
};
goog.ui.ColorPalette.prototype.setColors = function(colors, opt_labels) {
  this.colors_ = colors;
  this.labels_ = opt_labels || null;
  this.normalizedColors_ = null;
  this.setContent(this.createColorNodes())
};
goog.ui.ColorPalette.prototype.getSelectedColor = function() {
  var selectedItem = (this.getSelectedItem());
  if(selectedItem) {
    var color = goog.style.getStyle(selectedItem, "background-color");
    return goog.ui.ColorPalette.parseColor_(color)
  }else {
    return null
  }
};
goog.ui.ColorPalette.prototype.setSelectedColor = function(color) {
  var hexColor = goog.ui.ColorPalette.parseColor_(color);
  if(!this.normalizedColors_) {
    this.normalizedColors_ = goog.array.map(this.colors_, function(color) {
      return goog.ui.ColorPalette.parseColor_(color)
    })
  }
  this.setSelectedIndex(hexColor ? goog.array.indexOf(this.normalizedColors_, hexColor) : -1)
};
goog.ui.ColorPalette.prototype.createColorNodes = function() {
  return goog.array.map(this.colors_, function(color, index) {
    var swatch = this.getDomHelper().createDom("div", {"class":goog.getCssName(this.getRenderer().getCssClass(), "colorswatch"), "style":"background-color:" + color});
    if(this.labels_ && this.labels_[index]) {
      swatch.title = this.labels_[index]
    }else {
      swatch.title = color.charAt(0) == "#" ? "RGB (" + goog.color.hexToRgb(color).join(", ") + ")" : color
    }
    return swatch
  }, this)
};
goog.ui.ColorPalette.parseColor_ = function(color) {
  if(color) {
    try {
      return goog.color.parse(color).hex
    }catch(ex) {
    }
  }
  return null
};
goog.provide("goog.ui.ColorPicker");
goog.provide("goog.ui.ColorPicker.EventType");
goog.require("goog.ui.ColorPalette");
goog.require("goog.ui.Component");
goog.ui.ColorPicker = function(opt_domHelper, opt_colorPalette) {
  goog.ui.Component.call(this, opt_domHelper);
  this.colorPalette_ = opt_colorPalette || null;
  this.getHandler().listen(this, goog.ui.Component.EventType.ACTION, this.onColorPaletteAction_)
};
goog.inherits(goog.ui.ColorPicker, goog.ui.Component);
goog.ui.ColorPicker.DEFAULT_NUM_COLS = 5;
goog.ui.ColorPicker.EventType = {CHANGE:"change"};
goog.ui.ColorPicker.prototype.focusable_ = true;
goog.ui.ColorPicker.prototype.getColors = function() {
  return this.colorPalette_ ? this.colorPalette_.getColors() : null
};
goog.ui.ColorPicker.prototype.setColors = function(colors) {
  if(!this.colorPalette_) {
    this.createColorPalette_(colors)
  }else {
    this.colorPalette_.setColors(colors)
  }
};
goog.ui.ColorPicker.prototype.addColors = function(colors) {
  this.setColors(colors)
};
goog.ui.ColorPicker.prototype.setSize = function(size) {
  if(!this.colorPalette_) {
    this.createColorPalette_([])
  }
  this.colorPalette_.setSize(size)
};
goog.ui.ColorPicker.prototype.getSize = function() {
  return this.colorPalette_ ? this.colorPalette_.getSize() : null
};
goog.ui.ColorPicker.prototype.setColumnCount = function(n) {
  this.setSize(n)
};
goog.ui.ColorPicker.prototype.getSelectedIndex = function() {
  return this.colorPalette_ ? this.colorPalette_.getSelectedIndex() : -1
};
goog.ui.ColorPicker.prototype.setSelectedIndex = function(ind) {
  if(this.colorPalette_) {
    this.colorPalette_.setSelectedIndex(ind)
  }
};
goog.ui.ColorPicker.prototype.getSelectedColor = function() {
  return this.colorPalette_ ? this.colorPalette_.getSelectedColor() : null
};
goog.ui.ColorPicker.prototype.setSelectedColor = function(color) {
  if(this.colorPalette_) {
    this.colorPalette_.setSelectedColor(color)
  }
};
goog.ui.ColorPicker.prototype.isFocusable = function() {
  return this.focusable_
};
goog.ui.ColorPicker.prototype.setFocusable = function(focusable) {
  this.focusable_ = focusable;
  if(this.colorPalette_) {
    this.colorPalette_.setSupportedState(goog.ui.Component.State.FOCUSED, focusable)
  }
};
goog.ui.ColorPicker.prototype.canDecorate = function(element) {
  return false
};
goog.ui.ColorPicker.prototype.enterDocument = function() {
  goog.ui.ColorPicker.superClass_.enterDocument.call(this);
  if(this.colorPalette_) {
    this.colorPalette_.render(this.getElement())
  }
  this.getElement().unselectable = "on"
};
goog.ui.ColorPicker.prototype.disposeInternal = function() {
  goog.ui.ColorPicker.superClass_.disposeInternal.call(this);
  if(this.colorPalette_) {
    this.colorPalette_.dispose();
    this.colorPalette_ = null
  }
};
goog.ui.ColorPicker.prototype.focus = function() {
  if(this.colorPalette_) {
    this.colorPalette_.getElement().focus()
  }
};
goog.ui.ColorPicker.prototype.onColorPaletteAction_ = function(e) {
  e.stopPropagation();
  this.dispatchEvent(goog.ui.ColorPicker.EventType.CHANGE)
};
goog.ui.ColorPicker.prototype.createColorPalette_ = function(colors) {
  var cp = new goog.ui.ColorPalette(colors, null, this.getDomHelper());
  cp.setSize(goog.ui.ColorPicker.DEFAULT_NUM_COLS);
  cp.setSupportedState(goog.ui.Component.State.FOCUSED, this.focusable_);
  this.addChild(cp);
  this.colorPalette_ = cp;
  if(this.isInDocument()) {
    this.colorPalette_.render(this.getElement())
  }
};
goog.ui.ColorPicker.createSimpleColorGrid = function(opt_domHelper) {
  var cp = new goog.ui.ColorPicker(opt_domHelper);
  cp.setSize(7);
  cp.setColors(goog.ui.ColorPicker.SIMPLE_GRID_COLORS);
  return cp
};
goog.ui.ColorPicker.SIMPLE_GRID_COLORS = ["#ffffff", "#cccccc", "#c0c0c0", "#999999", "#666666", "#333333", "#000000", "#ffcccc", "#ff6666", "#ff0000", "#cc0000", "#990000", "#660000", "#330000", "#ffcc99", "#ff9966", "#ff9900", "#ff6600", "#cc6600", "#993300", "#663300", "#ffff99", "#ffff66", "#ffcc66", "#ffcc33", "#cc9933", "#996633", "#663333", "#ffffcc", "#ffff33", "#ffff00", "#ffcc00", "#999900", "#666600", "#333300", "#99ff99", "#66ff99", "#33ff33", "#33cc00", "#009900", "#006600", "#003300", 
"#99ffff", "#33ffff", "#66cccc", "#00cccc", "#339999", "#336666", "#003333", "#ccffff", "#66ffff", "#33ccff", "#3366ff", "#3333ff", "#000099", "#000066", "#ccccff", "#9999ff", "#6666cc", "#6633ff", "#6600cc", "#333399", "#330099", "#ffccff", "#ff99ff", "#cc66cc", "#cc33cc", "#993399", "#663366", "#330033"];
goog.provide("Blockly.FieldColour");
goog.require("Blockly.Field");
goog.require("goog.ui.ColorPicker");
Blockly.FieldColour = function(colour, opt_changeHandler) {
  Blockly.FieldColour.superClass_.constructor.call(this, "\u00a0\u00a0\u00a0");
  this.changeHandler_ = opt_changeHandler;
  this.borderRect_.style.fillOpacity = 1;
  this.setValue(colour)
};
goog.inherits(Blockly.FieldColour, Blockly.Field);
Blockly.FieldColour.prototype.CURSOR = "default";
Blockly.FieldColour.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldColour.superClass_.dispose.call(this)
};
Blockly.FieldColour.prototype.getValue = function() {
  return this.colour_
};
Blockly.FieldColour.prototype.setValue = function(colour) {
  this.colour_ = colour;
  this.borderRect_.style.fill = colour;
  if(this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.workspace.fireChangeEvent()
  }
};
Blockly.FieldColour.COLOURS = goog.ui.ColorPicker.SIMPLE_GRID_COLORS;
Blockly.FieldColour.COLUMNS = 7;
Blockly.FieldColour.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, Blockly.FieldColour.widgetDispose_);
  var div = Blockly.WidgetDiv.DIV;
  var picker = new goog.ui.ColorPicker;
  picker.setSize(Blockly.FieldColour.COLUMNS);
  picker.setColors(Blockly.FieldColour.COLOURS);
  picker.render(div);
  picker.setSelectedColor(this.getValue());
  var xy = Blockly.getAbsoluteXY_((this.borderRect_));
  if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
    this.borderRect_.style.display = "inline";
    var borderBBox = {x:this.borderRect_.getBBox().x, y:this.borderRect_.getBBox().y, width:this.borderRect_.scrollWidth, height:this.borderRect_.scrollHeight}
  }else {
    var borderBBox = this.borderRect_.getBBox()
  }
  if(Blockly.RTL) {
    xy.x += borderBBox.width
  }
  xy.y += borderBBox.height - 1;
  if(Blockly.RTL) {
    xy.x -= div.offsetWidth
  }
  div.style.left = xy.x + "px";
  div.style.top = xy.y + "px";
  var thisObj = this;
  Blockly.FieldColour.changeEventKey_ = goog.events.listen(picker, goog.ui.ColorPicker.EventType.CHANGE, function(event) {
    var colour = event.target.getSelectedColor() || "#000000";
    Blockly.WidgetDiv.hide();
    if(thisObj.changeHandler_) {
      var override = thisObj.changeHandler_(colour);
      if(override !== undefined) {
        colour = override
      }
    }
    if(colour !== null) {
      thisObj.setValue(colour)
    }
  })
};
Blockly.FieldColour.widgetDispose_ = function() {
  if(Blockly.FieldColour.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColour.changeEventKey_)
  }
};
goog.provide("Blockly.FieldTextInput");
goog.require("Blockly.Field");
goog.require("Blockly.Msg");
goog.require("goog.asserts");
goog.require("goog.userAgent");
Blockly.FieldTextInput = function(text, opt_changeHandler) {
  Blockly.FieldTextInput.superClass_.constructor.call(this, text);
  this.changeHandler_ = opt_changeHandler
};
goog.inherits(Blockly.FieldTextInput, Blockly.Field);
Blockly.FieldTextInput.prototype.CURSOR = "text";
Blockly.FieldTextInput.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldTextInput.superClass_.dispose.call(this)
};
Blockly.FieldTextInput.prototype.setText = function(text) {
  if(text === null) {
    return
  }
  if(this.changeHandler_) {
    var validated = this.changeHandler_(text);
    if(validated !== null && validated !== undefined) {
      text = validated
    }
  }
  Blockly.Field.prototype.setText.call(this, text)
};
Blockly.FieldTextInput.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, this.widgetDispose_());
  var div = Blockly.WidgetDiv.DIV;
  var htmlInput = goog.dom.createDom("input", "blocklyHtmlInput");
  Blockly.FieldTextInput.htmlInput_ = htmlInput;
  div.appendChild(htmlInput);
  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  this.validate_();
  this.resizeEditor_();
  htmlInput.focus();
  if(goog.userAgent.IPAD || goog.userAgent.IPHONE) {
    htmlInput.setSelectionRange(0, 9999)
  }else {
    htmlInput.select()
  }
  htmlInput.onKeyUpWrapper_ = Blockly.bindEvent_(htmlInput, "keyup", this, this.onHtmlInputChange_);
  htmlInput.onKeyPressWrapper_ = Blockly.bindEvent_(htmlInput, "keypress", this, this.onHtmlInputChange_);
  var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
  htmlInput.onWorkspaceChangeWrapper_ = Blockly.bindEvent_(workspaceSvg, "blocklyWorkspaceChange", this, this.resizeEditor_)
};
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if(e.keyCode == 13) {
    Blockly.WidgetDiv.hide()
  }else {
    if(e.keyCode == 27) {
      this.setText(htmlInput.defaultValue);
      Blockly.WidgetDiv.hide()
    }else {
      var text = htmlInput.value;
      if(text !== htmlInput.oldValue_) {
        htmlInput.oldValue_ = text;
        this.setText(text);
        this.validate_()
      }else {
        if(goog.userAgent.WEBKIT) {
          this.sourceBlock_.render()
        }
      }
    }
  }
};
Blockly.FieldTextInput.prototype.validate_ = function() {
  var valid = true;
  goog.asserts.assertObject(Blockly.FieldTextInput.htmlInput_);
  var htmlInput = (Blockly.FieldTextInput.htmlInput_);
  if(this.changeHandler_) {
    valid = this.changeHandler_(htmlInput.value)
  }
  if(valid === null) {
    Blockly.addClass_(htmlInput, "blocklyInvalidInput")
  }else {
    Blockly.removeClass_(htmlInput, "blocklyInvalidInput")
  }
};
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
    this.fieldGroup_.style.display = "inline";
    var bBox = {x:this.fieldGroup_.getBBox().x, y:this.fieldGroup_.getBBox().y, width:this.fieldGroup_.scrollWidth, height:this.fieldGroup_.scrollHeight}
  }else {
    var bBox = this.fieldGroup_.getBBox()
  }
  div.style.width = bBox.width + "px";
  var xy = Blockly.getAbsoluteXY_((this.borderRect_));
  if(Blockly.RTL) {
    if(navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0) {
      this.borderRect_.style.display = "inline";
      var borderBBox = {x:this.borderRect_.getBBox().x, y:this.borderRect_.getBBox().y, width:this.borderRect_.scrollWidth, height:this.borderRect_.scrollHeight}
    }else {
      var borderBBox = this.borderRect_.getBBox()
    }
    xy.x += borderBBox.width;
    xy.x -= div.offsetWidth
  }
  xy.y += 1;
  if(goog.userAgent.WEBKIT) {
    xy.y -= 3
  }
  div.style.left = xy.x + "px";
  div.style.top = xy.y + "px"
};
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    var text = htmlInput.value;
    if(thisField.changeHandler_) {
      text = thisField.changeHandler_(text);
      if(text === null) {
        text = htmlInput.defaultValue
      }
    }
    thisField.setText(text);
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
    Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
    Blockly.FieldTextInput.htmlInput_ = null;
    Blockly.WidgetDiv.DIV.style.width = "auto"
  }
};
Blockly.FieldTextInput.prototype.isKeyboardInputField_ = function() {
  return true
};
Blockly.FieldTextInput.numberValidator = function(text) {
  text = text || "";
  text = text.replace(/O/ig, "0");
  text = text.replace(/,/g, "");
  var n = parseFloat(text || 0);
  return isNaN(n) ? null : String(n)
};
Blockly.FieldTextInput.nonnegativeIntegerValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if(n) {
    n = String(Math.max(0, Math.floor(n)))
  }
  return n
};
goog.provide("Blockly.CodeGenerator");
goog.provide("Blockly.Generator");
goog.require("Blockly.Block");
Blockly.Generator = {};
Blockly.Generator.NAME_TYPE = "generated_function";
Blockly.Generator.languages = {};
Blockly.Generator.get = function(name) {
  if(!(name in Blockly.Generator.languages)) {
    var generator = new Blockly.CodeGenerator(name);
    Blockly.Generator.languages[name] = generator
  }
  return Blockly.Generator.languages[name]
};
Blockly.Generator.blocksToCode = function(name, blocks) {
  var code = [];
  var generator = Blockly.Generator.get(name);
  generator.init();
  for(var x = 0, block;block = blocks[x];x++) {
    var line = generator.blockToCode(block);
    if(line instanceof Array) {
      line = line[0]
    }
    if(line) {
      if(block.outputConnection && generator.scrubNakedValue) {
        line = generator.scrubNakedValue(line)
      }
      code.push(line)
    }
  }
  code = code.join("\n");
  code = generator.finish(code);
  code = code.replace(/^\s+\n/, "");
  code = code.replace(/\n\s+$/, "\n");
  code = code.replace(/[ \t]+\n/g, "\n");
  return code
};
Blockly.Generator.workspaceToCode = function(name, type) {
  var blocksToGenerate = [];
  if(type) {
    var blocks = Blockly.mainWorkspace.getTopBlocks(true);
    for(var x = 0, block;block = blocks[x];x++) {
      if(type && block.type != type) {
        continue
      }
      blocksToGenerate.push(block)
    }
  }else {
    blocksToGenerate = Blockly.mainWorkspace.getTopBlocks(true)
  }
  return Blockly.Generator.blocksToCode(name, blocksToGenerate)
};
Blockly.Generator.prefixLines = function(text, prefix) {
  return prefix + text.replace(/\n(.)/g, "\n" + prefix + "$1")
};
Blockly.Generator.allNestedComments = function(block) {
  var comments = [];
  var blocks = block.getDescendants();
  for(var x = 0;x < blocks.length;x++) {
    var comment = blocks[x].getCommentText();
    if(comment) {
      comments.push(comment)
    }
  }
  if(comments.length) {
    comments.push("")
  }
  return comments.join("\n")
};
Blockly.CodeGenerator = function(name) {
  this.name_ = name;
  this.RESERVED_WORDS_ = ""
};
Blockly.CodeGenerator.prototype.blockToCode = function(block) {
  if(!block) {
    return""
  }
  if(block.disabled) {
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    return this.blockToCode(nextBlock)
  }
  var func = this[block.type];
  if(!func) {
    throw'Language "' + this.name_ + '" does not know how to generate code ' + 'for block type "' + block.type + '".';
  }
  var code = func.call(block);
  if(code instanceof Array) {
    return[this.scrub_(block, code[0]), code[1]]
  }else {
    return this.scrub_(block, code)
  }
};
Blockly.CodeGenerator.prototype.valueToCode = function(block, name, order) {
  if(isNaN(order)) {
    throw'Expecting valid order from block "' + block.type + '".';
  }
  var targetBlock = block.getInputTargetBlock(name);
  if(!targetBlock) {
    return""
  }
  var tuple = this.blockToCode(targetBlock);
  if(tuple === "") {
    return""
  }
  if(!(tuple instanceof Array)) {
    throw'Expecting tuple from value block "' + targetBlock.type + '".';
  }
  var code = tuple[0];
  var innerOrder = tuple[1];
  if(isNaN(innerOrder)) {
    throw'Expecting valid order from value block "' + targetBlock.type + '".';
  }
  if(code && order <= innerOrder) {
    code = "(" + code + ")"
  }
  return code
};
Blockly.CodeGenerator.prototype.statementToCode = function(block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = this.blockToCode(targetBlock);
  if(!goog.isString(code)) {
    throw'Expecting code from statement block "' + targetBlock.type + '".';
  }
  if(code) {
    code = Blockly.Generator.prefixLines((code), "  ")
  }
  return code
};
Blockly.CodeGenerator.prototype.addReservedWords = function(words) {
  this.RESERVED_WORDS_ += words + ","
};
goog.provide("goog.cssom");
goog.provide("goog.cssom.CssRuleType");
goog.require("goog.array");
goog.require("goog.dom");
goog.cssom.CssRuleType = {STYLE:1, IMPORT:3, MEDIA:4, FONT_FACE:5, PAGE:6, NAMESPACE:7};
goog.cssom.getAllCssText = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return(goog.cssom.getAllCss_(styleSheet, true))
};
goog.cssom.getAllCssStyleRules = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return(goog.cssom.getAllCss_(styleSheet, false))
};
goog.cssom.getCssRulesFromStyleSheet = function(styleSheet) {
  var cssRuleList = null;
  try {
    cssRuleList = styleSheet.rules || styleSheet.cssRules
  }catch(e) {
    if(e.code == 15) {
      e.styleSheet = styleSheet;
      throw e;
    }
  }
  return cssRuleList
};
goog.cssom.getAllCssStyleSheets = function(opt_styleSheet, opt_includeDisabled) {
  var styleSheetsOutput = [];
  var styleSheet = opt_styleSheet || document.styleSheets;
  var includeDisabled = goog.isDef(opt_includeDisabled) ? opt_includeDisabled : false;
  if(styleSheet.imports && styleSheet.imports.length) {
    for(var i = 0, n = styleSheet.imports.length;i < n;i++) {
      goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(styleSheet.imports[i]))
    }
  }else {
    if(styleSheet.length) {
      for(var i = 0, n = styleSheet.length;i < n;i++) {
        goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(styleSheet[i]))
      }
    }else {
      var cssRuleList = goog.cssom.getCssRulesFromStyleSheet((styleSheet));
      if(cssRuleList && cssRuleList.length) {
        for(var i = 0, n = cssRuleList.length, cssRule;i < n;i++) {
          cssRule = cssRuleList[i];
          if(cssRule.styleSheet) {
            goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(cssRule.styleSheet))
          }
        }
      }
    }
  }
  if((styleSheet.type || (styleSheet.rules || styleSheet.cssRules)) && (!styleSheet.disabled || includeDisabled)) {
    styleSheetsOutput.push(styleSheet)
  }
  return styleSheetsOutput
};
goog.cssom.getCssTextFromCssRule = function(cssRule) {
  var cssText = "";
  if(cssRule.cssText) {
    cssText = cssRule.cssText
  }else {
    if(cssRule.style && (cssRule.style.cssText && cssRule.selectorText)) {
      var styleCssText = cssRule.style.cssText.replace(/\s*-closure-parent-stylesheet:\s*\[object\];?\s*/gi, "").replace(/\s*-closure-rule-index:\s*[\d]+;?\s*/gi, "");
      var thisCssText = cssRule.selectorText + " { " + styleCssText + " }";
      cssText = thisCssText
    }
  }
  return cssText
};
goog.cssom.getCssRuleIndexInParentStyleSheet = function(cssRule, opt_parentStyleSheet) {
  if(cssRule.style && cssRule.style["-closure-rule-index"]) {
    return cssRule.style["-closure-rule-index"]
  }
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule);
  if(!parentStyleSheet) {
    throw Error("Cannot find a parentStyleSheet.");
  }
  var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(parentStyleSheet);
  if(cssRuleList && cssRuleList.length) {
    for(var i = 0, n = cssRuleList.length, thisCssRule;i < n;i++) {
      thisCssRule = cssRuleList[i];
      if(thisCssRule == cssRule) {
        return i
      }
    }
  }
  return-1
};
goog.cssom.getParentStyleSheet = function(cssRule) {
  return cssRule.parentStyleSheet || cssRule.style && cssRule.style["-closure-parent-stylesheet"]
};
goog.cssom.replaceCssRule = function(cssRule, cssText, opt_parentStyleSheet, opt_index) {
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule);
  if(parentStyleSheet) {
    var index = opt_index >= 0 ? opt_index : goog.cssom.getCssRuleIndexInParentStyleSheet(cssRule, parentStyleSheet);
    if(index >= 0) {
      goog.cssom.removeCssRule(parentStyleSheet, index);
      goog.cssom.addCssRule(parentStyleSheet, cssText, index)
    }else {
      throw Error("Cannot proceed without the index of the cssRule.");
    }
  }else {
    throw Error("Cannot proceed without the parentStyleSheet.");
  }
};
goog.cssom.addCssRule = function(cssStyleSheet, cssText, opt_index) {
  var index = opt_index;
  if(index < 0 || index == undefined) {
    var rules = cssStyleSheet.cssRules || cssStyleSheet.rules;
    index = rules.length
  }
  if(cssStyleSheet.insertRule) {
    cssStyleSheet.insertRule(cssText, index)
  }else {
    var matches = /^([^\{]+)\{([^\{]+)\}/.exec(cssText);
    if(matches.length == 3) {
      var selector = matches[1];
      var style = matches[2];
      cssStyleSheet.addRule(selector, style, index)
    }else {
      throw Error("Your CSSRule appears to be ill-formatted.");
    }
  }
};
goog.cssom.removeCssRule = function(cssStyleSheet, index) {
  if(cssStyleSheet.deleteRule) {
    cssStyleSheet.deleteRule(index)
  }else {
    cssStyleSheet.removeRule(index)
  }
};
goog.cssom.addCssText = function(cssText, opt_domHelper) {
  var document = opt_domHelper ? opt_domHelper.getDocument() : goog.dom.getDocument();
  var cssNode = document.createElement("style");
  cssNode.type = "text/css";
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(cssNode);
  if(cssNode.styleSheet) {
    cssNode.styleSheet.cssText = cssText
  }else {
    var cssTextNode = document.createTextNode(cssText);
    cssNode.appendChild(cssTextNode)
  }
  return cssNode
};
goog.cssom.getFileNameFromStyleSheet = function(styleSheet) {
  var href = styleSheet.href;
  if(!href) {
    return null
  }
  var matches = /([^\/\?]+)[^\/]*$/.exec(href);
  var filename = matches[1];
  return filename
};
goog.cssom.getAllCss_ = function(styleSheet, isTextOutput) {
  var cssOut = [];
  var styleSheets = goog.cssom.getAllCssStyleSheets(styleSheet);
  for(var i = 0;styleSheet = styleSheets[i];i++) {
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet);
    if(cssRuleList && cssRuleList.length) {
      if(!isTextOutput) {
        var ruleIndex = 0
      }
      for(var j = 0, n = cssRuleList.length, cssRule;j < n;j++) {
        cssRule = cssRuleList[j];
        if(isTextOutput && !cssRule.href) {
          var res = goog.cssom.getCssTextFromCssRule(cssRule);
          cssOut.push(res)
        }else {
          if(!cssRule.href) {
            if(cssRule.style) {
              if(!cssRule.parentStyleSheet) {
                cssRule.style["-closure-parent-stylesheet"] = styleSheet
              }
              cssRule.style["-closure-rule-index"] = ruleIndex
            }
            cssOut.push(cssRule)
          }
        }
        if(!isTextOutput) {
          ruleIndex++
        }
      }
    }
  }
  return isTextOutput ? cssOut.join(" ") : cssOut
};
goog.provide("Blockly.Css");
goog.require("goog.cssom");
Blockly.Css.inject = function() {
  var text = Blockly.Css.CONTENT.join("\n");
  text = text.replace("%HAND_OPEN_PATH%", Blockly.assetUrl("media/handopen.cur")).replace("%TREE_PATH%", Blockly.assetUrl("media/tree.png")).replace("%SPRITES_PATH%", Blockly.assetUrl("media/sprites.png"));
  goog.cssom.addCssText(text)
};
Blockly.Css.CONTENT = [".blocklySvg {", "  cursor: pointer;", "  background-color: #fff;", "  border: 1px solid #ddd;", " overflow: hidden;", "}", "g.blocklyDraggable {", "  -ms-touch-action: none;", "  touch-action: none;", "}", ".blocklyWidgetDiv {", "  position: absolute;", "  display: none;", "  z-index: 999;", "}", ".blocklyDraggable {", "  /* Hotspot coordinates are baked into the CUR file, but they are still", "     required in the CSS due to a Chrome bug.", "     http://code.google.com/p/chromium/issues/detail?id=1446 */", 
"  cursor: url(%HAND_OPEN_PATH%) 8 5, auto;", "}", ".blocklyResizeSE {", "  fill: #aaa;", "  cursor: se-resize;", "}", ".blocklyResizeSW {", "  fill: #aaa;", "  cursor: sw-resize;", "}", ".blocklyResizeLine {", "  stroke-width: 1;", "  stroke: #888;", "}", ".blocklyHighlightedConnectionPath {", "  stroke-width: 4px;", "  stroke: #fc3;", "  fill: none;", "}", ".blocklyPathLight {", "  fill: none;", "  stroke-width: 2;", "  stroke-linecap: round;", "}", ".blocklySpotlight>.blocklyPath {", "  fill: #fc3;", 
"}", ".blocklySelected:not(.blocklyUndeletable)>.blocklyPath {", "  stroke-width: 3px;", "  stroke: #fc3;", "}", ".blocklySelected:not(.blocklyUndeletable)>.blocklyPathLight {", "  display: none;", "}", ".blocklyUndeletable>.blocklyEditableText>rect {", "  fill-opacity: 1.0;", "  fill: #ffdb74;", "}", ".blocklyDragging>.blocklyPath,", ".blocklyDragging>.blocklyPathLight {", "  fill-opacity: 0.8;", "  stroke-opacity: 0.8;", "}", ".blocklyDragging>.blocklyPathDark {", "  display: none;", "}", ".blocklyDisabled>.blocklyPath {", 
"  fill-opacity: 0.50;", "  stroke-opacity: 0.50;", "}", ".blocklyDisabled>.blocklyPathLight,", ".blocklyDisabled>.blocklyPathDark {", "  display: none;", "}", ".blocklyText {", "  cursor: default;", "  font-family: sans-serif;", "  font-size: 11pt;", "  fill: #fff;", "}", ".blocklyNonEditableText>text {", "  pointer-events: none;", "}", ".blocklyNonEditableText>rect,", ".blocklyEditableText>rect {", "  fill: #fff;", "  fill-opacity: 0.6;", "}", ".blocklyNonEditableText>text,", ".blocklyEditableText>text {", 
"  fill: #000;", "}", ".blocklyEditableText:hover>rect {", "  stroke-width: 2;", "  stroke: #fff;", "}", "/*", " * Don't allow users to select text.  It gets annoying when trying to", " * drag a block and selected text moves instead.", " */", ".blocklySvg text {", "  -moz-user-select: none;", "  -webkit-user-select: none;", "  user-select: none;", "  cursor: inherit;", "}", "", ".blocklyHidden {", "  display: none;", "}", ".blocklyFieldDropdown:not(.blocklyHidden) {", "  display: block;", "}", ".blocklyTooltipBackground {", 
"  fill: #ffffc7;", "  stroke-width: 1px;", "  stroke: #d8d8d8;", "}", ".blocklyTooltipShadow,", ".blocklyContextMenuShadow,", ".blocklyDropdownMenuShadow {", "  fill: #bbb;", "  filter: url(#blocklyShadowFilter);", "}", ".blocklyTooltipText {", "  font-family: sans-serif;", "  font-size: 9pt;", "  fill: #000;", "}", "", ".blocklyIconShield {", "  cursor: default;", "  fill: #00c;", "  stroke-width: 1px;", "  stroke: #ccc;", "}", ".blocklyIconGroup:hover>.blocklyIconShield {", "  fill: #00f;", "  stroke: #fff;", 
"}", ".blocklyIconGroup:hover>.blocklyIconMark {", "  fill: #fff;", "}", ".blocklyIconMark {", "  cursor: default !important;", "  font-family: sans-serif;", "  font-size: 9pt;", "  font-weight: bold;", "  fill: #ccc;", "  text-anchor: middle;", "}", ".blocklyWarningBody {", "}", ".blocklyMinimalBody {", "  margin: 0;", "  padding: 0;", "}", ".blocklyCommentTextarea {", "  margin: 0;", "  padding: 2px;", "  border: 0;", "  resize: none;", "  background-color: #ffc;", "}", ".blocklyHtmlInput {", "  font-family: sans-serif;", 
"  font-size: 11pt;", "  border: none;", "  outline: none;", "  width: 100%", "}", ".blocklyContextMenuBackground,", ".blocklyMutatorBackground {", "  fill: #fff;", "  stroke-width: 1;", "  stroke: #ddd;", "}", ".blocklyContextMenuOptions>.blocklyMenuDiv,", ".blocklyContextMenuOptions>.blocklyMenuDivDisabled,", ".blocklyDropdownMenuOptions>.blocklyMenuDiv {", "  fill: #fff;", "}", ".blocklyContextMenuOptions>.blocklyMenuDiv:hover>rect,", ".blocklyDropdownMenuOptions>.blocklyMenuDiv:hover>rect {", 
"  fill: #57e;", "}", ".blocklyMenuSelected>rect {", "  fill: #57e;", "}", ".blocklyMenuText {", "  cursor: default !important;", "  font-family: sans-serif;", "  font-size: 15px; /* All context menu sizes are based on pixels. */", "  fill: #000;", "}", ".blocklyContextMenuOptions>.blocklyMenuDiv:hover>.blocklyMenuText,", ".blocklyDropdownMenuOptions>.blocklyMenuDiv:hover>.blocklyMenuText {", "  fill: #fff;", "}", ".blocklyMenuSelected>.blocklyMenuText {", "  fill: #fff;", "}", ".blocklyMenuDivDisabled>.blocklyMenuText {", 
"  fill: #ccc;", "}", ".blocklyFlyoutBackground {", "  fill: #ddd;", "  fill-opacity: 0.8;", "}", ".blocklyColourBackground {", "  fill: #666;", "}", ".blocklyScrollbarBackground {", "  fill: #fff;", "  stroke-width: 1;", "  stroke: #e4e4e4;", "}", ".blocklyScrollbarKnob {", "  fill: #ccc;", "}", ".blocklyScrollbarBackground:hover+.blocklyScrollbarKnob,", ".blocklyScrollbarKnob:hover {", "  fill: #bbb;", "}", ".blocklyInvalidInput {", "  background: #faa;", "}", ".blocklyAngleCircle {", "  stroke: #444;", 
"  stroke-width: 1;", "  fill: #ddd;", "  fill-opacity: 0.8;", "}", ".blocklyAngleMarks {", "  stroke: #444;", "  stroke-width: 1;", "}", ".blocklyAngleGuage {", "  fill: #d00;", "  fill-opacity: 0.8;  ", "}", ".blocklyContextMenu {", "  border-radius: 4px;", "}", ".blocklyDropdownMenu {", "  padding: 0 !important;", "  position: relative !important;", "}", ".blocklyRectangularDropdownMenu .goog-menuitem {", "  height: 100%;", "  padding: 0 !important;", "  border-radius: 5px;", "  margin-bottom: 4px !important;", 
"}", ".fieldRectangularDropdownBackdrop {", "  fill: #fff;", "  fill-opacity: 0.6;", "}", ".blocklyRectangularDropdownArrow {", "  fill: #7965a1;", "  font-size: 20px !important;", "}", ".blocklyRectangularDropdownMenu .goog-menuitem-highlight, .goog-menuitem-hover {", "  border-color: #7965a1 !important;", "  border-style: dotted !important;", "  border-width: 0px !important;", "  margin: -4px -4px 0 !important;", "  border-width: 4px !important;", "  border-style: solid !important;", "  padding-bottom: 0px !important;", 
"  padding-top: 0px !important;", "}", ".blocklyRectangularDropdownMenu img {", "  -webkit-border-radius: 5px;", "  -moz-border-radius: 5px;", "  border-radius: 5px;", "}", ".blocklyRectangularDropdownMenu {", "  border-radius: 5px;", "  box-shadow: none !important;", "}", ".goog-option-selected .goog-menuitem-checkbox,", ".goog-option-selected .goog-menuitem-icon {", "}", "/* Category tree in Toolbox. */", ".blocklyToolboxDiv {", "  background-color: #ddd;", "  display: none;", "  overflow-x: visible;", 
"  overflow-y: auto;", "  position: absolute;", "}", ".blocklyTreeRoot {", "  padding: 4px 0;", "}", ".blocklyTreeRoot:focus {", "  outline: none;", "}", ".blocklyTreeRow {", "  line-height: 22px;", "  height: 22px;", "  padding-right: 1em;", "  white-space: nowrap;", "}", '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {', "  padding-right: 0;", "  padding-left: 1em !important;", "}", ".blocklyTreeRow:hover {", "  background-color: #e4e4e4;", "}", ".blocklyTreeIcon {", "  height: 16px;", "  width: 16px;", 
"  vertical-align: middle;", "  background-image: url(%TREE_PATH%);", "}", ".blocklyTreeIconClosedLtr {", "  background-position: -32px -1px;", "}", ".blocklyTreeIconClosedRtl {", "  background-position: 0px -1px;", "}", ".blocklyTreeIconOpen {", "  background-position: -16px -1px;", "}", ".blocklyTreeIconNone {", "  background-position: -48px -1px;", "}", ".blocklyTreeSelected>.blocklyTreeIconClosedLtr {", "  background-position: -32px -17px;", "}", ".blocklyTreeSelected>.blocklyTreeIconClosedRtl {", 
"  background-position: 0px -17px;", "}", ".blocklyTreeSelected>.blocklyTreeIconOpen {", "  background-position: -16px -17px;", "}", ".blocklyTreeSelected>.blocklyTreeIconNone {", "  background-position: -48px -17px;", "}", ".blocklyTreeLabel {", "  cursor: default;", "  font-family: sans-serif;", "  font-size: 16px;", "  padding: 0 3px;", "  vertical-align: middle;", "}", ".blocklyTreeSelected  {", "  background-color: #57e !important;", "}", ".blocklyTreeSelected .blocklyTreeLabel {", "  color: #fff;", 
"}", ".blocklyArrow {", "   font-size: 80%;", " }", "", "/*", " * Copyright 2007 The Closure Library Authors. All Rights Reserved.", " *", " * Use of this source code is governed by the Apache License, Version 2.0.", " * See the COPYING file for details.", " */", "", "/* Author: pupius@google.com (Daniel Pupius) */", "", "/*", " Styles to make the colorpicker look like the old gmail color picker", " NOTE: without CSS scoping this will override styles defined in palette.css", "*/", ".goog-palette {", 
"  outline: none;", "  cursor: default;", "}", "", ".goog-palette-table {", "  border: 1px solid #666;", "  border-collapse: collapse;", "}", "", ".goog-palette-cell {", "  height: 25px;", "  width: 25px;", "  margin: 0;", "  border: 0;", "  text-align: center;", "  vertical-align: middle;", "  border-right: 1px solid #666;", "  font-size: 1px;", "}", "", ".goog-palette-colorswatch {", "  position: relative;", "  height: 25px;", "  width: 25px;", "  border: 1px solid #666;", "}", "", ".goog-palette-cell-hover .goog-palette-colorswatch {", 
"  border: 1px solid #FFF;", "}", "", ".goog-palette-cell-selected .goog-palette-colorswatch {", "  border: 1px solid #000;", "  color: #fff;", "}", ".goog-menu {", "  background: #fff;", "  border-color: #ccc #666 #666 #ccc;", "  border-style: solid;", "  border-width: 1px;", "  cursor: default;", "  font: normal 13px Arial, sans-serif;", "  margin: 0;", "  outline: none;", "  padding: 4px 0;", "  position: absolute;", "  z-index: 20000;", "}", ".goog-menuitem {", "  color: #000;", "  font: normal 13px Arial, sans-serif;", 
"  list-style: none;", "  margin: 0;", "  padding: 4px 7em 4px 28px;", "  white-space: nowrap;", "}", ".goog-menuitem.goog-menuitem-rtl {", "  padding-left: 7em;", "  padding-right: 28px;", "}", ".goog-menu-nocheckbox .goog-menuitem,", ".goog-menu-noicon .goog-menuitem {", "  padding-left: 12px;", "}", ".goog-menu-noaccel .goog-menuitem {", "  padding-right: 20px;", "}", ".goog-menuitem-content {", "  color: #000;", "  font-size: 15px;", "}", ".goog-menuitem-disabled .goog-menuitem-accel,", ".goog-menuitem-disabled .goog-menuitem-content {", 
"  color: #ccc !important;", "}", ".goog-menuitem-disabled .goog-menuitem-icon {", "  opacity: 0.3;", "  -moz-opacity: 0.3;", "  filter: alpha(opacity=30);", "}", ".goog-menuitem-highlight,", ".goog-menuitem-hover {", "  background-color: #d6e9f8;", "  border-color: #d6e9f8;", "  border-style: dotted;", "  border-width: 1px 0;", "  padding-bottom: 3px;", "  padding-top: 3px;", "}", ".goog-menuitem-checkbox,", ".goog-menuitem-icon {", "  background-repeat: no-repeat;", "  height: 16px;", "  left: 6px;", 
"  position: absolute;", "  right: auto;", "  vertical-align: middle;", "  width: 16px;", "}", ".goog-menuitem-rtl .goog-menuitem-checkbox,", ".goog-menuitem-rtl .goog-menuitem-icon {", "  left: auto;", "  right: 6px;", "}", ".goog-option-selected .goog-menuitem-checkbox,", ".goog-option-selected .goog-menuitem-icon {", "}", ".goog-menuitem-accel {", "  color: #999;", "  direction: ltr;", "  left: auto;", "  padding: 0 6px;", "  position: absolute;", "  right: 0;", "  text-align: right;", "}", ".goog-menuitem-rtl .goog-menuitem-accel {", 
"  left: 0;", "  right: auto;", "  text-align: left;", "}", ".goog-menuitem-mnemonic-hint {", "  text-decoration: underline;", "}", ".goog-menuitem-mnemonic-separator {", "  color: #999;", "  font-size: 12px;", "  padding-left: 4px;", "}", ".goog-menuseparator {", "  border-top: 1px solid #ccc;", "  margin: 4px 0;", "  padding: 0;", "}", ""];
goog.provide("Blockly.inject");
goog.require("Blockly.Css");
goog.require("goog.dom");
Blockly.inject = function(container, opt_options) {
  if(!goog.dom.contains(document, container)) {
    throw"Error: container is not in current document.";
  }
  if(opt_options) {
    goog.mixin(Blockly, Blockly.parseOptions_(opt_options))
  }
  Blockly.createDom_(container);
  Blockly.init_()
};
Blockly.parseOptions_ = function(options) {
  var readOnly = !!options["readOnly"];
  if(readOnly) {
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var hasConcreteBlocks = false;
    var grayOutUndeletableBlocks = false;
    var tree = null
  }else {
    var tree = options["toolbox"];
    if(tree) {
      if(typeof tree != "string" && typeof XSLTProcessor == "undefined") {
        tree = tree.outerHTML
      }
      if(typeof tree == "string") {
        tree = Blockly.Xml.textToDom(tree)
      }
      var hasCategories = !!tree.getElementsByTagName("category").length
    }else {
      tree = null;
      var hasCategories = false
    }
    var hasTrashcan = options["trashcan"];
    if(hasTrashcan === undefined) {
      hasTrashcan = hasCategories
    }
    var hasCollapse = options["collapse"];
    if(hasCollapse === undefined) {
      hasCollapse = hasCategories
    }
    var grayOutUndeletableBlocks = options["grayOutUndeletableBlocks"];
    if(grayOutUndeletableBlocks === undefined) {
      grayOutUndeletableBlocks = false
    }
  }
  var varsInGlobals = !!options["varsInGlobals"];
  if(tree && !hasCategories) {
    var hasScrollbars = false;
    var hasConcreteBlocks = options["concreteBlocks"];
    if(hasConcreteBlocks === undefined) {
      hasConcreteBlocks = false
    }
  }else {
    var hasScrollbars = options["scrollbars"];
    if(hasScrollbars === undefined) {
      hasScrollbars = false
    }
    var hasConcreteBlocks = false
  }
  return{RTL:!!options["rtl"], collapse:hasCollapse, readOnly:readOnly, maxBlocks:options["maxBlocks"] || Infinity, assetUrl:options["assetUrl"] || function(path) {
    return"./" + path
  }, hasCategories:hasCategories, hasScrollbars:hasScrollbars, hasConcreteBlocks:hasConcreteBlocks, hasTrashcan:hasTrashcan, varsInGlobals:varsInGlobals, languageTree:tree, disableParamEditing:options["disableParamEditing"] || false, disableVariableEditing:options["disableVariableEditing"] || false, grayOutUndeletableBlocks:grayOutUndeletableBlocks}
};
Blockly.createDom_ = function(container) {
  container.setAttribute("dir", "LTR");
  goog.ui.Component.setDefaultRightToLeft(Blockly.RTL);
  Blockly.Css.inject();
  var svg = Blockly.createSvgElement("svg", {"xmlns":"http://www.w3.org/2000/svg", "xmlns:html":"http://www.w3.org/1999/xhtml", "xmlns:xlink":"http://www.w3.org/1999/xlink", "version":"1.1", "class":"blocklySvg"}, null);
  goog.events.listen(svg, "selectstart", function() {
    return false
  });
  var defs = Blockly.createSvgElement("defs", {id:"blocklySvgDefs"}, svg);
  var filter, feSpecularLighting, feMerge, pattern;
  filter = Blockly.createSvgElement("filter", {"id":"blocklyEmboss"}, defs);
  Blockly.createSvgElement("feGaussianBlur", {"in":"SourceAlpha", "stdDeviation":1, "result":"blur"}, filter);
  feSpecularLighting = Blockly.createSvgElement("feSpecularLighting", {"in":"blur", "surfaceScale":1, "specularConstant":0.5, "specularExponent":10, "lighting-color":"white", "result":"specOut"}, filter);
  Blockly.createSvgElement("fePointLight", {"x":-5E3, "y":-1E4, "z":2E4}, feSpecularLighting);
  Blockly.createSvgElement("feComposite", {"in":"specOut", "in2":"SourceAlpha", "operator":"in", "result":"specOut"}, filter);
  Blockly.createSvgElement("feComposite", {"in":"SourceGraphic", "in2":"specOut", "operator":"arithmetic", "k1":0, "k2":1, "k3":1, "k4":0}, filter);
  filter = Blockly.createSvgElement("filter", {"id":"blocklyTrashcanShadowFilter"}, defs);
  Blockly.createSvgElement("feGaussianBlur", {"in":"SourceAlpha", "stdDeviation":2, "result":"blur"}, filter);
  Blockly.createSvgElement("feOffset", {"in":"blur", "dx":1, "dy":1, "result":"offsetBlur"}, filter);
  feMerge = Blockly.createSvgElement("feMerge", {}, filter);
  Blockly.createSvgElement("feMergeNode", {"in":"offsetBlur"}, feMerge);
  Blockly.createSvgElement("feMergeNode", {"in":"SourceGraphic"}, feMerge);
  filter = Blockly.createSvgElement("filter", {"id":"blocklyShadowFilter"}, defs);
  Blockly.createSvgElement("feGaussianBlur", {"stdDeviation":2}, filter);
  pattern = Blockly.createSvgElement("pattern", {"id":"blocklyDisabledPattern", "patternUnits":"userSpaceOnUse", "width":10, "height":10}, defs);
  Blockly.createSvgElement("rect", {"width":10, "height":10, "fill":"#aaa"}, pattern);
  Blockly.createSvgElement("path", {"d":"M 0 0 L 10 10 M 10 0 L 0 10", "stroke":"#cc0"}, pattern);
  Blockly.mainWorkspace = new Blockly.Workspace(Blockly.getMainWorkspaceMetrics_, Blockly.setMainWorkspaceMetrics_);
  svg.appendChild(Blockly.mainWorkspace.createDom());
  Blockly.mainWorkspace.maxBlocks = Blockly.maxBlocks;
  if(!Blockly.readOnly) {
    if(Blockly.hasCategories) {
      Blockly.Toolbox.createDom(svg, container)
    }else {
      Blockly.mainWorkspace.flyout_ = new Blockly.Flyout;
      var flyout = Blockly.mainWorkspace.flyout_;
      var flyoutSvg = flyout.createDom();
      flyout.init(Blockly.mainWorkspace, true);
      flyout.autoClose = false;
      goog.dom.insertSiblingBefore(flyoutSvg, Blockly.mainWorkspace.svgGroup_);
      var workspaceChanged = function() {
        if(!Blockly.Block.isDragging()) {
          var metrics = Blockly.mainWorkspace.getMetrics();
          if(metrics.contentTop < 0 || (metrics.contentTop + metrics.contentHeight > metrics.viewHeight + metrics.viewTop || (metrics.contentLeft < (Blockly.RTL ? metrics.viewLeft : 0) || metrics.contentLeft + metrics.contentWidth > metrics.viewWidth + (Blockly.RTL ? 2 : 1) * metrics.viewLeft))) {
            var MARGIN = 25;
            var blocks = Blockly.mainWorkspace.getTopBlocks(false);
            for(var b = 0, block;block = blocks[b];b++) {
              var blockXY = block.getRelativeToSurfaceXY();
              var blockHW = block.getHeightWidth();
              var overflow = metrics.viewTop + MARGIN - blockHW.height - blockXY.y;
              if(overflow > 0) {
                block.moveBy(0, overflow)
              }
              var overflow = metrics.viewTop + metrics.viewHeight - MARGIN - blockXY.y;
              if(overflow < 0) {
                block.moveBy(0, overflow)
              }
              var overflow = MARGIN + metrics.viewLeft - blockXY.x - (Blockly.RTL ? 0 : blockHW.width);
              if(overflow > 0) {
                block.moveBy(overflow, 0)
              }
              var overflow = metrics.viewLeft + metrics.viewWidth - MARGIN - blockXY.x + (Blockly.RTL ? blockHW.width : 0);
              if(overflow < 0) {
                block.moveBy(overflow, 0)
              }
              if(block.isDeletable() && (Blockly.RTL ? blockXY.x - 2 * metrics.viewLeft - metrics.viewWidth : -blockXY.x) > MARGIN * 2) {
                flyout.onBlockDropped(block)
              }
            }
          }
        }
      };
      Blockly.addChangeListener(workspaceChanged)
    }
  }
  Blockly.mainWorkspace.setEnableToolbox = function(enabled) {
    if(Blockly.mainWorkspace.flyout_) {
      Blockly.mainWorkspace.flyout_.setEnabled(enabled)
    }else {
      Blockly.Toolbox.enabled = enabled
    }
  };
  svg.appendChild(Blockly.Tooltip.createDom());
  container.appendChild(svg);
  Blockly.svg = svg;
  Blockly.svgResize();
  Blockly.WidgetDiv.DIV = goog.dom.createDom("div", "blocklyWidgetDiv");
  Blockly.WidgetDiv.DIV.style.direction = Blockly.RTL ? "rtl" : "ltr";
  document.body.appendChild(Blockly.WidgetDiv.DIV)
};
Blockly.init_ = function() {
  if(goog.userAgent.WEBKIT) {
    var path = Blockly.createSvgElement("path", {"d":"m 0,0 c 0,-5 0,-5 0,0 H 50 V 50 z"}, Blockly.svg);
    if(Blockly.isMsie() || Blockly.isTrident()) {
      path.style.display = "inline";
      path.bBox_ = {x:path.getBBox().x, y:path.getBBox().y, width:path.scrollWidth, height:path.scrollHeight}
    }else {
      path.bBox_ = path.getBBox()
    }
    if(path.bBox_.height > 50) {
      Blockly.BROKEN_CONTROL_POINTS = true
    }
    Blockly.svg.removeChild(path)
  }
  Blockly.bindEvent_(Blockly.svg, "mousedown", null, Blockly.onMouseDown_);
  Blockly.bindEvent_(Blockly.svg, "mousemove", null, Blockly.onMouseMove_);
  Blockly.bindEvent_(Blockly.svg, "contextmenu", null, Blockly.onContextMenu_);
  Blockly.bindEvent_(Blockly.svg, "mouseup", null, Blockly.onMouseUp_);
  Blockly.bindEvent_(Blockly.WidgetDiv.DIV, "contextmenu", null, Blockly.onContextMenu_);
  if(!Blockly.documentEventsBound_) {
    Blockly.bindEvent_(window, "resize", document, Blockly.svgResize);
    Blockly.bindEvent_(document, "keydown", null, Blockly.onKeyDown_);
    if(goog.userAgent.IPAD) {
      Blockly.bindEvent_(window, "orientationchange", document, function() {
        Blockly.fireUiEvent(window, "resize")
      }, false)
    }
    Blockly.documentEventsBound_ = true
  }
  if(Blockly.languageTree) {
    if(Blockly.hasCategories) {
      Blockly.Toolbox.init()
    }else {
      Blockly.mainWorkspace.flyout_.init(Blockly.mainWorkspace, true);
      Blockly.mainWorkspace.flyout_.show(Blockly.languageTree.childNodes);
      Blockly.mainWorkspace.pageXOffset = Blockly.mainWorkspace.flyout_.width_;
      var translation = "translate(" + Blockly.mainWorkspace.pageXOffset + ", 0)";
      Blockly.mainWorkspace.getCanvas().setAttribute("transform", translation);
      Blockly.mainWorkspace.getBubbleCanvas().setAttribute("transform", translation)
    }
  }
  if(Blockly.hasScrollbars) {
    Blockly.mainWorkspace.scrollbar = new Blockly.ScrollbarPair(Blockly.mainWorkspace);
    Blockly.mainWorkspace.scrollbar.resize()
  }
  Blockly.mainWorkspace.addTrashcan();
  Blockly.loadAudio_([Blockly.assetUrl("media/click.mp3"), Blockly.assetUrl("media/click.wav"), Blockly.assetUrl("media/click.ogg")], "click");
  Blockly.loadAudio_([Blockly.assetUrl("media/delete.mp3"), Blockly.assetUrl("media/delete.ogg"), Blockly.assetUrl("media/delete.wav")], "delete")
};
goog.provide("Blockly.WidgetDiv");
goog.require("Blockly.Css");
goog.require("goog.dom");
Blockly.WidgetDiv.DIV = null;
Blockly.WidgetDiv.owner_ = null;
Blockly.WidgetDiv.dispose_ = null;
Blockly.WidgetDiv.show = function(newOwner, dispose) {
  Blockly.WidgetDiv.hide();
  Blockly.WidgetDiv.owner_ = newOwner;
  Blockly.WidgetDiv.dispose_ = dispose;
  Blockly.WidgetDiv.DIV.style.display = "block"
};
Blockly.WidgetDiv.isVisible = function() {
  return!!Blockly.WidgetDiv.owner_
};
Blockly.WidgetDiv.hide = function() {
  if(Blockly.WidgetDiv.owner_) {
    Blockly.WidgetDiv.DIV.style.display = "none";
    Blockly.WidgetDiv.dispose_ && Blockly.WidgetDiv.dispose_();
    Blockly.WidgetDiv.owner_ = null;
    Blockly.WidgetDiv.dispose_ = null;
    goog.dom.removeChildren(Blockly.WidgetDiv.DIV)
  }
};
Blockly.WidgetDiv.hideIfOwner = function(oldOwner) {
  if(Blockly.WidgetDiv.isOwner(oldOwner)) {
    Blockly.WidgetDiv.hide()
  }
};
Blockly.WidgetDiv.isOwner = function(owner) {
  return Blockly.WidgetDiv.owner_ == owner
};
Blockly.WidgetDiv.position = function(anchorX, anchorY, windowSize, scrollOffset) {
  if(anchorY < scrollOffset.y) {
    anchorY = scrollOffset.y
  }
  if(Blockly.RTL) {
    if(anchorX > windowSize.width + scrollOffset.x) {
      anchorX = windowSize.width + scrollOffset.x
    }
  }else {
    if(anchorX < scrollOffset.x) {
      anchorX = scrollOffset.x
    }
  }
  Blockly.WidgetDiv.DIV.style.left = anchorX + "px";
  Blockly.WidgetDiv.DIV.style.top = anchorY + "px"
};
goog.provide("Blockly.FieldAngle");
goog.require("Blockly.FieldTextInput");
Blockly.FieldAngle = function(text, opt_changeHandler) {
  var changeHandler;
  if(opt_changeHandler) {
    var thisObj = this;
    changeHandler = function(value) {
      value = Blockly.FieldAngle.angleValidator.call(thisObj, value);
      if(value !== null) {
        opt_changeHandler.call(thisObj, value)
      }
      return value
    }
  }else {
    changeHandler = Blockly.FieldAngle.angleValidator
  }
  this.symbol_ = Blockly.createSvgElement("tspan", {}, null);
  this.symbol_.appendChild(document.createTextNode("\u00b0"));
  Blockly.FieldAngle.superClass_.constructor.call(this, text, changeHandler)
};
goog.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);
Blockly.FieldAngle.HALF = 100 / 2;
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - 1;
Blockly.FieldAngle.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldAngle.superClass_.dispose_.call(thisField)();
    thisField.gauge_ = null;
    if(thisField.clickWrapper_) {
      Blockly.unbindEvent_(thisField.clickWrapper_)
    }
    if(thisField.moveWrapper1_) {
      Blockly.unbindEvent_(thisField.moveWrapper1_)
    }
    if(thisField.moveWrapper2_) {
      Blockly.unbindEvent_(thisField.moveWrapper2_)
    }
  }
};
Blockly.FieldAngle.prototype.showEditor_ = function() {
  Blockly.FieldAngle.superClass_.showEditor_.call(this);
  var div = Blockly.WidgetDiv.DIV;
  if(!div.firstChild) {
    return
  }
  var svg = Blockly.createSvgElement("svg", {"xmlns":"http://www.w3.org/2000/svg", "xmlns:html":"http://www.w3.org/1999/xhtml", "xmlns:xlink":"http://www.w3.org/1999/xlink", "version":"1.1", "height":Blockly.FieldAngle.HALF * 2 + "px", "width":Blockly.FieldAngle.HALF * 2 + "px"}, div);
  var circle = Blockly.createSvgElement("circle", {"cx":Blockly.FieldAngle.HALF, "cy":Blockly.FieldAngle.HALF, "r":Blockly.FieldAngle.RADIUS, "class":"blocklyAngleCircle"}, svg);
  this.gauge_ = Blockly.createSvgElement("path", {"class":"blocklyAngleGuage"}, svg);
  for(var a = 0;a < 360;a += 15) {
    Blockly.createSvgElement("line", {"x1":Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS, "y1":Blockly.FieldAngle.HALF, "x2":Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS - (a % 45 == 0 ? 10 : 5), "y2":Blockly.FieldAngle.HALF, "class":"blocklyAngleMarks", "transform":"rotate(" + a + ", " + Blockly.FieldAngle.HALF + ", " + Blockly.FieldAngle.HALF + ")"}, svg)
  }
  svg.style.marginLeft = "-35px";
  this.clickWrapper_ = Blockly.bindEvent_(svg, "click", this, Blockly.WidgetDiv.hide);
  this.moveWrapper1_ = Blockly.bindEvent_(circle, "mousemove", this, this.onMouseMove);
  this.moveWrapper2_ = Blockly.bindEvent_(this.gauge_, "mousemove", this, this.onMouseMove);
  this.updateGraph()
};
Blockly.FieldAngle.prototype.onMouseMove = function(e) {
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
  var angle = Math.atan(-dy / dx);
  if(isNaN(angle)) {
    return
  }
  angle = angle / Math.PI * 180;
  if(dx < 0) {
    angle += 180
  }else {
    if(dy > 0) {
      angle += 360
    }
  }
  angle = String(Math.round(angle));
  Blockly.FieldTextInput.htmlInput_.value = angle;
  this.setText(angle)
};
Blockly.FieldAngle.prototype.setText = function(text) {
  Blockly.FieldAngle.superClass_.setText.call(this, text);
  this.updateGraph();
  if(Blockly.RTL) {
    this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild)
  }else {
    this.textElement_.appendChild(this.symbol_)
  }
  this.size_.width = 0
};
Blockly.FieldAngle.prototype.updateGraph = function() {
  if(this.gauge_) {
    var angleRadians = Number(this.getText()) / 180 * Math.PI;
    if(isNaN(angleRadians)) {
      this.gauge_.setAttribute("d", "M " + Blockly.FieldAngle.HALF + ", " + Blockly.FieldAngle.HALF)
    }else {
      var x = Blockly.FieldAngle.HALF + Math.cos(angleRadians) * Blockly.FieldAngle.RADIUS;
      var y = Blockly.FieldAngle.HALF + Math.sin(angleRadians) * -Blockly.FieldAngle.RADIUS;
      var largeFlag = angleRadians > Math.PI ? 1 : 0;
      this.gauge_.setAttribute("d", "M " + Blockly.FieldAngle.HALF + ", " + Blockly.FieldAngle.HALF + " h " + Blockly.FieldAngle.RADIUS + " A " + Blockly.FieldAngle.RADIUS + "," + Blockly.FieldAngle.RADIUS + " 0 " + largeFlag + " 0 " + x + "," + y + " z")
    }
  }
};
Blockly.FieldAngle.angleValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if(n !== null) {
    n = n % 360;
    if(n < 0) {
      n += 360
    }
    n = String(n)
  }
  return n
};
goog.provide("Blockly");
goog.require("Blockly.Block");
goog.require("Blockly.Connection");
goog.require("Blockly.FieldAngle");
goog.require("Blockly.FieldCheckbox");
goog.require("Blockly.FieldColour");
goog.require("Blockly.FieldColourDropdown");
goog.require("Blockly.FieldDropdown");
goog.require("Blockly.FieldImage");
goog.require("Blockly.FieldImageDropdown");
goog.require("Blockly.FieldRectangularDropdown");
goog.require("Blockly.FieldTextInput");
goog.require("Blockly.FieldVariable");
goog.require("Blockly.Generator");
goog.require("Blockly.ImageDimensionCache");
goog.require("Blockly.Msg");
goog.require("Blockly.Procedures");
goog.require("Blockly.Toolbox");
goog.require("Blockly.WidgetDiv");
goog.require("Blockly.Workspace");
goog.require("Blockly.inject");
goog.require("Blockly.utils");
goog.require("goog.dom");
goog.require("goog.color");
goog.require("goog.events");
goog.require("goog.string");
goog.require("goog.ui.ColorPicker");
goog.require("goog.ui.tree.TreeControl");
goog.require("goog.userAgent");
Blockly.assetUrl = undefined;
Blockly.SVG_NS = "http://www.w3.org/2000/svg";
Blockly.HTML_NS = "http://www.w3.org/1999/xhtml";
Blockly.HSV_SATURATION = 0.45;
Blockly.HSV_VALUE = 0.65;
Blockly.makeColour = function(hue, saturation, value) {
  return goog.color.hsvToHex(hue, saturation, value * 256)
};
Blockly.INPUT_VALUE = 1;
Blockly.OUTPUT_VALUE = 2;
Blockly.NEXT_STATEMENT = 3;
Blockly.PREVIOUS_STATEMENT = 4;
Blockly.DUMMY_INPUT = 5;
Blockly.FUNCTIONAL_INPUT = 6;
Blockly.FUNCTIONAL_OUTPUT = 7;
Blockly.ALIGN_LEFT = -1;
Blockly.ALIGN_CENTRE = 0;
Blockly.ALIGN_RIGHT = 1;
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.FUNCTIONAL_INPUT] = Blockly.FUNCTIONAL_OUTPUT;
Blockly.OPPOSITE_TYPE[Blockly.FUNCTIONAL_OUTPUT] = Blockly.FUNCTIONAL_INPUT;
Blockly.SOUNDS_ = {};
window.AudioContext = window.AudioContext || window.webkitAudioContext;
if(window.AudioContext) {
  Blockly.CONTEXT = new AudioContext
}
Blockly.selected = null;
Blockly.readOnly = false;
Blockly.highlightedConnection_ = null;
Blockly.localConnection_ = null;
Blockly.DRAG_RADIUS = 5;
Blockly.SNAP_RADIUS = 15;
Blockly.BUMP_UNCONNECTED = true;
Blockly.BUMP_DELAY = 250;
Blockly.COLLAPSE_CHARS = 30;
Blockly.mainWorkspace = null;
Blockly.clipboard_ = null;
Blockly.svgSize = function() {
  return{width:Blockly.svg.cachedWidth_, height:Blockly.svg.cachedHeight_}
};
Blockly.svgResize = function() {
  var svg = Blockly.svg;
  var style = window.getComputedStyle(svg);
  var borderWidth = 0;
  if(style) {
    borderWidth = parseInt(style.borderLeftWidth, 10) + parseInt(style.borderRightWidth, 10)
  }
  var div = svg.parentNode;
  var width = div.offsetWidth - borderWidth;
  var height = div.offsetHeight;
  if(svg.cachedWidth_ != width) {
    svg.setAttribute("width", width + "px");
    svg.cachedWidth_ = width
  }
  if(svg.cachedHeight_ != height) {
    svg.setAttribute("height", height + "px");
    svg.cachedHeight_ = height
  }
  if(Blockly.mainWorkspace.scrollbar) {
    Blockly.mainWorkspace.scrollbar.resize()
  }else {
    if(Blockly.hasCategories) {
      Blockly.setMainWorkspaceMetricsNoScroll_()
    }
  }
};
Blockly.getWorkspaceWidth = function() {
  var metrics = Blockly.mainWorkspace.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;
  return width
};
Blockly.getToolboxWidth = function() {
  var flyout = Blockly.mainWorkspace.flyout_ || Blockly.Toolbox.flyout_;
  var metrics = flyout.workspace_.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;
  return width
};
Blockly.onMouseDown_ = function(e) {
  Blockly.terminateDrag_();
  Blockly.hideChaff();
  var isTargetSvg = e.target && (e.target.nodeName && e.target.nodeName.toLowerCase() == "svg");
  if(!Blockly.readOnly && (Blockly.selected && isTargetSvg)) {
    Blockly.selected.unselect()
  }
  if(Blockly.isRightButton(e)) {
  }else {
    if((Blockly.readOnly || isTargetSvg) && Blockly.mainWorkspace.scrollbar) {
      Blockly.mainWorkspace.dragMode = true;
      Blockly.mainWorkspace.startDragMouseX = e.clientX;
      Blockly.mainWorkspace.startDragMouseY = e.clientY;
      Blockly.mainWorkspace.startDragMetrics = Blockly.mainWorkspace.getMetrics();
      Blockly.mainWorkspace.startScrollX = Blockly.mainWorkspace.pageXOffset;
      Blockly.mainWorkspace.startScrollY = Blockly.mainWorkspace.pageYOffset;
      e.preventDefault()
    }
  }
};
Blockly.onMouseUp_ = function(e) {
  Blockly.setCursorHand_(false);
  Blockly.mainWorkspace.dragMode = false
};
Blockly.onMouseMove_ = function(e) {
  if(Blockly.mainWorkspace.dragMode) {
    Blockly.removeAllRanges();
    var dx = e.clientX - Blockly.mainWorkspace.startDragMouseX;
    var dy = e.clientY - Blockly.mainWorkspace.startDragMouseY;
    var metrics = Blockly.mainWorkspace.startDragMetrics;
    var x = Blockly.mainWorkspace.startScrollX + dx;
    var y = Blockly.mainWorkspace.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft - metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop - metrics.contentHeight);
    Blockly.mainWorkspace.scrollbar.set(-x - metrics.contentLeft, -y - metrics.contentTop)
  }
};
Blockly.onKeyDown_ = function(e) {
  if(Blockly.isTargetInput_(e)) {
    return
  }
  if(e.keyCode == 27) {
    Blockly.hideChaff()
  }else {
    if(e.keyCode == 8 || e.keyCode == 46) {
      try {
        if(Blockly.selected && Blockly.selected.isDeletable()) {
          Blockly.hideChaff();
          Blockly.selected.dispose(true, true)
        }
      }finally {
        e.preventDefault()
      }
    }else {
      if(e.altKey || (e.ctrlKey || e.metaKey)) {
        if(Blockly.selected && (Blockly.selected.isDeletable() && Blockly.selected.workspace == Blockly.mainWorkspace)) {
          Blockly.hideChaff();
          if(e.keyCode == 67) {
            Blockly.copy_(Blockly.selected)
          }else {
            if(e.keyCode == 88) {
              Blockly.copy_(Blockly.selected);
              Blockly.selected.dispose(true, true)
            }
          }
        }
        if(e.keyCode == 86) {
          if(Blockly.clipboard_) {
            Blockly.mainWorkspace.paste(Blockly.clipboard_)
          }
        }
      }
    }
  }
};
Blockly.terminateDrag_ = function() {
  Blockly.Block.terminateDrag_();
  Blockly.Flyout.terminateDrag_()
};
Blockly.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom_(block);
  Blockly.Xml.deleteNext(xmlBlock);
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute("x", Blockly.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute("y", xy.y);
  Blockly.clipboard_ = xmlBlock
};
Blockly.showContextMenu_ = function(e) {
  if(Blockly.readOnly) {
    return
  }
  var options = [];
  if(Blockly.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    var topBlocks = Blockly.mainWorkspace.getTopBlocks(false);
    for(var i = 0;i < topBlocks.length;i++) {
      if(topBlocks[i].isCollapsed()) {
        hasCollapsedBlocks = true
      }else {
        hasExpandedBlocks = true
      }
    }
    var collapseOption = {enabled:hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      for(var i = 0;i < topBlocks.length;i++) {
        topBlocks[i].setCollapsed(true)
      }
    };
    options.push(collapseOption);
    var expandOption = {enabled:hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      for(var i = 0;i < topBlocks.length;i++) {
        topBlocks[i].setCollapsed(false)
      }
    };
    options.push(expandOption)
  }
  var helpOption = {enabled:false};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
  };
  options.push(helpOption);
  Blockly.ContextMenu.show(e, options)
};
Blockly.onContextMenu_ = function(e) {
  if(!Blockly.isTargetInput_(e)) {
    e.preventDefault()
  }
};
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if(!opt_allowToolbox && (Blockly.Toolbox.flyout_ && Blockly.Toolbox.flyout_.autoClose)) {
    Blockly.Toolbox.clearSelection()
  }
};
Blockly.removeAllRanges = function() {
  function removeAllSafe() {
    try {
      window.getSelection().removeAllRanges()
    }catch(e) {
    }
  }
  if(window.getSelection) {
    var sel = window.getSelection();
    if(sel && sel.removeAllRanges) {
      removeAllSafe();
      window.setTimeout(function() {
        removeAllSafe()
      }, 0)
    }
  }
};
Blockly.isTargetInput_ = function(e) {
  return e.target.type == "textarea" || e.target.type == "text"
};
Blockly.onSoundLoad_ = function(request, name) {
  var onload = function() {
    Blockly.CONTEXT.decodeAudioData(request.response, function(buffer) {
      Blockly.SOUNDS_[name] = Blockly.createSoundFromBuffer_({buffer:buffer})
    })
  };
  return onload
};
Blockly.createSoundFromBuffer_ = function(options) {
  var source = Blockly.CONTEXT.createBufferSource();
  source.buffer = options.buffer;
  source.loop = options.loop;
  var gainNode;
  if(Blockly.CONTEXT.createGain) {
    gainNode = Blockly.CONTEXT.createGain()
  }else {
    if(Blockly.CONTEXT.createGainNode) {
      gainNode = Blockly.CONTEXT.createGainNode()
    }else {
      return null
    }
  }
  source.connect(gainNode);
  gainNode.connect(Blockly.CONTEXT.destination);
  gainNode.gain.value = options.volume || 1;
  return source
};
Blockly.loadWebAudio_ = function(filename, name) {
  var request = new XMLHttpRequest;
  request.open("GET", filename, true);
  request.responseType = "arraybuffer";
  request.onload = Blockly.onSoundLoad_(request, name);
  request.send()
};
Blockly.loadAudio_ = function(filenames, name) {
  if(window.Audio && filenames.length) {
    var audioTest = new window.Audio;
    for(var i = 0, filename;filename = filenames[i];i++) {
      var ext = filename.match(/\.(\w+)(\?.*)?$/);
      if(ext && audioTest.canPlayType("audio/" + ext[1])) {
        break
      }
    }
    if(filename) {
      if(window.AudioContext) {
        Blockly.loadWebAudio_(filename, name)
      }else {
        var sound = new window.Audio(filename);
        if(sound && sound.play) {
          if(!goog.userAgent.isDocumentMode(9)) {
            sound.play();
            sound.pause()
          }
          Blockly.SOUNDS_[name] = sound
        }
      }
    }
  }
};
Blockly.playAudio = function(name, options) {
  var sound = Blockly.SOUNDS_[name];
  var options = options || {};
  if(sound) {
    if(window.AudioContext) {
      options.buffer = sound.buffer;
      var newSound = Blockly.createSoundFromBuffer_(options);
      newSound.start ? newSound.start(0) : newSound.noteOn(0);
      Blockly.SOUNDS_[name] = newSound
    }else {
      if(!goog.userAgent.MOBILE) {
        sound.volume = options.volume !== undefined ? options.volume : 1;
        sound.loop = options.loop;
        sound.play()
      }
    }
  }
};
Blockly.stopLoopingAudio = function(name) {
  var sound = Blockly.SOUNDS_[name];
  try {
    if(sound) {
      if(sound.stop) {
        sound.stop(0)
      }else {
        if(sound.noteOff) {
          sound.noteOff(0)
        }else {
          sound.pause()
        }
      }
    }
  }catch(e) {
    if(e.name === "InvalidStateError") {
    }else {
      throw e;
    }
  }
};
Blockly.setCursorHand_ = function(closed) {
  if(Blockly.readOnly) {
    return
  }
  var cursor = "";
  if(closed) {
    cursor = "url(" + Blockly.assetUrl("media/handclosed.cur") + ") 7 3, auto"
  }
  if(Blockly.selected) {
    Blockly.selected.getSvgRoot().style.cursor = cursor
  }
  Blockly.svg.style.cursor = cursor
};
Blockly.getMainWorkspaceMetrics_ = function() {
  var svgSize = Blockly.svgSize();
  svgSize.width -= Blockly.Toolbox.width;
  var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
  try {
    if(Blockly.isMsie() || Blockly.isTrident()) {
      Blockly.mainWorkspace.getCanvas().style.display = "inline";
      var blockBox = {x:Blockly.mainWorkspace.getCanvas().getBBox().x, y:Blockly.mainWorkspace.getCanvas().getBBox().y, width:Blockly.mainWorkspace.getCanvas().scrollWidth, height:Blockly.mainWorkspace.getCanvas().scrollHeight}
    }else {
      var blockBox = Blockly.mainWorkspace.getCanvas().getBBox()
    }
  }catch(e) {
    return null
  }
  if(Blockly.mainWorkspace.scrollbar) {
    var leftEdge = 0;
    var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth, viewWidth * 1.5);
    var topEdge = 0;
    var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight, viewHeight * 1.5)
  }else {
    var leftEdge = blockBox.x;
    var rightEdge = leftEdge + blockBox.width;
    var topEdge = blockBox.y;
    var bottomEdge = topEdge + blockBox.height
  }
  var absoluteLeft = Blockly.RTL ? 0 : Blockly.Toolbox.width;
  return{viewHeight:svgSize.height, viewWidth:svgSize.width, contentHeight:bottomEdge - topEdge, contentWidth:rightEdge - leftEdge, viewTop:-Blockly.mainWorkspace.pageYOffset, viewLeft:-Blockly.mainWorkspace.pageXOffset, contentTop:topEdge, contentLeft:leftEdge, absoluteTop:0, absoluteLeft:absoluteLeft}
};
Blockly.setMainWorkspaceMetrics_ = function(xyRatio) {
  if(!Blockly.mainWorkspace.scrollbar) {
    throw"Attempt to set main workspace scroll without scrollbars.";
  }
  var metrics = Blockly.getMainWorkspaceMetrics_();
  if(goog.isNumber(xyRatio.x)) {
    Blockly.mainWorkspace.pageXOffset = -metrics.contentWidth * xyRatio.x - metrics.contentLeft
  }
  if(goog.isNumber(xyRatio.y)) {
    Blockly.mainWorkspace.pageYOffset = -metrics.contentHeight * xyRatio.y - metrics.contentTop
  }
  var translation = "translate(" + (Blockly.mainWorkspace.pageXOffset + metrics.absoluteLeft) + "," + (Blockly.mainWorkspace.pageYOffset + metrics.absoluteTop) + ")";
  Blockly.mainWorkspace.getCanvas().setAttribute("transform", translation);
  Blockly.mainWorkspace.getBubbleCanvas().setAttribute("transform", translation)
};
Blockly.setMainWorkspaceMetricsNoScroll_ = function() {
  var metrics = Blockly.getMainWorkspaceMetrics_();
  if(metrics) {
    var translation = "translate(" + metrics.absoluteLeft + "," + metrics.absoluteTop + ")";
    Blockly.mainWorkspace.getCanvas().setAttribute("transform", translation);
    Blockly.mainWorkspace.getBubbleCanvas().setAttribute("transform", translation)
  }
};
Blockly.addChangeListener = function(func) {
  return Blockly.bindEvent_(Blockly.mainWorkspace.getCanvas(), "blocklyWorkspaceChange", null, func)
};
Blockly.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData)
};


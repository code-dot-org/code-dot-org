// Do not edit this generated file
"use strict";


Blockly.JavaScript = Blockly.Generator.get("JavaScript");
Blockly.JavaScript.addReservedWords("Blockly,break,case,catch,continue,debugger,default,delete,do,else,finally,for,function,if,in,instanceof,new,return,switch,this,throw,try,typeof,var,void,while,with,class,enum,export,extends,import,super,implements,interface,let,package,private,protected,public,static,yield,const,null,true,false,Array,ArrayBuffer,Boolean,Date,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Error,eval,EvalError,Float32Array,Float64Array,Function,Infinity,Int16Array,Int32Array,Int8Array,isFinite,isNaN,Iterator,JSON,Math,NaN,Number,Object,parseFloat,parseInt,RangeError,ReferenceError,RegExp,StopIteration,String,SyntaxError,TypeError,Uint16Array,Uint32Array,Uint8Array,Uint8ClampedArray,undefined,uneval,URIError,applicationCache,closed,Components,content,_content,controllers,crypto,defaultStatus,dialogArguments,directories,document,frameElement,frames,fullScreen,globalStorage,history,innerHeight,innerWidth,length,location,locationbar,localStorage,menubar,messageManager,mozAnimationStartTime,mozInnerScreenX,mozInnerScreenY,mozPaintCount,name,navigator,opener,outerHeight,outerWidth,pageXOffset,pageYOffset,parent,performance,personalbar,pkcs11,returnValue,screen,screenX,screenY,scrollbars,scrollMaxX,scrollMaxY,scrollX,scrollY,self,sessionStorage,sidebar,status,statusbar,toolbar,top,URL,window,addEventListener,alert,atob,back,blur,btoa,captureEvents,clearImmediate,clearInterval,clearTimeout,close,confirm,disableExternalCapture,dispatchEvent,dump,enableExternalCapture,escape,find,focus,forward,GeckoActiveXObject,getAttention,getAttentionWithCycleCount,getComputedStyle,getSelection,home,matchMedia,maximize,minimize,moveBy,moveTo,mozRequestAnimationFrame,open,openDialog,postMessage,print,prompt,QueryInterface,releaseEvents,removeEventListener,resizeBy,resizeTo,restore,routeEvent,scroll,scrollBy,scrollByLines,scrollByPages,scrollTo,setCursor,setImmediate,setInterval,setResizable,setTimeout,showModalDialog,sizeToContent,stop,unescape,updateCommands,XPCNativeWrapper,XPCSafeJSObjectWrapper,onabort,onbeforeunload,onblur,onchange,onclick,onclose,oncontextmenu,ondevicemotion,ondeviceorientation,ondragdrop,onerror,onfocus,onhashchange,onkeydown,onkeypress,onkeyup,onload,onmousedown,onmousemove,onmouseout,onmouseover,onmouseup,onmozbeforepaint,onpaint,onpopstate,onreset,onresize,onscroll,onselect,onsubmit,onunload,onpageshow,onpagehide,Image,Option,Worker,Event,Range,File,FileReader,Blob,BlobBuilder,Attr,CDATASection,CharacterData,Comment,console,DocumentFragment,DocumentType,DomConfiguration,DOMError,DOMErrorHandler,DOMException,DOMImplementation,DOMImplementationList,DOMImplementationRegistry,DOMImplementationSource,DOMLocator,DOMObject,DOMString,DOMStringList,DOMTimeStamp,DOMUserData,Entity,EntityReference,MediaQueryList,MediaQueryListListener,NameList,NamedNodeMap,Node,NodeFilter,NodeIterator,NodeList,Notation,Plugin,PluginArray,ProcessingInstruction,SharedWorker,Text,TimeRanges,Treewalker,TypeInfo,UserDataHandler,Worker,WorkerGlobalScope,HTMLDocument,HTMLElement,HTMLAnchorElement,HTMLAppletElement,HTMLAudioElement,HTMLAreaElement,HTMLBaseElement,HTMLBaseFontElement,HTMLBodyElement,HTMLBRElement,HTMLButtonElement,HTMLCanvasElement,HTMLDirectoryElement,HTMLDivElement,HTMLDListElement,HTMLEmbedElement,HTMLFieldSetElement,HTMLFontElement,HTMLFormElement,HTMLFrameElement,HTMLFrameSetElement,HTMLHeadElement,HTMLHeadingElement,HTMLHtmlElement,HTMLHRElement,HTMLIFrameElement,HTMLImageElement,HTMLInputElement,HTMLKeygenElement,HTMLLabelElement,HTMLLIElement,HTMLLinkElement,HTMLMapElement,HTMLMenuElement,HTMLMetaElement,HTMLModElement,HTMLObjectElement,HTMLOListElement,HTMLOptGroupElement,HTMLOptionElement,HTMLOutputElement,HTMLParagraphElement,HTMLParamElement,HTMLPreElement,HTMLQuoteElement,HTMLScriptElement,HTMLSelectElement,HTMLSourceElement,HTMLSpanElement,HTMLStyleElement,HTMLTableElement,HTMLTableCaptionElement,HTMLTableCellElement,HTMLTableDataCellElement,HTMLTableHeaderCellElement,HTMLTableColElement,HTMLTableRowElement,HTMLTableSectionElement,HTMLTextAreaElement,HTMLTimeElement,HTMLTitleElement,HTMLTrackElement,HTMLUListElement,HTMLUnknownElement,HTMLVideoElement,HTMLCanvasElement,CanvasRenderingContext2D,CanvasGradient,CanvasPattern,TextMetrics,ImageData,CanvasPixelArray,HTMLAudioElement,HTMLVideoElement,NotifyAudioAvailableEvent,HTMLCollection,HTMLAllCollection,HTMLFormControlsCollection,HTMLOptionsCollection,HTMLPropertiesCollection,DOMTokenList,DOMSettableTokenList,DOMStringMap,RadioNodeList,SVGDocument,SVGElement,SVGAElement,SVGAltGlyphElement,SVGAltGlyphDefElement,SVGAltGlyphItemElement,SVGAnimationElement,SVGAnimateElement,SVGAnimateColorElement,SVGAnimateMotionElement,SVGAnimateTransformElement,SVGSetElement,SVGCircleElement,SVGClipPathElement,SVGColorProfileElement,SVGCursorElement,SVGDefsElement,SVGDescElement,SVGEllipseElement,SVGFilterElement,SVGFilterPrimitiveStandardAttributes,SVGFEBlendElement,SVGFEColorMatrixElement,SVGFEComponentTransferElement,SVGFECompositeElement,SVGFEConvolveMatrixElement,SVGFEDiffuseLightingElement,SVGFEDisplacementMapElement,SVGFEDistantLightElement,SVGFEFloodElement,SVGFEGaussianBlurElement,SVGFEImageElement,SVGFEMergeElement,SVGFEMergeNodeElement,SVGFEMorphologyElement,SVGFEOffsetElement,SVGFEPointLightElement,SVGFESpecularLightingElement,SVGFESpotLightElement,SVGFETileElement,SVGFETurbulenceElement,SVGComponentTransferFunctionElement,SVGFEFuncRElement,SVGFEFuncGElement,SVGFEFuncBElement,SVGFEFuncAElement,SVGFontElement,SVGFontFaceElement,SVGFontFaceFormatElement,SVGFontFaceNameElement,SVGFontFaceSrcElement,SVGFontFaceUriElement,SVGForeignObjectElement,SVGGElement,SVGGlyphElement,SVGGlyphRefElement,SVGGradientElement,SVGLinearGradientElement,SVGRadialGradientElement,SVGHKernElement,SVGImageElement,SVGLineElement,SVGMarkerElement,SVGMaskElement,SVGMetadataElement,SVGMissingGlyphElement,SVGMPathElement,SVGPathElement,SVGPatternElement,SVGPolylineElement,SVGPolygonElement,SVGRectElement,SVGScriptElement,SVGStopElement,SVGStyleElement,SVGSVGElement,SVGSwitchElement,SVGSymbolElement,SVGTextElement,SVGTextPathElement,SVGTitleElement,SVGTRefElement,SVGTSpanElement,SVGUseElement,SVGViewElement,SVGVKernElement,SVGAngle,SVGColor,SVGICCColor,SVGElementInstance,SVGElementInstanceList,SVGLength,SVGLengthList,SVGMatrix,SVGNumber,SVGNumberList,SVGPaint,SVGPoint,SVGPointList,SVGPreserveAspectRatio,SVGRect,SVGStringList,SVGTransform,SVGTransformList,SVGAnimatedAngle,SVGAnimatedBoolean,SVGAnimatedEnumeration,SVGAnimatedInteger,SVGAnimatedLength,SVGAnimatedLengthList,SVGAnimatedNumber,SVGAnimatedNumberList,SVGAnimatedPreserveAspectRatio,SVGAnimatedRect,SVGAnimatedString,SVGAnimatedTransformList,SVGPathSegList,SVGPathSeg,SVGPathSegArcAbs,SVGPathSegArcRel,SVGPathSegClosePath,SVGPathSegCurvetoCubicAbs,SVGPathSegCurvetoCubicRel,SVGPathSegCurvetoCubicSmoothAbs,SVGPathSegCurvetoCubicSmoothRel,SVGPathSegCurvetoQuadraticAbs,SVGPathSegCurvetoQuadraticRel,SVGPathSegCurvetoQuadraticSmoothAbs,SVGPathSegCurvetoQuadraticSmoothRel,SVGPathSegLinetoAbs,SVGPathSegLinetoHorizontalAbs,SVGPathSegLinetoHorizontalRel,SVGPathSegLinetoRel,SVGPathSegLinetoVerticalAbs,SVGPathSegLinetoVerticalRel,SVGPathSegMovetoAbs,SVGPathSegMovetoRel,ElementTimeControl,TimeEvent,SVGAnimatedPathData,SVGAnimatedPoints,SVGColorProfileRule,SVGCSSRule,SVGExternalResourcesRequired,SVGFitToViewBox,SVGLangSpace,SVGLocatable,SVGRenderingIntent,SVGStylable,SVGTests,SVGTextContentElement,SVGTextPositioningElement,SVGTransformable,SVGUnitTypes,SVGURIReference,SVGViewSpec,SVGZoomAndPan");
Blockly.JavaScript.ORDER_ATOMIC = 0;
Blockly.JavaScript.ORDER_MEMBER = 1;
Blockly.JavaScript.ORDER_NEW = 1;
Blockly.JavaScript.ORDER_FUNCTION_CALL = 2;
Blockly.JavaScript.ORDER_INCREMENT = 3;
Blockly.JavaScript.ORDER_DECREMENT = 3;
Blockly.JavaScript.ORDER_LOGICAL_NOT = 4;
Blockly.JavaScript.ORDER_BITWISE_NOT = 4;
Blockly.JavaScript.ORDER_UNARY_PLUS = 4;
Blockly.JavaScript.ORDER_UNARY_NEGATION = 4;
Blockly.JavaScript.ORDER_TYPEOF = 4;
Blockly.JavaScript.ORDER_VOID = 4;
Blockly.JavaScript.ORDER_DELETE = 4;
Blockly.JavaScript.ORDER_MULTIPLICATION = 5;
Blockly.JavaScript.ORDER_DIVISION = 5;
Blockly.JavaScript.ORDER_MODULUS = 5;
Blockly.JavaScript.ORDER_ADDITION = 6;
Blockly.JavaScript.ORDER_SUBTRACTION = 6;
Blockly.JavaScript.ORDER_BITWISE_SHIFT = 7;
Blockly.JavaScript.ORDER_RELATIONAL = 8;
Blockly.JavaScript.ORDER_IN = 8;
Blockly.JavaScript.ORDER_INSTANCEOF = 8;
Blockly.JavaScript.ORDER_EQUALITY = 9;
Blockly.JavaScript.ORDER_BITWISE_AND = 10;
Blockly.JavaScript.ORDER_BITWISE_XOR = 11;
Blockly.JavaScript.ORDER_BITWISE_OR = 12;
Blockly.JavaScript.ORDER_LOGICAL_AND = 13;
Blockly.JavaScript.ORDER_LOGICAL_OR = 14;
Blockly.JavaScript.ORDER_CONDITIONAL = 15;
Blockly.JavaScript.ORDER_ASSIGNMENT = 16;
Blockly.JavaScript.ORDER_COMMA = 17;
Blockly.JavaScript.ORDER_NONE = 99;
Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
Blockly.JavaScript.init = function() {
  Blockly.JavaScript.definitions_ = {};
  if(Blockly.Variables && (Blockly.JavaScript.variableDB_ ? Blockly.JavaScript.variableDB_.reset() : Blockly.JavaScript.variableDB_ = new Blockly.Names(Blockly.JavaScript.RESERVED_WORDS_), !Blockly.varsInGlobals)) {
    for(var a = [], b = Blockly.Variables.allVariables(), c = 0;c < b.length;c++) {
      a[c] = "var " + Blockly.JavaScript.variableDB_.getName(b[c], Blockly.Variables.NAME_TYPE) + ";"
    }
    Blockly.JavaScript.definitions_.variables = a.join("\n")
  }
};
Blockly.JavaScript.finish = function(a) {
  var b = [], c;
  for(c in Blockly.JavaScript.definitions_) {
    b.push(Blockly.JavaScript.definitions_[c])
  }
  return b.join("\n\n") + "\n\n\n" + a
};
Blockly.JavaScript.scrubNakedValue = function(a) {
  return a + ";\n"
};
Blockly.JavaScript.quote_ = function(a) {
  a = a.replace(/\\/g, "\\\\").replace(/\n/g, "\\\n").replace(/'/g, "\\'");
  return"'" + a + "'"
};
Blockly.JavaScript.translateVarName = function(a) {
  var b = Blockly.JavaScript.variableDB_.getName(a, Blockly.Variables.NAME_TYPE);
  return Blockly.varsInGlobals ? Blockly.JavaScript.variableDB_.checkSpecificType(a, Blockly.Variables.NAME_TYPE, Blockly.Variables.NAME_TYPE_LOCAL) ? b : "Globals." + b : b
};
Blockly.JavaScript.scrub_ = function(a, b, c) {
  if(null === b) {
    return""
  }
  var d = "";
  if(!a.outputConnection || !a.outputConnection.targetConnection) {
    var e = a.getCommentText();
    e && (d += Blockly.Generator.prefixLines(e, "// ") + "\n");
    for(var g = 0;g < a.inputList.length;g++) {
      a.inputList[g].type == Blockly.INPUT_VALUE && (e = a.inputList[g].connection.targetBlock()) && (e = Blockly.Generator.allNestedComments(e)) && (d += Blockly.Generator.prefixLines(e, "// "))
    }
  }
  a = a.nextConnection && a.nextConnection.targetBlock();
  c = this.blockToCode(a, c);
  return d + b + c
};
Blockly.JavaScript.colour = {};
Blockly.JavaScript.colour_picker = function() {
  return["'" + this.getTitleValue("COLOUR") + "'", Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.colour_random = function() {
  if(!Blockly.JavaScript.definitions_.colour_random) {
    var a = Blockly.JavaScript.variableDB_.getDistinctName("colour_random", Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript.colour_random.functionName = a;
    var b = [];
    b.push("function " + a + "() {");
    b.push("  var num = Math.floor(Math.random() * Math.pow(2, 24));");
    b.push("  return '#' + ('00000' + num.toString(16)).substr(-6);");
    b.push("}");
    Blockly.JavaScript.definitions_.colour_random = b.join("\n")
  }
  return[Blockly.JavaScript.colour_random.functionName + "()", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.colour_rgb = function() {
  var a = Blockly.JavaScript.valueToCode(this, "RED", Blockly.JavaScript.ORDER_COMMA) || 0, b = Blockly.JavaScript.valueToCode(this, "GREEN", Blockly.JavaScript.ORDER_COMMA) || 0, c = Blockly.JavaScript.valueToCode(this, "BLUE", Blockly.JavaScript.ORDER_COMMA) || 0;
  if(!Blockly.JavaScript.definitions_.colour_rgb) {
    var d = Blockly.JavaScript.variableDB_.getDistinctName("colour_rgb", Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript.colour_rgb.functionName = d;
    var e = [];
    e.push("function " + d + "(r, g, b) {");
    e.push("  r = Math.round(Math.max(Math.min(Number(r), 255), 0));");
    e.push("  g = Math.round(Math.max(Math.min(Number(g), 255), 0));");
    e.push("  b = Math.round(Math.max(Math.min(Number(b), 255), 0));");
    e.push("  r = ('0' + (r || 0).toString(16)).slice(-2);");
    e.push("  g = ('0' + (g || 0).toString(16)).slice(-2);");
    e.push("  b = ('0' + (b || 0).toString(16)).slice(-2);");
    e.push("  return '#' + r + g + b;");
    e.push("}");
    Blockly.JavaScript.definitions_.colour_rgb = e.join("\n")
  }
  return[Blockly.JavaScript.colour_rgb.functionName + "(" + a + ", " + b + ", " + c + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.colour_blend = function() {
  var a = Blockly.JavaScript.valueToCode(this, "COLOUR1", Blockly.JavaScript.ORDER_COMMA) || "'#000000'", b = Blockly.JavaScript.valueToCode(this, "COLOUR2", Blockly.JavaScript.ORDER_COMMA) || "'#000000'", c = Blockly.JavaScript.valueToCode(this, "RATIO", Blockly.JavaScript.ORDER_COMMA) || 0.5;
  if(!Blockly.JavaScript.definitions_.colour_blend) {
    var d = Blockly.JavaScript.variableDB_.getDistinctName("colour_blend", Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript.colour_blend.functionName = d;
    var e = [];
    e.push("function " + d + "(c1, c2, ratio) {");
    e.push("  ratio = Math.max(Math.min(Number(ratio), 1), 0);");
    e.push("  var r1 = parseInt(c1.substring(1, 3), 16);");
    e.push("  var g1 = parseInt(c1.substring(3, 5), 16);");
    e.push("  var b1 = parseInt(c1.substring(5, 7), 16);");
    e.push("  var r2 = parseInt(c2.substring(1, 3), 16);");
    e.push("  var g2 = parseInt(c2.substring(3, 5), 16);");
    e.push("  var b2 = parseInt(c2.substring(5, 7), 16);");
    e.push("  var r = Math.round(r1 * (1 - ratio) + r2 * ratio);");
    e.push("  var g = Math.round(g1 * (1 - ratio) + g2 * ratio);");
    e.push("  var b = Math.round(b1 * (1 - ratio) + b2 * ratio);");
    e.push("  r = ('0' + (r || 0).toString(16)).slice(-2);");
    e.push("  g = ('0' + (g || 0).toString(16)).slice(-2);");
    e.push("  b = ('0' + (b || 0).toString(16)).slice(-2);");
    e.push("  return '#' + r + g + b;");
    e.push("}");
    Blockly.JavaScript.definitions_.colour_blend = e.join("\n")
  }
  return[Blockly.JavaScript.colour_blend.functionName + "(" + a + ", " + b + ", " + c + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.lists = {};
Blockly.JavaScript.lists_create_empty = function() {
  return["[]", Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.lists_create_with = function() {
  for(var a = Array(this.itemCount_), b = 0;b < this.itemCount_;b++) {
    a[b] = Blockly.JavaScript.valueToCode(this, "ADD" + b, Blockly.JavaScript.ORDER_COMMA) || "null"
  }
  a = "[" + a.join(", ") + "]";
  return[a, Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.lists_repeat = function() {
  if(!Blockly.JavaScript.definitions_.lists_repeat) {
    var a = Blockly.JavaScript.variableDB_.getDistinctName("lists_repeat", Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript.lists_repeat.repeat = a;
    var b = [];
    b.push("function " + a + "(value, n) {");
    b.push("  var array = [];");
    b.push("  for (var i = 0; i < n; i++) {");
    b.push("    array[i] = value;");
    b.push("  }");
    b.push("  return array;");
    b.push("}");
    Blockly.JavaScript.definitions_.lists_repeat = b.join("\n")
  }
  a = Blockly.JavaScript.valueToCode(this, "ITEM", Blockly.JavaScript.ORDER_COMMA) || "null";
  b = Blockly.JavaScript.valueToCode(this, "NUM", Blockly.JavaScript.ORDER_COMMA) || "0";
  return[Blockly.JavaScript.lists_repeat.repeat + "(" + a + ", " + b + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.lists_length = function() {
  return[(Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_FUNCTION_CALL) || "''") + ".length", Blockly.JavaScript.ORDER_MEMBER]
};
Blockly.JavaScript.lists_isEmpty = function() {
  return["!" + (Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "[]") + ".length", Blockly.JavaScript.ORDER_LOGICAL_NOT]
};
Blockly.JavaScript.lists_indexOf = function() {
  var a = "FIRST" == this.getTitleValue("END") ? "indexOf" : "lastIndexOf", b = Blockly.JavaScript.valueToCode(this, "FIND", Blockly.JavaScript.ORDER_NONE) || "''";
  return[(Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "[]") + "." + a + "(" + b + ") + 1", Blockly.JavaScript.ORDER_MEMBER]
};
Blockly.JavaScript.lists_getIndex = function() {
  var a = this.getTitleValue("MODE") || "GET", b = this.getTitleValue("WHERE") || "FROM_START", c = Blockly.JavaScript.valueToCode(this, "AT", Blockly.JavaScript.ORDER_UNARY_NEGATION) || "1", d = Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "[]";
  if("FIRST" == b) {
    if("GET" == a) {
      return[d + "[0]", Blockly.JavaScript.ORDER_MEMBER]
    }
    if("GET_REMOVE" == a) {
      return[d + ".shift()", Blockly.JavaScript.ORDER_MEMBER]
    }
    if("REMOVE" == a) {
      return d + ".shift();\n"
    }
  }else {
    if("LAST" == b) {
      if("GET" == a) {
        return[d + ".slice(-1)[0]", Blockly.JavaScript.ORDER_MEMBER]
      }
      if("GET_REMOVE" == a) {
        return[d + ".pop()", Blockly.JavaScript.ORDER_MEMBER]
      }
      if("REMOVE" == a) {
        return d + ".pop();\n"
      }
    }else {
      if("FROM_START" == b) {
        c = Blockly.isNumber(c) ? parseFloat(c) - 1 : c + " - 1";
        if("GET" == a) {
          return[d + "[" + c + "]", Blockly.JavaScript.ORDER_MEMBER]
        }
        if("GET_REMOVE" == a) {
          return[d + ".splice(" + c + ", 1)[0]", Blockly.JavaScript.ORDER_FUNCTION_CALL]
        }
        if("REMOVE" == a) {
          return d + ".splice(" + c + ", 1);\n"
        }
      }else {
        if("FROM_END" == b) {
          if("GET" == a) {
            return[d + ".slice(-" + c + ")[0]", Blockly.JavaScript.ORDER_FUNCTION_CALL]
          }
          if("GET_REMOVE" == a || "REMOVE" == a) {
            if(!Blockly.JavaScript.definitions_.lists_remove_from_end) {
              b = Blockly.JavaScript.variableDB_.getDistinctName("lists_remove_from_end", Blockly.Generator.NAME_TYPE);
              Blockly.JavaScript.lists_getIndex.lists_remove_from_end = b;
              var e = [];
              e.push("function " + b + "(list, x) {");
              e.push("  x = list.length - x;");
              e.push("  return list.splice(x, 1)[0];");
              e.push("}");
              Blockly.JavaScript.definitions_.lists_remove_from_end = e.join("\n")
            }
            c = Blockly.JavaScript.lists_getIndex.lists_remove_from_end + "(" + d + ", " + c + ")";
            if("GET_REMOVE" == a) {
              return[c, Blockly.JavaScript.ORDER_FUNCTION_CALL]
            }
            if("REMOVE" == a) {
              return c + ";\n"
            }
          }
        }else {
          if("RANDOM" == b) {
            Blockly.JavaScript.definitions_.lists_get_random_item || (b = Blockly.JavaScript.variableDB_.getDistinctName("lists_get_random_item", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.lists_getIndex.random = b, e = [], e.push("function " + b + "(list, remove) {"), e.push("  var x = Math.floor(Math.random() * list.length);"), e.push("  if (remove) {"), e.push("    return list.splice(x, 1)[0];"), e.push("  } else {"), e.push("    return list[x];"), e.push("  }"), e.push("}"), Blockly.JavaScript.definitions_.lists_get_random_item = 
            e.join("\n"));
            c = Blockly.JavaScript.lists_getIndex.random + "(" + d + ", " + ("GET" != a) + ")";
            if("GET" == a || "GET_REMOVE" == a) {
              return[c, Blockly.JavaScript.ORDER_FUNCTION_CALL]
            }
            if("REMOVE" == a) {
              return c + ";\n"
            }
          }
        }
      }
    }
  }
  throw"Unhandled combination (lists_getIndex).";
};
Blockly.JavaScript.lists_setIndex = function() {
  function a() {
    if(b.match(/^\w+$/)) {
      return""
    }
    var a = Blockly.JavaScript.variableDB_.getDistinctName("tmp_list", Blockly.Variables.NAME_TYPE), c = "var " + a + " = " + b + ";\n";
    b = a;
    return c
  }
  var b = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_MEMBER) || "[]", c = this.getTitleValue("MODE") || "GET", d = this.getTitleValue("WHERE") || "FROM_START", e = Blockly.JavaScript.valueToCode(this, "AT", Blockly.JavaScript.ORDER_NONE) || "1", g = Blockly.JavaScript.valueToCode(this, "TO", Blockly.JavaScript.ORDER_ASSIGNMENT) || "null";
  if("FIRST" == d) {
    if("SET" == c) {
      return b + "[0] = " + g + ";\n"
    }
    if("INSERT" == c) {
      return b + ".unshift(" + g + ");\n"
    }
  }else {
    if("LAST" == d) {
      if("SET" == c) {
        return d = a(), d + (b + "[" + b + ".length - 1] = " + g + ";\n")
      }
      if("INSERT" == c) {
        return b + ".push(" + g + ");\n"
      }
    }else {
      if("FROM_START" == d) {
        e = Blockly.isNumber(e) ? parseFloat(e) - 1 : e + " - 1";
        if("SET" == c) {
          return b + "[" + e + "] = " + g + ";\n"
        }
        if("INSERT" == c) {
          return b + ".splice(" + e + ", 0, " + g + ");\n"
        }
      }else {
        if("FROM_END" == d) {
          d = a();
          if("SET" == c) {
            return d += b + "[" + b + ".length - " + e + "] = " + g + ";\n"
          }
          if("INSERT" == c) {
            return d += b + ".splice(" + b + ".length - " + e + ", 0, " + g + ");\n"
          }
        }else {
          if("RANDOM" == d) {
            d = a();
            e = Blockly.JavaScript.variableDB_.getDistinctName("tmp_x", Blockly.Variables.NAME_TYPE);
            d += "var " + e + " = Math.floor(Math.random() * " + b + ".length);\n";
            if("SET" == c) {
              return d += b + "[" + e + "] = " + g + ";\n"
            }
            if("INSERT" == c) {
              return d += b + ".splice(" + e + ", 0, " + g + ");\n"
            }
          }
        }
      }
    }
  }
  throw"Unhandled combination (lists_setIndex).";
};
Blockly.JavaScript.lists_getSublist = function() {
  var a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_MEMBER) || "[]", b = this.getTitleValue("WHERE1"), c = this.getTitleValue("WHERE2"), d = Blockly.JavaScript.valueToCode(this, "AT1", Blockly.JavaScript.ORDER_NONE) || "1", e = Blockly.JavaScript.valueToCode(this, "AT2", Blockly.JavaScript.ORDER_NONE) || "1";
  if("FIRST" == b && "LAST" == c) {
    a += ".concat()"
  }else {
    if(!Blockly.JavaScript.definitions_.lists_get_sublist) {
      var g = Blockly.JavaScript.variableDB_.getDistinctName("lists_get_sublist", Blockly.Generator.NAME_TYPE);
      Blockly.JavaScript.lists_getSublist.func = g;
      var f = [];
      f.push("function " + g + "(list, where1, at1, where2, at2) {");
      f.push("  function getAt(where, at) {");
      f.push("    if (where == 'FROM_START') {");
      f.push("      at--;");
      f.push("    } else if (where == 'FROM_END') {");
      f.push("      at = list.length - at;");
      f.push("    } else if (where == 'FIRST') {");
      f.push("      at = 0;");
      f.push("    } else if (where == 'LAST') {");
      f.push("      at = list.length - 1;");
      f.push("    } else {");
      f.push("      throw 'Unhandled option (lists_getSublist).';");
      f.push("    }");
      f.push("    return at;");
      f.push("  }");
      f.push("  at1 = getAt(where1, at1);");
      f.push("  at2 = getAt(where2, at2) + 1;");
      f.push("  return list.slice(at1, at2);");
      f.push("}");
      Blockly.JavaScript.definitions_.lists_get_sublist = f.join("\n")
    }
    a = Blockly.JavaScript.lists_getSublist.func + "(" + a + ", '" + b + "', " + d + ", '" + c + "', " + e + ")"
  }
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.logic = {};
Blockly.JavaScript.controls_if = function() {
  for(var a = 0, b = Blockly.JavaScript.valueToCode(this, "IF" + a, Blockly.JavaScript.ORDER_NONE) || "false", c = Blockly.JavaScript.statementToCode(this, "DO" + a), d = "if (" + b + ") {\n" + c + "}", a = 1;a <= this.elseifCount_;a++) {
    b = Blockly.JavaScript.valueToCode(this, "IF" + a, Blockly.JavaScript.ORDER_NONE) || "false", c = Blockly.JavaScript.statementToCode(this, "DO" + a), d += " else if (" + b + ") {\n" + c + "}"
  }
  this.elseCount_ && (c = Blockly.JavaScript.statementToCode(this, "ELSE"), d += " else {\n" + c + "}\n");
  return d + "\n"
};
Blockly.JavaScript.logic_compare = function() {
  var a = this.getTitleValue("OP"), a = Blockly.JavaScript.logic_compare.OPERATORS[a], b = "==" == a || "!=" == a ? Blockly.JavaScript.ORDER_EQUALITY : Blockly.JavaScript.ORDER_RELATIONAL, c = Blockly.JavaScript.valueToCode(this, "A", b) || "0", d = Blockly.JavaScript.valueToCode(this, "B", b) || "0";
  return[c + " " + a + " " + d, b]
};
Blockly.JavaScript.logic_compare.OPERATORS = {EQ:"==", NEQ:"!=", LT:"<", LTE:"<=", GT:">", GTE:">="};
Blockly.JavaScript.logic_operation = function() {
  var a = "AND" == this.getTitleValue("OP") ? "&&" : "||", b = "&&" == a ? Blockly.JavaScript.ORDER_LOGICAL_AND : Blockly.JavaScript.ORDER_LOGICAL_OR, c = Blockly.JavaScript.valueToCode(this, "A", b) || "false", d = Blockly.JavaScript.valueToCode(this, "B", b) || "false";
  return[c + " " + a + " " + d, b]
};
Blockly.JavaScript.logic_negate = function() {
  var a = Blockly.JavaScript.ORDER_LOGICAL_NOT;
  return["!" + (Blockly.JavaScript.valueToCode(this, "BOOL", a) || "false"), a]
};
Blockly.JavaScript.logic_boolean = function() {
  return["TRUE" == this.getTitleValue("BOOL") ? "true" : "false", Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.logic_null = function() {
  return["null", Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.logic_ternary = function() {
  var a = Blockly.JavaScript.valueToCode(this, "IF", Blockly.JavaScript.ORDER_CONDITIONAL) || "false", b = Blockly.JavaScript.valueToCode(this, "THEN", Blockly.JavaScript.ORDER_CONDITIONAL) || "null", c = Blockly.JavaScript.valueToCode(this, "ELSE", Blockly.JavaScript.ORDER_CONDITIONAL) || "null";
  return[a + " ? " + b + " : " + c, Blockly.JavaScript.ORDER_CONDITIONAL]
};
Blockly.JavaScript.loops = {};
Blockly.JavaScript.controls_repeat = function() {
  var a = Number(this.getTitleValue("TIMES")) || 0, b = Blockly.JavaScript.statementToCode(this, "DO");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (b = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + b);
  var c = Blockly.JavaScript.variableDB_.getDistinctName("count", Blockly.Variables.NAME_TYPE);
  return"for (var " + c + " = 0; " + c + " < " + a + "; " + c + "++) {\n" + b + "}\n"
};
Blockly.JavaScript.controls_repeat_ext = function() {
  var a = Blockly.JavaScript.valueToCode(this, "TIMES", Blockly.JavaScript.ORDER_ASSIGNMENT) || "0", b = Blockly.JavaScript.statementToCode(this, "DO");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (b = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + b);
  var c = "", d = Blockly.JavaScript.variableDB_.getDistinctName("count", Blockly.Variables.NAME_TYPE), e = a;
  a.match(/^\w+$/) || Blockly.isNumber(a) || (e = Blockly.JavaScript.variableDB_.getDistinctName("repeat_end", Blockly.Variables.NAME_TYPE), c += "var " + e + " = " + a + ";\n");
  return c + ("for (var " + d + " = 0; " + d + " < " + e + "; " + d + "++) {\n" + b + "}\n")
};
Blockly.JavaScript.controls_whileUntil = function() {
  var a = "UNTIL" == this.getTitleValue("MODE"), b = Blockly.JavaScript.valueToCode(this, "BOOL", a ? Blockly.JavaScript.ORDER_LOGICAL_NOT : Blockly.JavaScript.ORDER_NONE) || "false", c = Blockly.JavaScript.statementToCode(this, "DO");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + c);
  a && (b = "!" + b);
  return"while (" + b + ") {\n" + c + "}\n"
};
Blockly.JavaScript.controls_for = function() {
  var a = Blockly.JavaScript.translateVarName(this.getTitleValue("VAR")), b = Blockly.JavaScript.valueToCode(this, "FROM", Blockly.JavaScript.ORDER_ASSIGNMENT) || "0", c = Blockly.JavaScript.valueToCode(this, "TO", Blockly.JavaScript.ORDER_ASSIGNMENT) || "0", d = Blockly.JavaScript.valueToCode(this, "BY", Blockly.JavaScript.ORDER_ASSIGNMENT) || "1", e = Blockly.JavaScript.statementToCode(this, "DO");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (e = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + e);
  var g;
  if(Blockly.isNumber(b) && Blockly.isNumber(c) && Blockly.isNumber(d)) {
    var f = parseFloat(b) <= parseFloat(c);
    g = "for (" + a + " = " + b + "; " + a + (f ? " <= " : " >= ") + c + "; " + a;
    a = Math.abs(parseFloat(d));
    1 === a ? g += f ? "++" : "--" : (g += (f ? " += " : " -= ") + a, 0 === a && (e = "  throw Infinity;\n" + e));
    g += ") {\n" + e + "}\n"
  }else {
    g = "";
    var h = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("VAR"), Blockly.Variables.NAME_TYPE), f = b;
    b.match(/^\w+$/) || Blockly.isNumber(b) || (f = Blockly.JavaScript.variableDB_.getDistinctName(h + "_start", Blockly.Variables.NAME_TYPE), g += "var " + f + " = " + b + ";\n");
    b = c;
    c.match(/^\w+$/) || Blockly.isNumber(c) || (b = Blockly.JavaScript.variableDB_.getDistinctName(h + "_end", Blockly.Variables.NAME_TYPE), g += "var " + b + " = " + c + ";\n");
    c = Blockly.JavaScript.variableDB_.getDistinctName(h + "_inc", Blockly.Variables.NAME_TYPE);
    g += "var " + c + " = ";
    g = Blockly.isNumber(d) ? g + (Math.abs(d) + ";\n") : g + ("Math.abs(" + d + ");\n");
    g = g + ("if (" + f + " > " + b + ") {\n") + ("  " + c + " = -" + c + ";\n");
    g += "}\n";
    g += "for (" + a + " = " + f + ";\n     " + c + " >= 0 ? " + a + " <= " + b + " : " + a + " >= " + b + ";\n     " + a + " += " + c + ") {\n" + e + "}\n"
  }
  return g
};
Blockly.JavaScript.controls_forEach = function() {
  var a = Blockly.JavaScript.translateVarName(this.getTitleValue("VAR")), b = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_ASSIGNMENT) || "[]", c = Blockly.JavaScript.statementToCode(this, "DO");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + c);
  var d = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("VAR"), Blockly.Variables.NAME_TYPE), e = Blockly.JavaScript.variableDB_.getDistinctName(d + "_index", Blockly.Variables.NAME_TYPE);
  b.match(/^\w+$/) ? a = "for (var " + e + " in  " + b + ") {\n" + ("  " + a + " = " + b + "[" + e + "];\n" + c) + "}\n" : (d = Blockly.JavaScript.variableDB_.getDistinctName(d + "_list", Blockly.Variables.NAME_TYPE), c = "  " + a + " = " + d + "[" + e + "];\n" + c, a = "var " + d + " = " + b + ";\nfor (var " + e + " in " + d + ") {\n" + c + "}\n");
  return a
};
Blockly.JavaScript.controls_flow_statements = function() {
  switch(this.getTitleValue("FLOW")) {
    case "BREAK":
      return"break;\n";
    case "CONTINUE":
      return"continue;\n"
  }
  throw"Unknown flow statement.";
};
Blockly.JavaScript.math = {};
Blockly.JavaScript.math_number = function() {
  return[window.parseFloat(this.getTitleValue("NUM")) || 0, Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.math_arithmetic = function() {
  var a = this.getTitleValue("OP"), b = Blockly.JavaScript.math_arithmetic.OPERATORS[a], a = b[0], b = b[1], c = Blockly.JavaScript.valueToCode(this, "A", b) || "0", d = Blockly.JavaScript.valueToCode(this, "B", b) || "0";
  return a ? [c + a + d, b] : ["Math.pow(" + c + ", " + d + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.math_arithmetic.OPERATORS = {ADD:[" + ", Blockly.JavaScript.ORDER_ADDITION], MINUS:[" - ", Blockly.JavaScript.ORDER_SUBTRACTION], MULTIPLY:[" * ", Blockly.JavaScript.ORDER_MULTIPLICATION], DIVIDE:[" / ", Blockly.JavaScript.ORDER_DIVISION], POWER:[null, Blockly.JavaScript.ORDER_COMMA]};
Blockly.JavaScript.math_single = function() {
  var a = this.getTitleValue("OP"), b, c;
  if("NEG" == a) {
    return c = Blockly.JavaScript.valueToCode(this, "NUM", Blockly.JavaScript.ORDER_UNARY_NEGATION) || "0", "-" == c[0] && (c = " " + c), ["-" + c, Blockly.JavaScript.ORDER_UNARY_NEGATION]
  }
  c = "SIN" == a || "COS" == a || "TAN" == a ? Blockly.JavaScript.valueToCode(this, "NUM", Blockly.JavaScript.ORDER_DIVISION) || "0" : Blockly.JavaScript.valueToCode(this, "NUM", Blockly.JavaScript.ORDER_NONE) || "0";
  switch(a) {
    case "ABS":
      b = "Math.abs(" + c + ")";
      break;
    case "ROOT":
      b = "Math.sqrt(" + c + ")";
      break;
    case "LN":
      b = "Math.log(" + c + ")";
      break;
    case "EXP":
      b = "Math.exp(" + c + ")";
      break;
    case "POW10":
      b = "Math.pow(10," + c + ")";
      break;
    case "ROUND":
      b = "Math.round(" + c + ")";
      break;
    case "ROUNDUP":
      b = "Math.ceil(" + c + ")";
      break;
    case "ROUNDDOWN":
      b = "Math.floor(" + c + ")";
      break;
    case "SIN":
      b = "Math.sin(" + c + " / 180 * Math.PI)";
      break;
    case "COS":
      b = "Math.cos(" + c + " / 180 * Math.PI)";
      break;
    case "TAN":
      b = "Math.tan(" + c + " / 180 * Math.PI)"
  }
  if(b) {
    return[b, Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }
  switch(a) {
    case "LOG10":
      b = "Math.log(" + c + ") / Math.log(10)";
      break;
    case "ASIN":
      b = "Math.asin(" + c + ") / Math.PI * 180";
      break;
    case "ACOS":
      b = "Math.acos(" + c + ") / Math.PI * 180";
      break;
    case "ATAN":
      b = "Math.atan(" + c + ") / Math.PI * 180";
      break;
    default:
      throw"Unknown math operator: " + a;
  }
  return[b, Blockly.JavaScript.ORDER_DIVISION]
};
Blockly.JavaScript.math_constant = function() {
  var a = this.getTitleValue("CONSTANT");
  return Blockly.JavaScript.math_constant.CONSTANTS[a]
};
Blockly.JavaScript.math_constant.CONSTANTS = {PI:["Math.PI", Blockly.JavaScript.ORDER_MEMBER], E:["Math.E", Blockly.JavaScript.ORDER_MEMBER], GOLDEN_RATIO:["(1 + Math.sqrt(5)) / 2", Blockly.JavaScript.ORDER_DIVISION], SQRT2:["Math.SQRT2", Blockly.JavaScript.ORDER_MEMBER], SQRT1_2:["Math.SQRT1_2", Blockly.JavaScript.ORDER_MEMBER], INFINITY:["Infinity", Blockly.JavaScript.ORDER_ATOMIC]};
Blockly.JavaScript.math_number_property = function() {
  var a = Blockly.JavaScript.valueToCode(this, "NUMBER_TO_CHECK", Blockly.JavaScript.ORDER_MODULUS) || "0", b = this.getTitleValue("PROPERTY"), c;
  if("PRIME" == b) {
    return Blockly.JavaScript.definitions_.isPrime || (b = Blockly.JavaScript.variableDB_.getDistinctName("isPrime", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.logic_prime = b, c = [], c.push("function " + b + "(n) {"), c.push("  // http://en.wikipedia.org/wiki/Primality_test#Naive_methods"), c.push("  if (n == 2 || n == 3) {"), c.push("    return true;"), c.push("  }"), c.push("  // False if n is NaN, negative, is 1, or not whole."), c.push("  // And false if n is divisible by 2 or 3."), c.push("  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 || n % 3 == 0) {"), 
    c.push("    return false;"), c.push("  }"), c.push("  // Check all the numbers of form 6k +/- 1, up to sqrt(n)."), c.push("  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {"), c.push("    if (n % (x - 1) == 0 || n % (x + 1) == 0) {"), c.push("      return false;"), c.push("    }"), c.push("  }"), c.push("  return true;"), c.push("}"), Blockly.JavaScript.definitions_.isPrime = c.join("\n")), c = Blockly.JavaScript.logic_prime + "(" + a + ")", [c, Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }
  switch(b) {
    case "EVEN":
      c = a + " % 2 == 0";
      break;
    case "ODD":
      c = a + " % 2 == 1";
      break;
    case "WHOLE":
      c = a + " % 1 == 0";
      break;
    case "POSITIVE":
      c = a + " > 0";
      break;
    case "NEGATIVE":
      c = a + " < 0";
      break;
    case "DIVISIBLE_BY":
      b = Blockly.JavaScript.valueToCode(this, "DIVISOR", Blockly.JavaScript.ORDER_MODULUS) || "0", c = a + " % " + b + " == 0"
  }
  return[c, Blockly.JavaScript.ORDER_EQUALITY]
};
Blockly.JavaScript.math_change = function() {
  var a = Blockly.JavaScript.valueToCode(this, "DELTA", Blockly.JavaScript.ORDER_ADDITION) || "0", b = Blockly.JavaScript.translateVarName(this.getTitleValue("VAR"));
  return b + " = (typeof " + b + " == 'number' ? " + b + " : 0) + " + a + ";\n"
};
Blockly.JavaScript.math_round = Blockly.JavaScript.math_single;
Blockly.JavaScript.math_trig = Blockly.JavaScript.math_single;
Blockly.JavaScript.math_on_list = function() {
  var a = this.getTitleValue("OP");
  switch(a) {
    case "SUM":
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_MEMBER) || "[]";
      a += ".reduce(function(x, y) {return x + y;})";
      break;
    case "MIN":
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_COMMA) || "[]";
      a = "Math.min.apply(null, " + a + ")";
      break;
    case "MAX":
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_COMMA) || "[]";
      a = "Math.max.apply(null, " + a + ")";
      break;
    case "AVERAGE":
      if(!Blockly.JavaScript.definitions_.math_mean) {
        var b = Blockly.JavaScript.variableDB_.getDistinctName("math_mean", Blockly.Generator.NAME_TYPE);
        Blockly.JavaScript.math_on_list.math_mean = b;
        a = [];
        a.push("function " + b + "(myList) {");
        a.push("  return myList.reduce(function(x, y) {return x + y;}) / myList.length;");
        a.push("}");
        Blockly.JavaScript.definitions_.math_mean = a.join("\n")
      }
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_NONE) || "[]";
      a = Blockly.JavaScript.math_on_list.math_mean + "(" + a + ")";
      break;
    case "MEDIAN":
      Blockly.JavaScript.definitions_.math_median || (b = Blockly.JavaScript.variableDB_.getDistinctName("math_median", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.math_on_list.math_median = b, a = [], a.push("function " + b + "(myList) {"), a.push("  var localList = myList.filter(function (x) {return typeof x == 'number';});"), a.push("  if (!localList.length) return null;"), a.push("  localList.sort(function(a, b) {return b - a;});"), a.push("  if (localList.length % 2 == 0) {"), a.push("    return (localList[localList.length / 2 - 1] + localList[localList.length / 2]) / 2;"), 
      a.push("  } else {"), a.push("    return localList[(localList.length - 1) / 2];"), a.push("  }"), a.push("}"), Blockly.JavaScript.definitions_.math_median = a.join("\n"));
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_NONE) || "[]";
      a = Blockly.JavaScript.math_on_list.math_median + "(" + a + ")";
      break;
    case "MODE":
      Blockly.JavaScript.definitions_.math_modes || (b = Blockly.JavaScript.variableDB_.getDistinctName("math_modes", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.math_on_list.math_modes = b, a = [], a.push("function " + b + "(values) {"), a.push("  var modes = [];"), a.push("  var counts = [];"), a.push("  var maxCount = 0;"), a.push("  for (var i = 0; i < values.length; i++) {"), a.push("    var value = values[i];"), a.push("    var found = false;"), a.push("    var thisCount;"), a.push("    for (var j = 0; j < counts.length; j++) {"), 
      a.push("      if (counts[j][0] === value) {"), a.push("        thisCount = ++counts[j][1];"), a.push("        found = true;"), a.push("        break;"), a.push("      }"), a.push("    }"), a.push("    if (!found) {"), a.push("      counts.push([value, 1]);"), a.push("      thisCount = 1;"), a.push("    }"), a.push("    maxCount = Math.max(thisCount, maxCount);"), a.push("  }"), a.push("  for (var j = 0; j < counts.length; j++) {"), a.push("    if (counts[j][1] == maxCount) {"), a.push("        modes.push(counts[j][0]);"), 
      a.push("    }"), a.push("  }"), a.push("  return modes;"), a.push("}"), Blockly.JavaScript.definitions_.math_modes = a.join("\n"));
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_NONE) || "[]";
      a = Blockly.JavaScript.math_on_list.math_modes + "(" + a + ")";
      break;
    case "STD_DEV":
      Blockly.JavaScript.definitions_.math_standard_deviation || (b = Blockly.JavaScript.variableDB_.getDistinctName("math_standard_deviation", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.math_on_list.math_standard_deviation = b, a = [], a.push("function " + b + "(numbers) {"), a.push("  var n = numbers.length;"), a.push("  if (!n) return null;"), a.push("  var mean = numbers.reduce(function(x, y) {return x + y;}) / n;"), a.push("  var variance = 0;"), a.push("  for (var j = 0; j < n; j++) {"), 
      a.push("    variance += Math.pow(numbers[j] - mean, 2);"), a.push("  }"), a.push("  variance = variance / n;"), a.push("  return Math.sqrt(variance);"), a.push("}"), Blockly.JavaScript.definitions_.math_standard_deviation = a.join("\n"));
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_NONE) || "[]";
      a = Blockly.JavaScript.math_on_list.math_standard_deviation + "(" + a + ")";
      break;
    case "RANDOM":
      Blockly.JavaScript.definitions_.math_random_item || (b = Blockly.JavaScript.variableDB_.getDistinctName("math_random_item", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.math_on_list.math_random_item = b, a = [], a.push("function " + b + "(list) {"), a.push("  var x = Math.floor(Math.random() * list.length);"), a.push("  return list[x];"), a.push("}"), Blockly.JavaScript.definitions_.math_random_item = a.join("\n"));
      a = Blockly.JavaScript.valueToCode(this, "LIST", Blockly.JavaScript.ORDER_NONE) || "[]";
      a = Blockly.JavaScript.math_on_list.math_random_item + "(" + a + ")";
      break;
    default:
      throw"Unknown operator: " + a;
  }
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.math_modulo = function() {
  var a = Blockly.JavaScript.valueToCode(this, "DIVIDEND", Blockly.JavaScript.ORDER_MODULUS) || "0", b = Blockly.JavaScript.valueToCode(this, "DIVISOR", Blockly.JavaScript.ORDER_MODULUS) || "0";
  return[a + " % " + b, Blockly.JavaScript.ORDER_MODULUS]
};
Blockly.JavaScript.math_constrain = function() {
  var a = Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_COMMA) || "0", b = Blockly.JavaScript.valueToCode(this, "LOW", Blockly.JavaScript.ORDER_COMMA) || "0", c = Blockly.JavaScript.valueToCode(this, "HIGH", Blockly.JavaScript.ORDER_COMMA) || "Infinity";
  return["Math.min(Math.max(" + a + ", " + b + "), " + c + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.math_random_int = function() {
  var a = Blockly.JavaScript.valueToCode(this, "FROM", Blockly.JavaScript.ORDER_COMMA) || "0", b = Blockly.JavaScript.valueToCode(this, "TO", Blockly.JavaScript.ORDER_COMMA) || "0";
  if(!Blockly.JavaScript.definitions_.math_random_int) {
    var c = Blockly.JavaScript.variableDB_.getDistinctName("math_random_int", Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript.math_random_int.random_function = c;
    var d = [];
    d.push("function " + c + "(a, b) {");
    d.push("  if (a > b) {");
    d.push("    // Swap a and b to ensure a is smaller.");
    d.push("    var c = a;");
    d.push("    a = b;");
    d.push("    b = c;");
    d.push("  }");
    d.push("  return Math.floor(Math.random() * (b - a + 1) + a);");
    d.push("}");
    Blockly.JavaScript.definitions_.math_random_int = d.join("\n")
  }
  return[Blockly.JavaScript.math_random_int.random_function + "(" + a + ", " + b + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.math_random_float = function() {
  return["Math.random()", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.procedures = {};
Blockly.JavaScript.procedures_defreturn = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.parameterNames_.length;c++) {
    b[c] = Blockly.JavaScript.variableDB_.getName(this.parameterNames_[c], Blockly.Variables.NAME_TYPE, Blockly.Variables.NAME_TYPE_LOCAL)
  }
  c = Blockly.JavaScript.statementToCode(this, "STACK");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + c);
  var d = Blockly.JavaScript.valueToCode(this, "RETURN", Blockly.JavaScript.ORDER_NONE) || "";
  d && (d = "  return " + d + ";\n");
  b = (Blockly.varsInGlobals ? "Globals." + a + " = function" : "function " + a) + "(" + b.join(", ") + ") {\n" + c + d + "}";
  b = Blockly.JavaScript.scrub_(this, b);
  Blockly.JavaScript.definitions_[a] = b;
  return null
};
Blockly.JavaScript.procedures_defnoreturn = Blockly.JavaScript.procedures_defreturn;
Blockly.JavaScript.procedures_callreturn = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.currentParameterNames_.length;c++) {
    b[c] = Blockly.JavaScript.valueToCode(this, "ARG" + c, Blockly.JavaScript.ORDER_COMMA) || "null"
  }
  return[(Blockly.varsInGlobals ? "Globals." : "") + a + "(" + b.join(", ") + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.procedures_callnoreturn = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.currentParameterNames_.length;c++) {
    b[c] = Blockly.JavaScript.valueToCode(this, "ARG" + c, Blockly.JavaScript.ORDER_COMMA) || "null"
  }
  return(Blockly.varsInGlobals ? "Globals." : "") + a + "(" + b.join(", ") + ");\n"
};
Blockly.JavaScript.procedures_ifreturn = function() {
  var a = "if (" + (Blockly.JavaScript.valueToCode(this, "CONDITION", Blockly.JavaScript.ORDER_NONE) || "false") + ") {\n";
  if(this.hasReturnValue_) {
    var b = Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_NONE) || "null", a = a + ("  return " + b + ";\n")
  }else {
    a += "  return;\n"
  }
  return a + "}\n"
};
Blockly.JavaScript.functionalProcedures = {};
Blockly.JavaScript.functional_definition = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.parameterNames_.length;c++) {
    b[c] = Blockly.JavaScript.variableDB_.getName(this.parameterNames_[c], Blockly.Variables.NAME_TYPE, Blockly.Variables.NAME_TYPE_LOCAL)
  }
  c = Blockly.JavaScript.statementToCode(this, "STACK");
  Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + this.id + "'") + c);
  var d = Blockly.JavaScript.statementToCode(this, "RETURN", Blockly.JavaScript.ORDER_NONE) || "";
  d && (d = "  return " + d + ";\n");
  b = (Blockly.varsInGlobals ? "Globals." + a + " = function" : "function " + a) + "(" + b.join(", ") + ") {\nreturn " + c + d + "\n}";
  b = Blockly.JavaScript.scrub_(this, b);
  Blockly.JavaScript.definitions_[a] = b;
  return null
};
Blockly.JavaScript.functional_call = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.currentParameterNames_.length;c++) {
    b[c] = Blockly.JavaScript.statementToCode(this, "ARG" + c, Blockly.JavaScript.ORDER_COMMA) || "null"
  }
  return(Blockly.varsInGlobals ? "Globals." : "") + a + "(" + b.join(", ") + ")"
};
Blockly.JavaScript.functional_pass = function() {
  var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE);
  return(Blockly.varsInGlobals ? "Globals." : "") + a
};
Blockly.JavaScript.procedural_to_functional_call = function() {
  for(var a = Blockly.JavaScript.variableDB_.getName(this.getTitleValue("NAME"), Blockly.Procedures.NAME_TYPE), b = [], c = 0;c < this.currentParameterNames_.length;c++) {
    var d = Blockly.JavaScript.valueToCode(this, "ARG" + c, Blockly.JavaScript.ORDER_COMMA);
    b[c] = d || "null"
  }
  return[(Blockly.varsInGlobals ? "Globals." : "") + a + "(" + b.join(", ") + ")", Blockly.JavaScript.ORDER_NONE]
};
Blockly.JavaScript.functionalExamples = {};
Blockly.JavaScript.functional_example = function() {
  var a = Blockly.JavaScript.statementToCode(this, "EXPECTED", Blockly.JavaScript.ORDER_NONE) || "null", b = Blockly.JavaScript.statementToCode(this, "ACTUAL", Blockly.JavaScript.ORDER_NONE) || "null";
  return["(" + a + " == " + b + ")", 0]
};
Blockly.JavaScript.functionalParameters = {};
Blockly.JavaScript.functional_parameters_get = function() {
  return Blockly.JavaScript.translateVarName(this.getTitleValue("VAR"))
};
Blockly.JavaScript.text = function() {
  return[Blockly.JavaScript.quote_(this.getTitleValue("TEXT")), Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.text_join = function() {
  var a;
  if(0 == this.itemCount_) {
    return["''", Blockly.JavaScript.ORDER_ATOMIC]
  }
  if(1 == this.itemCount_) {
    return a = Blockly.JavaScript.valueToCode(this, "ADD0", Blockly.JavaScript.ORDER_NONE) || "''", ["String(" + a + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }
  if(2 == this.itemCount_) {
    a = Blockly.JavaScript.valueToCode(this, "ADD0", Blockly.JavaScript.ORDER_NONE) || "''";
    var b = Blockly.JavaScript.valueToCode(this, "ADD1", Blockly.JavaScript.ORDER_NONE) || "''";
    return["String(" + a + ") + String(" + b + ")", Blockly.JavaScript.ORDER_ADDITION]
  }
  a = Array(this.itemCount_);
  for(b = 0;b < this.itemCount_;b++) {
    a[b] = Blockly.JavaScript.valueToCode(this, "ADD" + b, Blockly.JavaScript.ORDER_COMMA) || "''"
  }
  a = "[" + a.join(",") + "].join('')";
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.text_append = function() {
  var a = Blockly.JavaScript.translateVarName(this.getTitleValue("VAR")), b = Blockly.JavaScript.valueToCode(this, "TEXT", Blockly.JavaScript.ORDER_NONE) || "''";
  return a + " = String(" + a + ") + String(" + b + ");\n"
};
Blockly.JavaScript.text_length = function() {
  return[(Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_FUNCTION_CALL) || "''") + ".length", Blockly.JavaScript.ORDER_MEMBER]
};
Blockly.JavaScript.text_isEmpty = function() {
  return["!" + (Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "''"), Blockly.JavaScript.ORDER_LOGICAL_NOT]
};
Blockly.JavaScript.text_indexOf = function() {
  var a = "FIRST" == this.getTitleValue("END") ? "indexOf" : "lastIndexOf", b = Blockly.JavaScript.valueToCode(this, "FIND", Blockly.JavaScript.ORDER_NONE) || "''";
  return[(Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "''") + "." + a + "(" + b + ") + 1", Blockly.JavaScript.ORDER_MEMBER]
};
Blockly.JavaScript.text_charAt = function() {
  var a = this.getTitleValue("WHERE") || "FROM_START", b = Blockly.JavaScript.valueToCode(this, "AT", Blockly.JavaScript.ORDER_UNARY_NEGATION) || "1", c = Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_MEMBER) || "''";
  switch(a) {
    case "FIRST":
      return[c + ".charAt(0)", Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case "LAST":
      return[c + ".slice(-1)", Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case "FROM_START":
      return b = Blockly.isNumber(b) ? parseFloat(b) - 1 : b + " - 1", [c + ".charAt(" + b + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case "FROM_END":
      return[c + ".slice(-" + b + ").charAt(0)", Blockly.JavaScript.ORDER_FUNCTION_CALL];
    case "RANDOM":
      return Blockly.JavaScript.definitions_.text_random_letter || (a = Blockly.JavaScript.variableDB_.getDistinctName("text_random_letter", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.text_charAt.text_random_letter = a, b = [], b.push("function " + a + "(text) {"), b.push("  var x = Math.floor(Math.random() * text.length);"), b.push("  return text[x];"), b.push("}"), Blockly.JavaScript.definitions_.text_random_letter = b.join("\n")), c = Blockly.JavaScript.text_charAt.text_random_letter + "(" + 
      c + ")", [c, Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }
  throw"Unhandled option (text_charAt).";
};
Blockly.JavaScript.text_getSubstring = function() {
  var a = Blockly.JavaScript.valueToCode(this, "STRING", Blockly.JavaScript.ORDER_MEMBER) || "[]", b = this.getTitleValue("WHERE1"), c = this.getTitleValue("WHERE2"), d = Blockly.JavaScript.valueToCode(this, "AT1", Blockly.JavaScript.ORDER_NONE) || "1", e = Blockly.JavaScript.valueToCode(this, "AT2", Blockly.JavaScript.ORDER_NONE) || "1";
  if("FIRST" != b || "LAST" != c) {
    if(!Blockly.JavaScript.definitions_.text_get_substring) {
      var g = Blockly.JavaScript.variableDB_.getDistinctName("text_get_substring", Blockly.Generator.NAME_TYPE);
      Blockly.JavaScript.text_getSubstring.func = g;
      var f = [];
      f.push("function " + g + "(text, where1, at1, where2, at2) {");
      f.push("  function getAt(where, at) {");
      f.push("    if (where == 'FROM_START') {");
      f.push("      at--;");
      f.push("    } else if (where == 'FROM_END') {");
      f.push("      at = text.length - at;");
      f.push("    } else if (where == 'FIRST') {");
      f.push("      at = 0;");
      f.push("    } else if (where == 'LAST') {");
      f.push("      at = text.length - 1;");
      f.push("    } else {");
      f.push("      throw 'Unhandled option (text_getSubstring).';");
      f.push("    }");
      f.push("    return at;");
      f.push("  }");
      f.push("  at1 = getAt(where1, at1);");
      f.push("  at2 = getAt(where2, at2) + 1;");
      f.push("  return text.slice(at1, at2);");
      f.push("}");
      Blockly.JavaScript.definitions_.text_get_substring = f.join("\n")
    }
    a = Blockly.JavaScript.text_getSubstring.func + "(" + a + ", '" + b + "', " + d + ", '" + c + "', " + e + ")"
  }
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.text_changeCase = function() {
  var a = this.getTitleValue("CASE");
  if(a = Blockly.JavaScript.text_changeCase.OPERATORS[a]) {
    var b = Blockly.JavaScript.valueToCode(this, "TEXT", Blockly.JavaScript.ORDER_MEMBER) || "''", a = b + a
  }else {
    Blockly.JavaScript.definitions_.text_toTitleCase || (a = Blockly.JavaScript.variableDB_.getDistinctName("text_toTitleCase", Blockly.Generator.NAME_TYPE), Blockly.JavaScript.text_changeCase.toTitleCase = a, b = [], b.push("function " + a + "(str) {"), b.push("  return str.replace(/\\S+/g,"), b.push("      function(txt) {return txt[0].toUpperCase() + txt.substring(1).toLowerCase();});"), b.push("}"), Blockly.JavaScript.definitions_.text_toTitleCase = b.join("\n")), b = Blockly.JavaScript.valueToCode(this, 
    "TEXT", Blockly.JavaScript.ORDER_NONE) || "''", a = Blockly.JavaScript.text_changeCase.toTitleCase + "(" + b + ")"
  }
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.text_changeCase.OPERATORS = {UPPERCASE:".toUpperCase()", LOWERCASE:".toLowerCase()", TITLECASE:null};
Blockly.JavaScript.text_trim = function() {
  var a = this.getTitleValue("MODE"), a = Blockly.JavaScript.text_trim.OPERATORS[a];
  return[(Blockly.JavaScript.valueToCode(this, "TEXT", Blockly.JavaScript.ORDER_MEMBER) || "''") + a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.text_trim.OPERATORS = {LEFT:".trimLeft()", RIGHT:".trimRight()", BOTH:".trim()"};
Blockly.JavaScript.text_print = function() {
  return"window.alert(" + (Blockly.JavaScript.valueToCode(this, "TEXT", Blockly.JavaScript.ORDER_NONE) || "''") + ");\n"
};
Blockly.JavaScript.text_prompt = function() {
  var a = "window.prompt(" + Blockly.JavaScript.quote_(this.getTitleValue("TEXT")) + ")";
  "NUMBER" == this.getTitleValue("TYPE") && (a = "window.parseFloat(" + a + ")");
  return[a, Blockly.JavaScript.ORDER_FUNCTION_CALL]
};
Blockly.JavaScript.variables = {};
Blockly.JavaScript.variables_get = function() {
  return[Blockly.JavaScript.translateVarName(this.getTitleValue("VAR")), Blockly.JavaScript.ORDER_ATOMIC]
};
Blockly.JavaScript.variables_set = function() {
  var a = Blockly.JavaScript.valueToCode(this, "VALUE", Blockly.JavaScript.ORDER_ASSIGNMENT) || "0";
  return Blockly.JavaScript.translateVarName(this.getTitleValue("VAR")) + " = " + a + ";\n"
};
Blockly.JavaScript.parameters_get = Blockly.JavaScript.variables_get;
Blockly.JavaScript.parameters_set = Blockly.JavaScript.variables_set;


// Do not edit this generated file
"use strict";


Blockly.Blocks.colour = {};
Blockly.Blocks.colour_picker = {init:function() {
  this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.appendDummyInput().appendTitle(new Blockly.FieldColour("#ff0000"), "COLOUR");
  this.setOutput(!0, Blockly.BlockValueType.COLOUR);
  this.setTooltip(Blockly.Msg.COLOUR_PICKER_TOOLTIP)
}};
Blockly.Blocks.colour_random = {init:function() {
  this.setHelpUrl(Blockly.Msg.COLOUR_RANDOM_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.appendDummyInput().appendTitle(Blockly.Msg.COLOUR_RANDOM_TITLE);
  this.setOutput(!0, Blockly.BlockValueType.COLOUR);
  this.setTooltip(Blockly.Msg.COLOUR_RANDOM_TOOLTIP)
}};
Blockly.Blocks.colour_rgb = {init:function() {
  this.setHelpUrl(Blockly.Msg.COLOUR_RGB_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.appendValueInput("RED").setCheck(Blockly.BlockValueType.NUMBER).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_RGB_TITLE).appendTitle(Blockly.Msg.COLOUR_RGB_RED);
  this.appendValueInput("GREEN").setCheck(Blockly.BlockValueType.NUMBER).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_RGB_GREEN);
  this.appendValueInput("BLUE").setCheck(Blockly.BlockValueType.NUMBER).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_RGB_BLUE);
  this.setOutput(!0, Blockly.BlockValueType.COLOUR);
  this.setTooltip(Blockly.Msg.COLOUR_RGB_TOOLTIP)
}};
Blockly.Blocks.colour_blend = {init:function() {
  this.setHelpUrl(Blockly.Msg.COLOUR_BLEND_HELPURL);
  this.setHSV(42, 0.89, 0.99);
  this.appendValueInput("COLOUR1").setCheck(Blockly.BlockValueType.COLOUR).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_BLEND_TITLE).appendTitle(Blockly.Msg.COLOUR_BLEND_COLOUR1);
  this.appendValueInput("COLOUR2").setCheck(Blockly.BlockValueType.COLOUR).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_BLEND_COLOUR2);
  this.appendValueInput("RATIO").setCheck(Blockly.BlockValueType.NUMBER).setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.COLOUR_BLEND_RATIO);
  this.setOutput(!0, Blockly.BlockValueType.COLOUR);
  this.setTooltip(Blockly.Msg.COLOUR_BLEND_TOOLTIP)
}};
Blockly.Blocks.lists = {};
Blockly.Blocks.lists_create_empty = {init:function() {
  this.setHelpUrl(Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.setOutput(!0, Blockly.BlockValueType.ARRAY);
  this.appendDummyInput().appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
  this.setTooltip(Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP)
}};
Blockly.Blocks.lists_create_with = {init:function() {
  this.setHSV(40, 1, 0.99);
  this.appendValueInput("ADD0").appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
  this.appendValueInput("ADD1");
  this.appendValueInput("ADD2");
  this.setOutput(!0, Blockly.BlockValueType.ARRAY);
  this.setMutator(new Blockly.Mutator(["lists_create_with_item"]));
  this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
  this.itemCount_ = 3
}, mutationToDom:function(a) {
  a = document.createElement("mutation");
  a.setAttribute("items", this.itemCount_);
  return a
}, domToMutation:function(a) {
  for(var b = 0;b < this.itemCount_;b++) {
    this.removeInput("ADD" + b)
  }
  this.itemCount_ = window.parseInt(a.getAttribute("items"), 10);
  for(b = 0;b < this.itemCount_;b++) {
    a = this.appendValueInput("ADD" + b), 0 == b && a.appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH)
  }
  0 == this.itemCount_ && this.appendDummyInput("EMPTY").appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE)
}, decompose:function(a) {
  var b = new Blockly.Block(a, "lists_create_with_container");
  b.initSvg();
  for(var c = b.getInput("STACK").connection, d = 0;d < this.itemCount_;d++) {
    var e = new Blockly.Block(a, "lists_create_with_item");
    e.initSvg();
    c.connect(e.previousConnection);
    c = e.nextConnection
  }
  return b
}, compose:function(a) {
  if(0 == this.itemCount_) {
    this.removeInput("EMPTY")
  }else {
    for(var b = this.itemCount_ - 1;0 <= b;b--) {
      this.removeInput("ADD" + b)
    }
  }
  this.itemCount_ = 0;
  for(a = a.getInputTargetBlock("STACK");a;) {
    b = this.appendValueInput("ADD" + this.itemCount_), 0 == this.itemCount_ && b.appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH), a.valueConnection_ && b.connection.connect(a.valueConnection_), this.itemCount_++, a = a.nextConnection && a.nextConnection.targetBlock()
  }
  0 == this.itemCount_ && this.appendDummyInput("EMPTY").appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE)
}, saveConnections:function(a) {
  a = a.getInputTargetBlock("STACK");
  for(var b = 0;a;) {
    var c = this.getInput("ADD" + b);
    a.valueConnection_ = c && c.connection.targetConnection;
    b++;
    a = a.nextConnection && a.nextConnection.targetBlock()
  }
}};
Blockly.Blocks.lists_create_with_container = {init:function() {
  this.setHSV(40, 1, 0.99);
  this.appendDummyInput().appendTitle(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);
  this.appendStatementInput("STACK");
  this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.lists_create_with_item = {init:function() {
  this.setHSV(40, 1, 0.99);
  this.appendDummyInput().appendTitle(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.lists_repeat = {init:function() {
  this.setHelpUrl(Blockly.Msg.LISTS_REPEAT_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.setOutput(!0, Blockly.BlockValueType.ARRAY);
  this.interpolateMsg(Blockly.Msg.LISTS_REPEAT_TITLE, ["ITEM", null, Blockly.ALIGN_RIGHT], ["NUM", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setTooltip(Blockly.Msg.LISTS_REPEAT_TOOLTIP)
}};
Blockly.Blocks.lists_length = {init:function() {
  this.setHelpUrl(Blockly.Msg.LISTS_LENGTH_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.appendValueInput("VALUE").setCheck([Blockly.BlockValueType.ARRAY, Blockly.BlockValueType.STRING]).appendTitle(Blockly.Msg.LISTS_LENGTH_INPUT_LENGTH);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.setTooltip(Blockly.Msg.LISTS_LENGTH_TOOLTIP)
}};
Blockly.Blocks.lists_isEmpty = {init:function() {
  this.setHelpUrl(Blockly.Msg.LISTS_IS_EMPTY_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.interpolateMsg(Blockly.Msg.LISTS_IS_EMPTY_TITLE, ["VALUE", ["Array", "String"], Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setInputsInline(!0);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.setTooltip(Blockly.Msg.LISTS_TOOLTIP)
}};
Blockly.Blocks.lists_indexOf = {init:function() {
  var a = [[Blockly.Msg.LISTS_INDEX_OF_FIRST, "FIRST"], [Blockly.Msg.LISTS_INDEX_OF_LAST, "LAST"]];
  this.setHelpUrl(Blockly.Msg.LISTS_INDEX_OF_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("VALUE").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST);
  this.appendValueInput("FIND").appendTitle(new Blockly.FieldDropdown(a), "END");
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.LISTS_INDEX_OF_TOOLTIP)
}};
Blockly.Blocks.lists_getIndex = {init:function() {
  var a = [[Blockly.Msg.LISTS_GET_INDEX_GET, "GET"], [Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE, "GET_REMOVE"], [Blockly.Msg.LISTS_GET_INDEX_REMOVE, "REMOVE"]];
  this.WHERE_OPTIONS = [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, "FROM_START"], [Blockly.Msg.LISTS_GET_INDEX_FROM_END, "FROM_END"], [Blockly.Msg.LISTS_GET_INDEX_FIRST, "FIRST"], [Blockly.Msg.LISTS_GET_INDEX_LAST, "LAST"], [Blockly.Msg.LISTS_GET_INDEX_RANDOM, "RANDOM"]];
  this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);
  this.setHSV(40, 1, 0.99);
  a = new Blockly.FieldDropdown(a, function(a) {
    this.sourceBlock_.updateStatement("REMOVE" == a)
  });
  this.appendValueInput("VALUE").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST);
  this.appendDummyInput().appendTitle(a, "MODE").appendTitle("", "SPACE");
  this.appendDummyInput("AT");
  Blockly.Msg.LISTS_GET_INDEX_TAIL && this.appendDummyInput("TAIL").appendTitle(Blockly.Msg.LISTS_GET_INDEX_TAIL);
  this.setInputsInline(!0);
  this.setOutput(!0);
  this.updateAt(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("MODE") + "_" + b.getTitleValue("WHERE");
    return Blockly.Msg["LISTS_GET_INDEX_TOOLTIP_" + a]
  })
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("statement", !this.outputConnection);
  var b = this.getInput("AT").type == Blockly.INPUT_VALUE;
  a.setAttribute("at", b);
  return a
}, domToMutation:function(a) {
  var b = "true" == a.getAttribute("statement");
  this.updateStatement(b);
  a = "false" != a.getAttribute("at");
  this.updateAt(a)
}, updateStatement:function(a) {
  a != !this.outputConnection && (this.unplug(!0, !0), a ? (this.setOutput(!1), this.setPreviousStatement(!0), this.setNextStatement(!0)) : (this.setPreviousStatement(!1), this.setNextStatement(!1), this.setOutput(!0)))
}, updateAt:function(a) {
  this.removeInput("AT");
  this.removeInput("ORDINAL", !0);
  a ? (this.appendValueInput("AT").setCheck(Blockly.BlockValueType.NUMBER), Blockly.Msg.ORDINAL_NUMBER_SUFFIX && this.appendDummyInput("ORDINAL").appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)) : this.appendDummyInput("AT");
  var b = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(b) {
    var d = "FROM_START" == b || "FROM_END" == b;
    if(d != a) {
      var e = this.sourceBlock_;
      e.updateAt(d);
      e.setTitleValue(b, "WHERE");
      return null
    }
  });
  this.getInput("AT").appendTitle(b, "WHERE");
  Blockly.Msg.LISTS_GET_INDEX_TAIL && this.moveInputBefore("TAIL", null)
}};
Blockly.Blocks.lists_setIndex = {init:function() {
  var a = [[Blockly.Msg.LISTS_SET_INDEX_SET, "SET"], [Blockly.Msg.LISTS_SET_INDEX_INSERT, "INSERT"]];
  this.WHERE_OPTIONS = [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, "FROM_START"], [Blockly.Msg.LISTS_GET_INDEX_FROM_END, "FROM_END"], [Blockly.Msg.LISTS_GET_INDEX_FIRST, "FIRST"], [Blockly.Msg.LISTS_GET_INDEX_LAST, "LAST"], [Blockly.Msg.LISTS_GET_INDEX_RANDOM, "RANDOM"]];
  this.setHelpUrl(Blockly.Msg.LISTS_SET_INDEX_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.appendValueInput("LIST").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST);
  this.appendDummyInput().appendTitle(new Blockly.FieldDropdown(a), "MODE").appendTitle("", "SPACE");
  this.appendDummyInput("AT");
  this.appendValueInput("TO").appendTitle(Blockly.Msg.LISTS_SET_INDEX_INPUT_TO);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.LISTS_SET_INDEX_TOOLTIP);
  this.updateAt(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("MODE") + "_" + b.getTitleValue("WHERE");
    return Blockly.Msg["LISTS_SET_INDEX_TOOLTIP_" + a]
  })
}, mutationToDom:function() {
  var a = document.createElement("mutation"), b = this.getInput("AT").type == Blockly.INPUT_VALUE;
  a.setAttribute("at", b);
  return a
}, domToMutation:function(a) {
  a = "false" != a.getAttribute("at");
  this.updateAt(a)
}, updateAt:function(a) {
  this.removeInput("AT");
  this.removeInput("ORDINAL", !0);
  a ? (this.appendValueInput("AT").setCheck(Blockly.BlockValueType.NUMBER), Blockly.Msg.ORDINAL_NUMBER_SUFFIX && this.appendDummyInput("ORDINAL").appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)) : this.appendDummyInput("AT");
  var b = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(b) {
    var d = "FROM_START" == b || "FROM_END" == b;
    if(d != a) {
      var e = this.sourceBlock_;
      e.updateAt(d);
      e.setTitleValue(b, "WHERE");
      return null
    }
  });
  this.moveInputBefore("AT", "TO");
  this.getInput("ORDINAL") && this.moveInputBefore("ORDINAL", "TO");
  this.getInput("AT").appendTitle(b, "WHERE")
}};
Blockly.Blocks.lists_getSublist = {init:function() {
  this.WHERE_OPTIONS_1 = [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, "FROM_START"], [Blockly.Msg.LISTS_GET_INDEX_FROM_END, "FROM_END"], [Blockly.Msg.LISTS_GET_INDEX_FIRST, "FIRST"]];
  this.WHERE_OPTIONS_2 = [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, "FROM_START"], [Blockly.Msg.LISTS_GET_INDEX_FROM_END, "FROM_END"], [Blockly.Msg.LISTS_GET_INDEX_LAST, "LAST"]];
  this.setHelpUrl(Blockly.Msg.LISTS_GET_SUBLIST_HELPURL);
  this.setHSV(40, 1, 0.99);
  this.appendValueInput("LIST").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST);
  this.appendDummyInput("AT1");
  this.appendDummyInput("AT2");
  Blockly.Msg.LISTS_GET_SUBLIST_TAIL && this.appendDummyInput("TAIL").appendTitle(Blockly.Msg.LISTS_GET_SUBLIST_TAIL);
  this.setInputsInline(!0);
  this.setOutput(!0, Blockly.BlockValueType.ARRAY);
  this.updateAt(1, !0);
  this.updateAt(2, !0);
  this.setTooltip(Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP)
}, mutationToDom:function() {
  var a = document.createElement("mutation"), b = this.getInput("AT1").type == Blockly.INPUT_VALUE;
  a.setAttribute("at1", b);
  b = this.getInput("AT2").type == Blockly.INPUT_VALUE;
  a.setAttribute("at2", b);
  return a
}, domToMutation:function(a) {
  var b = "true" == a.getAttribute("at1");
  a = "true" == a.getAttribute("at2");
  this.updateAt(1, b);
  this.updateAt(2, a)
}, updateAt:function(a, b) {
  this.removeInput("AT" + a);
  this.removeInput("ORDINAL" + a, !0);
  b ? (this.appendValueInput("AT" + a).setCheck(Blockly.BlockValueType.NUMBER), Blockly.Msg.ORDINAL_NUMBER_SUFFIX && this.appendDummyInput("ORDINAL" + a).appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)) : this.appendDummyInput("AT" + a);
  var c = new Blockly.FieldDropdown(this["WHERE_OPTIONS_" + a], function(c) {
    var e = "FROM_START" == c || "FROM_END" == c;
    if(e != b) {
      var f = this.sourceBlock_;
      f.updateAt(a, e);
      f.setTitleValue(c, "WHERE" + a);
      return null
    }
  });
  this.getInput("AT" + a).appendTitle(c, "WHERE" + a);
  1 == a && (this.moveInputBefore("AT1", "AT2"), this.getInput("ORDINAL1") && this.moveInputBefore("ORDINAL1", "AT2"));
  Blockly.Msg.LISTS_GET_SUBLIST_TAIL && this.moveInputBefore("TAIL", null)
}};
Blockly.Blocks.logic = {};
Blockly.Blocks.controls_if = {init:function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
  this.setColour(210);
  this.appendValueInput("IF0").setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(Blockly.Msg.CONTROLS_IF_MSG_IF);
  this.appendStatementInput("DO0").appendTitle(Blockly.Msg.CONTROLS_IF_MSG_THEN);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setMutator(new Blockly.Mutator(["controls_if_elseif", "controls_if_else"]));
  var a = this;
  this.setTooltip(function() {
    if(a.elseifCount_ || a.elseCount_) {
      if(!a.elseifCount_ && a.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_2
      }
      if(a.elseifCount_ && !a.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_3
      }
      if(a.elseifCount_ && a.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_4
      }
    }else {
      return Blockly.Msg.CONTROLS_IF_TOOLTIP_1
    }
    return""
  });
  this.elseCount_ = this.elseifCount_ = 0
}, mutationToDom:function() {
  if(!this.elseifCount_ && !this.elseCount_) {
    return null
  }
  var a = document.createElement("mutation");
  this.elseifCount_ && a.setAttribute("elseif", this.elseifCount_);
  this.elseCount_ && a.setAttribute("else", 1);
  return a
}, domToMutation:function(a) {
  this.elseifCount_ = window.parseInt(a.getAttribute("elseif"), 10);
  this.elseCount_ = window.parseInt(a.getAttribute("else"), 10);
  for(a = 1;a <= this.elseifCount_;a++) {
    this.appendValueInput("IF" + a).setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF), this.appendStatementInput("DO" + a).appendTitle(Blockly.Msg.CONTROLS_IF_MSG_THEN)
  }
  this.elseCount_ && this.appendStatementInput("ELSE").appendTitle(Blockly.Msg.CONTROLS_IF_MSG_ELSE)
}, decompose:function(a) {
  var b = new Blockly.Block(a, "controls_if_if");
  b.initSvg();
  for(var c = b.getInput("STACK").connection, d = 1;d <= this.elseifCount_;d++) {
    var e = new Blockly.Block(a, "controls_if_elseif");
    e.initSvg();
    c.connect(e.previousConnection);
    c = e.nextConnection
  }
  this.elseCount_ && (a = new Blockly.Block(a, "controls_if_else"), a.initSvg(), c.connect(a.previousConnection));
  return b
}, compose:function(a) {
  this.elseCount_ && this.removeInput("ELSE");
  this.elseCount_ = 0;
  for(var b = this.elseifCount_;0 < b;b--) {
    this.removeInput("IF" + b), this.removeInput("DO" + b)
  }
  this.elseifCount_ = 0;
  for(a = a.getInputTargetBlock("STACK");a;) {
    switch(a.type) {
      case "controls_if_elseif":
        this.elseifCount_++;
        var b = this.appendValueInput("IF" + this.elseifCount_).setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF), c = this.appendStatementInput("DO" + this.elseifCount_);
        c.appendTitle(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        a.valueConnection_ && b.connection.connect(a.valueConnection_);
        a.statementConnection_ && c.connection.connect(a.statementConnection_);
        break;
      case "controls_if_else":
        this.elseCount_++;
        b = this.appendStatementInput("ELSE");
        b.appendTitle(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
        a.statementConnection_ && b.connection.connect(a.statementConnection_);
        break;
      default:
        throw"Unknown block type.";
    }
    a = a.nextConnection && a.nextConnection.targetBlock()
  }
}, saveConnections:function(a) {
  a = a.getInputTargetBlock("STACK");
  for(var b = 1;a;) {
    switch(a.type) {
      case "controls_if_elseif":
        var c = this.getInput("IF" + b), d = this.getInput("DO" + b);
        a.valueConnection_ = c && c.connection.targetConnection;
        a.statementConnection_ = d && d.connection.targetConnection;
        b++;
        break;
      case "controls_if_else":
        d = this.getInput("ELSE");
        a.statementConnection_ = d && d.connection.targetConnection;
        break;
      default:
        throw"Unknown block type.";
    }
    a = a.nextConnection && a.nextConnection.targetBlock()
  }
}};
Blockly.Blocks.controls_if_if = {init:function() {
  this.setHSV(196, 1, 0.79);
  this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
  this.appendStatementInput("STACK");
  this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.controls_if_elseif = {init:function() {
  this.setHSV(196, 1, 0.79);
  this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.controls_if_else = {init:function() {
  this.setHSV(196, 1, 0.79);
  this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE);
  this.setPreviousStatement(!0);
  this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.logic_compare = {init:function() {
  var a = Blockly.RTL ? [["=", "EQ"], ["\u2260", "NEQ"], [">", "LT"], ["\u2265", "LTE"], ["<", "GT"], ["\u2264", "GTE"]] : [["=", "EQ"], ["\u2260", "NEQ"], ["<", "LT"], ["\u2264", "LTE"], [">", "GT"], ["\u2265", "GTE"]];
  this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.appendValueInput("A");
  this.appendValueInput("B").appendTitle(new Blockly.FieldDropdown(a), "OP");
  this.setInputsInline(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return{EQ:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ, NEQ:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ, LT:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT, LTE:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE, GT:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT, GTE:Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE}[a]
  })
}};
Blockly.Blocks.logic_operation = {init:function() {
  var a = [[Blockly.Msg.LOGIC_OPERATION_AND, "AND"], [Blockly.Msg.LOGIC_OPERATION_OR, "OR"]];
  this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.appendValueInput("A").setCheck(Blockly.BlockValueType.BOOLEAN);
  this.appendValueInput("B").setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(new Blockly.FieldDropdown(a), "OP");
  this.setInputsInline(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return b.TOOLTIPS[a]
  })
}};
Blockly.Blocks.logic_negate = {init:function() {
  this.setHelpUrl(Blockly.Msg.LOGIC_NEGATE_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.interpolateMsg(Blockly.Msg.LOGIC_NEGATE_TITLE, ["BOOL", Blockly.BlockValueType.BOOLEAN, Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setTooltip(Blockly.Msg.LOGIC_NEGATE_TOOLTIP)
}};
Blockly.Blocks.logic_boolean = {init:function() {
  var a = [[Blockly.Msg.LOGIC_BOOLEAN_TRUE, "TRUE"], [Blockly.Msg.LOGIC_BOOLEAN_FALSE, "FALSE"]];
  this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.appendDummyInput().appendTitle(new Blockly.FieldDropdown(a), "BOOL");
  this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP)
}};
Blockly.Blocks.logic_null = {init:function() {
  this.setHelpUrl(Blockly.Msg.LOGIC_NULL_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.setOutput(!0);
  this.appendDummyInput().appendTitle(Blockly.Msg.LOGIC_NULL);
  this.setTooltip(Blockly.Msg.LOGIC_NULL_TOOLTIP)
}};
Blockly.Blocks.logic_ternary = {init:function() {
  this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
  this.setHSV(196, 1, 0.79);
  this.appendValueInput("IF").setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(Blockly.Msg.LOGIC_TERNARY_CONDITION);
  this.appendValueInput("THEN").appendTitle(Blockly.Msg.LOGIC_TERNARY_IF_TRUE);
  this.appendValueInput("ELSE").appendTitle(Blockly.Msg.LOGIC_TERNARY_IF_FALSE);
  this.setOutput(!0);
  this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP)
}};
Blockly.Blocks.loops = {};
Blockly.Blocks.controls_repeat = {init:function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT).appendTitle(new Blockly.FieldTextInput("10", Blockly.FieldTextInput.nonnegativeIntegerValidator), "TIMES").appendTitle(Blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES);
  this.appendStatementInput("DO").appendTitle(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP)
}};
Blockly.Blocks.controls_repeat_ext = {init:function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.interpolateMsg(Blockly.Msg.CONTROLS_REPEAT_TITLE, ["TIMES", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.appendStatementInput("DO").appendTitle(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP)
}};
Blockly.Blocks.controls_whileUntil = {init:function() {
  var a = [[Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE, "WHILE"], [Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL, "UNTIL"]];
  this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.appendValueInput("BOOL").setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(new Blockly.FieldDropdown(a), "MODE");
  this.appendStatementInput("DO").appendTitle(Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("MODE");
    return{WHILE:Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE, UNTIL:Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}[a]
  })
}};
Blockly.Blocks.controls_for = {init:function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_FOR_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_FOR_INPUT_WITH).appendTitle(new Blockly.FieldVariable(null), "VAR");
  this.interpolateMsg(Blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY, ["FROM", "Number", Blockly.ALIGN_RIGHT], ["TO", "Number", Blockly.ALIGN_RIGHT], ["BY", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.appendStatementInput("DO").appendTitle(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
  var a = this;
  this.setTooltip(function() {
    return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace("%1", a.getTitleValue("VAR"))
  })
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}, customContextMenu:function(a) {
  var b = {enabled:!0}, c = this.getTitleValue("VAR");
  b.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace("%1", c);
  c = goog.dom.createDom("title", null, c);
  c.setAttribute("name", "VAR");
  c = goog.dom.createDom("block", null, c);
  c.setAttribute("type", "variables_get");
  b.callback = Blockly.ContextMenu.callbackFactory(this, c);
  a.push(b)
}, domToMutation:function(a) {
  "default_var" === a.getAttribute("name") && (a = Blockly.Variables.generateUniqueNameFromBase_(a.childNodes[0].data), this.setTitleValue(a, "VAR"))
}};
Blockly.Blocks.controls_forEach = {init:function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_FOREACH_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.appendValueInput("LIST").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(Blockly.Msg.CONTROLS_FOREACH_INPUT_ITEM).appendTitle(new Blockly.FieldVariable(null), "VAR").appendTitle(Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST);
  Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL && (this.appendDummyInput().appendTitle(Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL), this.setInputsInline(!0));
  this.appendStatementInput("DO").appendTitle(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  var a = this;
  this.setTooltip(function() {
    return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace("%1", a.getTitleValue("VAR"))
  })
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}, customContextMenu:Blockly.Blocks.controls_for.customContextMenu};
Blockly.Blocks.controls_flow_statements = {init:function() {
  var a = [[Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, "BREAK"], [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, "CONTINUE"]];
  this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
  this.setHSV(322, 0.9, 0.95);
  this.appendDummyInput().appendTitle(new Blockly.FieldDropdown(a), "FLOW");
  this.setPreviousStatement(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("FLOW");
    return b.TOOLTIPS[a]
  })
}, onchange:function() {
  if(this.blockSpace) {
    var a = !1, b = this;
    do {
      if("controls_repeat" == b.type || "controls_repeat_ext" == b.type || "controls_forEach" == b.type || "controls_for" == b.type || "controls_whileUntil" == b.type) {
        a = !0;
        break
      }
      b = b.getSurroundParent()
    }while(b);
    a ? this.setWarningText(null) : this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING)
  }
}};
Blockly.Blocks.math = {};
Blockly.Blocks.math_number = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.appendDummyInput().appendTitle(new Blockly.FieldTextInput("0", Blockly.FieldTextInput.numberValidator), "NUM");
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP)
}};
Blockly.Blocks.math_arithmetic = {init:function() {
  var a = [[Blockly.Msg.MATH_ADDITION_SYMBOL, "ADD"], [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, "MINUS"], [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, "MULTIPLY"], [Blockly.Msg.MATH_DIVISION_SYMBOL, "DIVIDE"], [Blockly.Msg.MATH_POWER_SYMBOL, "POWER"]];
  this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("A").setCheck(Blockly.BlockValueType.NUMBER);
  this.appendValueInput("B").setCheck(Blockly.BlockValueType.NUMBER).appendTitle(new Blockly.FieldDropdown(a), "OP");
  this.setInputsInline(!0);
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return{ADD:Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD, MINUS:Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS, MULTIPLY:Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY, DIVIDE:Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE, POWER:Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER}[a]
  })
}};
Blockly.Blocks.math_single = {init:function() {
  var a = [[Blockly.Msg.MATH_SINGLE_OP_ROOT, "ROOT"], [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, "ABS"], ["-", "NEG"], ["ln", "LN"], ["log10", "LOG10"], ["e^", "EXP"], ["10^", "POW10"]];
  this.setHelpUrl(Blockly.Msg.MATH_SINGLE_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("NUM").setCheck(Blockly.BlockValueType.NUMBER).appendTitle(new Blockly.FieldDropdown(a), "OP");
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return{ROOT:Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT, ABS:Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS, NEG:Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG, LN:Blockly.Msg.MATH_SINGLE_TOOLTIP_LN, LOG10:Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10, EXP:Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP, POW10:Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10}[a]
  })
}};
Blockly.Blocks.math_trig = {init:function() {
  var a = [[Blockly.Msg.MATH_TRIG_SIN, "SIN"], [Blockly.Msg.MATH_TRIG_COS, "COS"], [Blockly.Msg.MATH_TRIG_TAN, "TAN"], [Blockly.Msg.MATH_TRIG_ASIN, "ASIN"], [Blockly.Msg.MATH_TRIG_ACOS, "ACOS"], [Blockly.Msg.MATH_TRIG_ATAN, "ATAN"]];
  this.setHelpUrl(Blockly.Msg.MATH_TRIG_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("NUM").setCheck(Blockly.BlockValueType.NUMBER).appendTitle(new Blockly.FieldDropdown(a), "OP");
  var b = this;
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return{SIN:Blockly.Msg.MATH_TRIG_TOOLTIP_SIN, COS:Blockly.Msg.MATH_TRIG_TOOLTIP_COS, TAN:Blockly.Msg.MATH_TRIG_TOOLTIP_TAN, ASIN:Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN, ACOS:Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS, ATAN:Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN}[a]
  })
}};
Blockly.Blocks.math_constant = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_CONSTANT_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendDummyInput().appendTitle(new Blockly.FieldDropdown([["\u03c0", "PI"], ["e", "E"], ["\u03c6", "GOLDEN_RATIO"], ["sqrt(2)", "SQRT2"], ["sqrt(\u00bd)", "SQRT1_2"], ["\u221e", "INFINITY"]]), "CONSTANT");
  this.setTooltip(Blockly.Msg.MATH_CONSTANT_TOOLTIP)
}};
Blockly.Blocks.math_number_property = {init:function() {
  var a = [[Blockly.Msg.MATH_IS_EVEN, "EVEN"], [Blockly.Msg.MATH_IS_ODD, "ODD"], [Blockly.Msg.MATH_IS_PRIME, "PRIME"], [Blockly.Msg.MATH_IS_WHOLE, "WHOLE"], [Blockly.Msg.MATH_IS_POSITIVE, "POSITIVE"], [Blockly.Msg.MATH_IS_NEGATIVE, "NEGATIVE"], [Blockly.Msg.MATH_IS_DIVISIBLE_BY, "DIVISIBLE_BY"]];
  this.setHSV(258, 0.35, 0.62);
  this.appendValueInput("NUMBER_TO_CHECK").setCheck(Blockly.BlockValueType.NUMBER);
  a = new Blockly.FieldDropdown(a, function(a) {
    this.sourceBlock_.updateShape("DIVISIBLE_BY" == a)
  });
  this.appendDummyInput().appendTitle(a, "PROPERTY");
  this.setInputsInline(!0);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.setTooltip(Blockly.Msg.MATH_IS_TOOLTIP)
}, mutationToDom:function() {
  var a = document.createElement("mutation"), b = "DIVISIBLE_BY" == this.getTitleValue("PROPERTY");
  a.setAttribute("divisor_input", b);
  return a
}, domToMutation:function(a) {
  a = "true" == a.getAttribute("divisor_input");
  this.updateShape(a)
}, updateShape:function(a) {
  var b = this.getInput("DIVISOR");
  a ? b || this.appendValueInput("DIVISOR").setCheck(Blockly.BlockValueType.NUMBER) : b && this.removeInput("DIVISOR")
}};
Blockly.Blocks.math_change = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_CHANGE_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.appendValueInput("DELTA").setCheck(Blockly.BlockValueType.NUMBER).appendTitle(Blockly.Msg.MATH_CHANGE_TITLE_CHANGE).appendTitle(new Blockly.FieldVariable(Blockly.Msg.MATH_CHANGE_TITLE_ITEM), "VAR").appendTitle(Blockly.Msg.MATH_CHANGE_INPUT_BY);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  var a = this;
  this.setTooltip(function() {
    return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace("%1", a.getTitleValue("VAR"))
  })
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}};
Blockly.Blocks.math_round = {init:function() {
  var a = [[Blockly.Msg.MATH_ROUND_OPERATOR_ROUND, "ROUND"], [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP, "ROUNDUP"], [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN, "ROUNDDOWN"]];
  this.setHelpUrl(Blockly.Msg.MATH_ROUND_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("NUM").setCheck(Blockly.BlockValueType.NUMBER).appendTitle(new Blockly.FieldDropdown(a), "OP");
  this.setTooltip(Blockly.Msg.MATH_ROUND_TOOLTIP)
}};
Blockly.Blocks.math_on_list = {init:function() {
  var a = [[Blockly.Msg.MATH_ONLIST_OPERATOR_SUM, "SUM"], [Blockly.Msg.MATH_ONLIST_OPERATOR_MIN, "MIN"], [Blockly.Msg.MATH_ONLIST_OPERATOR_MAX, "MAX"], [Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE, "AVERAGE"], [Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN, "MEDIAN"], [Blockly.Msg.MATH_ONLIST_OPERATOR_MODE, "MODE"], [Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV, "STD_DEV"], [Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM, "RANDOM"]], b = this;
  this.setHelpUrl(Blockly.Msg.MATH_ONLIST_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  a = new Blockly.FieldDropdown(a, function(a) {
    "MODE" == a ? b.outputConnection.setCheck(Blockly.BlockValueType.ARRAY) : b.outputConnection.setCheck(Blockly.BlockValueType.NUMBER)
  });
  this.appendValueInput("LIST").setCheck(Blockly.BlockValueType.ARRAY).appendTitle(a, "OP");
  this.setTooltip(function() {
    var a = b.getTitleValue("OP");
    return b.TOOLTIPS[a]
  })
}};
Blockly.Blocks.math_modulo = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_MODULO_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.interpolateMsg(Blockly.Msg.MATH_MODULO_TITLE, ["DIVIDEND", "Number", Blockly.ALIGN_RIGHT], ["DIVISOR", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.MATH_MODULO_TOOLTIP)
}};
Blockly.Blocks.math_constrain = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_CONSTRAIN_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.interpolateMsg(Blockly.Msg.MATH_CONSTRAIN_TITLE, ["VALUE", "Number", Blockly.ALIGN_RIGHT], ["LOW", "Number", Blockly.ALIGN_RIGHT], ["HIGH", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.MATH_CONSTRAIN_TOOLTIP)
}};
Blockly.Blocks.math_random_int = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_RANDOM_INT_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.interpolateMsg(Blockly.Msg.MATH_RANDOM_INT_TITLE, ["FROM", "Number", Blockly.ALIGN_RIGHT], ["TO", "Number", Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.MATH_RANDOM_INT_TOOLTIP)
}};
Blockly.Blocks.math_random_float = {init:function() {
  this.setHelpUrl(Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL);
  this.setHSV(258, 0.35, 0.62);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendDummyInput().appendTitle(Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM);
  this.setTooltip(Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP)
}};
Blockly.Blocks.procedures = {};
Blockly.Blocks.procedures_defnoreturn = {shouldHideIfInMainBlockSpace:function() {
  return Blockly.useModalFunctionEditor
}, init:function() {
  var a = !Blockly.disableParamEditing && !Blockly.useModalFunctionEditor;
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
  this.setHSV(94, 0.84, 0.6);
  var b = Blockly.Procedures.findLegalName(Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
  this.appendDummyInput().appendTitle(a ? "" : " ").appendTitle(new Blockly.FieldTextInput(b, Blockly.Procedures.rename), "NAME").appendTitle("", "PARAMS");
  this.appendStatementInput("STACK").appendTitle(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
  a && this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
  this.setFramed(this.blockSpace === Blockly.mainBlockSpace && !this.blockSpace.isReadOnly());
  this.parameterNames_ = []
}, updateParams_:function() {
  for(var a = !1, b = {}, c = 0;c < this.parameterNames_.length;c++) {
    if(b["arg_" + this.parameterNames_[c].toLowerCase()]) {
      a = !0;
      break
    }
    b["arg_" + this.parameterNames_[c].toLowerCase()] = !0
  }
  a ? this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING) : this.setWarningText(null);
  a = "";
  this.parameterNames_.length && (a = Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " " + this.parameterNames_.join(", "));
  this.setTitleValue(a, "PARAMS")
}, mutationToDom:function() {
  for(var a = document.createElement("mutation"), b = 0;b < this.parameterNames_.length;b++) {
    var c = document.createElement("arg");
    c.setAttribute("name", this.parameterNames_[b]);
    a.appendChild(c)
  }
  this.description_ && (b = document.createElement("description"), b.innerHTML = this.description_, a.appendChild(b));
  return a
}, domToMutation:function(a) {
  this.parameterNames_ = [];
  for(var b = 0, c;c = a.childNodes[b];b++) {
    var d = c.nodeName.toLowerCase();
    "arg" === d ? this.parameterNames_.push(c.getAttribute("name")) : "description" === d && (this.description_ = c.innerHTML)
  }
  this.updateParams_()
}, decompose:function(a) {
  var b = new Blockly.Block(a, "procedures_mutatorcontainer");
  b.initSvg();
  for(var c = b.getInput("STACK").connection, d = 0;d < this.parameterNames_.length;d++) {
    var e = new Blockly.Block(a, "procedures_mutatorarg");
    e.initSvg();
    e.setTitleValue(this.parameterNames_[d], "NAME");
    e.oldLocation = d;
    c.connect(e.previousConnection);
    c = e.nextConnection
  }
  Blockly.Procedures.mutateCallers(this.getTitleValue("NAME"), this.blockSpace, this.parameterNames_, null);
  return b
}, compose:function(a) {
  a = a.getInputTargetBlock("STACK");
  for(var b = [], c = [];a;) {
    b.push(a.getTitleValue("NAME")), c.push(a.id), a = a.nextConnection && a.nextConnection.targetBlock()
  }
  this.updateParamsFromArrays(b, c)
}, updateParamsFromArrays:function(a, b) {
  this.parameterNames_ = goog.array.clone(a);
  this.paramIds_ = b ? goog.array.clone(b) : null;
  this.updateParams_();
  this.updateCallerParams_()
}, updateCallerParams_:function() {
  Blockly.Procedures.mutateCallers(this.getTitleValue("NAME"), this.blockSpace, this.parameterNames_, this.paramIds_)
}, dispose:function(a, b, c) {
  if(!c) {
    var d = this.getTitleValue("NAME");
    Blockly.Procedures.disposeCallers(d, this.blockSpace)
  }
  Blockly.Block.prototype.dispose.apply(this, arguments)
}, getProcedureInfo:function() {
  return{name:this.getTitleValue("NAME"), parameterNames:this.parameterNames_, parameterIDs:this.paramIds_, type:this.type, callType:this.callType_}
}, getVars:function() {
  return this.parameterNames_
}, renameVar:function(a, b) {
  for(var c = !1, d = 0;d < this.parameterNames_.length;d++) {
    Blockly.Names.equals(a, this.parameterNames_[d]) && (this.parameterNames_[d] = b, c = !0)
  }
  if(c && (this.updateParams_(), this.mutator && this.mutator.isVisible())) {
    for(var c = this.mutator.blockSpace_.getAllBlocks(), d = 0, e;e = c[d];d++) {
      "procedures_mutatorarg" == e.type && Blockly.Names.equals(a, e.getTitleValue("NAME")) && e.setTitleValue(b, "NAME")
    }
  }
}, removeVar:function(a) {
  a = this.parameterNames_.indexOf(a);
  -1 < a && (this.parameterNames_.splice(a, 1), this.updateParams_())
}, customContextMenu:function(a) {
  var b = {enabled:!0}, c = this.getTitleValue("NAME");
  b.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace("%1", c);
  var d = goog.dom.createDom("mutation");
  d.setAttribute("name", c);
  for(var e = 0;e < this.parameterNames_.length;e++) {
    c = goog.dom.createDom("arg"), c.setAttribute("name", this.parameterNames_[e]), d.appendChild(c)
  }
  d = goog.dom.createDom("block", null, d);
  d.setAttribute("type", this.callType_);
  b.callback = Blockly.ContextMenu.callbackFactory(this, d);
  a.push(b);
  for(e = 0;e < this.parameterNames_.length;e++) {
    b = {enabled:!0}, c = this.parameterNames_[e], b.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace("%1", c), d = goog.dom.createDom("title", null, c), d.setAttribute("name", "VAR"), d = goog.dom.createDom("block", null, d), d.setAttribute("type", "variables_get"), b.callback = Blockly.ContextMenu.callbackFactory(this, d), a.push(b)
  }
}, userCreated:!1, shouldBeGrayedOut:function() {
  return!1
}, callType_:"procedures_callnoreturn"};
Blockly.Blocks.procedures_defreturn = {shouldHideIfInMainBlockSpace:function() {
  return Blockly.useModalFunctionEditor
}, init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
  this.setHSV(94, 0.84, 0.6);
  var a = Blockly.Procedures.findLegalName(Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
  this.appendDummyInput().appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE).appendTitle(new Blockly.FieldTextInput(a, Blockly.Procedures.rename), "NAME").appendTitle("", "PARAMS");
  this.appendStatementInput("STACK").appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_DO);
  this.appendValueInput("RETURN").setAlign(Blockly.ALIGN_RIGHT).appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
  this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
  this.setFramed(this.blockSpace === Blockly.mainBlockSpace && !this.blockSpace.isReadOnly());
  this.parameterNames_ = []
}, updateParams_:Blockly.Blocks.procedures_defnoreturn.updateParams_, updateCallerParams_:Blockly.Blocks.procedures_defnoreturn.updateCallerParams_, updateParamsFromArrays:Blockly.Blocks.procedures_defnoreturn.updateParamsFromArrays, mutationToDom:Blockly.Blocks.procedures_defnoreturn.mutationToDom, domToMutation:Blockly.Blocks.procedures_defnoreturn.domToMutation, decompose:Blockly.Blocks.procedures_defnoreturn.decompose, compose:Blockly.Blocks.procedures_defnoreturn.compose, dispose:Blockly.Blocks.procedures_defnoreturn.dispose, 
getProcedureInfo:function() {
  return{name:this.getTitleValue("NAME"), parameterNames:this.parameterNames_, parameterIDs:this.paramIds_, type:this.type, callType:this.callType_}
}, getVars:Blockly.Blocks.procedures_defnoreturn.getVars, renameVar:Blockly.Blocks.procedures_defnoreturn.renameVar, customContextMenu:Blockly.Blocks.procedures_defnoreturn.customContextMenu, userCreated:Blockly.Blocks.procedures_defnoreturn.userCreated, shouldBeGrayedOut:Blockly.Blocks.procedures_defnoreturn.shouldBeGrayedOut, callType_:"procedures_callreturn"};
Blockly.Blocks.procedures_mutatorcontainer = {init:function() {
  this.setHSV(94, 0.84, 0.6);
  this.appendDummyInput().appendTitle(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
  this.appendStatementInput("STACK");
  this.setTooltip("");
  this.contextMenu = !1
}};
Blockly.Blocks.procedures_mutatorarg = {init:function() {
  this.setHSV(94, 0.84, 0.6);
  this.appendDummyInput().appendTitle(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE).appendTitle(new Blockly.FieldTextInput("x", this.validator), "NAME");
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip("");
  this.contextMenu = !1
}};
Blockly.Blocks.procedures_mutatorarg.validator = function(a) {
  return(a = a.replace(/[\s\xa0]+/g, " ").replace(/^ | $/g, "")) || null
};
Blockly.Blocks.procedures_callnoreturn = {init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
  this.setHSV(94, 0.84, 0.6);
  var a = this.appendDummyInput().appendTitle(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL).appendTitle("", "NAME");
  if(Blockly.useModalFunctionEditor) {
    var b = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
    Blockly.bindEvent_(b.fieldGroup_, "mousedown", this, this.openEditor);
    a.appendTitle(b)
  }
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP);
  this.currentParameterNames_ = [];
  this.currentParameterIDs = this.parameterIDsToArgumentConnections = null
}, openEditor:function(a) {
  a.stopPropagation();
  Blockly.functionEditor.openEditorForCallBlock_(this)
}, getCallName:function() {
  return this.getTitleValue("NAME")
}, renameProcedure:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("NAME")) && (this.setTitleValue(b, "NAME"), this.setTooltip((this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace("%1", b)))
}, setProcedureParameters:function(a, b) {
  if(b) {
    if(b.length != a.length) {
      throw"Error: paramNames and paramIds must be the same length.";
    }
    this.currentParameterIDs || (this.parameterIDsToArgumentConnections = {}, a.join("\n") == this.currentParameterNames_.join("\n") ? this.currentParameterIDs = b : this.currentParameterIDs = []);
    var c = this.rendered;
    this.rendered = !1;
    for(var d = this.currentParameterNames_.length - 1;0 <= d;d--) {
      var e = this.getInput("ARG" + d);
      if(e) {
        var f = e.connection.targetConnection;
        this.parameterIDsToArgumentConnections[this.currentParameterIDs[d]] = f;
        this.removeInput("ARG" + d)
      }
    }
    this.currentParameterNames_ = [].concat(a);
    this.currentParameterIDs = b;
    for(d = 0;d < this.currentParameterNames_.length;d++) {
      if(e = this.appendValueInput("ARG" + d).setAlign(Blockly.ALIGN_RIGHT).appendTitle(this.currentParameterNames_[d]), this.currentParameterIDs) {
        var g = this.currentParameterIDs[d];
        g in this.parameterIDsToArgumentConnections && (f = this.parameterIDsToArgumentConnections[g], !f || f.targetConnection || f.sourceBlock_.blockSpace != this.blockSpace ? delete this.parameterIDsToArgumentConnections[g] : e.connection.connect(f))
      }
    }
    (this.rendered = c) && this.render()
  }else {
    this.parameterIDsToArgumentConnections = {}, this.currentParameterIDs = null
  }
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("name", this.getTitleValue("NAME"));
  for(var b = 0;b < this.currentParameterNames_.length;b++) {
    var c = document.createElement("arg");
    c.setAttribute("name", this.currentParameterNames_[b]);
    a.appendChild(c)
  }
  return a
}, domToMutation:function(a) {
  var b = a.getAttribute("name");
  this.setTitleValue(b, "NAME");
  this.setTooltip((this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace("%1", b));
  if((b = Blockly.Procedures.getDefinition(b, this.blockSpace)) && b.mutator && b.mutator.isVisible()) {
    a = b.getProcedureInfo(), this.setProcedureParameters(a.parameterNames, a.parameterIDs)
  }else {
    this.currentParameterNames_ = [];
    for(var b = 0, c;c = a.childNodes[b];b++) {
      "arg" == c.nodeName.toLowerCase() && this.currentParameterNames_.push(c.getAttribute("name"))
    }
    this.setProcedureParameters(this.currentParameterNames_, this.currentParameterNames_)
  }
}, renameVar:function(a, b) {
  for(var c = 0;c < this.currentParameterNames_.length;c++) {
    Blockly.Names.equals(a, this.currentParameterNames_[c]) && (this.currentParameterNames_[c] = b, this.getInput("ARG" + c).titleRow[0].setText(b))
  }
}, customContextMenu:function(a) {
  var b = {enabled:!0};
  b.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
  var c = this.getTitleValue("NAME"), d = this.blockSpace;
  b.callback = function() {
    var a = Blockly.Procedures.getDefinition(c, d);
    a && a.select()
  };
  a.push(b)
}};
Blockly.Blocks.procedures_callreturn = {init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
  this.setHSV(94, 0.84, 0.6);
  var a = this.appendDummyInput().appendTitle(Blockly.Msg.PROCEDURES_CALLRETURN_CALL).appendTitle("", "NAME");
  if(Blockly.functionEditor) {
    var b = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
    Blockly.bindEvent_(b.fieldGroup_, "mousedown", this, this.openEditor);
    a.appendTitle(b)
  }
  this.setOutput(!0);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP);
  this.currentParameterNames_ = [];
  this.currentParameterIDs = this.parameterIDsToArgumentConnections = null
}, openEditor:Blockly.Blocks.procedures_callnoreturn.openEditor, getCallName:Blockly.Blocks.procedures_callnoreturn.getCallName, renameProcedure:Blockly.Blocks.procedures_callnoreturn.renameProcedure, setProcedureParameters:Blockly.Blocks.procedures_callnoreturn.setProcedureParameters, mutationToDom:Blockly.Blocks.procedures_callnoreturn.mutationToDom, domToMutation:Blockly.Blocks.procedures_callnoreturn.domToMutation, renameVar:Blockly.Blocks.procedures_callnoreturn.renameVar, customContextMenu:Blockly.Blocks.procedures_callnoreturn.customContextMenu};
Blockly.Blocks.procedures_ifreturn = {init:function() {
  this.setHelpUrl("http://c2.com/cgi/wiki?GuardClause");
  this.setHSV(94, 0.84, 0.6);
  this.appendValueInput("CONDITION").setCheck(Blockly.BlockValueType.BOOLEAN).appendTitle(Blockly.Msg.CONTROLS_IF_MSG_IF);
  this.appendValueInput("VALUE").appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
  this.hasReturnValue_ = !0
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("value", Number(this.hasReturnValue_));
  return a
}, domToMutation:function(a) {
  this.hasReturnValue_ = 1 == a.getAttribute("value");
  this.hasReturnValue_ || (this.removeInput("VALUE"), this.appendDummyInput("VALUE").appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN))
}, onchange:function() {
  if(this.blockSpace) {
    var a = !1, b = this;
    do {
      if("procedures_defnoreturn" == b.type || "procedures_defreturn" == b.type) {
        a = !0;
        break
      }
      b = b.getSurroundParent()
    }while(b);
    a ? ("procedures_defnoreturn" == b.type && this.hasReturnValue_ ? (this.removeInput("VALUE"), this.appendDummyInput("VALUE").appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN), this.hasReturnValue_ = !1) : "procedures_defreturn" != b.type || this.hasReturnValue_ || (this.removeInput("VALUE"), this.appendValueInput("VALUE").appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN), this.hasReturnValue_ = !0), this.setWarningText(null)) : this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING)
  }
}};
Blockly.Blocks.text = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
  this.setColour(160);
  this.appendDummyInput().appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote0.png"), 12, 12)).appendTitle(new Blockly.FieldTextInput(""), "TEXT").appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote1.png"), 12, 12));
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.setTooltip(Blockly.Msg.TEXT_TEXT_TOOLTIP)
}};
Blockly.Blocks.text_join = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_JOIN_HELPURL);
  this.setColour(160);
  this.appendValueInput("ADD0").appendTitle(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH);
  this.appendValueInput("ADD1");
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.setMutator(new Blockly.Mutator(["text_create_join_item"]));
  this.setTooltip(Blockly.Msg.TEXT_JOIN_TOOLTIP);
  this.itemCount_ = 2
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("items", this.itemCount_);
  return a
}, domToMutation:function(a) {
  for(var b = 0;b < this.itemCount_;b++) {
    this.removeInput("ADD" + b)
  }
  this.itemCount_ = window.parseInt(a.getAttribute("items"), 10);
  for(b = 0;b < this.itemCount_;b++) {
    a = this.appendValueInput("ADD" + b), 0 == b && a.appendTitle(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH)
  }
  0 == this.itemCount_ && this.appendDummyInput("EMPTY").appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote0.png"), 12, 12)).appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote1.png"), 12, 12))
}, decompose:function(a) {
  var b = new Blockly.Block(a, "text_create_join_container");
  b.initSvg();
  for(var c = b.getInput("STACK").connection, d = 0;d < this.itemCount_;d++) {
    var e = new Blockly.Block(a, "text_create_join_item");
    e.initSvg();
    c.connect(e.previousConnection);
    c = e.nextConnection
  }
  return b
}, compose:function(a) {
  if(0 == this.itemCount_) {
    this.removeInput("EMPTY")
  }else {
    for(var b = this.itemCount_ - 1;0 <= b;b--) {
      this.removeInput("ADD" + b)
    }
  }
  this.itemCount_ = 0;
  for(a = a.getInputTargetBlock("STACK");a;) {
    b = this.appendValueInput("ADD" + this.itemCount_), 0 == this.itemCount_ && b.appendTitle(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH), a.valueConnection_ && b.connection.connect(a.valueConnection_), this.itemCount_++, a = a.nextConnection && a.nextConnection.targetBlock()
  }
  0 == this.itemCount_ && this.appendDummyInput("EMPTY").appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote0.png"), 12, 12)).appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote1.png"), 12, 12))
}, saveConnections:function(a) {
  a = a.getInputTargetBlock("STACK");
  for(var b = 0;a;) {
    var c = this.getInput("ADD" + b);
    a.valueConnection_ = c && c.connection.targetConnection;
    b++;
    a = a.nextConnection && a.nextConnection.targetBlock()
  }
}};
Blockly.Blocks.text_create_join_container = {init:function() {
  this.setColour(160);
  this.appendDummyInput().appendTitle(Blockly.Msg.TEXT_CREATE_JOIN_TITLE_JOIN);
  this.appendStatementInput("STACK");
  this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.text_create_join_item = {init:function() {
  this.setColour(160);
  this.appendDummyInput().appendTitle(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TOOLTIP);
  this.contextMenu = !1
}};
Blockly.Blocks.text_append = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_APPEND_HELPURL);
  this.setColour(160);
  this.appendValueInput("TEXT").appendTitle(Blockly.Msg.TEXT_APPEND_TO).appendTitle(new Blockly.FieldVariable(Blockly.Msg.TEXT_APPEND_VARIABLE), "VAR").appendTitle(Blockly.Msg.TEXT_APPEND_APPENDTEXT);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  var a = this;
  this.setTooltip(function() {
    return Blockly.Msg.TEXT_APPEND_TOOLTIP.replace("%1", a.getTitleValue("VAR"))
  })
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}};
Blockly.Blocks.text_length = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_LENGTH_HELPURL);
  this.setColour(160);
  this.interpolateMsg(Blockly.Msg.TEXT_LENGTH_TITLE, ["VALUE", ["String", "Array"], Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.setTooltip(Blockly.Msg.TEXT_LENGTH_TOOLTIP)
}};
Blockly.Blocks.text_isEmpty = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_ISEMPTY_HELPURL);
  this.setColour(160);
  this.interpolateMsg(Blockly.Msg.TEXT_ISEMPTY_TITLE, ["VALUE", ["String", "Array"], Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setOutput(!0, Blockly.BlockValueType.BOOLEAN);
  this.setTooltip(Blockly.Msg.TEXT_ISEMPTY_TOOLTIP)
}};
Blockly.Blocks.text_indexOf = {init:function() {
  var a = [[Blockly.Msg.TEXT_INDEXOF_OPERATOR_FIRST, "FIRST"], [Blockly.Msg.TEXT_INDEXOF_OPERATOR_LAST, "LAST"]];
  this.setHelpUrl(Blockly.Msg.TEXT_INDEXOF_HELPURL);
  this.setColour(160);
  this.setOutput(!0, Blockly.BlockValueType.NUMBER);
  this.appendValueInput("VALUE").setCheck(Blockly.BlockValueType.STRING).appendTitle(Blockly.Msg.TEXT_INDEXOF_INPUT_INTEXT);
  this.appendValueInput("FIND").setCheck(Blockly.BlockValueType.STRING).appendTitle(new Blockly.FieldDropdown(a), "END");
  Blockly.Msg.TEXT_INDEXOF_TAIL && this.appendDummyInput().appendTitle(Blockly.Msg.TEXT_INDEXOF_TAIL);
  this.setInputsInline(!0);
  this.setTooltip(Blockly.Msg.TEXT_INDEXOF_TOOLTIP)
}};
Blockly.Blocks.text_charAt = {init:function() {
  this.WHERE_OPTIONS = [[Blockly.Msg.TEXT_CHARAT_FROM_START, "FROM_START"], [Blockly.Msg.TEXT_CHARAT_FROM_END, "FROM_END"], [Blockly.Msg.TEXT_CHARAT_FIRST, "FIRST"], [Blockly.Msg.TEXT_CHARAT_LAST, "LAST"], [Blockly.Msg.TEXT_CHARAT_RANDOM, "RANDOM"]];
  this.setHelpUrl(Blockly.Msg.TEXT_CHARAT_HELPURL);
  this.setColour(160);
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.appendValueInput("VALUE").setCheck(Blockly.BlockValueType.STRING).appendTitle(Blockly.Msg.TEXT_CHARAT_INPUT_INTEXT);
  this.appendDummyInput("AT");
  this.setInputsInline(!0);
  this.updateAt(!0);
  this.setTooltip(Blockly.Msg.TEXT_CHARAT_TOOLTIP)
}, mutationToDom:function() {
  var a = document.createElement("mutation"), b = this.getInput("AT").type == Blockly.INPUT_VALUE;
  a.setAttribute("at", b);
  return a
}, domToMutation:function(a) {
  a = "false" != a.getAttribute("at");
  this.updateAt(a)
}, updateAt:function(a) {
  this.removeInput("AT");
  this.removeInput("ORDINAL", !0);
  a ? (this.appendValueInput("AT").setCheck(Blockly.BlockValueType.NUMBER), Blockly.Msg.ORDINAL_NUMBER_SUFFIX && this.appendDummyInput("ORDINAL").appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)) : this.appendDummyInput("AT");
  Blockly.Msg.TEXT_CHARAT_TAIL && (this.removeInput("TAIL", !0), this.appendDummyInput("TAIL").appendTitle(Blockly.Msg.TEXT_CHARAT_TAIL));
  var b = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(b) {
    var d = "FROM_START" == b || "FROM_END" == b;
    if(d != a) {
      var e = this.sourceBlock_;
      e.updateAt(d);
      e.setTitleValue(b, "WHERE");
      return null
    }
  });
  this.getInput("AT").appendTitle(b, "WHERE")
}};
Blockly.Blocks.text_getSubstring = {init:function() {
  this.WHERE_OPTIONS_1 = [[Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_START, "FROM_START"], [Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_END, "FROM_END"], [Blockly.Msg.TEXT_GET_SUBSTRING_START_FIRST, "FIRST"]];
  this.WHERE_OPTIONS_2 = [[Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_START, "FROM_START"], [Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_END, "FROM_END"], [Blockly.Msg.TEXT_GET_SUBSTRING_END_LAST, "LAST"]];
  this.setHelpUrl(Blockly.Msg.TEXT_GET_SUBSTRING_HELPURL);
  this.setColour(160);
  this.appendValueInput("STRING").setCheck(Blockly.BlockValueType.STRING).appendTitle(Blockly.Msg.TEXT_GET_SUBSTRING_INPUT_IN_TEXT);
  this.appendDummyInput("AT1");
  this.appendDummyInput("AT2");
  Blockly.Msg.TEXT_GET_SUBSTRING_TAIL && this.appendDummyInput("TAIL").appendTitle(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);
  this.setInputsInline(!0);
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.updateAt(1, !0);
  this.updateAt(2, !0);
  this.setTooltip(Blockly.Msg.TEXT_GET_SUBSTRING_TOOLTIP)
}, mutationToDom:function() {
  var a = document.createElement("mutation"), b = this.getInput("AT1").type == Blockly.INPUT_VALUE;
  a.setAttribute("at1", b);
  b = this.getInput("AT2").type == Blockly.INPUT_VALUE;
  a.setAttribute("at2", b);
  return a
}, domToMutation:function(a) {
  var b = "true" == a.getAttribute("at1");
  a = "true" == a.getAttribute("at2");
  this.updateAt(1, b);
  this.updateAt(2, a)
}, updateAt:function(a, b) {
  this.removeInput("AT" + a);
  this.removeInput("ORDINAL" + a, !0);
  b ? (this.appendValueInput("AT" + a).setCheck(Blockly.BlockValueType.NUMBER), Blockly.Msg.ORDINAL_NUMBER_SUFFIX && this.appendDummyInput("ORDINAL" + a).appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX)) : this.appendDummyInput("AT" + a);
  2 == a && Blockly.Msg.TEXT_GET_SUBSTRING_TAIL && (this.removeInput("TAIL", !0), this.appendDummyInput("TAIL").appendTitle(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL));
  var c = new Blockly.FieldDropdown(this["WHERE_OPTIONS_" + a], function(c) {
    var e = "FROM_START" == c || "FROM_END" == c;
    if(e != b) {
      var f = this.sourceBlock_;
      f.updateAt(a, e);
      f.setTitleValue(c, "WHERE" + a);
      return null
    }
  });
  this.getInput("AT" + a).appendTitle(c, "WHERE" + a);
  1 == a && this.moveInputBefore("AT1", "AT2")
}};
Blockly.Blocks.text_changeCase = {init:function() {
  var a = [[Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE, "UPPERCASE"], [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE, "LOWERCASE"], [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE, "TITLECASE"]];
  this.setHelpUrl(Blockly.Msg.TEXT_CHANGECASE_HELPURL);
  this.setColour(160);
  this.appendValueInput("TEXT").setCheck(Blockly.BlockValueType.STRING).appendTitle(new Blockly.FieldDropdown(a), "CASE");
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.setTooltip(Blockly.Msg.TEXT_CHANGECASE_TOOLTIP)
}};
Blockly.Blocks.text_trim = {init:function() {
  var a = [[Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH, "BOTH"], [Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT, "LEFT"], [Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT, "RIGHT"]];
  this.setHelpUrl(Blockly.Msg.TEXT_TRIM_HELPURL);
  this.setColour(160);
  this.appendValueInput("TEXT").setCheck(Blockly.BlockValueType.STRING).appendTitle(new Blockly.FieldDropdown(a), "MODE");
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  this.setTooltip(Blockly.Msg.TEXT_TRIM_TOOLTIP)
}};
Blockly.Blocks.text_print = {init:function() {
  this.setHelpUrl(Blockly.Msg.TEXT_PRINT_HELPURL);
  this.setColour(160);
  this.interpolateMsg(Blockly.Msg.TEXT_PRINT_TITLE, ["TEXT", null, Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.TEXT_PRINT_TOOLTIP)
}};
Blockly.Blocks.text_prompt = {init:function() {
  var a = [[Blockly.Msg.TEXT_PROMPT_TYPE_TEXT, "TEXT"], [Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER, "NUMBER"]], b = this;
  this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);
  this.setColour(160);
  a = new Blockly.FieldDropdown(a, function(a) {
    "NUMBER" == a ? b.outputConnection.setCheck(Blockly.BlockValueType.NUMBER) : b.outputConnection.setCheck(Blockly.BlockValueType.STRING)
  });
  this.appendDummyInput().appendTitle(a, "TYPE").appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote0.png"), 12, 12)).appendTitle(new Blockly.FieldTextInput(""), "TEXT").appendTitle(new Blockly.FieldImage(Blockly.assetUrl("media/quote1.png"), 12, 12));
  this.setOutput(!0, Blockly.BlockValueType.STRING);
  b = this;
  this.setTooltip(function() {
    return"TEXT" == b.getTitleValue("TYPE") ? Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT : Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER
  })
}};
Blockly.Blocks.variables = {};
Blockly.Blocks.variables_get = {init:function() {
  var a = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
  a.EDITABLE = !0;
  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
  this.setHSV(312, 0.32, 0.62);
  this.appendDummyInput().appendTitle(Blockly.Msg.VARIABLES_GET_TITLE).appendTitle(Blockly.disableVariableEditing ? a : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_GET_ITEM), "VAR").appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
  this.setOutput(!0);
  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP)
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}, removeVar:function(a) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.dispose(!0, !0)
}, contextMenuType_:"variables_set", customContextMenu:function(a) {
  var b = {enabled:!0}, c = this.getTitleValue("VAR");
  b.text = Blockly.Msg.VARIABLES_GET_CREATE_SET.replace("%1", c);
  c = goog.dom.createDom("title", null, c);
  c.setAttribute("name", "VAR");
  c = goog.dom.createDom("block", null, c);
  c.setAttribute("type", this.contextMenuType_);
  b.callback = Blockly.ContextMenu.callbackFactory(this, c);
  a.push(b)
}};
Blockly.Blocks.variables_set = {init:function() {
  var a = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_SET_ITEM);
  a.EDITABLE = !0;
  this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
  this.setHSV(312, 0.32, 0.62);
  this.appendValueInput("VALUE").appendTitle(Blockly.Msg.VARIABLES_SET_TITLE).appendTitle(Blockly.disableVariableEditing ? a : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM), "VAR").appendTitle(Blockly.Msg.VARIABLES_SET_TAIL);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP)
}, getVars:function() {
  return[this.getTitleValue("VAR")]
}, renameVar:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("VAR")) && this.setTitleValue(b, "VAR")
}, contextMenuMsg_:Blockly.Msg.VARIABLES_SET_CREATE_GET, contextMenuType_:"variables_get", customContextMenu:Blockly.Blocks.variables_get.customContextMenu};
Blockly.Blocks.parameters_get = {init:function() {
  var a = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
  a.EDITABLE = !0;
  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
  this.setHSV(7, 0.8, 0.95);
  this.appendDummyInput().appendTitle(Blockly.Msg.VARIABLES_GET_TITLE).appendTitle(Blockly.disableVariableEditing ? a : new Blockly.FieldParameter(Blockly.Msg.VARIABLES_GET_ITEM), "VAR").appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
  this.setOutput(!0);
  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP)
}, renameVar:function(a, b) {
  Blockly.functionEditor && Blockly.functionEditor.isOpen() && (Blockly.functionEditor.renameParameter(a, b), Blockly.functionEditor.refreshParamsEverywhere())
}, removeVar:Blockly.Blocks.variables_get.removeVar};
Blockly.Blocks.functionalProcedures = {};
Blockly.Blocks.functional_definition = {shouldHideIfInMainBlockSpace:function() {
  return!0
}, init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
  this.setHSV(94, 0.84, 0.6);
  this.setFunctional(!0, {headerHeight:0, rowBuffer:3});
  this.setFunctionalOutput(!0, Blockly.BlockValueType.NUMBER);
  var a = Blockly.Procedures.findLegalName(Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
  this.appendDummyInput().appendTitle(Blockly.Msg.DEFINE_FUNCTION_DEFINE).appendTitle(new Blockly.FieldTextInput(a, Blockly.Procedures.rename), "NAME").appendTitle("", "PARAMS");
  this.appendFunctionalInput("STACK");
  this.setFunctional(!0);
  this.setTooltip(Blockly.Msg.FUNCTIONAL_PROCEDURE_DEFINE_TOOLTIP);
  this.isFunctionalVariable_ = !1;
  this.parameterNames_ = [];
  this.paramIds_ = [];
  this.parameterTypes_ = []
}, updateInputsToType:function(a) {
  this.updateInputType_(this.getInput("STACK"), a);
  this.render()
}, updateInputType_:function(a, b) {
  a.setHSV.apply(a, Blockly.FunctionalTypeColors[b]);
  a.setCheck(b)
}, mutationToDom:function() {
  for(var a = document.createElement("mutation"), b = 0;b < this.parameterNames_.length;b++) {
    var c = document.createElement("arg");
    c.setAttribute("name", this.parameterNames_[b]);
    this.parameterTypes_[b] && c.setAttribute("type", this.parameterTypes_[b]);
    a.appendChild(c)
  }
  this.description_ && (b = document.createElement("description"), b.innerHTML = this.description_, a.appendChild(b));
  this.outputType_ && (b = document.createElement("outputType"), b.innerHTML = this.outputType_, a.appendChild(b));
  this.isFunctionalVariable_ && (b = document.createElement("isfunctionalvariable"), b.innerHTML = "true", a.appendChild(b));
  return a
}, domToMutation:function(a) {
  this.parameterNames_ = [];
  for(var b = 0, c;c = a.childNodes[b];b++) {
    var d = c.nodeName.toLowerCase();
    "arg" === d ? (this.parameterNames_.push(c.getAttribute("name")), this.parameterTypes_.push(c.getAttribute("type"))) : "description" === d ? this.description_ = c.textContent : "outputtype" === d ? this.updateOutputType(c.textContent) : "isfunctionalvariable" === d && (this.isFunctionalVariable_ = !0)
  }
  this.updateParams_()
}, isVariable:function() {
  return this.isFunctionalVariable_
}, convertToVariable:function() {
  this.isFunctionalVariable_ = !0
}, updateParamsFromArrays:function(a, b, c) {
  this.parameterNames_ = goog.array.clone(a);
  this.paramIds_ = b ? goog.array.clone(b) : null;
  this.parameterTypes_ = goog.array.clone(c);
  this.updateParams_();
  this.updateCallerParams_()
}, updateParams_:function() {
  for(var a = !1, b = {}, c = 0;c < this.parameterNames_.length;c++) {
    if(b["arg_" + this.parameterNames_[c].toLowerCase()]) {
      a = !0;
      break
    }
    b["arg_" + this.parameterNames_[c].toLowerCase()] = !0
  }
  a ? this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING) : this.setWarningText(null);
  a = "";
  this.parameterNames_.length && (a = Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " " + this.parameterNames_.join(", "));
  this.setTitleValue(a, "PARAMS")
}, updateCallerParams_:function() {
  Blockly.Procedures.mutateCallers(this.getTitleValue("NAME"), this.blockSpace, this.parameterNames_, this.paramIds_, this.parameterTypes_)
}, getOutputType:function() {
  return this.outputType_
}, updateOutputType:function(a) {
  this.outputType_ = a;
  this.changeFunctionalOutput(this.outputType_)
}, dispose:function(a, b, c) {
  if(!c) {
    var d = this.getTitleValue("NAME");
    Blockly.Procedures.disposeCallers(d, this.blockSpace)
  }
  Blockly.Block.prototype.dispose.apply(this, arguments)
}, getProcedureInfo:function() {
  return{name:this.getTitleValue("NAME"), type:this.type, callType:this.callType_, parameterNames:this.parameterNames_, parameterTypes:this.parameterTypes_, isFunctionalVariable:this.isFunctionalVariable_}
}, getVars:function() {
  return this.parameterNames_
}, renameVar:function(a, b) {
  for(var c = !1, d = 0;d < this.parameterNames_.length;d++) {
    Blockly.Names.equals(a, this.parameterNames_[d]) && (this.parameterNames_[d] = b, c = !0)
  }
  if(c && (this.updateParams_(), this.mutator && this.mutator.isVisible())) {
    for(var c = this.mutator.blockSpace_.getAllBlocks(), d = 0, e;e = c[d];d++) {
      "functional_procedures_mutatorarg" == e.type && Blockly.Names.equals(a, e.getTitleValue("NAME")) && e.setTitleValue(b, "NAME")
    }
  }
}, removeVar:function(a) {
  a = this.parameterNames_.indexOf(a);
  -1 < a && (this.parameterNames_.splice(a, 1), this.updateParams_())
}, changeParamType:function(a, b) {
  for(var c = !1, d = 0;d < this.parameterNames_.length;d++) {
    Blockly.Names.equals(a, this.parameterNames_[d]) && (this.parameterTypes_[d] = b, c = !0)
  }
  c && (this.updateParams_(), this.updateCallerParams_())
}, shouldBeGrayedOut:function() {
  return!1
}, callType_:"functional_call"};
Blockly.Blocks.functional_call = {init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
  this.setTooltip("Calls a user-defined function");
  this.setHSV(94, 0.84, 0.6);
  var a = this.appendDummyInput().appendTitle(new Blockly.FieldLabel("Function Call", {fixedSize:{height:35}}), "NAME").appendTitle("", "PARAM_TEXT");
  if(Blockly.useContractEditor && this.blockSpace !== Blockly.modalBlockSpace) {
    var b = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
    Blockly.bindEvent_(b.fieldGroup_, "mousedown", this, this.openEditor);
    a.appendTitle(b);
    this.editLabel_ = b
  }
  this.setFunctional(!0);
  this.currentParameterNames_ = [];
  this.parameterIDsToArgumentConnections_ = {};
  this.currentParameterIDs_ = [];
  this.currentParameterTypes_ = [];
  this.currentDescription_ = this.currentOutputType_ = null;
  this.blockSpace.events.listen(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE, this.updateAttributesFromDefinition_, !1, this);
  this.changeFunctionalOutput(Blockly.BlockValueType.NONE)
}, updateAttributesFromDefinition_:function() {
  var a = Blockly.Procedures.getDefinition(this.getTitleValue("NAME"), this.blockSpace.blockSpaceEditor.blockSpace);
  a && (a.outputType_ && a.outputType_ !== this.currentOutputType_ && (this.currentOutputType_ = a.outputType_, this.changeFunctionalOutput(a.outputType_)), a.description_ && a.description_ !== this.currentDescription_ && (this.currentDescription_ = a.description_, this.setTooltip(a.description_)))
}, beforeDispose:function() {
  this.blockSpace.events.unlisten(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE, this.updateAttributesFromDefinition_, !1, this)
}, openEditor:function(a) {
  a.stopPropagation();
  Blockly.functionEditor.openEditorForCallBlock_(this)
}, getCallName:function() {
  return this.getTitleValue("NAME")
}, getParamTypes:function() {
  return this.currentParameterTypes_
}, renameProcedure:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("NAME")) && this.setTitleValue(b, "NAME")
}, setProcedureParameters:function(a, b, c) {
  if(b) {
    if(b.length != a.length) {
      throw"Error: paramNames and paramIds must be the same length.";
    }
    this.currentParameterIDs_ || (this.parameterIDsToArgumentConnections_ = {}, a.join("\n") === this.currentParameterNames_.join("\n") ? this.currentParameterIDs_ = b : this.currentParameterIDs_ = []);
    var d = this.rendered;
    this.rendered = !1;
    for(var e = this.currentParameterNames_.length - 1;0 <= e;e--) {
      var f = this.getInput("ARG" + e);
      if(f) {
        var g = f.connection.targetConnection;
        this.parameterIDsToArgumentConnections_[this.currentParameterIDs_[e]] = g;
        this.removeInput("ARG" + e)
      }
    }
    this.currentParameterNames_ = goog.array.clone(a);
    this.currentParameterIDs_ = goog.array.clone(b);
    this.currentParameterTypes_ = goog.array.clone(c);
    for(e = 0;e < this.currentParameterNames_.length;e++) {
      f = this.appendFunctionalInput("ARG" + e).setAlign(Blockly.ALIGN_CENTRE).setInline(0 < e), g = this.currentParameterTypes_[e], f.setHSV.apply(f, Blockly.FunctionalTypeColors[g]), f.setCheck(g), this.currentParameterIDs_ && (a = this.currentParameterIDs_[e], a in this.parameterIDsToArgumentConnections_ && (g = this.parameterIDsToArgumentConnections_[a], !g || g.targetConnection || g.sourceBlock_.blockSpace != this.blockSpace ? delete this.parameterIDsToArgumentConnections_[a] : f.connection.connect(g)))
    }
    this.refreshParameterTitleString_();
    (this.rendered = d) && this.render()
  }else {
    this.parameterIDsToArgumentConnections_ = {}, this.currentParameterIDs_ = null
  }
}, refreshParameterTitleString_:function() {
  var a = 0 < this.currentParameterNames_.length ? " (" + this.currentParameterNames_.join(", ") + ")" : "";
  this.setTitleValue(a, "PARAM_TEXT")
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("name", this.getTitleValue("NAME"));
  for(var b = 0;b < this.currentParameterNames_.length;b++) {
    var c = document.createElement("arg");
    c.setAttribute("name", this.currentParameterNames_[b]);
    c.setAttribute("type", this.currentParameterTypes_[b]);
    a.appendChild(c)
  }
  return a
}, domToMutation:function(a) {
  var b = a.getAttribute("name");
  this.setTitleValue(b, "NAME");
  this.setTooltip((this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace("%1", b));
  this.currentParameterNames_ = [];
  this.currentParameterIDs_ = [];
  this.currentParameterTypes_ = [];
  for(var b = 0, c;c = a.childNodes[b];b++) {
    "arg" == c.nodeName.toLowerCase() && (this.currentParameterNames_.push(c.getAttribute("name")), this.currentParameterTypes_.push(c.getAttribute("type")), this.currentParameterIDs_.push(Blockly.getUID()))
  }
  this.setProcedureParameters(this.currentParameterNames_, this.currentParameterIDs_, this.currentParameterTypes_);
  this.updateAttributesFromDefinition_()
}, renameVar:function(a, b) {
  for(var c = 0;c < this.currentParameterNames_.length;c++) {
    Blockly.Names.equals(a, this.currentParameterNames_[c]) && (this.currentParameterNames_[c] = b, this.refreshParameterTitleString_())
  }
}};
Blockly.Blocks.functional_pass = {init:function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
  this.setTooltip("Pass a user-defined function");
  this.setHSV(94, 0.84, 0.6);
  var a = this.appendDummyInput().appendTitle(new Blockly.FieldLabel("Pass Function", {fixedSize:{height:35}}), "NAME").appendTitle("", "PARAM_TEXT");
  if(Blockly.useContractEditor && this.blockSpace !== Blockly.modalBlockSpace) {
    var b = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
    Blockly.bindEvent_(b.fieldGroup_, "mousedown", this, this.openEditor);
    a.appendTitle(b);
    this.editLabel_ = b
  }
  this.setFunctional(!0);
  this.setMovable(!!Blockly.editBlocks);
  this.setColorFromName_();
  this.blockSpace.events.listen(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE, this.setColorFromName_, !1, this);
  this.changeFunctionalOutput(Blockly.BlockValueType.FUNCTION)
}, openEditor:function(a) {
  a.stopPropagation();
  Blockly.functionEditor.openEditorForCallBlock_(this)
}, renameProcedure:function(a, b) {
  Blockly.Names.equals(a, this.getTitleValue("NAME")) && (this.setTitleValue(b, "NAME"), this.setColorFromName_())
}, setColorFromName_:function() {
  var a = this.getTitleValue("NAME");
  a && (a = Blockly.mainBlockSpace.findFunction(a)) && (a = a.getOutputType(), this.setHSV.apply(this, Blockly.FunctionalTypeColors[a]))
}, mutationToDom:function() {
  var a = document.createElement("mutation");
  a.setAttribute("name", this.getTitleValue("NAME"));
  return a
}, domToMutation:function(a) {
  a = a.getAttribute("name");
  this.setTitleValue(a, "NAME");
  this.setTooltip((this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace("%1", a));
  this.setColorFromName_()
}};
Blockly.Blocks.procedural_to_functional_call = Blockly.Blocks.procedures_callreturn;
Blockly.Blocks.functionalExamples = {};
Blockly.Blocks.functional_example = {shouldHideIfInMainBlockSpace:function() {
  return!0
}, isCopyable:function() {
  return!1
}, init:function() {
  this.setHSV(0, 0, 0.49);
  this.setFunctional(!0, {headerHeight:0, rowBuffer:3});
  this.setFunctionalOutput(!1);
  this.appendFunctionalInput("ACTUAL").setAlign(Blockly.ALIGN_CENTRE);
  this.appendFunctionalInput("EXPECTED").setAlign(Blockly.ALIGN_CENTRE).setInline(!0);
  this.setTooltip(Blockly.Msg.EXAMPLE_DESCRIPTION)
}, mutationToDom:function() {
}, domToMutation:function(a) {
}, updateOutputType:function(a) {
  this.outputType_ = a;
  this.changeFunctionalOutput(this.outputType_)
}, updateInputsToType:function(a) {
  this.updateInputType_(this.getInput("EXPECTED"), a);
  this.updateInputType_(this.getInput("ACTUAL"), a);
  this.render()
}, updateInputType_:function(a, b) {
  a.setHSV.apply(a, Blockly.FunctionalTypeColors[b]);
  a.setCheck(b)
}};
Blockly.Blocks.functionalParameters = {};
Blockly.Blocks.functional_parameters_get = {init:function() {
  var a = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
  a.EDITABLE = !0;
  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
  this.setHSV(312, 0.32, 0.62);
  this.setFunctional(!0, {headerHeight:30});
  this.appendDummyInput().appendTitle(Blockly.Msg.VARIABLES_GET_TITLE).appendTitle(a, "VAR").appendTitle(Blockly.Msg.VARIABLES_GET_TAIL).setAlign(Blockly.ALIGN_CENTRE);
  this.setFunctionalOutput(!0);
  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP)
}, renameVar:function(a, b) {
  if(Blockly.functionEditor) {
    var c = this.getTitle_("VAR");
    c.getText() === a && c.setText(b)
  }
}, removeVar:Blockly.Blocks.variables_get.removeVar, mutationToDom:function() {
  var a = document.createElement("mutation");
  if(this.description_) {
    var b = document.createElement("description");
    b.textContent = this.description_;
    a.appendChild(b)
  }
  this.outputType_ && (b = document.createElement("outputtype"), b.textContent = this.outputType_, a.appendChild(b));
  return a
}, domToMutation:function(a) {
  for(var b = 0, c;c = a.childNodes[b];b++) {
    var d = c.nodeName.toLowerCase();
    "description" === d ? this.description_ = c.textContent : "outputtype" === d && (this.outputType_ = c.textContent, this.changeFunctionalOutput(this.outputType_))
  }
}};


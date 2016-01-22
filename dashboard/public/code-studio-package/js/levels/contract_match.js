require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({186:[function(require,module,exports){
/* global React */

"use strict";

$(window).load(function () {
  $.widget("custom.coloriconselectmenu", $.ui.selectmenu, {
    /**
     * Override the jQuery selectmenu to add a color square icon driven by the
     * data-color attribute on select elements.
     * @param ul
     * @param item
     * @returns {jQuery}
     * @private
     */
    _renderItem: function _renderItem(ul, item) {
      var li = $("<li>", { text: item.label });
      var color = item.element.attr("data-color");
      makeColorSquareIcon(color).appendTo(li);
      return li.appendTo(ul);
    },
    styleCurrentValue: function styleCurrentValue() {
      addSquareIconToButton(this.element);
    }
  });

  /**
   * @param {string} color
   * @returns {string}
   */
  function bgColorStyle(color) {
    return "background-color: " + color;
  }

  /**
   * Styles a button element to have a color square icon
   * @param {Element} selectElement
   */
  function addSquareIconToButton(selectElement) {
    var selectMenuButton = $("#" + $(selectElement).attr("id") + "-button .ui-selectmenu-text");
    var selectedColor = $(selectElement).find("option:selected").attr("data-color");
    makeColorSquareIcon(selectedColor).prependTo(selectMenuButton);
  }

  /**
   * @param {string} color
   * @returns {jQuery}
   */
  function makeColorSquareIcon(color) {
    return $("<div>", { "class": "color-square-icon", style: bgColorStyle(color) });
  }

  /**
   * TODO(bjordan): Change usages to lodash _.curry once available in this context
   * @param fn function to be curried with arguments
   * @params [...] rest of args
   * @returns {Function} new function with the given arguments pre-set as the
   *                     defaults (curried)
   */
  var curry = function curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
      return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
  };

  /**
   * Enum of block types. Used for block and domain/range coloring
   * @enum {string}
   */
  var blockValueType = {
    NONE: 'None',
    NUMBER: 'Number',
    STRING: 'String',
    IMAGE: 'Image',
    BOOLEAN: 'Boolean'
  };

  var typesToColors = {};
  typesToColors[blockValueType.NUMBER] = "#00ccff";
  typesToColors[blockValueType.STRING] = "#009999";
  typesToColors[blockValueType.IMAGE] = "#9900cc";
  typesToColors[blockValueType.BOOLEAN] = "#336600";

  /**
   * Component Structure:
   *
   * - ContractForm
   *   - DomainsList
   *     - TypeChooser
   */
  var ContractForm = React.createClass({
    displayName: "ContractForm",

    getName: function getName() {
      return this.state.name;
    },
    getRangeType: function getRangeType() {
      return this.state.rangeType;
    },
    getDomainTypes: function getDomainTypes() {
      return this.state.domainTypes;
    },
    nextUniqueID_: 0,
    grabUniqueID: function grabUniqueID() {
      return this.nextUniqueID_++;
    },
    getInitialState: function getInitialState() {
      /**
       * @param data {{
       *   name: string,
       *   rangeType: BlockValueType,
       *   domainTypes: {
       *     type: BlockValueType,
       *     key: string
       *   },
       * }}
       */
      return {
        name: "",
        rangeType: blockValueType.NUMBER,
        domainTypes: []
      };
    },
    onNameChangeEvent: function onNameChangeEvent(event) {
      this.setState({
        name: event.target.value
      });
    },
    onRangeChange: function onRangeChange(newType) {
      this.setState({
        rangeType: newType
      });
    },
    onDomainChange: function onDomainChange(domainKey, newType) {
      this.setState({
        domainTypes: this.state.domainTypes.map(function (object) {
          if (object.key === domainKey) {
            object.type = newType;
          }
          return object;
        })
      });
    },
    onDomainAdd: function onDomainAdd() {
      var nextDomainID = this.grabUniqueID();
      this.setState({
        domainTypes: this.state.domainTypes.concat({
          key: 'domain' + nextDomainID,
          type: blockValueType.NUMBER,
          order: nextDomainID
        })
      });
    },
    onDomainRemove: function onDomainRemove(domainKey) {
      this.setState({
        domainTypes:
        // TODO(bjordan): change to _.find once lodash available
        $.grep(this.state.domainTypes, function (object) {
          return object.key !== domainKey;
        })
      });
    },
    render: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { id: "sectionTitle" },
          "Name"
        ),
        React.createElement(
          "div",
          null,
          React.createElement("input", { id: "functionNameText", onChange: this.onNameChangeEvent, placeholder: "Name", type: "text", value: this.state.name })
        ),
        React.createElement(
          "div",
          { id: "sectionTitle" },
          "Domain ",
          React.createElement(
            "span",
            { className: "section-type-hint" },
            "(the domain is the type of input)"
          )
        ),
        React.createElement(DomainsList, {
          domainTypes: this.state.domainTypes,
          onDomainChange: this.onDomainChange,
          onDomainAdd: this.onDomainAdd,
          onDomainRemove: this.onDomainRemove }),
        React.createElement(
          "div",
          { id: "sectionTitle", className: "clear" },
          "Range ",
          React.createElement(
            "span",
            { className: "section-type-hint" },
            "(the range is the type of output)"
          )
        ),
        React.createElement(TypeChooser, { type: this.state.rangeType, onTypeChange: this.onRangeChange })
      );
    }
  });

  var DomainsList = React.createClass({
    displayName: "DomainsList",

    render: function render() {
      var self = this;
      var sortedDomains = this.props.domainTypes.sort(function (a, b) {
        return a.order > b.order;
      });
      var typeChoiceNodes = sortedDomains.map(function (object) {
        return React.createElement(
          "div",
          { className: "clear" },
          React.createElement(TypeChooser, {
            order: object.order,
            type: object.type,
            key: object.key,
            onTypeChange: curry(self.props.onDomainChange, object.key) }),
          React.createElement(
            "button",
            { className: "btn domain-x-button", onClick: curry(self.props.onDomainRemove, object.key) },
            "Remove"
          )
        );
      });
      return React.createElement(
        "div",
        { className: "domainsList" },
        typeChoiceNodes,
        React.createElement(
          "button",
          { className: "btn domain-add-button", onClick: this.props.onDomainAdd },
          "Add Domain"
        )
      );
    }
  });

  var TypeChooser = React.createClass({
    displayName: "TypeChooser",

    selectmenuChange: function selectmenuChange(selectChange) {
      this.props.onTypeChange(selectChange.target.value);
    },
    render: function render() {
      var divStyle = {
        backgroundColor: typesToColors[this.props.type]
      };
      return React.createElement(
        "select",
        { value: this.props.type, style: divStyle },
        React.createElement(
          "option",
          { "data-color": typesToColors[blockValueType.NUMBER], value: blockValueType.NUMBER },
          blockValueType.NUMBER
        ),
        React.createElement(
          "option",
          { "data-color": typesToColors[blockValueType.STRING], value: blockValueType.STRING },
          blockValueType.STRING
        ),
        React.createElement(
          "option",
          { "data-color": typesToColors[blockValueType.IMAGE], value: blockValueType.IMAGE },
          blockValueType.IMAGE
        ),
        React.createElement(
          "option",
          { "data-color": typesToColors[blockValueType.BOOLEAN], value: blockValueType.BOOLEAN },
          blockValueType.BOOLEAN
        )
      );
    },
    componentDidMount: function componentDidMount() {
      $(React.findDOMNode(this)).coloriconselectmenu({
        select: function select() {
          addSquareIconToButton(this);
        },
        change: this.selectmenuChange
      });
      $(React.findDOMNode(this)).coloriconselectmenu("styleCurrentValue");
    },
    componentWillUnmount: function componentWillUnmount() {
      $(React.findDOMNode(this)).coloriconselectmenu('destroy');
    }
  });

  var contractForm = React.render(React.createElement(ContractForm, null), document.getElementById('contractForm'));

  /**
   * Creates a getResult function compatible with _dialog.html.haml's getResult call
   * Generating this rather than passing directly to be explicit about inputs for now
   * @param {ContractForm} contractForm
   * @param {Object} levelData
   * @returns {Function} getResult function
   */
  var generateGetResultFunction = function generateGetResultFunction(contractForm, levelData) {
    return function () {
      /** @type {ContractForm} */
      var functionName = contractForm.getName().trim();
      var rangeType = contractForm.getRangeType();
      var domains = contractForm.getDomainTypes();

      var answers = levelData.answers;

      var formattedDomains = domains.map(function (domain) {
        return domain.type;
      }).join('|');

      var formattedResponse = functionName + '|' + rangeType + '|' + formattedDomains;

      var checkUserAnswer = checkAnswer.bind(null, functionName, rangeType, formattedDomains);
      var answerErrors = answers.map(checkUserAnswer);

      // If any succeeded, we succeed. Otherwise, grab the first error.
      var result = answerErrors.some(function (answerResult) {
        return answerResult === '';
      });
      var errorType = result ? null : answerErrors[0];

      return {
        response: formattedResponse,
        result: result,
        errorType: errorType
      };
    };
  };

  /**
   * Set the getResult used by _dialog.html.haml
   * @return {Object} response, result, error type
   */
  window.getResult = generateGetResultFunction(contractForm, window.levelData);

  /**
   * Given the user's submission and a correct answer, returns the error type,
   * or empty string if correct.
   * @param {string} functionName
   * @param {string} rangeInput
   * @param {string} domainInput
   * @param {string} correctAnswer
   * @returns {string}
   */
  function checkAnswer(functionName, rangeInput, domainInput, correctAnswer) {
    var correctAnswerItems = correctAnswer.split('|');
    var correctName = correctAnswerItems[0];
    var correctRange = correctAnswerItems[1];
    var correctDomain = correctAnswerItems.slice(2);
    var domainInputItems = domainInput.split('|');

    if (correctName !== functionName) {
      if (functionName.toLowerCase() === correctName.toLowerCase()) {
        return 'badname_case';
      }
      return 'badname';
    }
    if (correctRange !== rangeInput) {
      return 'badrange';
    }
    if (correctDomain.length !== domainInputItems.length) {
      return 'baddomainsize';
    }
    for (var i = 0; i < correctDomain.length; i++) {
      var correctDomainType = correctDomain[i];
      var domainType = domainInputItems[i];
      if (correctDomainType !== domainType) {
        return 'baddomaintype';
      }
    }
    return '';
  }
});

},{}]},{},[186])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS91YnVudHUvc3RhZ2luZy9jb2RlLXN0dWRpby9zcmMvanMvbGV2ZWxzL2NvbnRyYWN0X21hdGNoLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNFQSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVk7QUFDekIsR0FBQyxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTs7Ozs7Ozs7O0FBU3RELGVBQVcsRUFBRSxxQkFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFO0FBQy9CLFVBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDdkMsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUMseUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLGFBQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN4QjtBQUNELHFCQUFpQixFQUFFLDZCQUFZO0FBQzdCLDJCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQztHQUNGLENBQUMsQ0FBQzs7Ozs7O0FBTUgsV0FBUyxZQUFZLENBQUMsS0FBSyxFQUFFO0FBQzNCLFdBQU8sb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0dBQ3JDOzs7Ozs7QUFNRCxXQUFTLHFCQUFxQixDQUFDLGFBQWEsRUFBRTtBQUM1QyxRQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENB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QUFFLENBQUM7R0FDWDtDQUVGLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgUmVhY3QgKi9cblxuJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24gKCkge1xuICAkLndpZGdldChcImN1c3RvbS5jb2xvcmljb25zZWxlY3RtZW51XCIsICQudWkuc2VsZWN0bWVudSwge1xuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBqUXVlcnkgc2VsZWN0bWVudSB0byBhZGQgYSBjb2xvciBzcXVhcmUgaWNvbiBkcml2ZW4gYnkgdGhlXG4gICAgICogZGF0YS1jb2xvciBhdHRyaWJ1dGUgb24gc2VsZWN0IGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSB1bFxuICAgICAqIEBwYXJhbSBpdGVtXG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW5kZXJJdGVtOiBmdW5jdGlvbiAodWwsIGl0ZW0pIHtcbiAgICAgIHZhciBsaSA9ICQoXCI8bGk+XCIsIHt0ZXh0OiBpdGVtLmxhYmVsfSk7XG4gICAgICB2YXIgY29sb3IgPSBpdGVtLmVsZW1lbnQuYXR0cihcImRhdGEtY29sb3JcIik7XG4gICAgICBtYWtlQ29sb3JTcXVhcmVJY29uKGNvbG9yKS5hcHBlbmRUbyhsaSk7XG4gICAgICByZXR1cm4gbGkuYXBwZW5kVG8odWwpO1xuICAgIH0sXG4gICAgc3R5bGVDdXJyZW50VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGFkZFNxdWFyZUljb25Ub0J1dHRvbih0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gYmdDb2xvclN0eWxlKGNvbG9yKSB7XG4gICAgcmV0dXJuIFwiYmFja2dyb3VuZC1jb2xvcjogXCIgKyBjb2xvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdHlsZXMgYSBidXR0b24gZWxlbWVudCB0byBoYXZlIGEgY29sb3Igc3F1YXJlIGljb25cbiAgICogQHBhcmFtIHtFbGVtZW50fSBzZWxlY3RFbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBhZGRTcXVhcmVJY29uVG9CdXR0b24oc2VsZWN0RWxlbWVudCkge1xuICAgIHZhciBzZWxlY3RNZW51QnV0dG9uID0gJChcIiNcIiArICQoc2VsZWN0RWxlbWVudCkuYXR0cihcImlkXCIpICsgXCItYnV0dG9uIC51aS1zZWxlY3RtZW51LXRleHRcIik7XG4gICAgdmFyIHNlbGVjdGVkQ29sb3IgPSAkKHNlbGVjdEVsZW1lbnQpLmZpbmQoXCJvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtY29sb3JcIik7XG4gICAgbWFrZUNvbG9yU3F1YXJlSWNvbihzZWxlY3RlZENvbG9yKS5wcmVwZW5kVG8oc2VsZWN0TWVudUJ1dHRvbik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yXG4gICAqIEByZXR1cm5zIHtqUXVlcnl9XG4gICAqL1xuICBmdW5jdGlvbiBtYWtlQ29sb3JTcXVhcmVJY29uKGNvbG9yKSB7XG4gICAgcmV0dXJuICQoXCI8ZGl2PlwiLCB7Y2xhc3M6IFwiY29sb3Itc3F1YXJlLWljb25cIiwgc3R5bGU6IGJnQ29sb3JTdHlsZShjb2xvcil9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPKGJqb3JkYW4pOiBDaGFuZ2UgdXNhZ2VzIHRvIGxvZGFzaCBfLmN1cnJ5IG9uY2UgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dFxuICAgKiBAcGFyYW0gZm4gZnVuY3Rpb24gdG8gYmUgY3VycmllZCB3aXRoIGFyZ3VtZW50c1xuICAgKiBAcGFyYW1zIFsuLi5dIHJlc3Qgb2YgYXJnc1xuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IG5ldyBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMgcHJlLXNldCBhcyB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICBkZWZhdWx0cyAoY3VycmllZClcbiAgICovXG4gIHZhciBjdXJyeSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSkpO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIEVudW0gb2YgYmxvY2sgdHlwZXMuIFVzZWQgZm9yIGJsb2NrIGFuZCBkb21haW4vcmFuZ2UgY29sb3JpbmdcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICovXG4gIHZhciBibG9ja1ZhbHVlVHlwZSA9IHtcbiAgICBOT05FOiAnTm9uZScsXG4gICAgTlVNQkVSOiAnTnVtYmVyJyxcbiAgICBTVFJJTkc6ICdTdHJpbmcnLFxuICAgIElNQUdFOiAnSW1hZ2UnLFxuICAgIEJPT0xFQU46ICdCb29sZWFuJ1xuICB9O1xuXG4gIHZhciB0eXBlc1RvQ29sb3JzID0ge307XG4gIHR5cGVzVG9Db2xvcnNbYmxvY2tWYWx1ZVR5cGUuTlVNQkVSXSA9IFwiIzAwY2NmZlwiO1xuICB0eXBlc1RvQ29sb3JzW2Jsb2NrVmFsdWVUeXBlLlNUUklOR10gPSBcIiMwMDk5OTlcIjtcbiAgdHlwZXNUb0NvbG9yc1tibG9ja1ZhbHVlVHlwZS5JTUFHRV0gPSBcIiM5OTAwY2NcIjtcbiAgdHlwZXNUb0NvbG9yc1tibG9ja1ZhbHVlVHlwZS5CT09MRUFOXSA9IFwiIzMzNjYwMFwiO1xuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgU3RydWN0dXJlOlxuICAgKlxuICAgKiAtIENvbnRyYWN0Rm9ybVxuICAgKiAgIC0gRG9tYWluc0xpc3RcbiAgICogICAgIC0gVHlwZUNob29zZXJcbiAgICovXG4gIHZhciBDb250cmFjdEZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZ2V0TmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubmFtZTtcbiAgICB9LFxuICAgIGdldFJhbmdlVHlwZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucmFuZ2VUeXBlO1xuICAgIH0sXG4gICAgZ2V0RG9tYWluVHlwZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRvbWFpblR5cGVzO1xuICAgIH0sXG4gICAgbmV4dFVuaXF1ZUlEXzogMCxcbiAgICBncmFiVW5pcXVlSUQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICh0aGlzLm5leHRVbmlxdWVJRF8rKyk7XG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIGRhdGEge3tcbiAgICAgICAqICAgbmFtZTogc3RyaW5nLFxuICAgICAgICogICByYW5nZVR5cGU6IEJsb2NrVmFsdWVUeXBlLFxuICAgICAgICogICBkb21haW5UeXBlczoge1xuICAgICAgICogICAgIHR5cGU6IEJsb2NrVmFsdWVUeXBlLFxuICAgICAgICogICAgIGtleTogc3RyaW5nXG4gICAgICAgKiAgIH0sXG4gICAgICAgKiB9fVxuICAgICAgICovXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICByYW5nZVR5cGU6IGJsb2NrVmFsdWVUeXBlLk5VTUJFUixcbiAgICAgICAgZG9tYWluVHlwZXM6IFtdXG4gICAgICB9O1xuICAgIH0sXG4gICAgb25OYW1lQ2hhbmdlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG5hbWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBvblJhbmdlQ2hhbmdlOiBmdW5jdGlvbiAobmV3VHlwZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHJhbmdlVHlwZTogbmV3VHlwZVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBvbkRvbWFpbkNoYW5nZTogZnVuY3Rpb24gKGRvbWFpbktleSwgbmV3VHlwZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRvbWFpblR5cGVzOlxuICAgICAgICAgIHRoaXMuc3RhdGUuZG9tYWluVHlwZXMubWFwKGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChvYmplY3Qua2V5ID09PSBkb21haW5LZXkpIHtcbiAgICAgICAgICAgICAgb2JqZWN0LnR5cGUgPSBuZXdUeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBvbkRvbWFpbkFkZDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5leHREb21haW5JRCA9IHRoaXMuZ3JhYlVuaXF1ZUlEKCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZG9tYWluVHlwZXM6XG4gICAgICAgICAgdGhpcy5zdGF0ZS5kb21haW5UeXBlcy5jb25jYXQoe1xuICAgICAgICAgICAga2V5OiAnZG9tYWluJyArIG5leHREb21haW5JRCxcbiAgICAgICAgICAgIHR5cGU6IGJsb2NrVmFsdWVUeXBlLk5VTUJFUixcbiAgICAgICAgICAgIG9yZGVyOiBuZXh0RG9tYWluSURcbiAgICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBvbkRvbWFpblJlbW92ZTogZnVuY3Rpb24gKGRvbWFpbktleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRvbWFpblR5cGVzOlxuICAgICAgICAgIC8vIFRPRE8oYmpvcmRhbik6IGNoYW5nZSB0byBfLmZpbmQgb25jZSBsb2Rhc2ggYXZhaWxhYmxlXG4gICAgICAgICAgJC5ncmVwKHRoaXMuc3RhdGUuZG9tYWluVHlwZXMsIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Qua2V5ICE9PSBkb21haW5LZXk7XG4gICAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J3NlY3Rpb25UaXRsZSc+TmFtZTwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J2Z1bmN0aW9uTmFtZVRleHQnIG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZUV2ZW50fSBwbGFjZWhvbGRlcj0nTmFtZScgdHlwZT0ndGV4dCcgdmFsdWU9e3RoaXMuc3RhdGUubmFtZX0vPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J3NlY3Rpb25UaXRsZSc+RG9tYWluIDxzcGFuIGNsYXNzTmFtZT0nc2VjdGlvbi10eXBlLWhpbnQnPih0aGUgZG9tYWluIGlzIHRoZSB0eXBlIG9mIGlucHV0KTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8RG9tYWluc0xpc3RcbiAgICAgICAgICAgIGRvbWFpblR5cGVzPXt0aGlzLnN0YXRlLmRvbWFpblR5cGVzfVxuICAgICAgICAgICAgb25Eb21haW5DaGFuZ2U9e3RoaXMub25Eb21haW5DaGFuZ2V9XG4gICAgICAgICAgICBvbkRvbWFpbkFkZD17dGhpcy5vbkRvbWFpbkFkZH1cbiAgICAgICAgICAgIG9uRG9tYWluUmVtb3ZlPXt0aGlzLm9uRG9tYWluUmVtb3ZlfS8+XG4gICAgICAgICAgPGRpdiBpZD0nc2VjdGlvblRpdGxlJyBjbGFzc05hbWU9XCJjbGVhclwiPlJhbmdlIDxzcGFuIGNsYXNzTmFtZT0nc2VjdGlvbi10eXBlLWhpbnQnPih0aGUgcmFuZ2UgaXMgdGhlIHR5cGUgb2Ygb3V0cHV0KTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8VHlwZUNob29zZXIgdHlwZT17dGhpcy5zdGF0ZS5yYW5nZVR5cGV9IG9uVHlwZUNoYW5nZT17dGhpcy5vblJhbmdlQ2hhbmdlfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBEb21haW5zTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzb3J0ZWREb21haW5zID0gdGhpcy5wcm9wcy5kb21haW5UeXBlcy5zb3J0KGZ1bmN0aW9uIChhLGIpIHtcbiAgICAgICAgcmV0dXJuIGEub3JkZXIgPiBiLm9yZGVyO1xuICAgICAgfSk7XG4gICAgICB2YXIgdHlwZUNob2ljZU5vZGVzID0gc29ydGVkRG9tYWlucy5tYXAoZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJcIj5cbiAgICAgICAgICAgIDxUeXBlQ2hvb3NlclxuICAgICAgICAgICAgICBvcmRlcj17b2JqZWN0Lm9yZGVyfVxuICAgICAgICAgICAgICB0eXBlPXtvYmplY3QudHlwZX1cbiAgICAgICAgICAgICAga2V5PXtvYmplY3Qua2V5fVxuICAgICAgICAgICAgICBvblR5cGVDaGFuZ2U9e2N1cnJ5KHNlbGYucHJvcHMub25Eb21haW5DaGFuZ2UsIG9iamVjdC5rZXkpfS8+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBkb21haW4teC1idXR0b25cIiBvbkNsaWNrPXtjdXJyeShzZWxmLnByb3BzLm9uRG9tYWluUmVtb3ZlLCBvYmplY3Qua2V5KX0+UmVtb3ZlPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZG9tYWluc0xpc3RcIj5cbiAgICAgICAgICB7dHlwZUNob2ljZU5vZGVzfVxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGRvbWFpbi1hZGQtYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkRvbWFpbkFkZH0+QWRkIERvbWFpbjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgVHlwZUNob29zZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgc2VsZWN0bWVudUNoYW5nZTogZnVuY3Rpb24oc2VsZWN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVHlwZUNoYW5nZShzZWxlY3RDaGFuZ2UudGFyZ2V0LnZhbHVlKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRpdlN0eWxlID0ge1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHR5cGVzVG9Db2xvcnNbdGhpcy5wcm9wcy50eXBlXVxuICAgICAgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxzZWxlY3QgdmFsdWU9e3RoaXMucHJvcHMudHlwZX0gc3R5bGU9e2RpdlN0eWxlfT5cbiAgICAgICAgICA8b3B0aW9uIGRhdGEtY29sb3I9e3R5cGVzVG9Db2xvcnNbYmxvY2tWYWx1ZVR5cGUuTlVNQkVSXX0gdmFsdWU9e2Jsb2NrVmFsdWVUeXBlLk5VTUJFUn0+e2Jsb2NrVmFsdWVUeXBlLk5VTUJFUn08L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIGRhdGEtY29sb3I9e3R5cGVzVG9Db2xvcnNbYmxvY2tWYWx1ZVR5cGUuU1RSSU5HXX0gdmFsdWU9e2Jsb2NrVmFsdWVUeXBlLlNUUklOR30+e2Jsb2NrVmFsdWVUeXBlLlNUUklOR308L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIGRhdGEtY29sb3I9e3R5cGVzVG9Db2xvcnNbYmxvY2tWYWx1ZVR5cGUuSU1BR0VdfSB2YWx1ZT17YmxvY2tWYWx1ZVR5cGUuSU1BR0V9PntibG9ja1ZhbHVlVHlwZS5JTUFHRX08L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIGRhdGEtY29sb3I9e3R5cGVzVG9Db2xvcnNbYmxvY2tWYWx1ZVR5cGUuQk9PTEVBTl19IHZhbHVlPXtibG9ja1ZhbHVlVHlwZS5CT09MRUFOfT57YmxvY2tWYWx1ZVR5cGUuQk9PTEVBTn08L29wdGlvbj5cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICApO1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICQoUmVhY3QuZmluZERPTU5vZGUodGhpcykpLmNvbG9yaWNvbnNlbGVjdG1lbnUoe1xuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBhZGRTcXVhcmVJY29uVG9CdXR0b24odGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoYW5nZTogdGhpcy5zZWxlY3RtZW51Q2hhbmdlXG4gICAgICB9KTtcbiAgICAgICQoUmVhY3QuZmluZERPTU5vZGUodGhpcykpLmNvbG9yaWNvbnNlbGVjdG1lbnUoXCJzdHlsZUN1cnJlbnRWYWx1ZVwiKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAkKFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpKS5jb2xvcmljb25zZWxlY3RtZW51KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgY29udHJhY3RGb3JtID0gUmVhY3QucmVuZGVyKDxDb250cmFjdEZvcm0gLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmFjdEZvcm0nKSk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBnZXRSZXN1bHQgZnVuY3Rpb24gY29tcGF0aWJsZSB3aXRoIF9kaWFsb2cuaHRtbC5oYW1sJ3MgZ2V0UmVzdWx0IGNhbGxcbiAgICogR2VuZXJhdGluZyB0aGlzIHJhdGhlciB0aGFuIHBhc3NpbmcgZGlyZWN0bHkgdG8gYmUgZXhwbGljaXQgYWJvdXQgaW5wdXRzIGZvciBub3dcbiAgICogQHBhcmFtIHtDb250cmFjdEZvcm19IGNvbnRyYWN0Rm9ybVxuICAgKiBAcGFyYW0ge09iamVjdH0gbGV2ZWxEYXRhXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gZ2V0UmVzdWx0IGZ1bmN0aW9uXG4gICAqL1xuICB2YXIgZ2VuZXJhdGVHZXRSZXN1bHRGdW5jdGlvbiA9IGZ1bmN0aW9uIChjb250cmFjdEZvcm0sIGxldmVsRGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvKiogQHR5cGUge0NvbnRyYWN0Rm9ybX0gKi9cbiAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBjb250cmFjdEZvcm0uZ2V0TmFtZSgpLnRyaW0oKTtcbiAgICAgIHZhciByYW5nZVR5cGUgPSBjb250cmFjdEZvcm0uZ2V0UmFuZ2VUeXBlKCk7XG4gICAgICB2YXIgZG9tYWlucyA9IGNvbnRyYWN0Rm9ybS5nZXREb21haW5UeXBlcygpO1xuXG4gICAgICB2YXIgYW5zd2VycyA9IGxldmVsRGF0YS5hbnN3ZXJzO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkRG9tYWlucyA9IGRvbWFpbnMubWFwKGZ1bmN0aW9uIChkb21haW4pIHtcbiAgICAgICAgcmV0dXJuIGRvbWFpbi50eXBlO1xuICAgICAgfSkuam9pbignfCcpO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkUmVzcG9uc2UgPSBmdW5jdGlvbk5hbWUgKyAnfCcgKyByYW5nZVR5cGUgKyAnfCcgKyBmb3JtYXR0ZWREb21haW5zO1xuXG4gICAgICB2YXIgY2hlY2tVc2VyQW5zd2VyID0gY2hlY2tBbnN3ZXIuYmluZChudWxsLCBmdW5jdGlvbk5hbWUsIHJhbmdlVHlwZSwgZm9ybWF0dGVkRG9tYWlucyk7XG4gICAgICB2YXIgYW5zd2VyRXJyb3JzID0gYW5zd2Vycy5tYXAoY2hlY2tVc2VyQW5zd2VyKTtcblxuICAgICAgLy8gSWYgYW55IHN1Y2NlZWRlZCwgd2Ugc3VjY2VlZC4gT3RoZXJ3aXNlLCBncmFiIHRoZSBmaXJzdCBlcnJvci5cbiAgICAgIHZhciByZXN1bHQgPSBhbnN3ZXJFcnJvcnMuc29tZShmdW5jdGlvbiAoYW5zd2VyUmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBhbnN3ZXJSZXN1bHQgPT09ICcnO1xuICAgICAgfSk7XG4gICAgICB2YXIgZXJyb3JUeXBlID0gcmVzdWx0ID8gbnVsbCA6IGFuc3dlckVycm9yc1swXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzcG9uc2U6IGZvcm1hdHRlZFJlc3BvbnNlLFxuICAgICAgICByZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgZXJyb3JUeXBlOiBlcnJvclR5cGVcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHRoZSBnZXRSZXN1bHQgdXNlZCBieSBfZGlhbG9nLmh0bWwuaGFtbFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3BvbnNlLCByZXN1bHQsIGVycm9yIHR5cGVcbiAgICovXG4gIHdpbmRvdy5nZXRSZXN1bHQgPSBnZW5lcmF0ZUdldFJlc3VsdEZ1bmN0aW9uKGNvbnRyYWN0Rm9ybSwgd2luZG93LmxldmVsRGF0YSk7XG5cbiAgLyoqXG4gICAqIEdpdmVuIHRoZSB1c2VyJ3Mgc3VibWlzc2lvbiBhbmQgYSBjb3JyZWN0IGFuc3dlciwgcmV0dXJucyB0aGUgZXJyb3IgdHlwZSxcbiAgICogb3IgZW1wdHkgc3RyaW5nIGlmIGNvcnJlY3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJhbmdlSW5wdXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbklucHV0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb3JyZWN0QW5zd2VyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBjaGVja0Fuc3dlcihmdW5jdGlvbk5hbWUsIHJhbmdlSW5wdXQsIGRvbWFpbklucHV0LCBjb3JyZWN0QW5zd2VyKSB7XG4gICAgdmFyIGNvcnJlY3RBbnN3ZXJJdGVtcyA9IGNvcnJlY3RBbnN3ZXIuc3BsaXQoJ3wnKTtcbiAgICB2YXIgY29ycmVjdE5hbWUgPSBjb3JyZWN0QW5zd2VySXRlbXNbMF07XG4gICAgdmFyIGNvcnJlY3RSYW5nZSA9IGNvcnJlY3RBbnN3ZXJJdGVtc1sxXTtcbiAgICB2YXIgY29ycmVjdERvbWFpbiA9IGNvcnJlY3RBbnN3ZXJJdGVtcy5zbGljZSgyKTtcbiAgICB2YXIgZG9tYWluSW5wdXRJdGVtcyA9IGRvbWFpbklucHV0LnNwbGl0KCd8Jyk7XG5cbiAgICBpZiAoY29ycmVjdE5hbWUgIT09IGZ1bmN0aW9uTmFtZSkge1xuICAgICAgaWYgKGZ1bmN0aW9uTmFtZS50b0xvd2VyQ2FzZSgpID09PSBjb3JyZWN0TmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIHJldHVybiAnYmFkbmFtZV9jYXNlJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnYmFkbmFtZSc7XG4gICAgfVxuICAgIGlmIChjb3JyZWN0UmFuZ2UgIT09IHJhbmdlSW5wdXQpIHtcbiAgICAgIHJldHVybiAnYmFkcmFuZ2UnO1xuICAgIH1cbiAgICBpZiAoY29ycmVjdERvbWFpbi5sZW5ndGggIT09IGRvbWFpbklucHV0SXRlbXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJ2JhZGRvbWFpbnNpemUnO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcnJlY3REb21haW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjb3JyZWN0RG9tYWluVHlwZSA9IGNvcnJlY3REb21haW5baV07XG4gICAgICB2YXIgZG9tYWluVHlwZSA9IGRvbWFpbklucHV0SXRlbXNbaV07XG4gICAgICBpZiAoY29ycmVjdERvbWFpblR5cGUgIT09IGRvbWFpblR5cGUpIHtcbiAgICAgICAgcmV0dXJuICdiYWRkb21haW50eXBlJztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbn0pO1xuIl19

/* global React */

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
    _renderItem: function (ul, item) {
      var li = $("<li>", {text: item.label});
      var color = item.element.attr("data-color");
      makeColorSquareIcon(color).appendTo(li);
      return li.appendTo(ul);
    },
    styleCurrentValue: function () {
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
    return $("<div>", {class: "color-square-icon", style: bgColorStyle(color)});
  }

  /**
   * TODO(bjordan): Change usages to lodash _.curry once available in this context
   * @param fn function to be curried with arguments
   * @params [...] rest of args
   * @returns {Function} new function with the given arguments pre-set as the
   *                     defaults (curried)
   */
  var curry = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
      return fn.apply(this, args.concat(
        Array.prototype.slice.call(arguments, 0)));
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
    getName: function () {
      return this.state.name;
    },
    getRangeType: function () {
      return this.state.rangeType;
    },
    getDomainTypes: function () {
      return this.state.domainTypes;
    },
    nextUniqueID_: 0,
    grabUniqueID: function() {
      return (this.nextUniqueID_++);
    },
    getInitialState: function () {
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
    onNameChangeEvent: function (event) {
      this.setState({
        name: event.target.value
      });
    },
    onRangeChange: function (newType) {
      this.setState({
        rangeType: newType
      });
    },
    onDomainChange: function (domainKey, newType) {
      this.setState({
        domainTypes:
          this.state.domainTypes.map(function (object) {
            if (object.key === domainKey) {
              object.type = newType;
            }
            return object;
          })
      });
    },
    onDomainAdd: function () {
      var nextDomainID = this.grabUniqueID();
      this.setState({
        domainTypes:
          this.state.domainTypes.concat({
            key: 'domain' + nextDomainID,
            type: blockValueType.NUMBER,
            order: nextDomainID
          })
      });
    },
    onDomainRemove: function (domainKey) {
      this.setState({
        domainTypes:
          // TODO(bjordan): change to _.find once lodash available
          $.grep(this.state.domainTypes, function (object) {
            return object.key !== domainKey;
          })
      });
    },
    render: function () {
      return (
        <div>
          <div id='sectionTitle'>Name</div>
          <div>
            <input id='functionNameText' onChange={this.onNameChangeEvent} placeholder='Name' type='text' value={this.state.name}/>
          </div>
          <div id='sectionTitle'>Domain <span className='section-type-hint'>(the domain is the type of input)</span></div>
          <DomainsList
            domainTypes={this.state.domainTypes}
            onDomainChange={this.onDomainChange}
            onDomainAdd={this.onDomainAdd}
            onDomainRemove={this.onDomainRemove}/>
          <div id='sectionTitle' className="clear">Range <span className='section-type-hint'>(the range is the type of output)</span></div>
          <TypeChooser type={this.state.rangeType} onTypeChange={this.onRangeChange}/>
        </div>
      );
    }
  });

  var DomainsList = React.createClass({
    render: function () {
      var self = this;
      var sortedDomains = this.props.domainTypes.sort(function (a,b) {
        return a.order > b.order;
      });
      var typeChoiceNodes = sortedDomains.map(function (object) {
        return (
          <div className="clear" key={object.key}>
            <TypeChooser
              order={object.order}
              type={object.type}
              key={object.key}
              onTypeChange={curry(self.props.onDomainChange, object.key)}/>
            <button className="btn domain-x-button" onClick={curry(self.props.onDomainRemove, object.key)}>Remove</button>
          </div>
        );
      });
      return (
        <div className="domainsList">
          {typeChoiceNodes}
          <button className="btn domain-add-button" onClick={this.props.onDomainAdd}>Add Domain</button>
        </div>
      );
    }
  });

  var TypeChooser = React.createClass({
    selectmenuChange: function(selectChange) {
      this.props.onTypeChange(selectChange.target.value);
    },
    render: function () {
      var divStyle = {
        backgroundColor: typesToColors[this.props.type]
      };
      return (
        <select defaultValue={this.props.type} style={divStyle}>
          <option data-color={typesToColors[blockValueType.NUMBER]} value={blockValueType.NUMBER}>{blockValueType.NUMBER}</option>
          <option data-color={typesToColors[blockValueType.STRING]} value={blockValueType.STRING}>{blockValueType.STRING}</option>
          <option data-color={typesToColors[blockValueType.IMAGE]} value={blockValueType.IMAGE}>{blockValueType.IMAGE}</option>
          <option data-color={typesToColors[blockValueType.BOOLEAN]} value={blockValueType.BOOLEAN}>{blockValueType.BOOLEAN}</option>
        </select>
      );
    },
    componentDidMount: function () {
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu({
        select: function () {
          addSquareIconToButton(this);
        },
        change: this.selectmenuChange
      });
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu("styleCurrentValue");
    },
    componentWillUnmount: function () {
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu('destroy');
    }
  });

  var contractForm = ReactDOM.render(<ContractForm />, document.getElementById('contractForm'));

  /**
   * Creates a getResult function compatible with _dialog.html.haml's getResult call
   * Generating this rather than passing directly to be explicit about inputs for now
   * @param {ContractForm} contractForm
   * @param {Object} levelData
   * @returns {Function} getResult function
   */
  var generateGetResultFunction = function (contractForm, levelData) {
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

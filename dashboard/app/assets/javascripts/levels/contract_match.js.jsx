/** TODO(bjordan): Move this all into StudioApps */
$(window).load(function () {

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
  typesToColors[blockValueType.NONE] = "#999999";
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
      }
    },
    onNameChangeEvent: function (event) {
      this.setState({
        name: event.target.value
      });
    },
    onRangeChange: function (newType) {
      this.setState({
        rangeType: newType
      })
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
            type: blockValueType.NONE,
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
          <div id='sectionTitle'>Domain</div>
          <DomainsList
            domainTypes={this.state.domainTypes}
            onDomainChange={this.onDomainChange}
            onDomainAdd={this.onDomainAdd}
            onDomainRemove={this.onDomainRemove}/>
          <div id='sectionTitle' className="clear">Range</div>
          <TypeChooser type={this.state.rangeType} onTypeChange={this.onRangeChange}/>
        </div>
      )
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
          <div className="clear">
            <TypeChooser
              order={object.order}
              type={object.type}
              key={object.key}
              onTypeChange={curry(self.props.onDomainChange, object.key)}/>
            <button className="domain-x-button" onClick={curry(self.props.onDomainRemove, object.key)}>x</button>
          </div>
        );
      });
      return (
        <div className="domainsList">
          {typeChoiceNodes}
          <button className="domain-add-button" onClick={this.props.onDomainAdd}>Add</button>
        </div>
      )
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
        <select value={this.props.type} style={divStyle}>
          <option value={blockValueType.NUMBER}>{blockValueType.NUMBER}</option>
          <option value={blockValueType.STRING}>{blockValueType.STRING}</option>
          <option value={blockValueType.IMAGE}>{blockValueType.IMAGE}</option>
          <option value={blockValueType.BOOLEAN}>{blockValueType.BOOLEAN}</option>
        </select>
      )
    },
    componentDidMount: function() {
      $(React.findDOMNode(this)).selectmenu({
        change: this.selectmenuChange
      });
    },
    componentWillUnmount: function() {
      $(React.findDOMNode(this)).selectmenu('destroy');
    },
  });

  var contractForm = React.render(<ContractForm />, document.getElementById('contractForm'));

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

/**
 * Component Structure:
 *
 * - DomainsList
 *   - TypeChooser
 */
$(window).load(function () {

  var curry = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);

    return function() {
      return fn.apply(this, args.concat(
        Array.prototype.slice.call(arguments, 0)));
    };
  };

  /**
   * Enum of block types. Used for block and domain/range coloring
   * @enum {string}
   */
  var blockValueType = {
    NONE: 'None', // Typically as a connection/input check means "accepts any type"
    STRING: 'String',
    NUMBER: 'Number',
    IMAGE: 'Image',
    BOOLEAN: 'Boolean',
    FUNCTION: 'Function',
    COLOUR: 'Colour',
    ARRAY: 'Array'
  };

  var typesToColors = {};
  typesToColors[blockValueType.NONE] = "#999999";
  typesToColors[blockValueType.NUMBER] = "#00ccff";
  typesToColors[blockValueType.STRING] = "#009999";
  typesToColors[blockValueType.IMAGE] = "#9900cc";
  typesToColors[blockValueType.BOOLEAN] = "#336600";

  var ContractForm = React.createClass({
    maxDomainID: 0,
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
        rangeType: blockValueType.NONE,
        domainTypes: [
          {
            key: 'domain' + (this.maxDomainID++),
            type: blockValueType.NUMBER,
            order: 0
          }
        ]
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
          $.map(this.state.domainTypes, function (object) {
            if (object.key == domainKey) {
              object.type = newType;
            }
            return object;
          })
      });
    },
    onDomainAdd: function () {
      this.setState({
        domainTypes:
          this.state.domainTypes.concat({
            key: 'domain' + (this.maxDomainID++),
            type: blockValueType.NUMBER,
            order: Object.keys(this.state.domainTypes).length
          })
      });
    },
    onDomainRemove: function (domainKey) {
      this.setState({
        domainTypes:
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
          <div id='sectionTitle'>Range</div>
          <TypeChooser type={this.state.rangeType} onTypeChange={this.onRangeChange}/>
          <div id='sectionTitle'>Domain</div>
          <DomainsList
            domainTypes={this.state.domainTypes}
            onDomainChange={this.onDomainChange}
            onDomainAdd={this.onDomainAdd}
            onDomainRemove={this.onDomainRemove}/>
        </div>
      )
    }
  });

  var DomainsList = React.createClass({
    render: function() {
      var self = this;
      var typeChoiceNodes = $.map(this.props.domainTypes, function (object) {
        return (
          <div style={object.order == self.props.domainTypes.length - 1 ? {float: 'left'} : {}}>
            <TypeChooser type={object.type} key={object.key}
              onTypeChange={curry(self.props.onDomainChange, object.key)}/>
            <button onClick={curry(self.props.onDomainRemove, object.key)}>x</button>
          </div>
        );
      });
      return (
        <div className="domainsList">
          {typeChoiceNodes}
          <button onClick={this.props.onDomainAdd}>Add Domain</button>
        </div>
      )
    }
  });

  var TypeChooser = React.createClass({
    handleChange: function(event) {
      this.props.onTypeChange(event.target.value);
    },
    render: function () {
      var divStyle = {
        backgroundColor: typesToColors[this.props.type]
      };
      return (
        <select value={this.props.type} onChange={this.handleChange} style={divStyle}>
          <option value={blockValueType.NONE}>{blockValueType.NONE}</option>
          <option value={blockValueType.NUMBER}>{blockValueType.NUMBER}</option>
          <option value={blockValueType.STRING}he>{blockValueType.STRING}</option>
          <option value={blockValueType.IMAGE}>{blockValueType.IMAGE}</option>
          <option value={blockValueType.BOOLEAN}>{blockValueType.BOOLEAN}</option>
        </select>
      )
    }
  });

  React.render(
    React.createElement(ContractForm, null),
    document.getElementById('contractForm')
  );

  /**
   * Pre-react stuff below
   */

  $('#addButton').click(function () {
    var domainItemText = $('#domainItemText').val();
    var domainInput = $('#domainInput').val();
    var domainOptionSelected = $("#domainInput option:selected");
    $('#domainItemText').val('');
    var $div = $('<div/>').addClass('domainItem')
    $div.css("background-color", $(domainOptionSelected).data("color"));
    var $button = $('<button class="domain-x-button">x</button>');
    $div.append($button);
    $div.append($('<div/>').text(domainItemText + ':' + domainInput).addClass('domainItemText'));
    $button.click(function (event) {
      $(event.target.parentElement).remove();
    });
    $('#domainItems').append($div);
  });

  function getResult() {
    if (!window.levelData) {
      return;
    }

    var functionName = $('#functionNameText').val();
    var rangeInput = $('#rangeInput').val();
    var items = $('#domainItems').children().map(function (item, element) {
      return $(element).find('.domainItemText')[0].textContent;
    });

    var answers = window.levelData.answers.to_json;

    // Order domain inputs alphabetically sorted
    var domainInput = $.makeArray(items).slice().join('|');
    var response = functionName + '|' + rangeInput + '|' + domainInput;
    console.log('input="' + response + '"');

    var checkUserAnswer = checkAnswer.bind(null, functionName, rangeInput, domainInput);
    var resultPerAnswer = answers.map(checkUserAnswer);

    // If any succeeded, we succeed. Otherwise, grab the first error.
    var result = resultPerAnswer.some(function (answerResult) {
      return answerResult === '';
    });
    errorType = result ? null : resultPerAnswer[0];

    return {
      response: response,
      result: result,
      errorType: errorType
    };
  }

  /**
   * Given the user's submission and a correct answer, returns the error type,
   * or empty string if correct.
   */
  function checkAnswer(functionName, rangeInput, domainInput, correctAnswer) {
    var items = correctAnswer.split('|');
    var correctName = items[0];
    var correctRange = items[1];
    var correctDomain = items.slice(2);
    var domainInputItems = domainInput.split('|');

    if (correctName !== functionName) {
      return 'badname';
    }
    if (correctRange !== rangeInput) {
      return 'badrange';
    }
    if (correctDomain.length !== domainInputItems.length) {
      return 'baddomainsize';
    }
    for (var i = 0; i < correctDomain.length; i++) {
      var correctDomainName = correctDomain[i].split(':')[0];
      var correctDomainType = correctDomain[i].split(':')[1];
      var domainName = domainInputItems[i].split(':')[0];
      var domainType = domainInputItems[i].split(':')[1];
      if (correctDomainName !== domainName) {
        return 'baddomainname';
      }
      if (correctDomainType !== domainType) {
        return 'baddomaintype';
      }
    }
    return '';
  }

});

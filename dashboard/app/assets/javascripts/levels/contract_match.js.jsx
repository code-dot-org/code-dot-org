/**
 * Component Structure:
 *
 * - DomainsList
 *   - TypeChooser
 */

// What is className="" vs class=""?

$(window).load(function () {

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
  var ContractStore = (function ($) {

    var eventObject = $({});
    var saveEvent = "SAVE";
    var currentUniqueID = 0;

    function getUniqueID() {
      return "uid" + (currentUniqueID++).toString();
    }

    function ContractStore() {
      this.save = this.save.bind(this);
      this.data = {
        domainTypes: []
      };
      this.getData = this.getData.bind(this);
    }

    ContractStore.prototype.getData = function() {
      return this.data;
    };

    ContractStore.prototype.save = function() {
      eventObject.trigger(saveEvent, this.data);
    };

    ContractStore.prototype.addDomain = function(newDomainData) {
      newDomainData.key = getUniqueID();
      this.data.domainTypes.push(newDomainData);
    };

    ContractStore.prototype.getDomain = function(key) {
      return $.grep(this.data.domainTypes, function (domainData) {
        return domainData.key == key;
      })[0];
    };

    ContractStore.prototype.setDomainType = function(key, newType) {
      this.getDomain(key).type = newType;
      this.save();
    };

    ContractStore.prototype.subscribe = function(callback) {
      eventObject.on(saveEvent, callback);
      callback(saveEvent, this.data);
    };

    return ContractStore;
  })($);

  window.contractStore = new ContractStore();
  window.contractStore.addDomain({
    type: blockValueType.NUMBER
  });
  window.contractStore.save();

  var DomainsList = React.createClass({
    getInitialState: function() {
      return {
        contract: {
          domainTypes: []
        }
      }
    },
    componentDidMount: function() {
      var self = this;
      window.contractStore.subscribe(function (event, contract) {
        self.setState({
          contract: contract
        })
      });
    },
    handleAddDomain: function () {
      window.contractStore.addDomain({
        type: this.props.defaultType
      });
      window.contractStore.save();
    },
    render: function() {
      var nthChoice = 0;
      var typeChoiceNodes = window.contractStore.getData().domainTypes.map(function (domainChoice) {
        var isLastNode = nthChoice === window.contractStore.getData().domainTypes.length - 1;
        var divStyle = isLastNode ? {
          float: 'left'
        } : {};
        nthChoice++;
        // TODO(bjordan): why does key not get set as a prop when set as key={domainChoice.key}?
        //                & tried removing wrapping div as well
        return (
        <div style={divStyle}>
          <TypeChooser uniqueKey={domainChoice.key}/>
        </div>
        );
      }, this);
      return (
        <div className="domainsList">
          {typeChoiceNodes}
          <button onClick={this.handleAddDomain}>Add Domain</button>
        </div>
      )
    }
  });

  var TypeChooser = React.createClass({
    componentDidMount: function() {
      var self = this;
      window.contractStore.subscribe(function (event, contract) {
        self.setState({
          domain: window.contractStore.getDomain(self.props.uniqueKey)
        });
      });
    },
    handleChange: function(event) {
      window.contractStore.setDomainType(this.props.uniqueKey, event.target.value);
      window.contractStore.save();
    },
    render: function () {
      var divStyle = {
        backgroundColor: typesToColors[window.contractStore.getDomain(this.props.uniqueKey).type]
      };
      return (
        <select value={window.contractStore.getDomain(this.props.uniqueKey).type} onChange={this.handleChange} style={divStyle}>
          <option value={blockValueType.NONE}>{blockValueType.NONE}</option>
          <option value={blockValueType.NUMBER}>{blockValueType.NUMBER}</option>
          <option value={blockValueType.STRING}>{blockValueType.STRING}</option>
          <option value={blockValueType.IMAGE}>{blockValueType.IMAGE}</option>
          <option value={blockValueType.BOOLEAN}>{blockValueType.BOOLEAN}</option>
        </select>
      )
    }
  });

  React.render(
    React.createElement(DomainsList, {defaultType: blockValueType.NUMBER}),
    document.getElementById('domains')
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

  $('.contract select').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    $(this).css("background-color", $(optionSelected).data("color"));
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

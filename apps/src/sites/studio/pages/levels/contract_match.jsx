import $ from 'jquery';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { ContractMatchErrorDialog } from '@cdo/apps/lib/ui/LegacyDialogContents';
import i18n from '@cdo/locale';

$(window).load(function () {
  $.widget('custom.coloriconselectmenu', $.ui.selectmenu, {
    /**
     * Override the jQuery selectmenu to add a color square icon driven by the
     * data-color attribute on select elements.
     * @param ul
     * @param item
     * @returns {jQuery}
     * @private
     */
    _renderItem: function (ul, item) {
      const li = $("<li>", {text: item.label});
      const color = item.element.attr("data-color");
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
    return `background-color: ${color}`;
  }

  /**
   * Styles a button element to have a color square icon
   * @param {Element} selectElement
   */
  function addSquareIconToButton(selectElement) {
    const $element = $(selectElement);
    const selectMenuButton = $(`#${$element.attr('id')}-button .ui-selectmenu-text`);
    const selectedColor = $element.find('option:selected').attr('data-color');
    makeColorSquareIcon(selectedColor).prependTo(selectMenuButton);
  }

  /**
   * @param {string} color
   * @returns {jQuery}
   */
  function makeColorSquareIcon(color) {
    return $('<div>', {class: 'color-square-icon', style: bgColorStyle(color)});
  }

  /**
   * Enum of block types. Used for block and domain/range coloring
   * @enum {string}
   */
  const blockValueType = {
    NONE: 'None',
    NUMBER: 'Number',
    STRING: 'String',
    IMAGE: 'Image',
    BOOLEAN: 'Boolean'
  };

  const typesToColors = {
    [blockValueType.NUMBER]: '#00ccff',
    [blockValueType.STRING]: '#009999',
    [blockValueType.IMAGE]: '#9900cc',
    [blockValueType.BOOLEAN]: '#336600'
  };

  /**
   * Component Structure:
   *
   * - ContractForm
   *   - DomainsList
   *     - TypeChooser
   */
  class ContractForm extends React.Component {
    getName() {
      return this.state.name;
    }

    getRangeType() {
      return this.state.rangeType;
    }

    getDomainTypes() {
      return this.state.domainTypes;
    }

    nextUniqueID_ = 0;

    grabUniqueID() {
      return (this.nextUniqueID_++);
    }

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
    state = {
      name: '',
      rangeType: blockValueType.NUMBER,
      domainTypes: []
    };

    onNameChangeEvent = (event) => {
      this.setState({
        name: event.target.value
      });
    };

    onRangeChange = (newType) => {
      this.setState({
        rangeType: newType
      });
    };

    onDomainChange = (domainKey, newType) => {
      this.setState({
        domainTypes:
          this.state.domainTypes.map((object) => {
            if (object.key === domainKey) {
              object.type = newType;
            }
            return object;
          })
      });
    };

    onDomainAdd = () => {
      const nextDomainID = this.grabUniqueID();
      this.setState({
        domainTypes:
          this.state.domainTypes.concat({
            key: 'domain' + nextDomainID,
            type: blockValueType.NUMBER,
            order: nextDomainID
          })
      });
    };

    onDomainRemove = (domainKey) => {
      this.setState({
        domainTypes: this.state.domainTypes.filter(object => object.key !== domainKey)
      });
    };

    render() {
      return (
        <div>
          <div id="sectionTitle">Name</div>
          <div>
            <input id="functionNameText" onChange={this.onNameChangeEvent} placeholder="Name" type="text" value={this.state.name}/>
          </div>
          <div id="sectionTitle">Domain <span className="section-type-hint">(the domain is the type of input)</span></div>
          <DomainsList
            domainTypes={this.state.domainTypes}
            onDomainChange={this.onDomainChange}
            onDomainAdd={this.onDomainAdd}
            onDomainRemove={this.onDomainRemove}
          />
          <div id="sectionTitle" className="clear">Range <span className="section-type-hint">(the range is the type of output)</span></div>
          <TypeChooser type={this.state.rangeType} onTypeChange={this.onRangeChange}/>
        </div>
      );
    }
  }

  class DomainsList extends React.Component {
    static propTypes = {
      domainTypes: PropTypes.array.isRequired,
      onDomainAdd: PropTypes.func.isRequired,
      onDomainChange: PropTypes.func.isRequired,
      onDomainRemove: PropTypes.func.isRequired,
    };

    render() {
      const sortedDomains = this.props.domainTypes.sort((a,b) => (a.order > b.order));
      const typeChoiceNodes = sortedDomains.map(object => (
        <div className="clear" key={object.key}>
          <TypeChooser
            order={object.order}
            type={object.type}
            key={object.key}
            onTypeChange={(...args) => this.props.onDomainChange(object.key, ...args)}
          />
          <button
            className="btn domain-x-button"
            onClick={(...args) => this.props.onDomainRemove(object.key, ...args)}
          >
            Remove
          </button>
        </div>
      ));
      return (
        <div className="domainsList">
          {typeChoiceNodes}
          <button className="btn domain-add-button" onClick={this.props.onDomainAdd}>Add Domain</button>
        </div>
      );
    }
  }

  class TypeChooser extends React.Component {
    static propTypes = {
      onTypeChange: PropTypes.func.isRequired,
      type: PropTypes.string,
    };

    selectmenuChange = (selectChange) => {
      this.props.onTypeChange(selectChange.target.value);
    };

    componentDidMount() {
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu({
        select: function () {
          addSquareIconToButton(this);
        },
        change: this.selectmenuChange
      });
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu('styleCurrentValue');
    }

    componentWillUnmount() {
      $(ReactDOM.findDOMNode(this)).coloriconselectmenu('destroy');
    }

    render() {
      const divStyle = {
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
    }
  }

  const contractForm = ReactDOM.render(<ContractForm />, document.getElementById('contractForm'));

  /**
   * Creates a getResult function compatible with _dialog.html.haml's getResult call
   * Generating this rather than passing directly to be explicit about inputs for now
   * @param {ContractForm} contractForm
   * @param {Object} levelData
   * @returns {Function} getResult function
   */
  function generateGetResultFunction(contractForm, levelData) {
    return function () {
      /** @type {ContractForm} */
      const functionName = contractForm.getName().trim();
      const rangeType = contractForm.getRangeType();
      const domains = contractForm.getDomainTypes();

      const answers = levelData.answers;

      const formattedDomains = domains.map(domain => domain.type).join('|');

      const formattedResponse = functionName + '|' + rangeType + '|' + formattedDomains;

      const checkUserAnswer = checkAnswer.bind(null, functionName, rangeType, formattedDomains);
      const answerErrors = answers.map(checkUserAnswer);

      // If any succeeded, we succeed. Otherwise, grab the first error.
      const result = answerErrors.some(answerResult => answerResult === '');
      let errorDialog;
      if (!result) {
        errorDialog = <ContractMatchErrorDialog text={answerErrors[0]}/>;
      }

      return {
        response: formattedResponse,
        result: result,
        errorDialog
      };
    };
  }

  /**
   * Set the getResult used by _dialog.html.haml
   * @return {Object} response, result, error type
   */
  const getResult = generateGetResultFunction(contractForm, window.levelData);
  registerGetResult(getResult);

  /**
   * Given the user's submission and a correct answer, returns the error type,
   * or empty string if correct.
   * @param {string} functionName
   * @param {string} rangeInput
   * @param {string} domainInput
   * @param {string} correctAnswer
   * @returns {string} Text to display in error dialog
   */
  function checkAnswer(functionName, rangeInput, domainInput, correctAnswer) {
    const correctAnswerItems = correctAnswer.split('|');
    const correctName = correctAnswerItems[0];
    const correctRange = correctAnswerItems[1];
    const correctDomain = correctAnswerItems.slice(2);
    const domainInputItems = domainInput.split('|');

    if (correctName !== functionName) {
      if (functionName.toLowerCase() === correctName.toLowerCase()) {
        return i18n.contractMatchBadNameCase();
      }
      return i18n.contractMatchBadName();
    }
    if (correctRange !== rangeInput) {
      return i18n.contractMatchBadRange();
    }
    if (correctDomain.length !== domainInputItems.length) {
      return i18n.contractMatchBadDomainSize();
    }
    for (let i = 0; i < correctDomain.length; i++) {
      const correctDomainType = correctDomain[i];
      const domainType = domainInputItems[i];
      if (correctDomainType !== domainType) {
        return i18n.contractMatchBadDomainType();
      }
    }
    return '';
  }
});

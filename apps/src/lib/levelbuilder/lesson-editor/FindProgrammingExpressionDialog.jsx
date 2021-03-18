//import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import {connect} from 'react-redux';

import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import LessonEditorDialog from './LessonEditorDialog';

export default class FindProgrammingExpressionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired
    //programmingExpressions: PropTypes.arrayOf(programmingExpressionShape)
  };

  handleConfirm = e => {
    e.preventDefault(); // is this necessary?
    if (this.state && this.state.selectedProgrammingExpression) {
      this.props.handleConfirm(
        this.state.selectedProgrammingExpression.name,
        this.state.selectedProgrammingExpression.color,
        this.state.selectedProgrammingExpression.path
      );
    }
  };

  handleSearch = e => {
    this.doSearch(e.target.value);
  };

  handleSelectProgrammingExpression = e => {
    const selectedExpression = this.state.programmingExpressions.find(
      expression => expression.key === e.target.value
    );
    this.setState({
      selectedProgrammingExpression: selectedExpression
    });
  };

  doSearch(query) {
    //debounce(function() {
    fetch(
      '/programmingexpressionsearch?' +
        new URLSearchParams({
          limit: 8,
          //programmingEnvironmentId: undefined,
          query
        })
    )
      .then(response => response.json())
      .then(data => this.setState({programmingExpressions: data}));
    //}, 100);
  }

  render() {
    // TODO what should we actually do here?
    const defaultColor = '#0094ca';

    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>Add Programming Expression Documentation Link</h2>
        <input type="text" onChange={this.handleSearch} />
        {this.state && this.state.programmingExpressions && (
          <div>
            <hr />
            {this.state.programmingExpressions.map(programmingExpression => (
              <label className="radio">
                <input
                  type="radio"
                  name="programmingExpression"
                  value={programmingExpression.key}
                  onChange={this.handleSelectProgrammingExpression}
                />
                <SafeMarkdown
                  markdown={`[\`${
                    programmingExpression.name
                  }\`(${programmingExpression.color || defaultColor})](${
                    programmingExpression.path
                  })`}
                />
              </label>
            ))}
          </div>
        )}
        <DialogFooter rightAlign>
          <Button
            text={'Close and Add'}
            onClick={this.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </LessonEditorDialog>
    );
  }
}

//export const UnconnectedFindProgrammingExpressionDialog = FindProgrammingExpressionDialog;

//export default connect(state => ({
//  programmingExpressions: state.programmingExpressions
//}))(FindProgrammingExpressionDialog);

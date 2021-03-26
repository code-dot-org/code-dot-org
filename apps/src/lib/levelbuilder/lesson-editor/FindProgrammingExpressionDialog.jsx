import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import LessonEditorDialog from './LessonEditorDialog';
import {buildProgrammingExpressionMarkdown} from '@cdo/apps/template/lessonOverview/StyledCodeBlock';

const SearchForm = function(props) {
  return (
    <form className="form-search">
      <input
        type="text"
        className="input-large search-query"
        onChange={props.onSearch}
        placeholder="search by name"
      />
      <select
        className="input-small search-query"
        style={{marginLeft: 4}}
        onChange={props.onFilter}
      >
        <option value="">filter</option>
        {/* TODO: these should probably be sourced from somewhere, rather than hardcoded */}
        <option value="applab">Applab</option>
        <option value="gamelab">Gamelab</option>
        <option value="spritelab">Spritelab</option>
        <option value="weblab">Weblab</option>
      </select>
    </form>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired
};

const ProgrammingExpressionTable = function(props) {
  if (
    !props.programmingExpressions ||
    props.programmingExpressions.length === 0
  ) {
    return null;
  }

  // TODO implement pagination
  // As a temporary crutch until we have time to get pagination working, here's what we do:
  // Display a maximum of 10 results.
  // If we are given more than 10 results, inform the user that there
  // are more results and suggest that they narrow the search term.
  const tooManyResults = props.programmingExpressions.length > 10;
  const displayExpressions = props.programmingExpressions.slice(0, 10);

  return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          <th />
          <th>Expression</th>
          <th>Environment</th>
        </tr>
      </thead>
      <tbody>
        {displayExpressions.map(programmingExpression => (
          <tr key={programmingExpression.uniqueKey}>
            <td>
              <input
                type="radio"
                name="programmingExpression"
                value={programmingExpression.uniqueKey}
                onChange={props.handleSelect}
              />
            </td>
            <td>
              <SafeMarkdown
                markdown={buildProgrammingExpressionMarkdown(
                  programmingExpression
                )}
              />
            </td>
            <td>{programmingExpression.programmingEnvironmentName}</td>
          </tr>
        ))}
        {tooManyResults && (
          <tr>
            <td colSpan="3">
              <small>
                Too many results to display; if the block you're looking for
                isn't here, please narrow your search term
              </small>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

ProgrammingExpressionTable.propTypes = {
  programmingExpressions: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      name: PropTypes.string.isRequired,
      link: PropTypes.string,
      programmingEnvironmentName: PropTypes.string.isRequired,
      uniqueKey: PropTypes.string.isRequired
    })
  ),
  handleSelect: PropTypes.func.isRequired
};

export default class FindProgrammingExpressionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps, prevState) {
    const searchChanged =
      this.state.searchQuery !== prevState.searchQuery ||
      this.state.filteredProgrammingEnvironment !==
        prevState.filteredProgrammingEnvironment;
    if (searchChanged) {
      this.doSearch();
    }
  }

  handleConfirm = e => {
    e.preventDefault(); // is this necessary?
    if (this.state.selectedProgrammingExpression) {
      this.props.handleConfirm(this.state.selectedProgrammingExpression);
    }
  };

  handleSearch = e => {
    this.setState({
      searchQuery: e.target.value
    });
  };
  handleFilter = e => {
    this.setState({
      filteredProgrammingEnvironment: e.target.value
    });
  };

  handleSelectProgrammingExpression = e => {
    this.setState({
      selectedProgrammingExpression: this.state.programmingExpressions.find(
        expression => expression.uniqueKey === e.target.value
      )
    });
  };

  doSearch() {
    if (!this.state.searchQuery) {
      return;
    }

    const params = {
      // limit to one more than our display limit, so we can detect the 'too
      // many' case
      limit: 11,
      query: this.state.searchQuery
    };

    if (this.state.filteredProgrammingEnvironment) {
      params.programmingEnvironmentName = this.state.filteredProgrammingEnvironment;
    }

    fetch('/programmingexpressionsearch?' + new URLSearchParams(params))
      .then(response => response.json())
      .then(data => this.setState({programmingExpressions: data}));
  }

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>Add Programming Expression Documentation Link</h2>

        <SearchForm onSearch={this.handleSearch} onFilter={this.handleFilter} />

        <ProgrammingExpressionTable
          programmingExpressions={this.state.programmingExpressions}
          handleSelect={this.handleSelectProgrammingExpression}
        />

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

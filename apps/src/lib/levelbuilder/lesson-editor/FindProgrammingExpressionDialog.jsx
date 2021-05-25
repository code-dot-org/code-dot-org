import PropTypes from 'prop-types';
import React, {Component} from 'react';
import queryString from 'query-string';

import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';

import LessonEditorDialog from './LessonEditorDialog';
import {connect} from 'react-redux';
import {buildProgrammingExpressionMarkdown} from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

export const SearchForm = function(props) {
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
        {props.programmingEnvironments.map(environment => (
          <option value={environment.name} key={environment.id}>
            {environment.name}
          </option>
        ))}
      </select>
    </form>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  programmingEnvironments: PropTypes.array
};

export const ProgrammingExpressionTable = function(props) {
  if (
    !props.programmingExpressions ||
    props.programmingExpressions.length === 0
  ) {
    return null;
  }

  return (
    <table
      style={{marginBottom: 0}}
      className="table table-striped table-bordered"
    >
      <thead>
        <tr>
          <th />
          <th>Expression</th>
          <th>Environment</th>
        </tr>
      </thead>
      <tbody>
        {props.programmingExpressions.map(programmingExpression => (
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

export class FindProgrammingExpressionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    programmingEnvironments: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      numPages: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const searchChanged =
      this.state.searchQuery !== prevState.searchQuery ||
      this.state.filteredProgrammingEnvironment !==
        prevState.filteredProgrammingEnvironment ||
      this.state.currentPage !== prevState.currentPage;
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
      page: this.state.currentPage,
      query: this.state.searchQuery
    };

    if (this.state.filteredProgrammingEnvironment) {
      params.programmingEnvironmentName = this.state.filteredProgrammingEnvironment;
    }

    fetch('/programming_expressions/search?' + queryString.stringify(params))
      .then(response => response.json())
      .then(data => {
        this.setState({
          programmingExpressions: data.programmingExpressions,
          numPages: data.numPages
        });
      });
  }

  setCurrentPage = value => {
    this.setState({currentPage: value});
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>Add Programming Expression Documentation Link</h2>

        <SearchForm
          onSearch={this.handleSearch}
          onFilter={this.handleFilter}
          programmingEnvironments={this.props.programmingEnvironments}
        />

        <ProgrammingExpressionTable
          programmingExpressions={this.state.programmingExpressions}
          handleSelect={this.handleSelectProgrammingExpression}
        />

        <div style={{padding: 20}}>
          <PaginationWrapper
            totalPages={this.state.numPages}
            currentPage={this.state.currentPage}
            onChangePage={this.setCurrentPage}
          />
        </div>

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

export default connect(state => ({
  programmingEnvironments: state.programmingEnvironments
}))(FindProgrammingExpressionDialog);

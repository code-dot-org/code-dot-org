import React, { PropTypes, Component } from 'react';
import CensusInaccuracyReviewTable from './CensusInaccuracyReviewTable';
import CensusInaccuracyReviewDetails from './CensusInaccuracyReviewDetails';

export default class CensusInaccuracyReview extends Component {
  static propTypes = {
    authenticityToken: PropTypes.string,
    reportsToReview: PropTypes.array,
  };

  state = {
    toReview: undefined,
    resolvedReports: [],
  };

  scrollToHeader = () => {
    $('#report-header')[0].scrollIntoView();
  };

  handleStartReview = (reviewData) => {
    this.setState({toReview: reviewData});
    this.scrollToHeader();
  };

  handleReturnToMainList = () => {
    this.setState({toReview: undefined});
    this.scrollToHeader();
  };

  handleSuccessfulSubmittion = (reportId) => {
    this.setState((prevState) => ({
      resolvedReports: prevState.resolvedReports.concat([reportId]),
      toReview: undefined,
    }));
    this.scrollToHeader();
  };

  render() {
    let display;
    if (this.state.toReview) {
      display = (
        <CensusInaccuracyReviewDetails
          authenticityToken={this.props.authenticityToken}
          toReview={this.state.toReview}
          onReturnToMainList={this.handleReturnToMainList}
          onSuccessfulSubmission={this.handleSuccessfulSubmittion}
        />
      );
    } else {
      display = (
        <CensusInaccuracyReviewTable
          reportsToReview={this.props.reportsToReview}
          resolvedReports={this.state.resolvedReports}
          onStartReview={this.handleStartReview}
        />
      );
    }

    return (
      <div>
        <h1 id="report-header">
          Reported Access Report Inaccuracies
        </h1>
        {display}
      </div>
    );
  }
}

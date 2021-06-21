/**
 * Loader for table displaying workshop summaries based on a supplied query.
 * It requires exactly one child component that expects workshops in its props.
 * It runs the query specified in queryUrl and passes resulting workshop data to the child
 * component or displays "None" if no workshops are returned.
 * It optionally handles deleting workshops.
 */
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Spinner from '../../components/spinner';

export default class WorkshopTableLoader extends React.Component {
  static propTypes = {
    queryUrl: PropTypes.string.isRequired,
    queryParams: PropTypes.object,
    canDelete: PropTypes.bool, // When true, sets child prop onDelete to this.handleDelete
    children: PropTypes.element.isRequired, // Require exactly 1 child component.
    hideNoWorkshopsMessage: PropTypes.bool // Should we show "no workshops found" if no workshops are found?
  };

  state = {
    loading: true,
    workshops: null
  };

  UNSAFE_componentWillMount() {
    this.load = _.debounce(this.load, 200);
  }

  componentDidMount() {
    this.load();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props, nextProps)) {
      this.abortPendingRequests();
      this.load(nextProps);
    }
  }

  componentDidUpdate() {
    if (this.childElement) {
      // Save child element rendered height, to preserve during reload for a smoother transition.
      this.childHeight = ReactDOM.findDOMNode(this.childElement).offsetHeight;
    }
  }

  componentWillUnmount() {
    this.abortPendingRequests();
  }

  load = (props = this.props) => {
    this.setState({loading: true});
    const effectiveParams = _.omitBy(
      props.queryParams,
      value => value === null || value === undefined
    );
    const url = props.queryParams
      ? `${props.queryUrl}?${$.param(effectiveParams)}`
      : props.queryUrl;

    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        workshops: data
      });
    });
  };

  abortPendingRequests() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    if (this.deleteRequest) {
      this.deleteRequest.abort();
    }
  }

  handleDelete = workshopId => {
    this.deleteRequest = $.ajax({
      method: 'DELETE',
      url: '/api/v1/pd/workshops/' + workshopId
    }).done(() => {
      this.load();
    });
  };

  render() {
    if (this.state.loading) {
      return (
        // While reloading, preserve the height of the previous child component so the refresh is smoother.
        <div style={{height: this.childHeight}}>
          <Spinner />
        </div>
      );
    }

    if (!this.state.workshops.length && !this.state.workshops.total_count) {
      if (this.props.hideNoWorkshopsMessage) {
        return null;
      } else {
        return <p>No workshops found</p>;
      }
    }

    return React.cloneElement(this.props.children, {
      workshops: this.state.workshops,
      onDelete: this.props.canDelete ? this.handleDelete : null,
      ref: ref => {
        this.childElement = ref;
      }
    });
  }
}

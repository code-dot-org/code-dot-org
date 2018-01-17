/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 */

import React, {PropTypes} from 'react';
import Spinner from '../components/spinner';
import $ from 'jquery';
import DetailViewContents from './detail_view_contents';

export default class DetailView extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired,
    route: PropTypes.shape({
      viewType: PropTypes.oneOf(['teacher', 'facilitator']),
      course: PropTypes.oneOf(['csf', 'csd', 'csp'])
    })
  };

  state = {
    loading: true
  };

  componentWillMount() {
    this.load();
  }


  load = () => {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications/${this.props.params.applicationId}`
    }).done(data => {
      this.setState({
        data,
        loading: false
      });
    });
  }

  updateData = (newProps) => {
    this.setState({
      data: Object.assign({}, this.state.data, newProps)
    });
  };

  render() {
    if (this.state.loading) {
      return (<Spinner />);
    } else {
      return (
        (
          <DetailViewContents
            applicationId={this.props.params.applicationId}
            applicationData={this.state.data}
            viewType={this.props.route.viewType}
            course={this.props.route.course}
            reload={this.load}
          />
        )
      );
    }
  }
}

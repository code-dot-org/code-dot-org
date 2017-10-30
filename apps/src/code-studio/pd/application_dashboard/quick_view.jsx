/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csf_facilitators
 *        /csd_facilitators
 *        /csp_facilitators
 */
import React, {PropTypes} from 'react';
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import $ from 'jquery';

export default class QuickView extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null
  };

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications/quick_view?role=${this.props.route.path}`,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    return (
      <div>
        <h1>{this.props.route.title}</h1>
        <QuickViewTable path={this.props.route.path} data={this.state.applications}/>
      </div>
    );
  }
}

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
    this.load();
  }

  load = (props = this.props) => {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/pd/applications/quick_view/' + this.props.route.path,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Spinner/>
        </div>
      );
    } else {
      return (
        <div>
          <h1>{this.props.route.title}</h1>
          <QuickViewTable path={this.props.route.path} data={this.state.applications}/>
        </div>
      );
    }
  }
}

QuickView.childContextTypes = {
  router: PropTypes.object
};

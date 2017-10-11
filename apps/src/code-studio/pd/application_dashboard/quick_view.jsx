/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csd_facilitators
 *        /csp_facilitators
 */
import React, {PropTypes} from 'react';
import QuickViewTable from './quick_view_table';

export default class QuickView extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      title: PropTypes.string.isRequired
    })
  };

  render() {
    return (
      <div>
        <h1>{this.props.route.title}</h1>
        <QuickViewTable />
      </div>
    );
  }
}

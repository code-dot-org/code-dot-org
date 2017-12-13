import React, {PropTypes} from 'react';

export default class QuickViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
  }

  constructColumns() {
    return [
      {}, {}, {}, {}, {}, {}, {}
    ];
  }
}

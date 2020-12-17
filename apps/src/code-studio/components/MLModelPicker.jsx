import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';

const styles = {
  root: {
    margin: '0 0 0 5px'
  },
  divider: {
    borderColor: color.purple,
    margin: '5px 0'
  },
  warning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold'
  },
  item: {
    margin: 4,
    backgroundColor: color.default_blue,
    color: color.white,
    padding: 6,
    cursor: 'pointer'
  }
};

/**
 * A component for managing hosted sounds and the Sound Library.
 */
export default class MLModelPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    libraryOnly: PropTypes.bool
  };

  state = {
    data: null
  };

  componentDidMount() {
    $.ajax({
      url: '/api/v1/ml_models/names',
      method: 'GET'
    })
      .success(data => {
        console.log(data);
        this.setState({data});
      })
      .fail((jqXhr, status) => {
        console.log('error');
      });
  }

  onClick(id) {
    console.log('clicked', id);
    this.props.assetChosen(id);
  }

  render() {
    return (
      <div className="modal-content" style={styles.root}>
        {'ML Model'}
        <hr style={styles.divider} />
        {this.state.data &&
          this.state.data.map(model => {
            return (
              <div
                key={model.id}
                onClick={this.onClick.bind(this, model.id)}
                style={styles.item}
              >
                {model.name}
              </div>
            );
          })}
      </div>
    );
  }
}

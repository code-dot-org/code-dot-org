import PropTypes from "prop-types";
import React, { Component } from "react";
import CSVReaderWrapper from "./CSVReaderWrapper";
import { connect } from "react-redux";

class Parent extends Component {
  static propTypes = {
    data: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  toggleRawData = () => {
    this.setState({
      showRawData: !this.state.showRawData
    });
  };

  render() {
    return (
      <div>
        <CSVReaderWrapper />
        {this.props.data && <div>{JSON.stringify(this.props.data)}</div>}
      </div>
    );
  }
}

export default connect(state => ({ data: state.data }))(Parent);

/* A single tutorial shown in TutorialExplorer.  Displays a thumbnail image, name, and some extra information.
 */

import React from 'react';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import { getTutorialDetailString } from './util';

const styles = {
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tutorialSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  }
};

const Tutorial = React.createClass({
  propTypes: {
    item: shapes.tutorial.isRequired
  },

  getInitialState() {
    return {
      showingDetail: false
    };
  },

  tutorialClicked() {
    this.setState({showingDetail: true});
  },

  tutorialDetailClosed() {
    this.setState({showingDetail: false});
  },

  render() {
    return (
      <div>
        <TutorialDetail
          showing={this.state.showingDetail}
          item={this.props.item}
          closeClicked={this.tutorialDetailClosed}
        />
        <div
          className="col-33"
          style={{float: 'left', padding: 2}}
        >
          <div style={{padding: 5}}>
            <div
              style={{cursor: 'pointer'}}
              onClick={this.tutorialClicked}
            >
              <div style={{position: "relative", width: "100%", height: 0, paddingTop: "75%"}}>
                <img
                  src={this.props.item.image.replace("/images/", "/images/fill-480x360/").replace(".png", ".jpg")}
                  style={{position: "absolute", top: 0, left: 0, width: "100%"}}
                />
              </div>
              <div style={styles.tutorialName}>
                {this.props.item.name}
              </div>
              <div style={styles.tutorialSub}>
                {getTutorialDetailString(this.props.item)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default Tutorial;

import React, {Component} from 'react';
import color from '@cdo/apps/util/color';

// shape includes comment, commenter, project ID, project version, is from teacher?
export default class Comment extends Component {
  render() {
    return (
      <div>
        <div style={styles.commentHeaderContainer}>
          <span style={styles.name}>Ben Brooks</span>
          <div
            className="fa fa-ellipsis-h"
            style={styles.ellipsisMenu}
            onClick={() => console.log('hello!')}
          />
          <span style={styles.timestamp}>2020/01/01 at 9:30 AM</span>
        </div>
        <div style={styles.comment}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </div>
      </div>
    );
  }
}

const styles = {
  name: {
    fontWeight: 'bold'
  },
  ellipsisMenu: {
    float: 'right',
    fontSize: '24px',
    lineHeight: '18px',
    margin: '0 0 0 5px'
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lighter_gray
  },
  timestamp: {
    fontStyle: 'italic',
    float: 'right',
    margin: '0 5px'
  },
  commentHeaderContainer: {
    margin: '0 0 5px 0'
  }
};

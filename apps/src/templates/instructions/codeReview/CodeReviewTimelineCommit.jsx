import React from 'react';

const CodeReviewTimelineCommit = () => {
  return (
    <div>
      <div style={styles.header}>Commit</div>
      <div style={styles.date}>Date</div>
      <div>Message</div>
    </div>
  );
};

export default CodeReviewTimelineCommit;

const styles = {
  header: {
    fontWeight: 'bold'
  },
  date: {}
};

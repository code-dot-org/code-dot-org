import React from 'react';

const styles = {
  block: {
    width: 100,
    height: 100,
    backgroundColor: "lightblue",
    margin: 10,
    float: "left"
  }
};

const BlockLink = ({text, link, linkText}) => (
  <div style={styles.block}>
    <a href={link}>
      {text}
    </a>
  </div>
);

BlockLink.propTypes = {
  text: React.PropTypes.string.isRequired,
  link: React.PropTypes.string.isRequired,
  linkText: React.PropTypes.string.isRequired
};

export default BlockLink;

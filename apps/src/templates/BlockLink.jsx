import React from 'react';
import color from "../util/color";

const styles = {
  block: {
    width: 155,
    height: 150,
    backgroundColor: color.light_cyan,
    marginRight: 25,
    float: "left",
    padding: 20,
    borderRadius: 5,
    fontSize: 20,
    lineHeight: "24px"
  },
  link: {
    color: color.white
  }
};

const BlockLink = ({text, link, linkText}) => (
  <a style={styles.link} href={link}>
    <div style={styles.block}>
      {text}
    </div>
  </a>
);

BlockLink.propTypes = {
  text: React.PropTypes.string.isRequired,
  link: React.PropTypes.string.isRequired,
  linkText: React.PropTypes.string.isRequired
};

export default BlockLink;

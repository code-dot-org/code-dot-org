import PropTypes from "prop-types";
import { styles } from "../constants";

export default function ScrollableContent({ tinted, children }) {
  return (
    <div
      style={
        tinted ? styles.scrollableContentsTinted : styles.scrollableContents
      }
    >
      <div style={styles.scrollingContents}>{children}</div>
    </div>
  );
}

ScrollableContent.propTypes = {
  tinted: PropTypes.bool,
  children: PropTypes.node
};

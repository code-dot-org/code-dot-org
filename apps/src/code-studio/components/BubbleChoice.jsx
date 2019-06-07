import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

const THUMBNAIL_IMAGE_SIZE = 150;
const MARGIN = 10;

const styles = {
  h2: {
    color: color.charcoal,
    padding: `${MARGIN}px 0`
  },
  row: {
    display: 'flex',
    marginBottom: MARGIN
  },
  thumbnail: {
    width: THUMBNAIL_IMAGE_SIZE
  },
  placeholderThumbnail: {
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    backgroundColor: color.lighter_gray
  },
  column: {
    marginLeft: MARGIN * 2
  },
  title: {
    fontSize: 20,
    fontFamily: '"Gotham 5r"',
    color: color.teal
  }
};

export default class BubbleChoice extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      sublevels: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          title: PropTypes.string.isRequired,
          thumbnail_url: PropTypes.string
        })
      )
    })
  };

  render() {
    const {level} = this.props;

    return (
      <div>
        <h1>{level.title}</h1>
        <UnsafeRenderedMarkdown markdown={level.description} />
        <h2 style={styles.h2}>{i18n.chooseActivity()}</h2>
        {level.sublevels.map(sublevel => (
          <div key={sublevel.id} style={styles.row}>
            {/* Render a square-shaped placeholder if we don't have a thumbnail. */}
            {sublevel.thumbnail_url ? (
              <img src={sublevel.thumbnail_url} style={styles.thumbnail} />
            ) : (
              <div
                style={styles.placeholderThumbnail}
                className="placeholder"
              />
            )}
            <div style={styles.column}>
              <span style={styles.title}>{sublevel.title}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

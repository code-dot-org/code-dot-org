import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';

const THUMBNAIL_IMAGE_SIZE = 150;
const MARGIN = 10;

const styles = {
  row: {
    display: 'flex',
    marginBottom: MARGIN,
    backgroundColor: color.white,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2,
    width: 450,
    marginRight: 10
  },
  thumbnail: {
    minWidth: THUMBNAIL_IMAGE_SIZE,
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2
  },
  placeholderThumbnail: {
    minWidth: THUMBNAIL_IMAGE_SIZE,
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    backgroundColor: color.lighter_gray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2
  },
  icon: {
    fontSize: THUMBNAIL_IMAGE_SIZE - 50,
    color: color.white,
    opacity: 0.8
  },
  flagBubble: {
    fontSize: 30,
    height: 30,
    width: 30
  },
  column: {
    width: 280,
    marginLeft: MARGIN * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: 10
  },
  bubbleAndTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  title: {
    minHeight: 30,
    fontSize: 20,
    fontFamily: '"Gotham 5r"',
    color: color.teal,
    marginLeft: 10,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    hyphens: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  description: {
    marginTop: MARGIN
  }
};

export default class SublevelCard extends React.Component {
  static propTypes = {
    isLessonExtra: PropTypes.bool,
    sublevel: PropTypes.shape({
      id: PropTypes.number.isRequired,
      display_name: PropTypes.string.isRequired,
      description: PropTypes.string,
      thumbnail_url: PropTypes.string,
      url: PropTypes.string.isRequired,
      position: PropTypes.number,
      letter: PropTypes.string,
      perfect: PropTypes.bool
    })
  };

  /* Determine if we should use the normal progress
   * bubble or the lesson extras flag.
   */
  renderBubble = () => {
    const {isLessonExtra, sublevel} = this.props;

    if (isLessonExtra) {
      return (
        <div style={styles.flagBubble}>
          <LessonExtrasProgressBubble
            stageExtrasUrl={sublevel.url}
            perfect={sublevel.perfect}
          />
        </div>
      );
    }

    return (
      <ProgressBubble level={sublevel} disabled={false} hideToolTips={true} />
    );
  };

  render() {
    const {sublevel} = this.props;

    return (
      <div
        key={sublevel.id}
        style={styles.row}
        className="uitest-bubble-choice"
      >
        {/* Render a square-shaped placeholder if we don't have a thumbnail. */}
        <a href={sublevel.url + location.search}>
          {sublevel.thumbnail_url ? (
            <img src={sublevel.thumbnail_url} style={styles.thumbnail} />
          ) : (
            <div style={styles.placeholderThumbnail} className="placeholder">
              <FontAwesome
                icon={getIconForLevel(sublevel)}
                style={styles.icon}
                key={sublevel.id}
              />
            </div>
          )}
        </a>
        <div style={styles.column}>
          <div style={styles.bubbleAndTitle}>
            {this.renderBubble()}
            <a
              href={sublevel.url + location.search}
              style={styles.title}
              className="sublevel-card-title-uitest"
            >
              {sublevel.display_name}
            </a>
          </div>
          {sublevel.description && (
            <div
              style={styles.description}
              className="sublevel-card-description-uitest"
            >
              {sublevel.description}
            </div>
          )}
        </div>
      </div>
    );
  }
}

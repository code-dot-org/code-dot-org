import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE
  },
  placeholderThumbnail: {
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    backgroundColor: color.lighter_gray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: THUMBNAIL_IMAGE_SIZE - 50,
    color: color.white,
    opacity: 0.8
  },
  column: {
    marginLeft: MARGIN * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  bubbleAndTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontFamily: '"Gotham 5r"',
    color: color.teal,
    marginLeft: 10
  },
  description: {
    marginTop: MARGIN
  },
  btn: {
    color: color.white,
    backgroundColor: color.lighter_gray,
    borderColor: color.lighter_gray
  },
  btnOrange: {
    backgroundColor: color.orange,
    borderColor: color.orange
  }
};

export default class BubbleChoice extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      previous_level_url: PropTypes.string,
      next_level_url: PropTypes.string,
      script_url: PropTypes.string,
      sublevels: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          display_name: PropTypes.string.isRequired,
          description: PropTypes.string,
          thumbnail_url: PropTypes.string,
          url: PropTypes.string.isRequired,
          position: PropTypes.number,
          letter: PropTypes.string,
          perfect: PropTypes.bool
        })
      )
    })
  };

  goToUrl = url => {
    navigateToHref(url + location.search);
  };

  renderButtons = () => {
    const {level} = this.props;
    const backButtonUrl = level.previous_level_url || level.script_url;
    const continueButtonUrl = level.next_level_url || level.script_url;

    return (
      <div>
        {backButtonUrl && (
          <button
            type="button"
            onClick={() => this.goToUrl(backButtonUrl)}
            style={styles.btn}
          >
            {i18n.back()}
          </button>
        )}
        {continueButtonUrl && (
          <button
            type="button"
            onClick={() => this.goToUrl(continueButtonUrl)}
            style={{...styles.btn, ...styles.btnOrange}}
          >
            {level.next_level_url ? i18n.continue() : i18n.finish()}
          </button>
        )}
      </div>
    );
  };

  render() {
    const {level} = this.props;

    return (
      <div>
        <h1>{level.display_name}</h1>
        <SafeMarkdown markdown={level.description} />
        {this.renderButtons()}
        <h2 style={styles.h2}>{i18n.chooseActivity()}</h2>
        {level.sublevels.map(sublevel => (
          <div
            key={sublevel.id}
            style={styles.row}
            className="uitest-bubble-choice"
          >
            {/* Render a square-shaped placeholder if we don't have a thumbnail. */}
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
            <div style={styles.column}>
              <div style={styles.bubbleAndTitle}>
                <ProgressBubble level={sublevel} disabled={false} />
                <a href={sublevel.url + location.search} style={styles.title}>
                  {sublevel.display_name}
                </a>
              </div>
              {sublevel.description && (
                <div style={styles.description}>{sublevel.description}</div>
              )}
            </div>
          </div>
        ))}
        {this.renderButtons()}
      </div>
    );
  }
}

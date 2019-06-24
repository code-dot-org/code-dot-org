import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';
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
  },
  description: {
    marginTop: MARGIN
  },
  btnContainer: {
    float: 'right'
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
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      previous_level_url: PropTypes.string,
      next_level_url: PropTypes.string,
      script_url: PropTypes.string,
      sublevels: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          title: PropTypes.string.isRequired,
          description: PropTypes.string,
          thumbnail_url: PropTypes.string,
          url: PropTypes.string.isRequired
        })
      )
    })
  };

  goToUrl = url => {
    navigateToHref(url + location.search);
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
              <a href={sublevel.url + location.search} style={styles.title}>
                {sublevel.title}
              </a>
              {sublevel.description && (
                <div style={styles.description}>{sublevel.description}</div>
              )}
            </div>
          </div>
        ))}
        <div style={styles.btnContainer}>
          <button
            type="button"
            onClick={() =>
              this.goToUrl(level.previous_level_url || level.script_url)
            }
            style={styles.btn}
          >
            {i18n.back()}
          </button>
          <button
            type="button"
            onClick={() =>
              this.goToUrl(level.next_level_url || level.script_url)
            }
            style={{...styles.btn, ...styles.btnOrange}}
          >
            {level.next_level_url ? i18n.continue() : i18n.finish()}
          </button>
        </div>
      </div>
    );
  }
}

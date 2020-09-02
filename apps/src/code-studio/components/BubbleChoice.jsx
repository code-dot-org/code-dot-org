import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SublevelCard from './SublevelCard';

const MARGIN = 10;

const styles = {
  h2: {
    color: color.charcoal,
    padding: `${MARGIN}px 0`
  },
  btn: {
    color: color.white,
    backgroundColor: color.lighter_gray,
    borderColor: color.lighter_gray
  },
  btnOrange: {
    backgroundColor: color.orange,
    borderColor: color.orange
  },
  cards: {
    display: 'flex',
    flexWrap: 'wrap'
  }
};

export default class BubbleChoice extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      previous_level_url: PropTypes.string,
      redirect_url: PropTypes.string,
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
    const finishButtonUrl = level.redirect_url || level.script_url;

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
        {finishButtonUrl && (
          <button
            type="button"
            onClick={() => this.goToUrl(finishButtonUrl)}
            style={{...styles.btn, ...styles.btnOrange}}
          >
            {i18n.finish()}
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
        <div style={styles.cards}>
          {level.sublevels.map(sublevel => (
            <SublevelCard
              isLessonExtra={false}
              sublevel={sublevel}
              key={sublevel.id}
            />
          ))}
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}

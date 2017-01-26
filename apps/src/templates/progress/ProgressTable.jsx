import React, { PropTypes } from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import { connect } from 'react-redux';
import { stageNames, statusByStage, urlsByStage } from '@cdo/apps/code-studio/progressRedux';

const lighterBorder = '#D8D8D8';

const styles = {
  table: {
    backgroundColor: '#F6F6F6'
    // TODO - get borderRadius working correctly (mgith be able to have all of
    // our existing borders become less complicated?)
  },
  headerRow: {
    borderTopWidth: 1,
    borderTopColor: color.border_gray,
    borderTopStyle: 'solid',
    backgroundColor: '#ECECEC',
  },
  bottomRow: {
    borderBottomWidth: 1,
    // TODO - should this be primary or secondary?
    borderBottomColor: lighterBorder,
    borderBottomStyle: 'solid',
  },
  lightRow: {
    backgroundColor: '#FCFCFC'
  },
  darkRow: {
    // TODO - this wasnt provided to me
    backgroundColor: '#F4F4F4'
  },
  col1: {
    borderLeftWidth: 1,
    borderLeftColor: color.border_gray,
    borderLeftStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: lighterBorder,
    borderRightStyle: 'solid',
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    lineHeight: '52px',
    color: '#5B6770',
    letterSpacing: -0.11,
    whiteSpace: 'nowrap',
    paddingLeft: 20,
    paddingRight: 20
  },
  col2: {
    width: '100%',
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: lighterBorder,
    paddingLeft: 20,
    paddingRight: 20
  },
  colText: {
    color: '#5B6770',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

const ProgressTable = React.createClass({
  propTypes: {
    stageNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    statusByStage: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.string)
    ).isRequired,
    urlsByStage: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.string)
    ).isRequired
  },
  componentDidMount() {
    // TODO - dont ship this way
    const padding = 80;
    $(".container.main").css({
      width: 'initial',
      maxWidth: 940 + 2 * padding,
      paddingLeft: padding,
      paddingRight:padding
    });
  },

  render() {
    const { stageNames, statusByStage, urlsByStage } = this.props;
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>{i18n.stageName()}</div>
            </td>
            <td style={styles.col2}>
              <div style={styles.colText}>{i18n.yourProgress()}</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {
            stageNames.map((stageName, index) => (
              <tr
                key={index}
                style={{
                  ...((index % 2 === 0) && styles.lightRow),
                  ...((index % 2 === 1) && styles.darkRow),
                  ...((index + 1 === stageNames.length) && styles.bottomRow)
                }}
              >
                <td style={styles.col1}>
                  <div style={styles.colText}>
                    {`${index + 1}. ${stageName}`}
                  </div>
                </td>
                <td style={styles.col2}>
                  <ProgressBubbleSet
                    startingNumber={1}
                    statuses={statusByStage[index]}
                    urls={urlsByStage[index]}
                  />
                </td>
              </tr>
            ))
          }
        </tbody>

      </table>
    );
  }
});

export default connect(state => ({
  stageNames: stageNames(state.progress),
  statusByStage: statusByStage(state.progress),
  urlsByStage: urlsByStage(state.progress)
}))(ProgressTable);

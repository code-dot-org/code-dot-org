import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from './SafeMarkdown';

export const styles = {
  linkStyle: {
    color: 'rgb(102, 102, 102)',
    display: 'block',
    padding: '5px',
    fontSize: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  listStyle: {
    margin: '0px',
    padding: '0px',
    listStyleType: 'none'
  }
};

export default class LocalMapControlList extends React.Component {
  static propTypes = {
    selected: PropTypes.number.isRequired,
    lng: PropTypes.string.isRequired,
    lat: PropTypes.string.isRequired,
    featureList: PropTypes.arrayOf(PropTypes.object).isRequired,
    flyToLocation: PropTypes.func.isRequired,
    createPopUp: PropTypes.func.isRequired,
    resetMap: PropTypes.func.isRequired,
    updateActive: PropTypes.func.isRequired
  };

  render() {
    const {
      featureList,
      lng,
      lat,
      flyToLocation,
      createPopUp,
      resetMap,
      selected,
      updateActive
    } = this.props;
    var allFeatures = [];
    featureList.forEach((feature, index) => {
      allFeatures.push(
        <LocalMapControlItem
          index={index + 1}
          key={`control-${index + 1}`}
          selected={index + 1 === selected}
          onSelect={() => {
            flyToLocation(feature);
            createPopUp(feature);
            updateActive(featureList, lng, lat, index + 1);
          }}
          title={feature.properties.title}
        />
      );
    });
    return (
      <ul className="ullist controls" style={styles.listStyle}>
        <LocalMapControlItem
          index={0}
          key="control-0"
          selected={selected === 0}
          onSelect={() => {
            updateActive(featureList, lng, lat, 0);
            resetMap();
          }}
          title="View All"
        />
        {allFeatures}
      </ul>
    );
  }
}

class LocalMapControlItem extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  };
  render() {
    const {index, selected, onSelect, title} = this.props;
    return (
      <li id={`control-${index}`} className={selected ? 'active' : ''}>
        <a style={styles.linkStyle} onClick={onSelect}>
          <span>
            <SafeMarkdown markdown={title} />
          </span>
        </a>
      </li>
    );
  }
}

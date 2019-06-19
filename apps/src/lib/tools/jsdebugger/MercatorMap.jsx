// import PropTypes from 'prop-types';
import React from 'react';
// import {connect} from 'react-redux';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';

const RADIUS = 20;
const WIDTH = 400;
const HEIGHT = 400;

class MercatorMap extends React.Component {
  // static propTypes = {
  //
  // };
  state = {
    mercator: ''
  };

  async componentDidMount() {
    let value = await this.mercator();
    this.setState({
      mercator: value
    });
  }

  projection() {
    return geoMercator()
      .scale(RADIUS)
      .translate([WIDTH / 2, HEIGHT / 2]);
  }

  async mercator() {
    let displayWorldMap = async function() {
      const worldMapUrl = 'https://unpkg.com/world-atlas@1/world/110m.json';
      let response = await fetch(worldMapUrl);

      let worldData = await response.json();

      return feature(worldData, worldData.objects.countries).features;
    };

    let worldMap = await displayWorldMap();

    // TODO: consult with product/design about color scheme
    return (
      <svg width={WIDTH} height={HEIGHT}>
        <g className="countries">
          {worldMap.map((d, i) => (
            <path
              key={`path-${i}`}
              d={geoPath().projection(this.projection())(d)}
              className="country"
              fill={'green'}
              stroke="#FFFFFF"
              strokeWidth={0.5}
            />
          ))}
        </g>
      </svg>
    );
  }

  render() {
    return <div>{this.state.mercator}</div>;
  }
}

export default MercatorMap;

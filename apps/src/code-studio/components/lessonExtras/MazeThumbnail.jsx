import {utils, MazeMap, drawMap} from '@code-dot-org/maze';
import PropTypes from 'prop-types';
import React from 'react';

import assetUrl from '@cdo/apps/code-studio/assetUrl';
import skins from '@cdo/apps/maze/skins';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

import color from '../../../util/color';

const getSubtypeForSkin = utils.getSubtypeForSkin;

// Size of each edge of (unscaled) square thumbnail, in pixels.
const SIZE = 400;

export default class MazeThumbnail extends React.Component {
  static propTypes = {
    size: PropTypes.number,
    mazeSummary: PropTypes.shape({
      level: PropTypes.shape({
        startDirection: PropTypes.number.isRequired,
        flowerType: PropTypes.string,
      }).isRequired,
      map: PropTypes.array,
      serializedMaze: PropTypes.array,
      skin: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    scale: 1,
  };

  componentDidMount() {
    const skin = skins.load(assetUrl, this.props.mazeSummary.skin);
    const Maze = {};
    const Type = getSubtypeForSkin(this.props.mazeSummary.skin);
    const subtype = new Type(Maze, {
      skin,
      level: this.props.mazeSummary.level,
    });

    Maze.map = this.props.mazeSummary.serializedMaze
      ? MazeMap.deserialize(
          this.props.mazeSummary.serializedMaze,
          subtype.getCellClass()
        )
      : MazeMap.parseFromOldValues(
          this.props.mazeSummary.map,
          null,
          subtype.getCellClass()
        );
    subtype.initStartFinish();
    subtype.createDrawer(this.svg);
    subtype.initWallMap();

    drawMap(this.svg, skin, subtype, Maze.map);
  }

  render() {
    const scale = (this.props.size || SIZE) / SIZE;
    return (
      <div
        style={{
          width: this.props.size,
          height: this.props.size,
          display: 'inline-block',
          overflow: 'hidden',
          border: `1px solid ${color.lighter_gray}`,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            ...styles.wrapper,
          }}
        >
          <ProtectedStatefulDiv>
            <svg
              width={SIZE}
              height={SIZE}
              ref={c => {
                this.svg = c;
              }}
            />
          </ProtectedStatefulDiv>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    display: 'inline-block',
    position: 'relative',
    transformOrigin: document.dir === 'rtl' ? `${SIZE}px 0` : '0 0',
  },
  overlay: {
    width: SIZE,
    height: SIZE,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    textAlign: 'center',
  },
  check: {
    fontSize: 350,
    lineHeight: '400px',
    color: '#fff',
    opacity: 0.8,
  },
};

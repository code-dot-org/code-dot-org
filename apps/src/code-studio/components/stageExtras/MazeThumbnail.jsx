import React, {PropTypes} from 'react';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import skins from "@cdo/apps/maze/skins";
import {getSubtypeForSkin} from '@cdo/apps/maze/mazeUtils';
import MazeMap from '@cdo/apps/maze/mazeMap';
import drawMap from '@cdo/apps/maze/drawMap';
import assetUrl from '@cdo/apps/code-studio/assetUrl';

export default class MazeThumbnail extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      startDirection: PropTypes.number.isRequired,
      flowerType: PropTypes.string,
    }).isRequired,
    map: PropTypes.array,
    serializedMaze: PropTypes.array,
    skin: PropTypes.string.isRequired,
  };

  static defaultProps = {
    scale: 1
  };

  componentDidMount() {
    const skin = skins.load(assetUrl, this.props.skin);
    const Maze = {};
    const Type = getSubtypeForSkin(this.props.skin);
    const subtype = new Type(Maze, null, {
      skin,
      level: this.props.level,
    });

    Maze.map = this.props.serializedMaze ?
      MazeMap.deserialize(this.props.serializedMaze, subtype.getCellClass()) :
      MazeMap.parseFromOldValues(this.props.map, null, subtype.getCellClass());
    subtype.initStartFinish();
    subtype.createDrawer(this.svg);
    subtype.initWallMap();

    drawMap(this.svg, skin, subtype, Maze.map);
  }

  render() {
    return (
      <ProtectedStatefulDiv>
        <svg
          width="400"
          height="400"
          ref={c => {this.svg = c;}}
        />
      </ProtectedStatefulDiv>
    );
  }
}

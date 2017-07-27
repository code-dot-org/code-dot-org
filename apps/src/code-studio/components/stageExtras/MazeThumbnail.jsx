import React from 'react';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import skins from "@cdo/apps/maze/skins";
import {getSubtypeForSkin} from '@cdo/apps/maze/mazeUtils';
import MazeMap from '@cdo/apps/maze/mazeMap';
import drawMap from '@cdo/apps/maze/drawMap';
import assetUrl from '@cdo/apps/code-studio/assetUrl';

export default class MazeThumbnail extends React.Component {
  static propTypes = {
    map: React.PropTypes.array.isRequired,
    skin: React.PropTypes.string.isRequired,
    startDirection: React.PropTypes.number.isRequired,
  }

  static defaultProps = {
    scale: 1
  }

  componentDidMount() {
    const skin = skins.load(assetUrl, this.props.skin);
    const Maze = {};
    const Type = getSubtypeForSkin(this.props.skin);
    const subtype = new Type(Maze, null, {
      skin: skin,
      level: {startDirection: this.props.startDirection}
    });

    Maze.map = MazeMap.parseFromOldValues(this.props.map, null, subtype.getCellClass());
    subtype.initStartFinish();
    subtype.createDrawer();
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

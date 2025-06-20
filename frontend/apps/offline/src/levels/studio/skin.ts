export interface WallMap {
  srcUrl: string;
}

export interface WallMaps {
  [key: string]: WallMap;
}

export interface CollisionRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ObstacleZone {
  [key: string]: CollisionRect[];
}

export interface ObstacleZones {
  [key: string]: ObstacleZone;
}

export interface Skin {
  avatarList: string[];
  customObstacleZones?: ObstacleZones;
  wallMaps?: WallMaps;
}

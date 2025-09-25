import styles from './adoptionMap.module.scss';

export const MAP_POINT_NO_DATA_COLOR = '#FFFFFF';
export const MAP_POINT_HAS_CS_COLOR = '#0093A4';
export const MAP_POINT_NO_CS_COLOR = '#8C52BA';
export const MAP_POINT_STROKE_COLOR = '#000000';
export const MAP_POINT_STROKE_WIDTH = 0.5;

export enum MAP_POINT_TYPES {
  HAS_CS = 'HAS_CS',
  NO_CS = 'NO_CS',
  NO_DATA = 'NO_DATA',
}

const MAP_POINT_TYPE_TO_COLOR_MAP = {
  [MAP_POINT_TYPES.HAS_CS]: MAP_POINT_HAS_CS_COLOR,
  [MAP_POINT_TYPES.NO_CS]: MAP_POINT_NO_CS_COLOR,
  [MAP_POINT_TYPES.NO_DATA]: MAP_POINT_NO_DATA_COLOR,
};

export interface AdoptionMapPointProps {
  type: MAP_POINT_TYPES;
}

const AdoptionMapPoint: React.FC<AdoptionMapPointProps> = ({
  type = MAP_POINT_TYPES.NO_DATA,
}) => (
  <span
    role="presentation"
    className={styles.adoptionMapPoint}
    style={{
      backgroundColor: MAP_POINT_TYPE_TO_COLOR_MAP[type],
      borderWidth: MAP_POINT_STROKE_WIDTH,
      borderColor: MAP_POINT_STROKE_COLOR,
    }}
  />
);

export default AdoptionMapPoint;

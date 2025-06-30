import {render, screen} from '@testing-library/react';

import AdoptionMapPoint, {
  AdoptionMapPointProps,
  MAP_POINT_TYPES,
  MAP_POINT_HAS_CS_COLOR,
  MAP_POINT_NO_CS_COLOR,
  MAP_POINT_NO_DATA_COLOR,
  MAP_POINT_STROKE_COLOR,
  MAP_POINT_STROKE_WIDTH,
} from '../AdoptionMapPoint';

describe('AdoptionMapPoint', () => {
  const renderComponent = (props: AdoptionMapPointProps) =>
    render(<AdoptionMapPoint {...props} />);

  [
    {type: MAP_POINT_TYPES.HAS_CS, expectedColor: MAP_POINT_HAS_CS_COLOR},
    {type: MAP_POINT_TYPES.NO_CS, expectedColor: MAP_POINT_NO_CS_COLOR},
    {type: MAP_POINT_TYPES.NO_DATA, expectedColor: MAP_POINT_NO_DATA_COLOR},
  ].forEach(({type, expectedColor}) => {
    it(`applies correct style for ${type} type`, () => {
      renderComponent({type});

      const point = screen.getByRole('presentation');

      expect(point).toHaveStyle({
        backgroundColor: expectedColor,
        borderWidth: MAP_POINT_STROKE_WIDTH,
        borderColor: MAP_POINT_STROKE_COLOR,
      });
    });
  });
});

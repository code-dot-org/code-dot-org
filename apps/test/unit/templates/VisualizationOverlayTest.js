import {expect} from '../../util/configuredChai';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { VisualizationOverlay } from '@cdo/apps/templates/VisualizationOverlay';
import CrosshairOverlay from '@cdo/apps/templates/CrosshairOverlay';

describe('VisualizationOverlay', function () {
  const TEST_APP_WIDTH = 300, TEST_APP_HEIGHT = 200;

  it('renders no children if no children are given', function () {
    expect(shallowRender(
        <VisualizationOverlay
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            areOverlaysVisible={true}
        />
    )).to.deep.equal(svgWithChildren(undefined));
  });

  it('renders no children if areOverlaysVisible is false', function () {
    expect(shallowRender(
        <VisualizationOverlay
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            areOverlaysVisible={false}
        >
          <CrosshairOverlay />
          <CrosshairOverlay />
        </VisualizationOverlay>
    )).to.deep.equal(svgWithChildren(false));
  });

  function shallowRender(component) {
    let renderer = ReactTestUtils.createRenderer();
    renderer.render(component);
    return renderer.getRenderOutput();
  }

  function svgWithChildren(children) {
    return (
        <svg
            ref="root"
            id="visualizationOverlay"
            version="1.1"
            baseProfile="full"
            xmlns="http://www.w3.org/2000/svg"
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            viewBox={`0 0 ${TEST_APP_WIDTH} ${TEST_APP_HEIGHT}`}
            pointerEvents="none"
            children={children}
        />
    );
  }

  it('otherwise renders each child with size and mouse position provided', function () {
    expect(shallowRender(
        <VisualizationOverlay
            width={TEST_APP_WIDTH}
            height={TEST_APP_HEIGHT}
            areOverlaysVisible={true}
        >
          <CrosshairOverlay />
          <CrosshairOverlay />
        </VisualizationOverlay>
    )).to.deep.equal(svgWithChildren([
      <CrosshairOverlay
          key="0/.0"
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={-1}
          mouseY={-1}
      />,
      <CrosshairOverlay
          key="1/.1"
          width={TEST_APP_WIDTH}
          height={TEST_APP_HEIGHT}
          mouseX={-1}
          mouseY={-1}
      />
    ]));
  });
});

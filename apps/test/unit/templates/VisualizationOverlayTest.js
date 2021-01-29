import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {VisualizationOverlay} from '@cdo/apps/templates/VisualizationOverlay';
import {mount} from 'enzyme';
import CrosshairOverlay from '@cdo/apps/templates/CrosshairOverlay';

describe('VisualizationOverlay', () => {
  const TEST_APP_WIDTH = 300,
    TEST_APP_HEIGHT = 200;

  it('renders no children if no children are given', () => {
    const visualizationOverlay = mount(
      <VisualizationOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        areOverlaysVisible={true}
        areRunStateOverlaysVisible={false}
      />
    );

    verifySvg(visualizationOverlay);
    const svg = visualizationOverlay.find('svg').first();
    expect(svg.props().children).to.equal(undefined);
  });

  it('renders no children if areOverlaysVisible is false', () => {
    const visualizationOverlay = mount(
      <VisualizationOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        areOverlaysVisible={false}
        areRunStateOverlaysVisible={false}
      >
        <CrosshairOverlay />
        <CrosshairOverlay />
      </VisualizationOverlay>
    );

    verifySvg(visualizationOverlay);
    const svg = visualizationOverlay.find('svg').first();
    expect(svg.props().children).to.deep.equal([]);
  });

  it('otherwise renders each child with size and mouse position provided', () => {
    const visualizationOverlay = mount(
      <VisualizationOverlay
        width={TEST_APP_WIDTH}
        height={TEST_APP_HEIGHT}
        areOverlaysVisible={true}
        areRunStateOverlaysVisible={false}
      >
        <CrosshairOverlay />
        <CrosshairOverlay />
      </VisualizationOverlay>
    );

    verifySvg(visualizationOverlay);
    const svg = visualizationOverlay.find('svg').first();
    const crosshair = svg.props().children;
    crosshair.forEach(verifyCrosshair);
    expect(crosshair[0].key).to.equal('0/.0');
    expect(crosshair[1].key).to.equal('1/.1');
  });

  function verifySvg(element) {
    const svg = element.find('svg').first();
    expect(svg.props().id).to.equal('visualizationOverlay');
    expect(svg.props().version).to.equal('1.1');
    expect(svg.props().baseProfile).to.equal('full');
    expect(svg.props().width).to.equal(TEST_APP_WIDTH);
    expect(svg.props().height).to.equal(TEST_APP_HEIGHT);
    expect(svg.props().viewBox).to.equal(
      `0 0 ${TEST_APP_WIDTH} ${TEST_APP_HEIGHT}`
    );
    expect(svg.props().pointerEvents).to.equal('none');
  }

  function verifyCrosshair(crosshair) {
    expect(crosshair.props.width).to.equal(TEST_APP_WIDTH);
    expect(crosshair.props.height).to.equal(TEST_APP_HEIGHT);
    expect(crosshair.props.mouseX).to.equal(-1);
    expect(crosshair.props.mouseY).to.equal(-1);
  }
});

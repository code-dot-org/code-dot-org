import PropTypes from 'prop-types';
import React from 'react';

import dom from '../dom';
import color from '../util/color';

const style = {
  sliderTrack: {
    stroke: color.neutral_white,
    strokeWidth: 4,
    strokeLinecap: 'round',
  },
  sliderKnob: {
    fill: color.neutral_white,
    stroke: '#bbc',
    strokeWidth: 1,
    strokeLinejoin: 'round',
    ':hover': {
      fill: '#eee',
    },
  },
};

const sliderImages = {
  darkTurtle:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAMCAYAAABm+U3GAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEhMHWFBV9gAAAQpJREFUOMul0y9Lg1EUBvCfbCBMDQtqEGFB1mcxGgSbwaZg8mMYLFpsYhO/gMVkWxOxahCWBVnwXRAczmo5L1yu7zbRp5x7zz3n4Tl/bs10dLCLNXzh/Rc5Zia8beEIC5m/iwsUfyE+xfaEvDcc42lcQK3Ct4eDMfFDzGIeO2ji4TeKO7hMSGCUvDeSc9mifbTQjvsNipz4FstjSHM00IvzRiKmh5N61oKSdITPKYN/CbsYPS/RgnpMvx2ldWOtpuEu4tfj/kNEqXglCOdwH6qr9rUZdjPzX+E5ePrp8K79D2dBWOSKH7GK1yhvgPNkiJLKDqOvg7DwkX+YdCuWKpQUE755P/o8rIr9BkRqM7n1cwrvAAAAAElFTkSuQmCC',
  darkRabbit:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAPCAYAAAAPr1RWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEg0vuaTC0wAAAXFJREFUOMul079L1WEUBvDPzQwpTCiS6GaUrZKGq0Gg0BTZJghBQ1tT0H8QNAatTf0BQYOTYktQ0NJgVDTUomC3QL1xTfqhLc+FF7l6v9VZznnf7znP8z3nPG+P6jaDEfRitUrBwYrA5+NHcCvxSzxJ/LpTUU9F8LX88Ta+4hSGMYEW1pPzT+Ayijfx79P1SYzheyeCvwEvu/iEZ3iVkV3GJHbQSDddwS/iBh5k1hfwAwdCcgy/cQbvcA0fAt7qBn4bV4vzaUzhSkgOYRYnMFSIZBmrtS7Su1NxVN/iv+ARltDYD3wR/RVB+zGPhzk39tL5IK4n/ogjiQ/vQ/K5iBt7PaIZTAdwM20+zcKGcLbIbcUP423xoAbbBO2FTuI+xrOk55nbCyygGbKN6HkxOU38DOk5HMdKdP+rPfN7GMVctLuSQthCH46inrtmcuoBHseloqs5PK4Vei4B26C7ra/D9/KujpsYwN3aroQt/2clkT8FpVab2rcDgAAAAABJRU5ErkJggg==',
  lightTurtle:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAMCAYAAABm+U3GAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEjkwj4Y80QAAARJJREFUOMulk7FKQ0EQRc+IVUTBQi1ESCHptTGdheA3aJuPsLCwskkndiE/kMbKzk4sA1oI6QRBXqEpAgbTjs19MGw2eU+cZnZ3Zu/euTNr1DB3PwDawAQYmtlb1R2rADwBLoH1JPQA3JrZ15+B3f0aOF3y7idwZWYvueDKAtCzJaBT+R2g5+4XtRhLz14CMgspjbAuJToHmkBL+7sc8L3Y5EBTawAjrY8CmdFqRoISdAb8VDT/XX5LmpfWtND9lkrbAPZrTOGj8g9zwch4V4BrwJNYTzJ3NuWPk/M+8CqcwoIMA/5nXaAoZzsyfgb2gA+VNwZuQhNjZR3pOpYH+I4fxpLmbc/N44LfpbEspPM0zf0FoFJU5IxlTp4AAAAASUVORK5CYII=',
  lightRabbit:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAPCAYAAAAPr1RWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEjcsBQRNEAAAAX9JREFUOMuV0zFrVUEQBeBvwCJEEqukEeWhgiiCiIVYWATROqKFrUV6EfwH/gLbVBY2gpAilUQbCaKNRSQgGEnzCt8DwQRDurGZK5d4zbtv4LI7c3fP2Z09J/SMzHxY068R8bnPnhM9gc/X9ApWMhM+4DX8j6wXeETsZOZ8pXu4hZu4ivXM3IuInX/2mTLqFgMsFfgsXmHjKMHU4B1Ej3EZB3iJdxExmtiWzLyGO3hQpY9Yw27rlJtYwDesYJyZWxExmtTz+7jbym/Ut5+ZqxhjucAXas0SfmIUE6T3pGeH9mscYxVbEXEs+FvM9QSdwxs8L3V19zwzF3Gv0u84WfPZY0h+tGQ76tR5tWK5AA/qmms4izMlwSZ+13gO242hMnOxIYgq3K6Xbk75Hr9KAZu4hItFMo8vRXyhXDvAbtU3MIyIwwb8WeM2fMKwnCgiDjNzpkBPt1w6rHyA6+XaJtbxIlp6/gvYgHa8x8zR/+1akT3CKTyN9oIuwCkd2ybyB67+kmBPPxeyAAAAAElFTkSuQmCC',
};

let knobXMax = 135;
const knobXMin = 15;
const knobWidth = 16;
let trackLength = knobXMax - knobXMin - 5;

/**
 * SpeedSlider for modifying a value.
 * For a usage example, see JSDebugger.
 */
class SpeedSlider extends React.Component {
  static propTypes = {
    hasFocus: PropTypes.bool,
    style: PropTypes.object,
    value: PropTypes.number.isRequired,
    lineWidth: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  state = {
    dragStart: undefined,
    valueStart: undefined,
  };

  componentDidMount() {
    this.isAndroid_ = dom.isAndroid();
    this.isIOS_ = dom.isIOS();
    this.isWindowsTouch_ = dom.isWindowsTouch();

    dom.addMouseDownTouchEvent(this.knob_, this.onKnobMouseDown);
    dom.addMouseDownTouchEvent(this.track_, this.onTrackMouseDown);
  }

  mouseToSvg_ = e => {
    let svgPoint = this.SVG_.createSVGPoint();
    // Most browsers provide clientX/Y. iOS only provides pageX/Y.
    // Android Chrome only provides coordinates within e.changedTouches.
    if (this.isWindowsTouch_) {
      // Only screenX/Y properly accounts for zooming in on windows touch.
      svgPoint.x = e.screenX;
      svgPoint.y = e.screenY;
    } else if (this.isAndroid_) {
      svgPoint.x = e.changedTouches[0].pageX;
      svgPoint.y = e.changedTouches[0].pageY;
    } else if (this.isIOS_) {
      svgPoint.x = e.pageX;
      svgPoint.y = e.pageY;
    } else {
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
    }
    const matrix = this.SVG_.getScreenCTM().inverse();
    return svgPoint.matrixTransform(matrix);
  };

  clampValue = val => {
    return Math.min(Math.max(val, 0), 1);
  };

  svgPositionToValue = position => {
    position = (position - knobXMin) / trackLength;
    return this.clampValue(position);
  };

  onTrackMouseDown = event => {
    const mousePosition = this.mouseToSvg_(event);
    const newValue = this.svgPositionToValue(mousePosition.x);
    this.props.onChange(newValue);
    this.setState({
      dragStart: mousePosition.x,
      valueStart: newValue,
    });
    this.startDragging();
  };

  onKnobMouseDown = event => {
    const mousePosition = this.mouseToSvg_(event);
    this.setState({
      dragStart: mousePosition.x,
      valueStart: this.props.value,
    });
    this.startDragging();
  };

  startDragging = () => {
    this.unbindOnMouseMove = dom.addMouseMoveTouchEvent(
      document,
      this.onMouseMove
    );
    this.unbindStopDragging = dom.addMouseUpTouchEvent(
      document,
      this.stopDragging
    );
  };

  onMouseMove = event => {
    const mousePosition = this.mouseToSvg_(event);
    const mouseDelta = mousePosition.x - this.state.dragStart;
    const valueDelta = mouseDelta / trackLength;
    const newValue = this.clampValue(this.state.valueStart + valueDelta);
    this.props.onChange(newValue);
  };

  stopDragging = event => {
    this.setState({
      dragStart: undefined,
      valueStart: undefined,
    });
    this.unbindOnMouseMove();
    this.unbindStopDragging();
  };

  render() {
    const props = this.props;
    if (props.lineWidth) {
      knobXMax = props.lineWidth;
      trackLength = knobXMax - knobXMin - 5;
    }
    let clampedValue = this.clampValue(props.value);
    let knobXPosition = knobXMin + trackLength * clampedValue - knobWidth / 2;
    return (
      <div id="slider-cell" style={props.style} className={props.className}>
        <svg width={knobXMax + 10} height="35" ref={el => (this.SVG_ = el)}>
          {/*<!-- Slow icon. -->*/}
          <clipPath id="slowClipPath">
            <rect width={26} height={12} x={0} y={6} />
          </clipPath>
          {/* turtle image */}
          <image
            xlinkHref={sliderImages.lightTurtle}
            height={12}
            width={22}
            x={2}
            y={6}
          />
          {/*<!-- Fast icon. -->*/}
          <clipPath id="fastClipPath">
            <rect width={26} height={16} x={knobXMax - 19} y={2} />
          </clipPath>
          {/* rabbit image */}
          <image
            xlinkHref={sliderImages.lightRabbit}
            height={15}
            width={23}
            x={knobXMax - 18}
            y={3}
          />
          <line
            style={style.sliderTrack}
            x1="5"
            y1="25"
            x2={knobXMax + 5}
            y2="25"
            ref={el => (this.track_ = el)}
          />
          <path
            style={style.sliderKnob}
            transform={`translate(${knobXPosition}, 10)`}
            d="m 8,0 l -8,8 v 12 h 16 v -12 z"
            ref={el => (this.knob_ = el)}
          />
        </svg>
      </div>
    );
  }
}

export default SpeedSlider;

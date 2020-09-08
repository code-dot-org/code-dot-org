import dom from '@cdo/apps/dom';
import gameLabDPadHtmlEjs from '@cdo/apps/templates/gameLabDPad.html.ejs';
import {GAMELAB_DPAD_CONTAINER_ID} from './constants';
import {showArrowButtons} from '@cdo/apps/templates/arrowDisplayRedux';
import {getStore} from '@cdo/apps/redux';

const DPAD_DEAD_ZONE = 3;
// Allows diagonal to kick in after 22.5 degrees off primary axis, giving each
// of the 8 directions an equal 45 degree cone
const DIAG_SCALE_FACTOR = Math.cos((Math.PI * 22.5) / 180);

const mouseUpTouchEventName = dom.getTouchEventName('mouseup');
const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');

const ButtonState = {
  UP: 0,
  DOWN: 1
};

const ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton',
  SPACE: 'studio-space-button'
};

function p5KeyCodeFromArrow(idBtn) {
  switch (idBtn) {
    case ArrowIds.LEFT:
      return window.p5.prototype.LEFT_ARROW;
    case ArrowIds.RIGHT:
      return window.p5.prototype.RIGHT_ARROW;
    case ArrowIds.UP:
      return window.p5.prototype.UP_ARROW;
    case ArrowIds.DOWN:
      return window.p5.prototype.DOWN_ARROW;
    case ArrowIds.SPACE:
      return window.p5.prototype.KEY.SPACE;
  }
}

function domIdFromArrow(idBtn) {
  switch (idBtn) {
    case ArrowIds.SPACE:
      return 'studio-space-button';
  }
  return undefined;
}

export default class MobileControls {
  btnState = {};
  dPadState = {};
  dpadFourWay = true;

  init(opts) {
    this.opts = opts || {};

    document.getElementById(
      GAMELAB_DPAD_CONTAINER_ID
    ).innerHTML = gameLabDPadHtmlEjs();

    // Connect up arrow button event handlers
    for (const btn in ArrowIds) {
      dom.addMouseUpTouchEvent(
        document.getElementById(ArrowIds[btn]),
        this.onArrowButtonUp.bind(this, ArrowIds[btn])
      );
      dom.addMouseDownTouchEvent(
        document.getElementById(ArrowIds[btn]),
        this.onArrowButtonDown.bind(this, ArrowIds[btn])
      );
    }
    dom.addMouseDownTouchEvent(
      document.getElementById('studio-dpad-button'),
      this.onMouseDown
    );
    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.addEventListener('mouseup', this.onMouseUp, false);
    if (mouseUpTouchEventName) {
      document.body.addEventListener(mouseUpTouchEventName, this.onMouseUp);
    }
  }

  update(config, isShareView = true) {
    const {dpadVisible, dpadFourWay, spaceButtonVisible, mobileOnly} = config;
    const mobileControlsOk = dom.isMobile() && isShareView ? true : !mobileOnly;

    const dpadDisplayStyle =
      dpadVisible && mobileControlsOk ? 'inline' : 'none';
    document.getElementById('studio-dpad-rim').style.display = dpadDisplayStyle;
    document.getElementById(
      'studio-dpad-cone'
    ).style.display = dpadDisplayStyle;
    document.getElementById(
      'studio-dpad-button'
    ).style.display = dpadDisplayStyle;

    const spaceButtonDisplayStyle =
      spaceButtonVisible && mobileControlsOk ? 'inline' : 'none';
    document.getElementById(
      'studio-space-button'
    ).style.display = spaceButtonDisplayStyle;

    if (this.dpadFourWay !== dpadFourWay) {
      if (this.dPadState.trackingMouseMove) {
        // Fake a mousemove back at the original starting position, which
        // will reset buttons back to "up":
        this.onMouseMove({
          clientX: this.dPadState.startingX,
          clientY: this.dPadState.startingY
        });
      }

      this.dpadFourWay = dpadFourWay;

      if (this.dPadState.trackingMouseMove) {
        // Fake another mousemove at the last mousemove position, which
        // will set up buttons correctly for the new dpad mode:
        this.onMouseMove({
          clientX: this.dPadState.previousX,
          clientY: this.dPadState.previousY
        });
      }
    }

    // For export mode only:
    if (dpadVisible || spaceButtonVisible) {
      $('#sketch').removeClass('no-controls');
    } else {
      $('#sketch').addClass('no-controls');
    }
  }

  onArrowButtonDown(buttonId, e) {
    const {notifyKeyCodeDown} = this.opts;
    // Store the most recent event type per-button
    this.btnState[buttonId] = ButtonState.DOWN;
    e.preventDefault(); // Stop normal events so we see mouseup later.

    const domId = domIdFromArrow(buttonId);
    if (domId) {
      $(`#${domId}`).addClass('active');
    }
    notifyKeyCodeDown(p5KeyCodeFromArrow(buttonId));
  }

  onArrowButtonUp(buttonId, e) {
    const {notifyKeyCodeUp} = this.opts;
    // Store the most recent event type per-button
    this.btnState[buttonId] = ButtonState.UP;

    const domId = domIdFromArrow(buttonId);
    if (domId) {
      $(`#${domId}`).removeClass('active');
    }
    notifyKeyCodeUp(p5KeyCodeFromArrow(buttonId));
  }

  onMouseMove = e => {
    var clientX = e.clientX;
    var clientY = e.clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    if (this.dpadFourWay) {
      this.notifyKeysFourWayDPad(clientX, clientY);
    } else {
      this.notifyKeyEightWayDPad(
        window.p5.prototype.LEFT_ARROW,
        'left',
        clientX,
        clientY
      );
      this.notifyKeyEightWayDPad(
        window.p5.prototype.RIGHT_ARROW,
        'right',
        clientX,
        clientY
      );
      this.notifyKeyEightWayDPad(
        window.p5.prototype.UP_ARROW,
        'up',
        clientX,
        clientY
      );
      this.notifyKeyEightWayDPad(
        window.p5.prototype.DOWN_ARROW,
        'down',
        clientX,
        clientY
      );
    }

    this.dPadState.previousX = clientX;
    this.dPadState.previousY = clientY;
  };

  onMouseDown = e => {
    this.dPadState = {
      trackingMouseMove: true
    };
    document.body.addEventListener('mousemove', this.onMouseMove);
    if (mouseMoveTouchEventName) {
      document.body.addEventListener(mouseMoveTouchEventName, this.onMouseMove);
    }
    if (e.touches) {
      this.dPadState.startingX = e.touches[0].clientX;
      this.dPadState.startingY = e.touches[0].clientY;
      this.dPadState.previousX = e.touches[0].clientX;
      this.dPadState.previousY = e.touches[0].clientY;
    } else {
      this.dPadState.startingX = e.clientX;
      this.dPadState.startingY = e.clientY;
      this.dPadState.previousX = e.clientX;
      this.dPadState.previousY = e.clientY;
    }

    $('#studio-dpad-button').addClass('active');

    e.preventDefault(); // Stop normal events so we see mouseup later.
  };

  onMouseUp = e => {
    const {notifyKeyCodeUp} = this.opts;
    // Reset all arrow buttons on "global mouse up" - this handles the case where
    // the mouse moved off the arrow button and was released somewhere else

    if (e.touches && e.touches.length > 0) {
      return;
    }

    for (var buttonId in this.btnState) {
      if (this.btnState[buttonId] === ButtonState.DOWN) {
        this.btnState[buttonId] = ButtonState.UP;
        const domId = domIdFromArrow(buttonId);
        if (domId) {
          $(`#${domId}`).removeClass('active');
        }
        notifyKeyCodeUp(p5KeyCodeFromArrow(buttonId));
      }
    }

    this.resetDPad();
  };

  reset() {
    const {softButtonIds} = this.opts;
    softButtonIds.forEach(
      buttonId => (document.getElementById(buttonId).style.display = 'inline')
    );
    if (softButtonIds.length) {
      $('#soft-buttons').addClass('soft-buttons-' + softButtonIds.length);
      getStore().dispatch(showArrowButtons());
    }
    // For export mode only:
    $('#sketch').removeClass('no-controls');

    this.resetDPad();
  }

  notifyKeyEightWayDPad(keyCode, cssClass, currentX, currentY) {
    const dPadButton = $('#studio-dpad-button');
    const dPadCone = $('#studio-dpad-cone');
    const {startingX, previousX, startingY, previousY} = this.dPadState;
    const {notifyKeyCodeDown, notifyKeyCodeUp} = this.opts;
    let curPrimary, curSecondary, prevPrimary, prevSecondary;

    switch (keyCode) {
      case window.p5.prototype.LEFT_ARROW:
        curPrimary = -(currentX - startingX);
        curSecondary = currentY - startingY;
        prevPrimary = -(previousX - startingX);
        prevSecondary = previousY - startingY;
        break;
      case window.p5.prototype.RIGHT_ARROW:
        curPrimary = currentX - startingX;
        curSecondary = currentY - startingY;
        prevPrimary = previousX - startingX;
        prevSecondary = previousY - startingY;
        break;
      case window.p5.prototype.UP_ARROW:
        curPrimary = -(currentY - startingY);
        curSecondary = currentX - startingX;
        prevPrimary = -(previousY - startingY);
        prevSecondary = previousX - startingX;
        break;
      case window.p5.prototype.DOWN_ARROW:
        curPrimary = currentY - startingY;
        curSecondary = currentX - startingX;
        prevPrimary = previousY - startingY;
        prevSecondary = previousX - startingX;
        break;
    }

    const curDiag =
      DIAG_SCALE_FACTOR *
      Math.sqrt(Math.pow(curPrimary, 2) + Math.pow(curSecondary, 2));
    const prevDiag =
      DIAG_SCALE_FACTOR *
      Math.sqrt(Math.pow(prevPrimary, 2) + Math.pow(prevSecondary, 2));

    const curDown =
      curPrimary > DPAD_DEAD_ZONE &&
      (curPrimary > curDiag || curDiag > Math.abs(curSecondary));
    const prevDown =
      prevPrimary > DPAD_DEAD_ZONE &&
      (prevPrimary > prevDiag || prevDiag > Math.abs(prevSecondary));

    if (curDown && !prevDown) {
      notifyKeyCodeDown(keyCode);
      dPadButton.addClass(cssClass);
      dPadCone.addClass(cssClass);
    } else if (!curDown && prevDown) {
      notifyKeyCodeUp(keyCode);
      dPadButton.removeClass(cssClass);
      dPadCone.removeClass(cssClass);
    }
  }

  notifyKeysFourWayDPad(currentX, currentY) {
    const dPadButton = $('#studio-dpad-button');
    const dPadCone = $('#studio-dpad-cone');
    const {startingX, previousX, startingY, previousY} = this.dPadState;
    const {notifyKeyCodeDown, notifyKeyCodeUp} = this.opts;

    const keyValues = [
      {
        cssClass: 'left',
        key: window.p5.prototype.LEFT_ARROW,
        current: -(currentX - startingX),
        previous: -(previousX - startingX)
      },
      {
        cssClass: 'right',
        key: window.p5.prototype.RIGHT_ARROW,
        current: currentX - startingX,
        previous: previousX - startingX
      },
      {
        cssClass: 'up',
        key: window.p5.prototype.UP_ARROW,
        current: -(currentY - startingY),
        previous: -(previousY - startingY)
      },
      {
        cssClass: 'down',
        key: window.p5.prototype.DOWN_ARROW,
        current: currentY - startingY,
        previous: previousY - startingY
      }
    ];
    const prevKeyValue = keyValues.reduce((maxKeyValue, curKeyValue) => {
      const {previous = 0} = maxKeyValue || {};
      if (curKeyValue.previous > Math.max(previous, DPAD_DEAD_ZONE)) {
        return curKeyValue;
      } else {
        return maxKeyValue;
      }
    }, null);
    const currentKeyValue = keyValues.reduce((maxKeyValue, curKeyValue) => {
      const {current = 0} = maxKeyValue || {};
      if (curKeyValue.current > Math.max(current, DPAD_DEAD_ZONE)) {
        return curKeyValue;
      } else {
        return maxKeyValue;
      }
    }, null);
    const {key: prevKey, cssClass: prevCssClass} = prevKeyValue || {};
    const {key: currentKey, cssClass: currentCssClass} = currentKeyValue || {};

    if (prevKey && prevKey !== currentKey) {
      notifyKeyCodeUp(prevKey);
      dPadButton.removeClass(prevCssClass);
      dPadCone.removeClass(prevCssClass);
    }
    if (currentKey && prevKey !== currentKey) {
      notifyKeyCodeDown(currentKey);
      dPadButton.addClass(currentCssClass);
      dPadCone.addClass(currentCssClass);
    }
  }

  resetDPad() {
    if (this.dPadState.trackingMouseMove) {
      // Fake a final mousemove back at the original starting position, which
      // will reset buttons back to "up":
      this.onMouseMove({
        clientX: this.dPadState.startingX,
        clientY: this.dPadState.startingY
      });

      document.body.removeEventListener('mousemove', this.onMouseMove);
      if (mouseMoveTouchEventName) {
        document.body.removeEventListener(
          mouseMoveTouchEventName,
          this.onMouseMove
        );
      }

      $('#studio-dpad-button').removeClass('active');

      this.dPadState = {};
      this.dPadFourWay = true;
    }
  }
}

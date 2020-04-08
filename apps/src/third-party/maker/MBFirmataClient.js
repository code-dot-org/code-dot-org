/*
  Code from: https://github.com/microbit-foundation/microbit-firmata

  This file includes changes to the original code to facilitate using this
  in our repo. The changes are tracked here:
  https://github.com/microbit-foundation/microbit-firmata/pull/3
 */

// TODO Reference this code from package.json after demo

/*
MIT License

Copyright (c) 2019 Micro:bit Educational Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* The MicrobitFirmataClient is a client for BBC micro:bit Firmata.
 *
 * Use connect() to connect to a board (serial ports are scanned for a connected micro:bit).
 * or setSerialPort() to provide your own serial port.
 *
 * Entry points are provided to control the 5x5 LED display and digital/PWM output pins.
 *
 * Clients can listen for DAL events, digital pin changes, or analog channel updates.
 */

let serialport;
let TextEncoder, TextDecoder;

// If running outside of the browser, create the TextEncoder/TextDecoder
if (typeof window === 'undefined' || !window.TextEncoder) {
  TextEncoder = require('util').TextEncoder;
  TextDecoder = require('util').TextDecoder;
} else {
  TextEncoder = window.TextEncoder;
  TextDecoder = window.TextDecoder;
}

class MicrobitFirmataClient {
  constructor(port) {
    serialport = port ? port : require('serialport');
    this.addConstants();
    this.myPort = null;
    this.inbuf = new Uint8Array(1000);
    this.inbufCount = 0;

    this.boardVersion = '';
    this.firmataVersion = '';
    this.firmwareVersion = '';

    this.buttonAPressed = false;
    this.buttonBPressed = false;
    this.isScrolling = false;

    this.digitalInput = new Array(21).fill(false);
    this.analogChannel = new Array(16).fill(0);
    this.eventListeners = new Array();
    this.updateListeners = new Array();

    // statistics:
    this.analogUpdateCount = 0;
    this.channelUpdateCounts = new Array(16).fill(0);
  }

  addConstants() {
    // Add Firmata constants

    // Firamata Channel Messages

    this.STREAM_ANALOG				= 0xC0; // enable/disable streaming of an analog channel
    this.STREAM_DIGITAL				= 0xD0; // enable/disable tracking of a digital port
    this.ANALOG_UPDATE				= 0xE0; // analog channel update
    this.DIGITAL_UPDATE				= 0x90; // digital port update

    this.SYSEX_START				= 0xF0
    this.SET_PIN_MODE				= 0xF4; // set pin mode
    this.SET_DIGITAL_PIN			= 0xF5; // set pin value
    this.SYSEX_END					= 0xF7
    this.FIRMATA_VERSION			= 0xF9; // request/report Firmata protocol version
    this.SYSTEM_RESET				= 0xFF; // reset Firmata

    // Firamata Sysex Messages

    this.EXTENDED_ANALOG_WRITE		= 0x6F; // analog write (PWM, Servo, etc) to any pin
    this.REPORT_FIRMWARE			= 0x79; // request/report firmware version and name
    this.SAMPLING_INTERVAL			= 0x7A; // set msecs between streamed analog samples

    // BBC micro:bit Sysex Messages (0x01-0x0F)

    this.MB_DISPLAY_CLEAR			= 0x01
    this.MB_DISPLAY_SHOW			= 0x02
    this.MB_DISPLAY_PLOT			= 0x03
    this.MB_SCROLL_STRING			= 0x04
    this.MB_SCROLL_INTEGER			= 0x05
    this.MB_SET_TOUCH_MODE			= 0x06
    this.MB_DISPLAY_ENABLE			= 0x07
    // 0x08-0x0C reserved for additional micro:bit messages
    this.MB_REPORT_EVENT			= 0x0D
    this.MB_DEBUG_STRING			= 0x0E
    this.MB_EXTENDED_SYSEX			= 0x0F; // allow for 128 additional micro:bit messages

    // Firmata Pin Modes

    this.DIGITAL_INPUT				= 0x00
    this.DIGITAL_OUTPUT				= 0x01
    this.ANALOG_INPUT				= 0x02
    this.PWM						= 0x03
    this.INPUT_PULLUP				= 0x0B
    this.INPUT_PULLDOWN				= 0x0F; // micro:bit extension; not defined by Firmata
  }

  // Connecting/Disconnecting

  /**
   * @returns {Promise} when port has been opened or if no port found
   */
  connect() {
    // Search serial port list for a connected micro:bit and, if found, open that port.

    return serialport.list()
    .then((ports) => {
      for (var i = 0; i < ports.length; i++) {
        var p = ports[i];
        if ((p.vendorId && p.vendorId.toLowerCase() == '0d28') && (p.productId == '0204')) {
          return p.comName;
        }
      }
      return null;
    })
    .then((portName) => {
      if (portName) {
        // Attempt to open the serial port on the given port name.
        // If this fails it will fail with an UnhandledPromiseRejectionWarning.
        console.log("Opening", portName);
        return this.setSerialPort(new serialport(portName, { baudRate: 57600 }));
      } else {
        console.log("No micro:bit found; is your board plugged in?");
        return null;
      }
    });
  }

  /**
   * @returns {Promise} when board version is set
   */
  setSerialPort(port) {
    // Use the given port. Assume the port has been opened by the caller.

    function dataReceived(data) {
      if ((this.inbufCount + data.length) < this.inbuf.length) {
        this.inbuf.set(data, this.inbufCount);
        this.inbufCount += data.length;
        this.processFirmatMessages();
      }
    }
    this.myPort = port;
    this.myPort.on('data', dataReceived.bind(this));
    this.requestFirmataVersion();
    this.requestFirmwareVersion();

    // get the board serial number (used to determine board version)
    this.boardVersion = '';
    return serialport.list()
    .then((ports) => {
      for (var i = 0; i < ports.length; i++) {
        var p = ports[i];
        if ((p.comName == this.myPort.path)) {
          this.boardVersion = this.boardVersionFromSerialNumber(p.serialNumber);
        }
      }
      return null;
    })
  }

  disconnect() {
    // Close and discard the serial port.

    if (this.myPort) {
      console.log("Closing", this.myPort.path);
      this.myPort.close();
      this.myPort = null;
    }
  }

  // Internal: Connecting/Disconnecting Support

  boardVersionFromSerialNumber(usbSerialNumber) {
    // The micro:bit board version can be determined from the USB device serial number.
    // See https://support.microbit.org/support/solutions/articles/19000084312-micro-bit-motion-sensor-hardware-changes-for-editor-developers
    var id = usbSerialNumber.slice(0, 4);
    if ('9900' == id) return '1.3';
    if ('9901' == id) return '1.5';
    return 'unrecognized board';
  }

  requestFirmataVersion() {
    this.myPort.write([this.FIRMATA_VERSION, 0, 0]);
  }

  requestFirmwareVersion() {
    this.myPort.write([this.SYSEX_START, this.REPORT_FIRMWARE, this.SYSEX_END]);
  }

  // Internal: Parse Incoming Firmata Messages

  processFirmatMessages() {
    // Process and remove all complete Firmata messages in inbuf.

    if (!this.inbufCount) return; // nothing received
    var cmdStart = 0;
    while (true) {
      cmdStart = this.findCmdByte(cmdStart);
      if (cmdStart < 0) {; // no more messages
        this.inbufCount = 0;
        return;
      }
      var skipBytes = this.dispatchCommand(cmdStart);
      if (skipBytes < 0) {
        // command at cmdStart is incomplete: remove processed messages and exit
        if (0 == cmdStart) return; // cmd is already at start of inbuf
        var remainingBytes = this.inbufCount - cmdStart;
        this.inbuf.copyWithin(0, cmdStart, cmdStart + remainingBytes);
        this.inbufCount = remainingBytes;
        return;
      }
      cmdStart += skipBytes;
    }
  }

  findCmdByte(startIndex) {
    for (var i = startIndex; i < this.inbufCount; i++) {
      if (this.inbuf[i] & 0x80) return i;
    }
    return -1;
  }

  dispatchCommand(cmdStart) {
    // Attempt to process the command starting at the given index in inbuf.
    // If the command is incomplete, return -1.
    // Otherwise, process it and return the number of bytes in the entire command.

    var cmdByte = this.inbuf[cmdStart];
    var chanCmd = cmdByte & 0xF0;
    var argBytes = 0;
    var nextCmdIndex = this.findCmdByte(cmdStart + 1);
    if (nextCmdIndex < 0) {; // no next command; current command may not be complete
      if (this.SYSEX_START == cmdByte) return -1; // incomplete sysex
      argBytes = this.inbufCount - (cmdStart + 1);
      var argsNeeded = 2;
      if (0xFF == cmdByte) argsNeeded = 0;
      if ((0xC0 == chanCmd) || (0xD0 == chanCmd)) argsNeeded = 1;
      if (argBytes < argsNeeded) return -1;
    } else {
      argBytes = nextCmdIndex - (cmdStart + 1);
    }

    if (this.SYSEX_START == cmdByte) {; // system exclusive message: SYSEX_START ...data ... SYSEX_END
      if (this.SYSEX_END != this.inbuf[cmdStart + argBytes + 1]) {
        // last byte is not SYSEX_END; skip this message
        return argBytes + 1; // skip cmd + argBytes
      }
      this.dispatchSysexCommand(cmdStart + 1, argBytes - 1);
      return argBytes + 2; // skip cmd, arg bytes, and final SYSEX_END
    }

    var chan = cmdByte & 0xF;
    var arg1 = (argBytes > 0) ? this.inbuf[cmdStart + 1] : 0;
    var arg2 = (argBytes > 1) ? this.inbuf[cmdStart + 2] : 0;

    if (this.DIGITAL_UPDATE == chanCmd) this.receivedDigitalUpdate(chan, (arg1 | (arg2 << 7)));
    if (this.ANALOG_UPDATE == chanCmd) this.receivedAnalogUpdate(chan, (arg1 | (arg2 << 7)));
    if (this.FIRMATA_VERSION == cmdByte) this.receivedFirmataVersion(arg1, arg2);

    return argBytes + 1;
  }

  dispatchSysexCommand(sysexStart, argBytes) {
    var sysexCmd = this.inbuf[sysexStart];
    switch (sysexCmd) {
      case this.MB_REPORT_EVENT:
        this.receivedEvent(sysexStart, argBytes);
        break;
      case this.MB_DEBUG_STRING:
        var buf = this.inbuf.slice(sysexStart + 1, sysexStart + 1 + argBytes);
        console.log('DB: ' + new TextDecoder().decode(buf));
        break;
      case this.REPORT_FIRMWARE:
        this.receivedFirmwareVersion(sysexStart, argBytes);
        break;
    }
  }

  // Internal: Handling Messages from the micro:bit

  receivedFirmataVersion(major, minor) {
    this.firmataVersion = 'Firmata Protocol ' + major + '.' + minor;
  }

  receivedFirmwareVersion(sysexStart, argBytes) {
    var major = this.inbuf[sysexStart + 1];
    var minor = this.inbuf[sysexStart + 2];
    var utf8Bytes = new Array();
    for (var i = sysexStart + 3; i <= argBytes; i += 2) {
      utf8Bytes.push(this.inbuf[i] | (this.inbuf[i + 1] << 7));
    }
    var firmwareName = new TextDecoder().decode(Buffer.from(utf8Bytes));
    this.firmwareVersion = firmwareName + ' ' + major + '.' + minor;
  }

  receivedDigitalUpdate(chan, pinMask) {
    var pinNum = 8 * chan;
    for (var i = 0; i < 8; i++) {
      var isOn = ((pinMask & (1 << i)) != 0);
      if (pinNum < 21) this.digitalInput[pinNum] = isOn;
      pinNum++;
    }
  }

  receivedAnalogUpdate(chan, value) {
    if (value > 8191) value = value - 16384; // negative value (14-bits 2-completement)
    this.analogChannel[chan] = value;

    // update stats:
    this.analogUpdateCount++;
    this.channelUpdateCounts[chan]++;

    for (var f of this.updateListeners) f.call(); // notify all update listeners
  }

  receivedEvent(sysexStart, argBytes) {
    const MICROBIT_ID_BUTTON_A = 1;
    const MICROBIT_ID_BUTTON_B = 2;
    const MICROBIT_BUTTON_EVT_DOWN = 1;
    const MICROBIT_BUTTON_EVT_UP = 2;

    const MICROBIT_ID_DISPLAY = 6;
    const MICROBIT_DISPLAY_EVT_ANIMATION_COMPLETE = 1;

    var sourceID =
      (this.inbuf[sysexStart + 3] << 14) |
      (this.inbuf[sysexStart + 2] << 7) |
      this.inbuf[sysexStart + 1];
    var eventID =
      (this.inbuf[sysexStart + 6] << 14) |
      (this.inbuf[sysexStart + 5] << 7) |
      this.inbuf[sysexStart + 4];

    if (sourceID == MICROBIT_ID_BUTTON_A) {
      if (eventID == MICROBIT_BUTTON_EVT_DOWN) this.buttonAPressed = true;
      if (eventID == MICROBIT_BUTTON_EVT_UP) this.buttonAPressed = false;
    }
    if (sourceID == MICROBIT_ID_BUTTON_B) {
      if (eventID == MICROBIT_BUTTON_EVT_DOWN) this.buttonBPressed = true;
      if (eventID == MICROBIT_BUTTON_EVT_UP) this.buttonBPressed = false;
    }
    if ((sourceID == MICROBIT_ID_DISPLAY) &&
      (eventID == MICROBIT_DISPLAY_EVT_ANIMATION_COMPLETE)) {
      this.isScrolling = false;
    }

    // notify event listeners
    for (var f of this.eventListeners) f.call(null, sourceID, eventID);
  }

  // Display Commands

  enableDisplay(enableFlag) {
    // Enable or disable the display. When the display is disabled, the edge connector
    // pins normall used by the display can be used for other I/O functions.
    // Re-enabling the display (even when is already enabled) disables the light
    // sensor which, when running monopolizes the A/D converter preventing all pins
    // from being used for analog input. Requesting a light sensor value restarts
    // the light sensor.

    var enable = enableFlag ? 1 : 0;
    this.myPort.write([this.SYSEX_START, this.MB_DISPLAY_ENABLE, enable, this.SYSEX_END]);
  }

  displayClear() {
    // Clear the display and stop any ongoing animation.

    this.isScrolling = false;
    this.myPort.write([this.SYSEX_START, this.MB_DISPLAY_CLEAR, this.SYSEX_END]);
  }

  displayShow(useGrayscale, pixels) {
    // Display the given 5x5 image on the display. If useGrayscale is true, pixel values
    // are brightness values in the range 0-255. Otherwise, a zero pixel value means off
    // and >0 means on. Pixels is an Array of 5-element Arrays.

    this.isScrolling = false;
    this.myPort.write([this.SYSEX_START, this.MB_DISPLAY_SHOW]);
    this.myPort.write([useGrayscale ? 1 : 0]);
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 5; x++) {
        var pix = pixels[y][x];
        if (pix > 1) pix = pix / 2; // transmit as 7-bits
        this.myPort.write([pix & 0x7F]);
      }
    }
    this.myPort.write([this.SYSEX_END]);
  }

  displayPlot(x, y, brightness) {
    // Set the display pixel at x, y to the given brightness (0-255).

    this.isScrolling = false;
    this.myPort.write([this.SYSEX_START, this.MB_DISPLAY_PLOT,
      x, y, (brightness / 2) & 0x7F,
      this.SYSEX_END]);
  }

  scrollString(s, delay) {
    // Scroll the given string across the display with the given delay.
    // Omit the delay parameter to use the default scroll speed.
    // The maximum string length is 100 characters.

    this.isScrolling = true;
    if (null == delay) delay = 120;
    if (s.length > 100) s = s.slice(0, 100);
    var buf = new TextEncoder().encode(s);
    this.myPort.write([this.SYSEX_START, this.MB_SCROLL_STRING, delay]);
    for (var i = 0; i < buf.length; i++) {
      var b = buf[i];
      this.myPort.write([b & 0x7F, (b >> 7) & 0x7F]);
    }
    this.myPort.write([this.SYSEX_END]);
  }

  scrollInteger(n, delay) {
    // Scroll the given integer value across the display with the given delay.
    // Omit the delay parameter to use the default scroll speed.
    // Note: 32-bit integer is transmitted as five 7-bit data bytes.

    this.isScrolling = true;
    if (null == delay) delay = 120;
    this.myPort.write([this.SYSEX_START, this.MB_SCROLL_INTEGER,
      delay,
      n & 0x7F, (n >> 7) & 0x7F, (n >> 14) & 0x7F, (n >> 21) & 0x7F, (n >> 28) & 0x7F,
      this.SYSEX_END]);
  }

  // Pin and Sensor Channel Commands

  setPinMode(pinNum, mode) {
    if ((pinNum < 0) || (pinNum > 20)) return;
    this.myPort.write([this.SET_PIN_MODE, pinNum, mode]);
  }

  trackDigitalPin(pinNum, optionalMode) {
    // Start tracking the given pin as a digital input.
    // The optional mode can be 0 (no pullup or pulldown), 1 (pullup resistor),
    // or 2 (pulldown resistor). It defaults to 0.

    if ((pinNum < 0) || (pinNum > 20)) return;
    var port = pinNum >> 3;
    var mode = this.DIGITAL_INPUT; // default
    if (0 == optionalMode) mode = this.DIGITAL_INPUT;
    if (1 == optionalMode) mode = this.INPUT_PULLUP;
    if (2 == optionalMode) mode = this.INPUT_PULLDOWN;
    this.myPort.write([this.SET_PIN_MODE, pinNum, mode]);
    this.myPort.write([this.STREAM_DIGITAL | port, 1]);
  }

  stopTrackingDigitalPins() {
    // Stop tracking all digital pins.

    for (var i = 0; i < 3; i++) {
      this.myPort.write([this.STREAM_DIGITAL | i, 0]);
    }
  }

  clearChannelData() {
    // Reset analog channel values and statistics.

    this.analogChannel.fill(0);
    this.analogUpdateCount = 0; // statistic: total number of analog updates received
    this.channelUpdateCounts.fill(0); // statistic: number of updates received for each analog channel
  }

  streamAnalogChannel(chan) {
    // Start streaming the given analog channel.

    if ((chan < 0) || (chan > 15)) return;
    this.myPort.write([this.STREAM_ANALOG | chan, 1]);
  }

  stopStreamingAnalogChannel(chan) {
    // Stop streaming the given analog channel.

    if ((chan < 0) || (chan > 15)) return;
    this.myPort.write([this.STREAM_ANALOG | chan, 0]);
  }

  setAnalogSamplingInterval(samplingMSecs) {
    // Set the number of milliseconds (1-16383) between analog channel updates.

    if ((samplingMSecs < 1) || (samplingMSecs > 16383)) return;
    this.myPort.write([this.SYSEX_START, this.SAMPLING_INTERVAL,
      samplingMSecs & 0x7F, (samplingMSecs >> 7) & 0x7F,
      this.SYSEX_END]);
  }

  enableLightSensor() {
    // Enable the light sensor.
    // Note: When running, the light sensor monopolizes the A/D converter, preventing
    // use of the analog input pins. Thus, the light sensor is disabled by default.
    // This method can be used to enable it.

    this.myPort.write([this.SET_PIN_MODE, 11, this.ANALOG_INPUT]);
  }

  setTouchMode(pinNum, touchModeOn) {
    // Turn touch mode on/off for a pin. Touch mode is only supported for pins 0-2).
    // When touch mode is on, the pin generates events as if it were a button.

    if ((pinNum < 0) || (pinNum > 2)) return;
    var mode = touchModeOn ? 1 : 0;
    this.myPort.write([this.SYSEX_START, this.MB_SET_TOUCH_MODE,
      pinNum, mode,
      this.SYSEX_END]);
  }

  // Event/Update Listeners

  addFirmataEventListener(eventListenerFunction) {
    // Add a listener function to handle micro:bit DAL events.
    // The function arguments are the sourceID and eventID (both numbers).

    this.eventListeners.push(eventListenerFunction);
  }

  addFirmataUpdateListener(updateListenerFunction) {
    // Add a listener function (with no arguments) called when sensor or pin updates arrive.

    this.updateListeners.push(updateListenerFunction);
  }

  removeAllFirmataListeners() {
    // Remove all event and update listeners. Used by test suite.

    this.eventListeners = [];
    this.updateListeners = [];
  }

  // Digital and Analog Outputs

  setDigitalOutput(pinNum, turnOn) {
    // Make the given pin an output and turn it off (0 volts) or on (3.3 volts)
    // based on the boolean turnOn parameter.
    // This can be used, for example, to turn an LED on or off.

    if ((pinNum < 0) || (pinNum > 20)) return;
    this.myPort.write([this.SET_PIN_MODE, pinNum, this.DIGITAL_OUTPUT]);
    this.digitalWrite(pinNum, (turnOn ? 1 : 0));
  }

  digitalWrite(pin, value){
    if ((pin < 0) || (pin > 20)) return;
    this.myPort.write([this.SET_DIGITAL_PIN, pin, value]);
  }

  setAnalogOutput(pinNum, level) {
    // Output a simulated analog voltage level on the given pin,
    // where level (0-1023) maps to a simulated voltage of 0 to 3.3 volts.
    // Since micro:bit pins can only be on or off, the voltage level is simulated
    // using "pulse width modulation" (PWM). That is, the pin is turned and off
    // rapidly, using the level to determine what fraction of time the pin is on.
    // PWM can be used, for example, to control the brightness of an LED.

    if ((pinNum < 0) || (pinNum > 20)) return;
    this.myPort.write([this.SET_PIN_MODE, pinNum, this.PWM]);
    this.analogWrite(pinNum, level);
  }

  analogWrite(pin, value){
    if ((pin < 0) || (pin > 20)) return;
    this.myPort.write([this.SYSEX_START, this.EXTENDED_ANALOG_WRITE,
      pin, (value & 0x7F), ((value >> 7) & 0x7F),
      this.SYSEX_END]);
  }

  turnOffOutput(pinNum) {
    // Turn off either the digital or analog output of the given pin.
    // (The pin reverts to being an input pin with no pullup.)

    if ((pinNum < 0) || (pinNum > 20)) return;
    this.myPort.write([this.SET_PIN_MODE, pinNum, this.DIGITAL_INPUT]);
  }

} // end class MicrobitFirmataClient

module.exports = MicrobitFirmataClient;

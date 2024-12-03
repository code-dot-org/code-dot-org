import {MicropythonFsHex} from '@microbit/microbit-fs';
import {DAPLink} from 'dapjs';

import {
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_MICROPYTHON_V1_URL,
  MICROBIT_MICROPYTHON_V2_URL,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {MicroBitVersion} from '@cdo/apps/maker/boards/microBit/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

export const detectMicroBitVersion = (device: USBDevice) => {
  // Detect micro:bit version V1 or V2 from the first 4 digits of the micro:bit's serial number
  // Documentation at https://support.microbit.org/support/solutions/articles/19000035697-what-are-the-usb-vid-pid-numbers-for-micro-bit
  if (!device.serialNumber) {
    return;
  }
  const microBitId = device.serialNumber?.substring(0, 4);
  let microBitVersion = null;
  if (MICROBIT_IDS_V1.includes(microBitId)) {
    microBitVersion = MicroBitVersion.V1;
  } else if (MICROBIT_IDS_V2.includes(microBitId)) {
    microBitVersion = MicroBitVersion.V2;
  }
  analyticsReporter.sendEvent(EVENTS.MAKER_SETUP_PAGE_MB_VERSION_EVENT, {
    'Microbit Version': microBitVersion,
  });

  return microBitVersion;
};

export const getFirmataURLByVersion = (microBitVersion: MicroBitVersion) => {
  if (
    microBitVersion !== MicroBitVersion.V1 &&
    microBitVersion !== MicroBitVersion.V2
  ) {
    throw new Error('micro:bit version is invalid.');
  }
  return microBitVersion === MicroBitVersion.V1
    ? MICROBIT_FIRMATA_V1_URL
    : MICROBIT_FIRMATA_V2_URL;
};

/* 
Get modified .hex file that includes: 
1. An copy of the base MicroPython .hex code file,
2. A small header which marks a region as a MicroPython script (followed by the length of the script in bytes),
3. A verbatim copy of user's Python program, complete with comments and any spaces.
*/
export const getModifiedMicroPythonHexFile = async (
  pythonCode: string,
  microBitVersion: MicroBitVersion
) => {
  const microPythonUrl =
    microBitVersion === MicroBitVersion.V1
      ? MICROBIT_MICROPYTHON_V1_URL
      : MICROBIT_MICROPYTHON_V2_URL;
  const microPython = await fetch(microPythonUrl);
  const microPythonHexStr = await microPython.text();

  const commonFsSize = 20 * 1024;
  const microbitFileSystem = new MicropythonFsHex(microPythonHexStr, {
    maxFsSize: commonFsSize,
  });
  microbitFileSystem.write('main.py', pythonCode);
  return microbitFileSystem.getIntelHex();
};

export const flashHexString = async (hexString: string, target: DAPLink) => {
  // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
  const hexAsBytes = new TextEncoder().encode(hexString);
  // Push binary to board
  await target.connect();
  await target.flash(hexAsBytes);
  await target.disconnect();
};

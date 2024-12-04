import {MicropythonFsHex} from '@microbit/microbit-fs';
import {DAPLink, WebUSB} from 'dapjs';

import {
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_MICROPYTHON_V1_URL,
  MICROBIT_MICROPYTHON_V2_URL,
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
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

export const flashHexString = async (hexString: string, target: DAPLink) => {
  // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
  const hexAsBytes = new TextEncoder().encode(hexString);
  // Push binary to board
  await target.connect();
  await target.flash(hexAsBytes);
  await target.disconnect();
};

export const sendPythonCodeToMicroBit = async (pythonCode: string) => {
  const device = await navigator.usb.requestDevice({
    filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
  });
  const microBitVersion = detectMicroBitVersion(device);
  if (!microBitVersion) {
    throw new Error('micro:bit version not detected correctly.');
  }

  const transport = new WebUSB(device);
  const target = new DAPLink(transport);
  // For now, log flash progress in dev console.
  target.on(DAPLink.EVENT_PROGRESS, progress => {
    if (Math.floor(progress * 100) % 10 === 0) {
      console.log('progress percent', Math.floor(progress * 100));
    }
    if (progress === 1) {
      console.log('FLASH COMPLETE');
    }
  });
  const hexStrWithFiles = await getModifiedMicroPythonHexFile(
    pythonCode,
    microBitVersion
  );
  try {
    await flashHexString(hexStrWithFiles, target);
  } catch (error) {
    console.log(error);
    return Promise.reject('Failed to send MicroPython program to micro:bit.');
  }
};

/* 
Get modified .hex file that includes: 
1. An copy of the base MicroPython .hex code file,
2. A small header which marks a region as a MicroPython script (followed by the length of the script in bytes),
3. A verbatim copy of user's Python program, complete with comments and any spaces.
*/
const getModifiedMicroPythonHexFile = async (
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

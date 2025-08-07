import path from 'path';

import {convertBlocklyXmlToJson} from '@code-dot-org/blockly-workspace/xml';
import loadBlocklyData from '@code-dot-org/lab-blockly/parser';

import type {ArtistData, ArtistImageData} from '../types';

export const urlToKey: (url: string) => string = url => {
  const parsed = URL.parse(url);
  return `${parsed?.protocol?.replace(':', '') || 'relative'}-${parsed?.host || 'unknown'}${parsed?.pathname || ''}`;
};

/**
 * Clean up JSON and allow whitespace and JavaScript comments.
 */
export const sanitizeJSON: (data: string) => string = data =>
  data
    // Remove Windows-style newlines for convenience
    .replaceAll('\r', '')
    // Strip out line comments
    .split('\n')
    .filter(line => !line.match(/^\s*\/\//))
    .join('\n')
    // Remove whitespace
    .trim();

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}, xml?: Document, parser?: DOMParser): ArtistData {
  const parseXml = (root: HTMLElement | undefined) =>
    root?.querySelector('xml > *') ? root?.innerHTML?.trim() : undefined;

  const convert = (xmlString?: string) =>
    (xmlString && parser) ? convertBlocklyXmlToJson(parser, xmlString) : undefined;

  let x = 200;
  try {
    x = parseInt(config.properties?.x || '200');
  } catch (_) {
    // Just ignore failures to parse this value
  }

  let y = 200;
  try {
    y = parseInt(config.properties?.y || '200');
  } catch (_) {
    // Just ignore failures to parse this value
  }

  let startDirection = 0;
  try {
    startDirection = parseInt(config.properties?.start_direction || '0');
  } catch (_) {
    // Just ignore failures to parse this value
  }

  return {
    ...loadBlocklyData(config, xml, parser),
    skinId: config.properties?.skin || 'artist',
    initialX: x,
    initialY: y,
    startDirection,
    predrawBlocks: xml ? convert(
      parseXml(
        xml.querySelector('blocks > predraw_blocks > xml')?.parentNode as
          | HTMLElement
          | undefined,
      ),
    ) : undefined,
    images: (
      JSON.parse(
        sanitizeJSON(config.properties?.images || '[]'),
      ) as ArtistImageData[]
    ).map(info => ({
      ...info,
      local: info.filename.startsWith('http')
        ? path.join('artist', urlToKey(info.filename))
        : undefined,
    })),
  };
}

export default load;

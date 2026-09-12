/**
 * One-time conversion script: reads all TS data files and writes JSON.
 * Run via: node scripts/convert-to-json.mjs
 */
import {pythonLabLevelData} from '../src/pythonLabLevelData';
import {pythonLabStudioData} from '../src/pythonLabStudioData';
import {pythonLabStudentMessages} from '../src/pythonLabStudentMessages';
import {pythonLabEvalData} from '../src/pythonLabEvalData';
import {VIDEO_FILE_DATA} from '../src/aiTutorTestTypes';
import {writeFileSync, mkdirSync} from 'fs';

mkdirSync('data', {recursive: true});

// Merge student messages into studio data entries
const studioData: Record<string, object> = {};
for (const [key, entry] of Object.entries(pythonLabStudioData)) {
  const msgs = (pythonLabStudentMessages as Record<string, object>)[key];
  studioData[key] = msgs ? {...entry, ...msgs} : {...entry};
}

writeFileSync('data/levels.json', JSON.stringify(pythonLabLevelData, null, 2));
writeFileSync('data/studioData.json', JSON.stringify(studioData, null, 2));
writeFileSync('data/evalData.json', JSON.stringify(pythonLabEvalData, null, 2));
writeFileSync('data/videoFiles.json', JSON.stringify(VIDEO_FILE_DATA, null, 2));

console.log('Exported: levels, studioData (messages merged), evalData, videoFiles');

// ScreenAnalyticsOverlay -- viewport-fit diagnostic overlay.
//
// Enabled by `?show-screen-analytics=true`.  Reports the fraction of sampled
// users whose innerWidth and innerHeight are both <= the current window's.
// Three samples are bundled, one per age band (K-5, 6-8, 9-12); 6-8 default.
// Each sample is a Statsig export from 2026-02-23..2026-03-15, summed across
// days -- the distribution of sizes is what matters, not the date.

import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';

import moduleStyles from './ScreenAnalyticsOverlay.module.scss';

type DatasetId = 'k5' | '68' | '912';
type Sample = ReadonlyArray<readonly [number, number, number]>;

// rows are [width, height, users].
const DATASETS: ReadonlyArray<{
  id: DatasetId;
  label: string;
  sample: Sample;
}> = [
  {
    id: 'k5',
    label: 'K-5',
    sample: [
      [1366, 599, 16488],
      [1920, 911, 7994],
      [1366, 647, 7835],
      [1366, 768, 6450],
      [1366, 633, 6382],
      [1920, 945, 6122],
      [1517, 684, 3461],
      [1920, 953, 3141],
      [1912, 948, 2832],
      [1920, 919, 2469],
      [1366, 641, 2260],
      [1366, 681, 2252],
      [1536, 730, 2193],
      [1318, 647, 2047],
      [1517, 731, 2004],
      [1912, 956, 1923],
      [1180, 692, 1789],
      [1080, 682, 1729],
      [1517, 852, 1456],
      [1300, 561, 1386],
      [1920, 893, 1146],
      [1358, 636, 1140],
      [1400, 821, 1020],
      [1358, 602, 1017],
      [1300, 609, 1007],
      [1400, 939, 964],
      [1536, 695, 955],
      [1280, 585, 953],
      [1400, 884, 936],
      [1600, 765, 935],
      [1080, 724, 892],
      [1517, 717, 861],
      [1600, 731, 821],
      [1300, 731, 801],
      [1920, 859, 749],
      [1366, 607, 747],
      [1097, 516, 730],
      [1469, 731, 695],
      [1528, 732, 690],
      [1080, 707, 679],
      [1272, 588, 627],
      [1180, 734, 579],
      [1280, 631, 557],
      [1912, 914, 556],
      [1280, 665, 555],
      [1138, 537, 550],
      [1272, 668, 516],
      [1280, 680, 508],
      [1400, 959, 483],
      [1318, 681, 479],
    ],
  },
  {
    id: '68',
    label: '6-8',
    sample: [
      [1366, 599, 2270],
      [1920, 911, 1390],
      [1366, 647, 1120],
      [1366, 633, 1044],
      [1366, 768, 595],
      [1920, 945, 556],
      [1517, 684, 415],
      [1358, 636, 370],
      [1366, 681, 310],
      [1318, 647, 289],
      [1517, 731, 282],
      [1280, 551, 269],
      [1440, 731, 243],
      [1920, 919, 224],
      [1912, 948, 200],
      [1517, 852, 180],
      [1300, 561, 178],
      [1517, 717, 170],
      [1920, 893, 155],
      [1920, 953, 152],
      [1280, 631, 152],
      [1920, 958, 144],
      [1440, 778, 135],
      [1920, 859, 128],
      [1180, 692, 118],
      [1300, 609, 111],
      [2240, 1172, 95],
      [1318, 636, 95],
      [1920, 867, 93],
      [1517, 765, 91],
      [1318, 681, 91],
      [1469, 731, 89],
      [1358, 602, 82],
      [1912, 914, 76],
      [1263, 620, 74],
      [2240, 1138, 71],
      [1600, 731, 71],
      [1241, 529, 71],
      [1300, 731, 70],
      [1536, 695, 64],
      [1680, 871, 63],
      [1300, 596, 63],
      [1440, 812, 56],
      [1272, 588, 55],
      [1920, 959, 51],
      [2560, 1271, 48],
      [1707, 748, 48],
      [1528, 698, 48],
      [1300, 643, 47],
      [1680, 923, 45],
    ],
  },
  {
    id: '912',
    label: '9-12',
    sample: [
      [1366, 599, 1600],
      [1920, 911, 1001],
      [1366, 647, 591],
      [1366, 633, 393],
      [1920, 945, 330],
      [1440, 731, 273],
      [1440, 778, 242],
      [1308, 634, 212],
      [1366, 768, 201],
      [1912, 948, 187],
      [1517, 684, 179],
      [1358, 602, 178],
      [1280, 631, 167],
      [1366, 681, 150],
      [1920, 919, 147],
      [1920, 859, 136],
      [1318, 647, 125],
      [1517, 731, 114],
      [1517, 665, 108],
      [1358, 636, 106],
      [1536, 695, 84],
      [1600, 765, 82],
      [1536, 791, 79],
      [1920, 893, 76],
      [1912, 914, 72],
      [1536, 960, 72],
      [1600, 731, 71],
      [1300, 609, 71],
      [1272, 634, 71],
      [1280, 551, 67],
      [1536, 730, 63],
      [1300, 561, 62],
      [1920, 953, 60],
      [1440, 812, 59],
      [2560, 1271, 57],
      [1272, 668, 57],
      [1180, 692, 57],
      [1366, 641, 55],
      [1707, 748, 53],
      [1536, 826, 52],
      [1280, 665, 52],
      [1358, 600, 50],
      [1272, 588, 50],
      [1470, 833, 46],
      [1470, 797, 46],
      [1528, 732, 45],
      [2133, 1012, 44],
      [1241, 529, 41],
      [1440, 820, 39],
      [1821, 798, 38],
    ],
  },
] as const;

const DEFAULT_DATASET: DatasetId = '68';

function totalUsers(sample: Sample): number {
  return sample.reduce((s, [, , n]) => s + n, 0);
}

function fitCount(sample: Sample, width: number, height: number): number {
  let n = 0;
  for (const [w, h, count] of sample) {
    if (w <= width && h <= height) n += count;
  }
  return n;
}

function isEnabled(): boolean {
  return queryParams('show-screen-analytics') === 'true';
}

const ScreenAnalyticsOverlay: React.FC = () => {
  const [enabled] = useState(isEnabled);
  const [datasetId, setDatasetId] = useState<DatasetId>(DEFAULT_DATASET);
  const [size, setSize] = useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    if (!enabled) return;
    const onResize = () =>
      setSize({w: window.innerWidth, h: window.innerHeight});
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled]);

  if (!enabled) return null;

  const dataset = DATASETS.find(d => d.id === datasetId) ?? DATASETS[1];
  const total = totalUsers(dataset.sample);
  const fits = fitCount(dataset.sample, size.w, size.h);
  const pct = (100 * fits) / total;

  return (
    <div className={moduleStyles.overlay} data-theme="Dark" aria-hidden="true">
      <div className={moduleStyles.toggles}>
        <SegmentedButtons
          color="strong"
          size="xs"
          selectedButtonValue={datasetId}
          onChange={value => setDatasetId(value as DatasetId)}
          buttons={DATASETS.map(d => ({label: d.label, value: d.id}))}
        />
      </div>
      <Typography variant="h4">{pct.toFixed(1)}% fit</Typography>
      <Typography variant="body4">
        {size.w} &times; {size.h}
      </Typography>
    </div>
  );
};

export default ScreenAnalyticsOverlay;

import {z} from 'zod';

import {
  ImageAttributionLicenseVersions,
  ImageAttributionSchema,
  InstrumentSchema,
  LibraryJsonSchema,
  SoundFolderSchema,
  KitSchema,
  PackSchema,
  SoundSchema,
  SoundTypes,
} from './music.schemata';

export type ImageAttributionLicenseVersion =
  (typeof ImageAttributionLicenseVersions)[number];
export type ImageAttribution = z.infer<typeof ImageAttributionSchema>;
export type SoundFolder = z.infer<typeof SoundFolderSchema>;
export type Kit = z.infer<typeof KitSchema>;
export type LibraryJson = z.infer<typeof LibraryJsonSchema>;
export type Pack = z.infer<typeof PackSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type Sound = z.infer<typeof SoundSchema>;
export type SoundType = (typeof SoundTypes)[number];

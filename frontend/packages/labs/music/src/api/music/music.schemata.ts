import {z} from 'zod';

export const SoundTypes = ['preview', 'beat', 'bass', 'lead', 'fx', 'vocal'];

export const SoundSchema = z.object({
  name: z.string(),
  src: z.string(),
  path: z.string().optional(),
  length: z.number(),
  note: z.number().optional(),
  restricted: z.boolean().optional(),
  skipLocalization: z.boolean().optional(),
  bpm: z.number().optional(),
  key: z.number().optional(),
  type: z.enum(SoundTypes),
});

// A Creative Commons (2, 3, or 4) or regular copyright license.
export const ImageAttributionLicenseVersions = [
  'CC2',
  'CC3',
  'CC4',
  'C',
] as const;

export const ImageAttributionSchema = z.object({
  author: z.string(),
  licenseVersion: z.enum(ImageAttributionLicenseVersions),
  year: z.string().optional(),
  src: z.string().optional(),
  position: z.enum(['left', 'right']).optional(),
  color: z.string().optional(),
});

export const SoundFolderSchema = z.object({
  name: z.string(),
  artist: z.string().optional(),
  id: z.string(),
  path: z.string(),
  imageSrc: z.string().optional(),
  restricted: z.boolean().optional(),
  skipLocalization: z.boolean().optional(),
  bpm: z.number().optional(),
  key: z.number().optional(),
  imageAttribution: ImageAttributionSchema.optional(),
  sounds: z.array(SoundSchema),
});

export const PackSchema = SoundFolderSchema;

export const InstrumentSoundSchema = z.object({
  name: z.string(),
  src: z.string(),
  note: z.number(),
});

export const InstrumentSchema = SoundFolderSchema.extend({
  sounds: z.array(InstrumentSoundSchema),
});

export const KitSoundSchema = z.object({
  name: z.string(),
  src: z.string(),
  length: z.number(),
  note: z.number().optional(),
});

export const KitSchema = SoundFolderSchema.extend({
  sounds: z.array(KitSoundSchema),
});

export const LibraryJsonSchema = z.object({
  id: z.string(),
  path: z.string(),
  imageSrc: z.string().optional(),
  bpm: z.number().optional(),
  key: z.number().optional(),
  defaultSound: z.string().optional(),
  extraCredit: z.string().optional(),
  instruments: z.array(InstrumentSchema),
  kits: z.array(KitSchema),
  packs: z.array(PackSchema),
});

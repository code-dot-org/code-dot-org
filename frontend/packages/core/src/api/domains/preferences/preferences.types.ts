import {z} from 'zod';

import {
  ConsoleFontSizeSchema,
  DisplayThemeSchema,
  EditorFontSizeSchema,
  FontSizes,
  HasDismissedPersonalizationAlertSchema,
  MuteMusicSchema,
  UserThemeSettingsSchema,
  UsingTextModeSchema,
} from './preferences.schemata';

export type ConsoleFontSize = z.infer<typeof ConsoleFontSizeSchema>;
export type DisplayTheme = z.infer<typeof DisplayThemeSchema>;
export type EditorFontSize = z.infer<typeof EditorFontSizeSchema>;
export type FontSize = keyof typeof FontSizes;
export type HasDismissedPersonalizationAlert = z.infer<
  typeof HasDismissedPersonalizationAlertSchema
>;
export type MuteMusic = z.infer<typeof MuteMusicSchema>;
export type UserThemeSettings = z.infer<typeof UserThemeSettingsSchema>;
export type UsingTextMode = z.infer<typeof UsingTextModeSchema>;

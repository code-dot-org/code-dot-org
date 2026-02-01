import {z} from 'zod';

export const UsingTextModeSchema = z.object({
  using_text_mode: z.boolean(),
});

export const MuteMusicSchema = z.object({
  mute_music: z.boolean(),
});

export const DisplayThemeSchema = z.object({
  display_theme: z.string(),
});

export const HasDismissedPersonalizationAlertSchema = z.object({
  has_dismissed_personalization_alert: z.boolean(),
});

export const FontSizes = {
  Tiny: 10,
  Small: 13, // Default font size
  Medium: 17,
  Large: 22,
  Huge: 27,
};

export const ConsoleFontSizeSchema = z.object({
  console_font_size: z.record(z.string(), z.enum(Object.keys(FontSizes))),
});

export const EditorFontSizeSchema = z.object({
  editor_font_size: z.record(z.string(), z.enum(Object.keys(FontSizes))),
});

export const UserThemeSettingsSchema = z.record(z.string(), z.string());

export enum IconColor {
  Gray = 'Gray',
  Purple = 'Purple',
  Blue = 'Blue',
  Aqua = 'Aqua',
  Green = 'Green',
  Red = 'Red',
  Orange = 'Orange',
}

interface AiPrompt {
  text: string;
  prompt: string;
}

interface HrefLink {
  text: string;
  url: string;
}

export interface AiDiffNotification {
  id: string;
  externalId: string;
  title: string;
  description: string;
  readAt: Date | null;
  iconName: string;
  iconColor: IconColor;
  publishedAt: Date;
  aiPrompts: AiPrompt[];
  hrefLinks: HrefLink[];
}

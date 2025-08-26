export enum IconColor {
  Gray = 'Gray',
  Purple = 'Purple',
  Blue = 'Blue',
  Aqua = 'Aqua',
  Green = 'Green',
  Red = 'Red',
  Orange = 'Orange',
}

export interface AiDiffNotification {
  id: string;
  title: string;
  description: string;
  readAt: Date | null;
  iconName: string;
  iconColor: IconColor;
  publishedAt: Date;
}

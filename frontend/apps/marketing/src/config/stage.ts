export type Stage = 'development' | 'test' | 'production';

export function getStage(): Stage {
  switch (process.env.STAGE) {
    case 'development':
    case 'test':
    case 'production':
      return process.env.STAGE;
    default:
      return 'development';
  }
}

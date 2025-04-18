export type Stage = 'development' | 'pr' | 'test' | 'production';

export function getStage(): Stage {
  switch (process.env.STAGE) {
    case 'development':
    case 'test':
    case 'production':
    case 'pr':
      return process.env.STAGE;
    default:
      return 'development';
  }
}

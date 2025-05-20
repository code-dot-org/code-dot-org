import {getEnv} from '@/providers/environment';

export type Stage = 'development' | 'pr' | 'test' | 'production';

export function getStage(): Stage {
  const stage = getEnv('NEXT_PUBLIC_STAGE') as Stage;

  switch (stage) {
    case 'development':
    case 'test':
    case 'production':
    case 'pr':
      return stage;
    default:
      return 'development';
  }
}

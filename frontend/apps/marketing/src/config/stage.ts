import {getEnv} from '@/providers/environment';

export type Stage = 'development' | 'pr' | 'test' | 'production';

function getStageFromEnv(): Stage | undefined {
  const stage = getEnv('NEXT_PUBLIC_STAGE') as Stage;

  switch (stage) {
    case 'development':
    case 'test':
    case 'production':
    case 'pr':
      return stage;
    default:
      return undefined;
  }
}

function getStageFromDomain(): Stage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const host = window.location.host;

  switch (host) {
    case 'code.org':
    case 'code.marketing-sites.code.org':
      return 'production';
    case 'test.code.org':
    case 'code.marketing-sites.dev-code.org':
      return 'test';
    default:
      return 'test';
  }
}

export function getStage(): Stage {
  return getStageFromEnv() ?? getStageFromDomain() ?? 'development';
}

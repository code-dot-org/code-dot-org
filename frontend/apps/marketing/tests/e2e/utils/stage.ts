export function getTestStage() {
  const stage = process.env.STAGE;

  switch (stage) {
    case 'development':
      return 'development';
    case 'pr':
      return 'pr';
    case 'test':
      return 'test';
    case 'production':
      return 'production';
    default:
      throw new Error(`Invalid stage: ${stage}`);
  }
}

export function getAppStageFromTestStage() {
  const stage = process.env.STAGE;

  switch (stage) {
    case 'pr':
    case 'localhost':
      return 'development';
    case 'test':
      return 'test';
    case 'production':
      return 'production';
    default:
      throw new Error(`Invalid stage: ${stage}`);
  }
}

export function isDeployedStage() {
  return getAppStageFromTestStage() !== 'development';
}

import type {ValidationResult} from '@code-dot-org/progress';

export function getStatusForResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
    case 'EXPECTED_FAILURE':
      return 'passed';
    case 'FAIL':
    case 'UNEXPECTED_SUCCESS':
      return 'failed';
    case 'SKIP':
      return 'caution';
    case 'PENDING':
      return 'pending';
    default:
    case 'ERROR':
      return 'error';
  }
}

export function getTranslatedResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
      return 'Pass';
    case 'FAIL':
      return 'Fail';
    case 'SKIP':
      return 'Skip';
    case 'EXPECTED_FAILURE':
      return 'Expected failure';
    case 'UNEXPECTED_SUCCESS':
      return 'Unexpected success';
    case 'PENDING':
      return '';
    default:
    case 'ERROR':
      return 'Error';
  }
}

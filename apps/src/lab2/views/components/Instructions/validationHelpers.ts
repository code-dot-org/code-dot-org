import lab2I18n from '@cdo/apps/lab2/locale';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

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
    case 'ERROR':
      return 'error';
    case 'PENDING':
      return 'pending';
  }
}

export function getTranslatedResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
      return lab2I18n.pass();
    case 'FAIL':
      return lab2I18n.fail();
    case 'SKIP':
      return lab2I18n.skip();
    case 'EXPECTED_FAILURE':
      return lab2I18n.expectedFailure();
    case 'UNEXPECTED_SUCCESS':
      return lab2I18n.unexpectedSuccess();
    case 'ERROR':
      return lab2I18n.error();
    case 'PENDING':
      return '';
  }
}

import unittest
from .validation_runner import ValidationTestResult

def run_validation_tests(file_pattern):
  """
  Run the tests matching the given file pattern and display the results to the user.
  Validation tests use the ValidationTestResult class to display only the short description of the test.

  Args:
    file_pattern (str): A glob pattern to match test files.

  Returns:
      List[Dict[str, str]]: A simplified list of test results with each entry containing:
          - 'name': The name of the test.
          - 'result': The outcome, which is one of the following:
            'PASS', 'FAIL', 'ERROR', 'SKIP', 'EXPECTED_FAILURE', 'UNEXPECTED_SUCCESS'.
  """
  result = run_tests(file_pattern, ValidationTestResult)
  return result.simplified_results


def run_student_tests(file_pattern):
  """
  Run the tests in the given file pattern and display the results to the user.
  Student tests use the standard TextTestResult class to display the test name and short description.
  
  Args:
    file_pattern (str): A glob pattern to match test files.
  """
  run_tests(file_pattern, unittest.TextTestResult)

def run_tests(file_pattern, resultclass):
  loader = unittest.TestLoader()
  test_suite = loader.discover('.', file_pattern)
  runner = unittest.TextTestRunner(verbosity=2, resultclass=resultclass)
  return runner.run(test_suite)


from unittest import TextTestResult

class ValidationTestResult(TextTestResult):
  def __init__(self, stream, descriptions, verbosity):
    super(ValidationTestResult, self).__init__(stream, descriptions, verbosity)
    self.simplified_results = []

  # The default behavior is to display the test name and short description.
  # We want to display only the short description if it exists, otherwise just the test name.
  # Students don't see the tests, so we don't need to display the test name.
  # See this PR for details: https://github.com/code-dot-org/pythonlab-packages/pull/3
  def getDescription(self, test):
    doc_first_line = test.shortDescription()
    if doc_first_line:
      return doc_first_line
    else:
      return str(test)

  def addSuccess(self, test):
      super(ValidationTestResult, self).addSuccess(test)
      self.simplified_results.append({'name': self.getDescription(test), 'result': "PASS"})

  def addError(self, test, err):
      self.errors.append(test, self.parseError(err))
      self.write_status(test, "ERROR", "E")
      self.simplified_results.append({'name': self.getDescription(test), 'result': "ERROR"})

  def addFailure(self, test, err):
      self.failures.append(test, self.parseError(err))
      self.write_status(test, "FAILURE", "F")
      self.simplified_results.append({'name': self.getDescription(test), 'result': "FAIL"})

  def addSkip(self, test, reason):
      super(ValidationTestResult, self).addSkip(test, reason)
      self.simplified_results.append({'name': self.getDescription(test), 'result': "SKIP"})

  def addExpectedFailure(self, test, err):
      self.expectedFailures.append(test, self.parseError(err))
      self.write_status(test, "expected failure", "x")
      self.simplified_results.append({'name': self.getDescription(test), 'result': "EXPECTED_FAILURE"})

  def addUnexpectedSuccess(self, test):
      super(ValidationTestResult, self).addUnexpectedSuccess(test)
      self.simplified_results.append({'name': self.getDescription(test), 'result': "UNEXPECTED_SUCCESS"})

  def parseError(self, err):
     exception_type, value, traceback = err
     return value
  
  def write_status(self, test, status_long, status_short):
    if self.showAll:
      self._write_status(test, status_long)
    elif self.dots:
      self.stream.write(status_short)
      self.stream.flush()
export function runValidationTests(validationFileName: string) {
  return `
from unittest_runner import run_validation_tests
run_validation_tests('${validationFileName}')
`;
}

// Find all tests in the project and run them. The test files need to follow the filePattern regex.
// The tests need to be in the top-level folder or in a folder with an
// __init__.py file (the file can be empty). An init file signifies that the folder is a module.
export function runStudentTests() {
  return `
from unittest_runner import run_student_tests
run_student_tests('test*.py')
`;
}

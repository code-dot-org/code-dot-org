// Find all tests in the project and run them. The test files need to follow the filePattern regex.
// The tests need to be in the top-level folder or in a folder with an
// __init__.py file (the file can be empty). An init file signifies that the folder is a module.
export function getTestRunnerScript(filePattern = 'test*.py') {
  return `
import unittest

def discover_and_run(start_dir, pattern):
    loader = unittest.TestLoader()
    test_suite = loader.discover(start_dir, pattern)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)

discover_and_run('.', '${filePattern}')
`;
}

// Find all tests in the project and run them. The tests need to be in the top-level folder,
// or in a folder with an __init__.py file (the file can be empty). An init file signifies that
// the folder is a module.
// In order to restrict to find tests in a specific folder or file we can parameterize this
// and update the start_dir and/or pattern.
export const FIND_AND_RUN_ALL_TESTS = `
import unittest

def discover_and_run(start_dir = '.', pattern = 'test*.py'):
    loader = unittest.TestLoader()
    test_suite = loader.discover(start_dir, pattern)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    return result

discover_and_run()
`;

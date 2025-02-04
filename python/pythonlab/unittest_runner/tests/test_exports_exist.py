from unittest_runner.run_tests import run_student_tests as run_student_tests
from unittest_runner.run_tests import run_validation_tests as run_validation_tests

# Placeholder no-op test: just ensure the expected exports exist from unittest_runner package
def test_exports_exist():
    assert callable(run_student_tests)
    assert callable(run_validation_tests)

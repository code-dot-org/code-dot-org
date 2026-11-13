# Ruby unit tests

Before adding or changing Ruby unit tests, read
[Writing Unit Tests](../../STYLEGUIDE.md#writing-unit-tests).

- Use Minitest spec syntax for new and refactored tests.
  Older neighboring tests do not override this recommendation.
- Group methods with `describe '#instance_method'` or
  `describe '.class_method'`; express behaviors with `it`.
- Use `context` descriptions beginning with “when”, “with”,
  or “without” for different conditions.
- Use `let` for memoized values, `before` for setup, and
  `subject` for the operation under test.
- Prefer `must_*` expectations over `assert_*` or `expect`.
- Mixed syntax is allowed in existing files. Keep unrelated
  tests unchanged.

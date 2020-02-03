---
title: <%= (1..3).to_a.join(',').inspect %>
theme: with_title
---

# Test No ERB in YAML

This template is intended to test that the ERB syntax in the YAML header above
will NOT be parsed as actual embedded ruby, but simply as plain text.

See `RouterTest.test_no_erb_in_yaml` for more details.

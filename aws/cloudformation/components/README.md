# /components

This directory contains partial-template chunks that can be included in a CloudFormation template via `StackTemplate#component` within an ERB snippet (e.g., `<%=component 'my_component' [...] %>`). This provides a lightweight layer of organization to large templates without depending on CloudFormation Nested Stacks or other heavier constructs.
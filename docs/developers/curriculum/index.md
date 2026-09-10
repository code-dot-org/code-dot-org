---
title: Curriculum authoring and pipeline
description: Internal documentation for the Levelbuilder authoring tool and the curriculum data pipeline.
type: concept
---

Levelbuilder is the internal curriculum authoring tool for CodeAI. Curriculum
authors use it to create and edit courses, units, lessons, and levels. The
content they produce is serialized to flat files under `dashboard/config/`,
committed to the `levelbuilder` branch, and seeded into every other environment
on its way to production.

This section covers the authoring tool, the data model behind it, and the
pipeline that moves content from Levelbuilder to production. It does not cover
how to build a new lab (see [Labs and the learning experience](/developers/labs/))
or how teachers assign courses to students (see the curriculum-and-assignment
docs in the teachers section).

**Applies to:** curriculum authors (Levelbuilder permission holders) and
engineers who maintain the curriculum pipeline.

## Pages

- [Levelbuilder environment](/developers/curriculum/levelbuilder-environment/) --
  what Levelbuilder is, how to get access, and how environments differ.
- [Curriculum authoring](/developers/curriculum/curriculum-authoring/) --
  the object hierarchy authors edit, the editors available, and the publishing
  lifecycle.
- [Curriculum pipeline](/developers/curriculum/curriculum-pipeline/) --
  how authored content is serialized, committed, merged, and seeded into
  downstream environments.
- [Data model and seeding](/developers/curriculum/data-model-and-seeding/) --
  the ActiveRecord models, their table-name surprises, seed tasks, deprecated
  levels, the test-only config tree, legacy surfaces, and common failure modes.

## Related

- [Labs and the learning experience](/developers/labs/) -- runtime lab
  framework and how to add a lab.
- `docs/update-levelbuilder.md` (legacy) -- older instructions for updating
  the Levelbuilder server. Troubleshooting advice there is reconciled into
  [Data model and seeding](/developers/curriculum/data-model-and-seeding/).

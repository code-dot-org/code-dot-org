# Lesson plan generation

Lesson plan PDFs are generated from certain folders.

## Adding a new lesson plan PDF

1. Create a new folder for the lesson plan
  1. Currently must be a number, e.g. `1` or `15`
1. Add the `title` of the course to a file `info.yml`
1. (optional) Add any extra styles to `morestyle.css`
1. Create a file with the extension `.md`. Lesson plans are currently all named `Teacher.md`

## Dropbox integration

There are three different Dropbox shares named `curriculum-course1`, `curriculum-course2` and `curriculum-course3`, which sync to the corresponding folders in `/pegasus/sites/virtual`.

For Dropbox folder access, ask Brendan or anyone with Dropbox `Pegasus Staging` account access.

## Adding functionality

See `/pegasus/src/course.rb` and `/pegasus/sites/virtual/generate_curriculum_pdfs.rake` for some of the PDF generation logic.

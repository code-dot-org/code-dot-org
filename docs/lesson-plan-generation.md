# Lesson plan generation

On the staging.code.org server, lesson plan PDFs are generated from certain folders.

The typical build cycle is:

1. A change to a .md or .collate file is made via Dropbox and detected on staging
2. A PDF is generated from that file
3. The original PDF is moved to S3, and a `.fetch` file is put in its place, pointing to the uploaded copy

# Create PDFs with curriculum folder `.md` files

## Adding a new lesson plan PDF

1. Create a new folder for the lesson plan
  1. Currently must be a number, e.g. `1` or `15`
1. Add the `title` of the course to a file `info.yml`
1. (optional) Add any extra styles to `morestyle.css`
1. Create a file with the extension `.md`. Lesson plans are currently all named `Teacher.md`

# Join PDFs with `.collate` files

`.collate` files contain a list of either: (1) relative paths to PDFs or (2) URLs to remote PDFs.

On staging, a cron task joins the PDFs in these `.collate` files together and places them where the `.collate` file is (same filename, minus the `.collate` extension).

# Numbering PDFs with `numbers` option

Page numbers can be applied to `.collate`-generated PDFs.

At the top of the `.collate` file, add YAML front matter with the following variable set:

```
---
numbers: true
---

# My normal content

```

# Dropbox integration

There are different Dropbox shares named `curriculum-course*` and `curriculum-docs` which sync to the corresponding folders in `/pegasus/sites/virtual`.

For Dropbox folder access, ask Brendan or anyone with Dropbox `Pegasus Staging` account access.

## Adding functionality

`/pegasus/src/course.rb` and `/pegasus/sites/virtual/generate_curriculum_pdfs.rake` are good starting points for some of the PDF generation logic.

# Running on OS X

The staging build server setup script automatically installs the dependencies required.

For OS X, to test curriculum PDF generation, an extra package is needed:

* Install pdftk
  `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb`

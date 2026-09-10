# projects-and-sharing: domain report

## Pages

### Students (12 pages)

| Path | Type | Grade |
|---|---|---|
| `docs/students/projects/find-your-projects.md` | task | VERIFIED |
| `docs/students/projects/start-a-new-project.md` | task | VERIFIED |
| `docs/students/projects/share-your-project.md` | task | VERIFIED |
| `docs/students/projects/can-i-share-this.md` | reference | STRONGLY_SUPPORTED |
| `docs/students/projects/remix-a-project.md` | task | VERIFIED |
| `docs/students/projects/browse-the-public-gallery.md` | task | VERIFIED |
| `docs/students/projects/publish-to-the-gallery.md` | task | STRONGLY_SUPPORTED |
| `docs/students/projects/restore-an-earlier-version.md` | task | STRONGLY_SUPPORTED |
| `docs/students/projects/report-a-project.md` | task | STRONGLY_SUPPORTED |
| `docs/students/projects/store-data-in-your-app.md` | concept | STRONGLY_SUPPORTED |
| `docs/students/projects/use-a-code-library.md` | task | STRONGLY_SUPPORTED |
| `docs/students/projects/use-the-backpack.md` | task | STRONGLY_SUPPORTED |

### Teachers (3 pages)

| Path | Type | Grade |
|---|---|---|
| `docs/teachers/projects/see-student-projects.md` | task | VERIFIED |
| `docs/teachers/projects/manage-sharing-for-your-class.md` | concept | STRONGLY_SUPPORTED |
| `docs/teachers/projects/share-a-library-with-your-class.md` | task | STRONGLY_SUPPORTED |

### Developers (4 pages)

| Path | Type | Grade |
|---|---|---|
| `docs/developers/projects/project-storage.md` | concept | STRONGLY_SUPPORTED |
| `docs/developers/projects/sharing-and-abuse.md` | reference | STRONGLY_SUPPORTED |
| `docs/developers/projects/publishability-tiers.md` | reference | STRONGLY_SUPPORTED |
| `docs/developers/projects/sandboxed-preview-domain.md` | concept | STRONGLY_SUPPORTED |

## Journeys

Spec: `frontend/packages/e2e-tests/docs-journeys/projects-and-sharing.spec.ts`

| Test | Result |
|---|---|
| student project list loads | PASS |
| student creates dance project and opens share dialog | PASS |
| shared project shows remix button | PASS |
| under-13 student cannot share open-ended project | PASS |
| public gallery loads | PASS |
| teacher sees student projects tab | PASS |

## Screenshots (4)

| Image | Earns its place because |
|---|---|
| `find-your-projects-project-list.png` | Shows the full projects page layout; reader recognizes where to find their projects |
| `share-your-project-share-dialog.png` | Crop of share dialog showing Copy link and Send to phone buttons |
| `remix-a-project-remix-button.png` | Crop of Remix button on a shared project |
| `browse-the-public-gallery-gallery.png` | Gallery page layout with project type categories |

## UI labels observed

- Page heading: "Projects" (not "My Projects")
- Header nav link: "Projects"
- Header button: "New project +"
- Share dialog title: "Share your project"
- Copy button: "Copy link to project"
- Send to phone: "Send to phone"
- Under-13 warning: "Ask your teacher before sharing. Only share with others in your school."
- Sharing disabled: "Sharing is disabled"
- Publish: "Publish to Public Gallery"
- Unpublish: "Unpublish"
- Remix: "Remix"
- Version history: "Version History"
- Report abuse: "Report abuse"
- View full list: "View full list"

## Contradictions

- `docs/how-sharing-and-feedback-work.md` has a dead Gliffy diagram link
  (`http://www.gliffy.com/go/publish/image/6229079/L.png`). Noted but not fixed
  (legacy file, not in scope).
- `docs/projects-data-model.md` describes an early design. The JSON blob structure
  still holds conceptually, but the actual backing store is S3, not the original
  "AppsAPI" app JSON. The doc mentions SOLR for filtering; current code uses SQL.

## Questions for Fable

1. The header nav says "Projects" but the page heading also says "Projects". The
   student's "My projects" moment may warrant a different page title than the
   heading -- or the heading may change. Record for terminology reconciliation.
2. Library manager and backpack UI steps are inferred from code, not walked in
   browser. These pages are graded STRONGLY_SUPPORTED, not VERIFIED. A future
   journey that opens App Lab and interacts with the library manager would upgrade
   them.
3. Share filtering (WebPurify) and abuse reporting (Zendesk) cannot be tested
   locally. Marked BLOCKED in evidence where relevant.

## Assumed cross-domain link paths

- `/students/labs/` prefix for lab workspace pages (labs owner)
- `/students/progress/see-your-progress/` (classrooms owner)
- `/students/account/` prefix (accounts owner)
- `/teachers/classes/edit-section-settings/` (classrooms owner)
- `/teachers/classes/` prefix (classrooms owner)

## Inventory coverage

All 23 slice items documented. `project-thumbnails-and-images` folded into
`share-your-project.md` and `sharing-and-abuse.md`. `content-proxies` covered in
`sharing-and-abuse.md` proxy table. `project-image-upload-warning` covered in
`can-i-share-this.md` uploaded-images section.

# projects-and-sharing: page plan

## Blocking questions

1. **UI label: "My Projects" vs "My projects".** The header menu says
   "My Projects" (title case) but the page heading may differ. Will verify
   in browser. Use whatever the UI shows.
2. **"Section" vs "class" in teacher project views.** The teacher dashboard
   tab is labeled "Student Projects"; the data comes from sections. Will
   verify the tab label in browser and use it.
3. **Under-13 sharing gate behavior locally.** The `createStudent` helper
   defaults to age 16; passing `age: '10'` should produce an under-13
   account with `sharing_disabled = true`. Needs verification.
4. **Libraries and backpack UI.** These features live inside the App Lab
   IDE. Documenting the full workflow requires an App Lab project with code;
   screenshots may be BLOCKED if the lab does not load locally.

## Terminology observed

| Concept | UI label | Source |
|---|---|---|
| Share dialog title | "Share your project" | i18n `shareTitle` |
| Share button | **Share** | `.project_share` selector |
| Copy link | "Copy link to project" | i18n `copyLinkToProject` |
| Publish | "Publish to Public Gallery" | i18n `publishToPublicGallery` |
| Unpublish | "Unpublish" | i18n `unpublish` |
| Remix | "Remix" | i18n `remix` |
| Version history | "Version History" | i18n `showVersionsHeader` |
| Under-13 warning | "Ask your teacher before sharing." | i18n `shareU13Warning` |
| Report abuse | "Report abuse" | `report_abuse` route, Cucumber |
| Project list page | `/projects` | projects_controller index |
| Public gallery | `/projects/public` | projects_controller public |

## Pages

### Students (`docs/students/projects/`)

| Path | Type | Question it answers | Inventory ids | Screenshot |
|---|---|---|---|---|
| `find-your-projects.md` | task | Where are all my projects? | student-project-list | crop of project list actions menu |
| `start-a-new-project.md` | task | How do I make something outside a lesson? | student-create-project | -- |
| `share-your-project.md` | task | How do I send my project to someone? | project-share-link, project-share-warnings, project-embed | crop of share dialog |
| `can-i-share-this.md` | reference | Why can't I share? (decision/eligibility) | project-share-link, project-share-warnings, project-image-upload-warning | -- |
| `remix-a-project.md` | task | How do I start from someone else's project? | project-remix | crop of Remix button on share page |
| `browse-the-public-gallery.md` | task | Where can I see other students' projects? | project-public-gallery | -- |
| `publish-to-the-gallery.md` | task | How do I put my project in the gallery? | project-publish-to-gallery | -- |
| `restore-an-earlier-version.md` | task | I broke my project; how do I go back? | project-version-history | -- |
| `report-a-project.md` | task | Someone made something inappropriate. | project-report-abuse | -- |
| `store-data-in-your-app.md` | concept | How does my App Lab app remember data? | project-datablock-storage, project-datasets | -- |
| `use-a-code-library.md` | task | How do I reuse code across projects? | project-libraries | -- |
| `use-the-backpack.md` | task | How do I carry code between projects? | project-backpack | -- |

### Teachers (`docs/teachers/projects/`)

| Path | Type | Question | Inventory ids | Screenshot |
|---|---|---|---|---|
| `see-student-projects.md` | task | How do I see what my class built? | teacher-view-student-projects | -- |
| `manage-sharing-for-your-class.md` | concept | How does sharing work for my section? | project-share-link (teacher angle) | -- |
| `share-a-library-with-your-class.md` | task | How do I give my class a shared library? | teacher-section-libraries | -- |

### Developers (`docs/developers/projects/`)

| Path | Type | Question | Inventory ids |
|---|---|---|---|
| `project-storage.md` | concept | How are projects stored? | dev-project-storage-stack, project-storage-channels |
| `sharing-and-abuse.md` | reference | How does sharing eligibility and abuse moderation work? | project-share-link, project-report-abuse, project-share-warnings, content-proxies |
| `publishability-tiers.md` | reference | Which project types can be published and why? | project-publish-to-gallery |
| `sandboxed-preview-domain.md` | concept | Why does Web Lab preview use a separate domain? | project-sandboxed-preview |

## Journeys

One spec: `frontend/packages/e2e-tests/docs-journeys/projects-and-sharing.spec.ts`

Tests:
1. Create 16+ student, navigate to `/projects`, verify page loads (screenshot: project list).
2. Create an Artist project, open share dialog (screenshot: share dialog crop).
3. Visit the shared project URL, verify the Remix button is visible (screenshot: Remix button).
4. Create under-13 student (age 10), attempt to share an App Lab project, verify disabled state.
5. Navigate to `/projects/public`, verify gallery loads.
6. Teacher: navigate to teacher dashboard Student Projects tab.

## Cross-domain links assumed

- `/students/labs/` prefix for lab-specific workspace pages (labs owner)
- `/students/progress/see-your-progress/` (classrooms owner)
- `/students/account/` prefix for account pages (accounts owner)
- `/teachers/classes/` prefix for section management (classrooms owner)
- `/students/classes/join-a-section/` (classrooms owner)

## Inventory coverage

All 23 slice items are covered. `project-thumbnails-and-images` is folded into
`share-your-project.md` (student) and `sharing-and-abuse.md` (developer)
rather than getting its own page, because a student never interacts with
thumbnails directly.

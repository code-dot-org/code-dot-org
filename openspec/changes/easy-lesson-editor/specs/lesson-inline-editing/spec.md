## ADDED Requirements

### Requirement: Edit mode is gated to levelbuilder permission on the levelbuilder environment
The lesson show page SHALL expose the in-page edit-mode toggle only when both (a) the application is running in levelbuilder mode and (b) the current user has the levelbuilder permission. Users without either condition SHALL see no edit affordances and SHALL receive no editable-field metadata that would invite client-side editing.

#### Scenario: Levelbuilder user on levelbuilder environment
- **WHEN** a levelbuilder user requests a lesson show page in levelbuilder mode
- **THEN** the page SHALL render an edit-mode toggle control

#### Scenario: Non-levelbuilder user on levelbuilder environment
- **WHEN** a user without the levelbuilder permission requests a lesson show page in levelbuilder mode
- **THEN** the page SHALL NOT render an edit-mode toggle control

#### Scenario: Levelbuilder user on non-levelbuilder environment
- **WHEN** a levelbuilder user requests a lesson show page on a non-levelbuilder environment
- **THEN** the page SHALL NOT render an edit-mode toggle control

### Requirement: Toggling edit mode does not reload the page
The edit-mode toggle SHALL switch the page between viewing and editing without a full page navigation. The rendered content visible before toggling SHALL remain visible after toggling, with editable affordances applied or removed in place.

#### Scenario: Turning edit mode on
- **WHEN** a levelbuilder user clicks the edit-mode toggle while it is off
- **THEN** the same lesson content SHALL remain visible and the editable regions SHALL gain hover/click affordances without a page reload

#### Scenario: Turning edit mode off
- **WHEN** a levelbuilder user clicks the edit-mode toggle while it is on, with no unsaved edits open
- **THEN** the editable affordances SHALL be removed and the page SHALL remain on the same URL without a reload

### Requirement: Editable regions carry a stable field identifier in the rendered HTML
For every field that the in-page editor supports, the lesson show page SHALL render the field's HTML inside an element that carries a stable identifier mapping the DOM region to a single `(model, record id, field)` triple, in a form the client can read without parsing surrounding content.

#### Scenario: Identifier is present on each editable field
- **WHEN** the lesson show page is rendered for a levelbuilder user in levelbuilder mode
- **THEN** every editable region SHALL include a stable identifier (e.g. `data-editable-field="<id>"`) that uniquely names the underlying field

#### Scenario: Identifier is stable across renders of the same lesson
- **WHEN** the same lesson is rendered twice without intervening structural edits
- **THEN** each editable region SHALL receive the same identifier in both renders

### Requirement: Clicking an editable region opens a raw-source field editor
In edit mode, clicking an editable region SHALL replace that region's rendered HTML with an editable control bound to the field's raw stored source (markdown with any inline HTML preserved as-is). No rendering or formatting transform SHALL be applied to the source on the way into the editor.

#### Scenario: Click swaps rendered HTML for raw source
- **WHEN** a levelbuilder user in edit mode clicks an editable region
- **THEN** the rendered HTML for that region SHALL be replaced by an editable control whose initial value is the field's raw stored source

#### Scenario: Editor is plain (no rich-text toolbar)
- **WHEN** the editable control is shown
- **THEN** it SHALL be a plain text editor (e.g. a textarea or contenteditable surface) with no formatting toolbar, color picker, or other rich-text UI

### Requirement: Saving happens on blur when content changed
When the user moves focus out of the editable control, the client SHALL compare the current value to the value loaded into the editor. If the value changed, the client SHALL send a PATCH to the field-scoped save endpoint and, on success, re-render the saved field in place using the same client-side renderer the page used on initial load.

#### Scenario: Unchanged content on blur
- **WHEN** the user blurs the editor without modifying the value
- **THEN** the client SHALL NOT send a save request and SHALL restore the field's original rendered content

#### Scenario: Changed content on blur, save succeeds
- **WHEN** the user blurs the editor after changing the value, and the server returns a successful response
- **THEN** the client SHALL replace the editor with the field re-rendered from the response data, leaving the rest of the page untouched, and SHALL display a transient "Saved" indicator

#### Scenario: Changed content on blur, save fails
- **WHEN** the user blurs the editor after changing the value, and the server returns an error response
- **THEN** the client SHALL keep the editor open with the user's edited value intact and SHALL display the server's error message

### Requirement: Field-scoped save endpoint authorizes every request server-side
The server SHALL expose an endpoint that updates a single `(model, record id, field)` triple on a lesson or its child records. Every request SHALL be independently authorized by (a) the levelbuilder environment check, (b) the current user's levelbuilder permission, and (c) a server-side allowlist that names which `(model, field)` pairs are editable in-page.

#### Scenario: Authorized request to an allowlisted field
- **WHEN** a levelbuilder user on the levelbuilder environment PATCHes an allowlisted `(model, field)` with a new value
- **THEN** the server SHALL persist the change and return a success response containing the freshly rendered HTML for that field

#### Scenario: Request from non-levelbuilder user
- **WHEN** a user without the levelbuilder permission PATCHes the endpoint
- **THEN** the server SHALL reject the request with an authorization failure and SHALL NOT persist any change

#### Scenario: Request on non-levelbuilder environment
- **WHEN** the endpoint is reached on a non-levelbuilder environment
- **THEN** the server SHALL respond as if the endpoint does not exist (e.g. 404) and SHALL NOT persist any change

#### Scenario: Request for a field not on the allowlist
- **WHEN** an authorized levelbuilder user PATCHes a `(model, field)` pair that is not on the server-side allowlist
- **THEN** the server SHALL reject the request and SHALL NOT persist any change, even if the underlying column exists and is writable elsewhere

### Requirement: Saves persist to the unit's script_json file
On every successful save the endpoint SHALL re-serialize the saved lesson's containing unit to its `script_json` file via `Script#write_script_json` (the same call the existing lesson editor makes after `LessonsController#update`). Without this step the database row and the checked-in `dashboard/config/scripts_json/<script>.script_json` file would diverge and the change would be lost on the next deploy or environment seed from script_json.

#### Scenario: script_json is rewritten after a successful save
- **WHEN** a save succeeds for an allowlisted field in levelbuilder mode
- **THEN** the unit's `script_json` file SHALL be rewritten to reflect the saved value before the response is returned

#### Scenario: script_json write failure surfaces to the user
- **WHEN** the database save succeeds but the subsequent `script_json` rewrite raises
- **THEN** the endpoint SHALL surface the failure to the client (the client SHALL display the error and keep the editor open) so the author is aware that the change is not durable

### Requirement: Save response returns only the edited field's data
On a successful save the endpoint SHALL return only the saved field's data — the persisted raw value plus any server-side preprocessing the lesson show page applies to that value before client-side rendering — and SHALL NOT return rendered HTML or data for any field other than the one edited. The client SHALL render this returned data through the same client-side renderer used on initial page load, so the same code path produces the visible result.

#### Scenario: Response carries only the edited field
- **WHEN** a save succeeds for an allowlisted field
- **THEN** the response body SHALL contain the saved value (with any server-side preprocessing applied) for that one field
- **AND** the response body SHALL NOT contain data for any other field, record, or rendered HTML for the page

#### Scenario: Client re-renders only the edited field
- **WHEN** the client receives a successful save response
- **THEN** only the DOM region corresponding to the edited field SHALL be updated
- **AND** other rendered regions on the page SHALL remain untouched

### Requirement: Out-of-scope edits are not exposed by in-page editing
The in-page editor SHALL NOT support structural edits (adding, removing, or reordering activities, sections, or other lesson sub-records) and SHALL NOT support rich-text editing of allowlisted fields. Structural edits remain the responsibility of the existing lesson editor.

#### Scenario: No structural controls in edit mode
- **WHEN** a levelbuilder user enables edit mode on a lesson show page
- **THEN** the page SHALL NOT render controls for adding, removing, or reordering activities, sections, or other lesson sub-records

#### Scenario: Structural fields are not on the allowlist
- **WHEN** a save request targets a field that controls structural ordering or membership (e.g. `position`, parent association IDs)
- **THEN** the server SHALL reject the request because the field is not on the in-page editing allowlist

## ADDED Requirements

### Requirement: Catalog screen lists course offerings

The studio app SHALL provide a catalog screen at route `/` (when not mounted under Rails) that lists course offerings as tappable tiles.

#### Scenario: Catalog renders on first launch from bundled data
- **WHEN** a user opens the app for the first time
- **THEN** the catalog screen MUST render a list of at least six course tiles sourced from a bundled `bundled-catalog.json`
- **AND** each tile MUST display the course title, an illustration, and a state badge

#### Scenario: Catalog refreshes from Dashboard when online
- **WHEN** the catalog screen mounts and the device reports network connectivity
- **THEN** the app MUST attempt to fetch the latest course offerings from the Dashboard course-offerings endpoint
- **AND** on success MUST merge the response into IndexedDB
- **AND** the visible catalog MUST update to reflect any new, removed, or changed tiles without requiring a page reload

#### Scenario: Catalog falls back to cache on network failure
- **WHEN** the catalog screen mounts and the Dashboard fetch fails for any reason
- **THEN** the app MUST render the most recently cached catalog from IndexedDB
- **AND** if IndexedDB has no cached catalog the app MUST fall back to `bundled-catalog.json`
- **AND** no user-visible error toast or modal MUST appear

### Requirement: Tile state badges communicate offline availability

Each catalog tile SHALL display a state badge that communicates whether the course is launchable without network.

#### Scenario: Cached course shows ready badge
- **WHEN** a course's assets are present in cache (precached by the service worker or bundled in the app)
- **THEN** its tile MUST display a "Ready offline" badge with a check icon
- **AND** the tile MUST be fully tappable

#### Scenario: Online-only course shows needs-internet badge when offline
- **WHEN** a course's assets are NOT cached
- **AND** the device reports no network connectivity
- **THEN** its tile MUST display a "Needs internet" badge with a cloud-slash icon
- **AND** the tile MUST appear visually dimmed (reduced opacity)
- **AND** tapping the tile MUST NOT navigate; instead it MUST show a short inline message stating that the course needs internet

#### Scenario: Online-only course is launchable when online
- **WHEN** a course's assets are NOT cached
- **AND** the device reports network connectivity
- **THEN** its tile MUST NOT be dimmed
- **AND** tapping the tile MUST navigate to the lab route

### Requirement: Catalog layout adapts to viewport

The catalog SHALL render a layout appropriate to the device's viewport width, prioritizing single-handed thumb reach on phones.

#### Scenario: Phone layout (viewport < 768px)
- **WHEN** the viewport width is less than 768px
- **THEN** tiles MUST render two per row
- **AND** all primary tap targets MUST be at least 44 CSS pixels in their smallest dimension
- **AND** when a last-played course exists a sticky "Continue" pill MUST appear anchored to the bottom of the viewport, within thumb reach

#### Scenario: Tablet layout (768px ≤ viewport < 1024px)
- **WHEN** the viewport width is between 768px and 1023px inclusive
- **THEN** tiles MUST render three per row

#### Scenario: Desktop layout (viewport ≥ 1024px)
- **WHEN** the viewport width is 1024px or greater
- **THEN** tiles MUST render four per row within a max-width container
- **AND** the "Continue" affordance MUST appear at the top of the viewport rather than the bottom

### Requirement: Global connectivity state is communicated subtly

The catalog screen SHALL communicate the device's connectivity state via a single header indicator and SHALL NOT block the UI with full-screen offline errors.

#### Scenario: Online state shown in header
- **WHEN** the device reports network connectivity
- **THEN** the catalog header MUST show an "Online" indicator
- **AND** the indicator MUST be visually unobtrusive (small chip, non-blocking)

#### Scenario: Offline state shown in header
- **WHEN** the device reports no network connectivity
- **THEN** the catalog header MUST show an "Offline" indicator
- **AND** no full-screen overlay, modal, or blocking error MUST appear

### Requirement: Catalog data persists across launches

Catalog data fetched from Dashboard SHALL persist in IndexedDB so that subsequent cold launches render the most recent known catalog without network.

#### Scenario: Second launch reads from IDB without network
- **WHEN** a user has previously launched the app online and the Dashboard fetch succeeded
- **AND** then re-launches the app with the device offline
- **THEN** the catalog screen MUST render the previously fetched catalog within the same paint as the app shell
- **AND** MUST NOT show a loading spinner waiting on network

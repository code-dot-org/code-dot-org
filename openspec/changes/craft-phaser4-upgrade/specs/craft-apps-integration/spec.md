## ADDED Requirements

### Requirement: apps no longer supplies a Phaser global
`apps/` SHALL NOT provide `window.Phaser`. The vendored Phaser build and its build-copy step SHALL be removed.

#### Scenario: Vendored Phaser removed
- **WHEN** the repository is inspected after the change
- **THEN** `apps/lib/phaser/` does not exist and no `Gruntfile.js` task copies a phaser build into `build/minifiable-lib/phaser/`

#### Scenario: No Phaser config key passed to the engine
- **WHEN** the four `apps/src/craft/{simple,aquatic,agent,designer}/craft.js` files construct `GameController`
- **THEN** they do not pass a `Phaser: window.Phaser` config key (the engine imports Phaser itself)

### Requirement: Dashboard stops injecting the Phaser script
The dashboard SHALL NOT emit a `<script>` tag for Phaser on craft levels, and the `use_phaser` gate SHALL be removed.

#### Scenario: No phaser script tag
- **WHEN** `dashboard/app/views/levels/_apps_dependencies.html.haml` is read
- **THEN** it contains no `js/phaser/phaser.js` script tag

#### Scenario: use_phaser flag removed
- **WHEN** `dashboard/app/helpers/levels_helper.rb` is read
- **THEN** the `use_phaser` flag and its references are gone

### Requirement: apps glue adapted to Phaser 4 APIs
The craft apps glue SHALL be updated for the Phaser 4 game object: the CE-only iPhone scroll workaround is removed, readiness is probed on the game object rather than the CE loader, and touch capture uses the v4 API.

#### Scenario: Obsolete CE workaround removed
- **WHEN** the four variant `craft.js` files are read
- **THEN** none call `Craft.gameController.game.device.whenReady(...)` or set `game.scale.compatibility.scrollTo`

#### Scenario: Readiness probe updated
- **WHEN** `Craft.phaserLoaded()` runs
- **THEN** it returns true based on `Craft.gameController?.game` rather than `game.load`

### Requirement: No behavioral change to production craft levels
The integration change SHALL preserve production behavior for all craft level types served by the dashboard.

#### Scenario: mc course unchanged
- **WHEN** a student plays the Minecraft Adventurer course after the change
- **THEN** every level (1–14) loads, runs, and completes as before, including character select, minecart, day/night, free-play, and the share thumbnail

#### Scenario: Code Connection variant unaffected
- **WHEN** a `code-connection` level loads
- **THEN** it behaves as before (it does not use the craft-lab engine and is untouched by the Phaser upgrade)

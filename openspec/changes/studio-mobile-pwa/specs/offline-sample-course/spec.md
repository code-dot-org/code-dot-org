## ADDED Requirements

### Requirement: AI for Oceans plays end-to-end offline

The studio app SHALL bundle and run AI for Oceans entirely without network, from app launch through completing at least one fish-vs-trash training and test cycle.

#### Scenario: Launch AI for Oceans from the catalog while offline
- **WHEN** a user with the device in airplane mode taps the AI for Oceans tile on the catalog screen
- **THEN** the app MUST navigate to the AI for Oceans lab
- **AND** the lab MUST load its Blockly workspace, training UI, and bundled dataset without any failed network requests

#### Scenario: Train the classifier offline
- **WHEN** a user is in AI for Oceans with the device offline
- **AND** labels at least one fish and one trash example via the training UI
- **THEN** the classifier MUST train locally using bundled TensorFlow.js
- **AND** the trained model MUST produce predictions on subsequent unlabeled examples without any network request

#### Scenario: Complete a test round offline
- **WHEN** a user has trained the classifier and proceeds to the test phase with the device offline
- **THEN** the app MUST display the test sequence using bundled images
- **AND** MUST display the round's final score using only on-device computation

### Requirement: AI for Oceans assets are precached

All assets required for AI for Oceans to run offline SHALL be precached by the service worker (PWA mode) or bundled into the native binary (Capacitor mode).

#### Scenario: Service worker precaches lab assets
- **WHEN** the studio service worker installs
- **THEN** its precache manifest MUST include the AI for Oceans JS chunk, its CSS, its bundled dataset of fish/trash images, its labels JSON, and the TensorFlow.js runtime files it uses

#### Scenario: Capacitor binary ships lab assets
- **WHEN** a Capacitor build of the studio app is installed
- **THEN** the binary's web assets MUST include all files listed in the AI for Oceans precache manifest
- **AND** opening the lab from the installed app with the device offline MUST NOT trigger any network request to a remote origin

### Requirement: Bundled dataset is sufficient for a meaningful round

The bundled AI for Oceans dataset SHALL contain enough labeled examples for a learner to train a classifier that performs visibly better than chance.

#### Scenario: Dataset size and labels
- **WHEN** the AI for Oceans lab loads its bundled dataset
- **THEN** the dataset MUST contain at least 100 fish images and at least 100 non-fish (trash) images
- **AND** each image MUST have a label in the bundled labels JSON
- **AND** the total compressed bundle size for the dataset MUST NOT exceed 5 MB

### Requirement: Student progress for sample courses persists locally

Per-course progress for offline-capable sample courses SHALL persist to IndexedDB so the student can resume where they left off without an account.

#### Scenario: Resume progress on next launch
- **WHEN** a user completes part of AI for Oceans, closes the app, and reopens it
- **THEN** the AI for Oceans tile on the catalog screen MUST show a "Continue" affordance
- **AND** tapping the tile MUST resume the lab at the activity step the user last reached
- **AND** any labels or trained-state the lab persists MUST be restored from IndexedDB

#### Scenario: Progress is local-only by default
- **WHEN** a user makes progress in any offline-capable sample course
- **THEN** the app MUST NOT transmit that progress to any remote server during this change's scope
- **AND** the progress MUST be readable on a subsequent launch without an account

### Requirement: Lab UI is usable on a phone

The AI for Oceans lab UI rendered inside the studio mobile shell SHALL be operable with one thumb on a phone in portrait orientation.

#### Scenario: Tap targets meet minimum size
- **WHEN** the lab renders on a viewport less than 768px wide
- **THEN** all interactive controls (run button, label-this-image controls, navigation arrows) MUST have a tap target of at least 44 CSS pixels in their smallest dimension

#### Scenario: Blockly toolbox accommodates phone width
- **WHEN** the lab renders a Blockly workspace on a viewport less than 768px wide
- **THEN** the toolbox MUST be presentable in a layout that does not require horizontal scrolling of the workspace to reveal it
- **AND** dragging a block from the toolbox to the workspace MUST work via touch

## 1. Level tagging

- [x] 1.1 Add `class_gallery` to `ScriptLevel.serialized_attrs` and to the `for_edit` summary
- [x] 1.2 Persist `class_gallery` in `ActivitySection#update_script_levels`
- [x] 1.3 Add the "Class Gallery" checkbox to `LevelTokenDetails.jsx` and the "class gallery" tag to `LevelToken.jsx`
- [x] 1.4 Test that `update_script_levels` saves the flag and that seeding a unit from JSON sets it

## 2. Reactions storage

- [x] 2.1 Extract `EmojiReactions` (vocabulary and tally) and use it from `ChallengeResponse` and `ChallengeResponseReaction`
- [x] 2.2 Migration and model for `project_reactions (project_id, user_id, emoji)` with the unique index; annotate schema
- [x] 2.3 Run the existing challenge reaction and response tests unchanged

## 3. Listing

- [x] 3.1 `ClassGallery` query object: tagged script levels, host level resolution (templates, bubble choices), channel tokens, saved-and-active projects, one entry per student per tagged level, reactions
- [x] 3.2 `ClassGalleryProjectsController#index` and `#unit_counts`, with section authorization and sort
- [x] 3.3 Routes, including `tutor/gallery/*path` to `lessons#tutor_gallery`
- [x] 3.4 Controller tests covering each listing scenario in the spec

## 4. Reactions API

- [x] 4.1 `:react_in_class_gallery` ability on `Project`
- [x] 4.2 `ClassGalleryProjectReactionsController#create` and `#destroy`, keyed by channel id
- [x] 4.3 Controller tests: peer, owner, teacher, outsider, unknown emoji, idempotence

## 5. Frontend

- [x] 5.1 `ClassGalleryProject` type and list validator in `@code-dot-org/lesson-deep-dive`; rebuild the package
- [x] 5.2 `reactionsApi` and `ReactionChips` take a reactions path; update callers and tests
- [x] 5.3 `ClassProjectCard` and `ClassProjectGallery`, reusing `GallerySidebar` and the gallery styles
- [x] 5.4 `GalleryViewSwitcher`, the `gallery/projects` route in `TutorApp`, and the switcher in `ChallengeGallery`
- [x] 5.5 Jest tests for `ClassProjectGallery` and the switcher routes

## 6. Test content

- [x] 6.1 Tag programming-with-music-lab-2025 lessons 5, 9 and 13 (final project levels) in `.script_json`
- [x] 6.2 Tag aif2-2025 lesson 13 level 1 (bubble choice) and ai-generated-design-pilot-2025 lesson 13 level 4
- [x] 6.3 Seed the three units locally and check the flags with `rails runner`

## 7. Verification

- [x] 7.1 Run the new and touched Ruby and Jest tests; typecheck apps; lint with `tools/hooks/pre-commit`
- [x] 7.2 Exercise the endpoints locally with a section, students and saved projects

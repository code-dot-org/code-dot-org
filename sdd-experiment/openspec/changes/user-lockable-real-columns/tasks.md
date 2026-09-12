# Tasks: user-lockable-real-columns

Phases 2, 3, and 4 are separate deploys, in order.

## 1. Pin current behavior

- [ ] 1.1 Run `bundle exec spring testunit
      test/models/devise_lockable_test.rb` green — this suite is the
      oracle for every later phase
- [ ] 1.2 Characterization test: explicit `failed_attempts = 0` /
      `locked_at = nil` writes are compacted out of the blob and read
      back `nil` (pins the quirk phase 4 removes)

## 2. Columns + dual-write (deploy 1)

- [ ] 2.1 Migration: `add_column :users, :failed_attempts, :integer,
      default: 0, null: false` and `add_column :users, :locked_at,
      :datetime`; no index (design D1)
- [ ] 2.2 User `before_save` mirror: copy blob accessor values into
      the raw columns (`self[:failed_attempts] = failed_attempts.to_i`,
      `self[:locked_at] = locked_at`) — marked as transient (D2)
- [ ] 2.3 Test: a failed teacher login and a `lock_access!` populate
      both blob and columns; oracle suite still green

## 3. Backfill (deploy 2 not required; console script after deploy 1)

- [ ] 3.1 Batched script per design D3: rows whose `properties` contain
      `failed_attempts`/`locked_at` keys get `update_columns` from the
      blob values; idempotent
- [ ] 3.2 Verify: count of rows with blob keys == count of rows where
      columns match blob values; spot-check a locked account

## 4. Switch reads + de-monkeypatch (deploy 3)

- [ ] 4.1 Remove `failed_attempts`/`locked_at` from `serialized_attrs`
      (user.rb:264-265) and delete the 2.2 mirror hook
- [ ] 4.2 Delete the prepend block in config/initializers/devise.rb
      (:374-380); add `include Devise::Models::CustomLockable` in
      user.rb after the existing post-devise includes (:503-505)
- [ ] 4.3 Simplify custom_lockable.rb: delete `attempts_exceeded?`
      override; `increment_failed_attempts` keeps the teacher guard,
      delegates to `super`; metrics wrappers unchanged; drop
      blob-rationale comments
- [ ] 4.4 Update the user.rb properties annotation (:203-204) and the
      devise_lockable_test.rb initial-value assertions (`assert_nil`
      → `assert_equal 0`); no other test diffs permitted
- [ ] 4.5 Oracle suite green; grep confirms no remaining reference to
      lockable keys in `serialized_attrs` or `properties`

## 5. Verify + optional hygiene

- [ ] 5.1 `bundle exec spring testunit
      test/models/devise_lockable_test.rb` and
      `test/controllers/devise_unlocks_controller_test.rb` green
- [ ] 5.2 `./tools/hooks/pre-commit` clean
- [ ] 5.3 (optional) One-off scrub of stale `failed_attempts`/
      `locked_at` keys left in `properties` blobs — dead data only
      (design, alternatives)

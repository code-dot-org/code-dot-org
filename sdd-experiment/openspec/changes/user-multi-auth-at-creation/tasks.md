# Tasks: user-multi-auth-at-creation

Prerequisite: `user-single-multi-auth-migrator` merged (single
migrator; its option shaping is reused here).

## 1. Pin current behavior

- [ ] 1.1 Characterization tests per persisting flow (email sign-up,
      oauth sign-up incl. session round trip, roster import, sponsored
      bulk add, /join): post-create `provider == 'migrated'`, option
      count/type/data, `primary_contact_info`, sponsored invariant
- [ ] 1.2 Verify `from_omniauth`'s blank `create` (user.rb:1613) fails
      validation today, so `after_create` fires only on the second
      save with the real provider (rails runner + test)
- [ ] 1.3 Pin validation edges per flow: duplicate email, missing
      email, under-13 — accept/reject must not change after conversion
      (design D6)

## 2. Build the construction command

- [ ] 2.1 `Services::User::Create`: attributes + credential descriptor
      → unsaved user with `provider = PROVIDER_MIGRATED` and options
      attached; option shaping extracted from the single migrator's
      `migrated_auth_option`, shared not copied (design D1)
- [ ] 2.2 Refactor `Services::Lti.initialize_lti_user` and
      `initialize_lti_user_from_nrps` (lib/services/lti.rb:13, :106)
      onto the command; LTI tests stay green (already-multi-auth
      consumers, no behavior change)
- [ ] 2.3 DCDO gate `multi_auth_at_creation_flows` (default `[]`) with
      a helper predicate; unit test both positions

## 3. Convert flows, one at a time (each: convert → tests → ramp)

- [ ] 3.1 `email`: `UserBuilder` (user_builder.rb:13-15) builds via the
      command when gated
- [ ] 3.2 `oauth`: staging sites (omniauth_callbacks_controller.rb:234,
      :268, :314) build multi-auth users with tokens in option `data`;
      confirm session round trip via `authentication_options_attributes`
      (policies/user.rb:19-24, user.rb:366)
- [ ] 3.3 `roster`: `from_omniauth` (user.rb:1609-1624) becomes
      build-then-save via the command (design D4); covers
      omniauth_callbacks_controller.rb:195 and omni_auth_section.rb:69
- [ ] 3.4 `sponsored`: sections_students_controller.rb:92-102 creates
      via the command (no option); sponsored invariant test from 1.1
- [ ] 3.5 `join_section`: followers_controller.rb:32-34 builds via the
      command

## 4. Retire the hook

- [ ] 4.1 Ramp all flows to 100%; run the oracle during soak: zero
      users `created_at > ramp_start` with `provider != 'migrated'`
      (reader client in prod, assertion in CI)
- [ ] 4.2 Remove `after_create :migrate_to_multi_auth` (user.rb:484),
      the DCDO gate, and the legacy branches in the converted callers;
      keep `migrate_to_multi_auth` itself (still referenced by
      `user-single-auth-retirement` scope decisions)

## 5. Verify

- [ ] 5.1 Flow test files + user_test.rb creation sections via
      `bundle exec spring testunit`
- [ ] 5.2 Full dashboard suite before the hook-removal PR
- [ ] 5.3 `./tools/hooks/pre-commit` clean

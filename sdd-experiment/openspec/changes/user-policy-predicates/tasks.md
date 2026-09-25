# Tasks: user-policy-predicates

## 1. Pin current behavior

- [ ] 1.1 Characterization tests: table-driven over representative user
      states (student/teacher, migrated/unmigrated, sponsored,
      oauth-only, password-bearing, sectioned/unsectioned), asserting
      the current answer of each of the 28 in-scope predicates
- [ ] 1.2 Characterization tests for the two ability.rb javabuilder
      rules (:565, :573): grant and deny cases for the CSA
      verified-instructor check
- [ ] 1.3 Pin `personal_account?` answers for all existing caller
      contexts (users_helper.rb:274, user.rb:1136,
      lib/policies/child_account.rb:174), persisted users only

## 2. Move predicates

- [ ] 2.1 Add the 28 class methods to `Policies::User`
      (dashboard/lib/policies/user.rb), literal-copy bodies;
      intra-cluster calls resolve policy-to-policy (design D2)
- [ ] 2.2 Replace each moved body in user.rb with a one-line delegation
      to `Policies::User`; signatures unchanged
- [ ] 2.3 Re-run 1.1 unchanged against the delegating model — all green

## 3. Kill the duplication

- [ ] 3.1 `personal_account?` derives its set from `user.providers`
      behind the parallel-comparison guard: compute old and new,
      report mismatch to Honeybadger, return old; DCDO flag flips to
      new (design D3/D4)
- [ ] 3.2 Extract the CSA verified-instructor lambda to one named
      `Policies::User` predicate; consume it at ability.rb:565 and
      :573; re-run 1.2 unchanged — all green

## 4. Verify

- [ ] 4.1 `bundle exec spring testunit test/lib/policies/user_test.rb`
      and the user/ability model tests touched by 1.x
- [ ] 4.2 `./tools/hooks/pre-commit` clean
- [ ] 4.3 After production soak with zero mismatch reports: flip the
      DCDO flag, delete the guard, done

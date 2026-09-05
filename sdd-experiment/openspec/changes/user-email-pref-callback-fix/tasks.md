# Tasks: user-email-pref-callback-fix

## 1. Pin current behavior

- [ ] 1.1 Characterization test: full save path (not the direct method
      call used at email_preferences_test.rb:92) with radio choice "yes"
      stamps the opt-in timestamp (green today via the re-fetch)
- [ ] 1.2 Characterization test: with `find_by_email_or_hashed_email`
      stubbed to nil, the save raises NoMethodError today (flip to the
      regression assertion in 2.2 after the fix)
- [ ] 1.3 git blame the re-fetch: confirm no intentional cross-account
      semantics before deleting it

## 2. Fix

- [ ] 2.1 Rewrite `save_email_reg_partner_preference` per design D1:
      `before_save` assignment of
      `share_teacher_email_regional_partner_opt_in` on `self`, keeping
      the `teacher?` and `casecmp?("yes")` guards; remove the
      `find_by_email_or_hashed_email` call and the nested `save!`
      (email_preferences.rb:25,54-60)
- [ ] 2.2 Regression tests: lookup-miss save completes and stamps `self`;
      colliding-account save leaves the other account unmodified; "no"
      and non-teacher saves write nothing; opted-in save does not
      re-enter the callback (single save cycle)
- [ ] 2.3 Update the existing direct-call test block
      (email_preferences_test.rb:91-109) to the new hook shape

## 3. Verify

- [ ] 3.1 `bundle exec spring testunit test/models/concerns/user/email_preferences_test.rb`
- [ ] 3.2 `./tools/hooks/pre-commit` clean

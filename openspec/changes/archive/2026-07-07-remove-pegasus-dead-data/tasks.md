## 1. Remove StaticModels

- [x] 1.1 Remove `require pegasus_dir 'data/static_models'` from `lib/cdo/db.rb`
- [x] 1.2 Remove `PEGASUS_DB.singleton_class.prepend StaticModels` from `lib/cdo/db.rb`
- [x] 1.3 Delete `pegasus/data/static_models.rb`
- [x] 1.4 Delete `pegasus/test/test_static_models.rb`

## 2. Delete pegasus data CSVs

- [x] 2.1 Delete all 28 CSV files in `pegasus/data/`

## 3. Remove Donor/DonorSchool

- [x] 3.1 Delete `dashboard/app/models/donor.rb`
- [x] 3.2 Delete `dashboard/app/models/donor_school.rb`
- [x] 3.3 Delete `lib/cdo/cdo_donor.rb`
- [x] 3.4 Remove `Donor.setup` from `dashboard/lib/tasks/seed.rake`
- [x] 3.5 Delete `pegasus/rake/seed.rake`
- [x] 3.6 Remove any test files referencing Donor or DonorSchool
- [x] 3.7 Create AR migration to drop `donors` and `donor_schools` tables

## 4. Verify

- [x] 4.1 Rails boots cleanly (`bin/rails runner 'puts PEGASUS_DB'` from dashboard/)
- [x] 4.2 `PEGASUS_DB[:hoc_activity]` still works
- [x] 4.3 `./tools/hooks/pre-commit` passes
- [x] 4.4 `bundle exec spring testunit` on any test files that touched Donor

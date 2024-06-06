require 'test_helper'

# Here, we want to ensure that User records can be purged via
# the AccountPurger class.
class AccountPurgerIntegrationTest < ActionDispatch::IntegrationTest
  NULL_STREAM = File.open File::NULL, 'w'

  setup do
    # Never actually upload logs to S3
    PurgedAccountLog.any_instance.stubs(:upload)
  end

  # We can purge a simple but typical student account, in general.
  test 'can purge a typical student account' do
    # This will test that a typical user account can be purged.
    # There are occasionally regressions related to on-delete hooks
    # that assume that a user is always valid. A deleted user,
    # however, can be both attached via foreign key to an object
    # but not be usable (essentially acts as nil)
    user = create :young_student_with_teacher

    # Delete the user
    user.destroy!

    # Now try to purge that user
    purger = AccountPurger.new(log: NULL_STREAM)
    purger.purge_data_for_account(user)

    # Ensure that the purger completed
    assert user.purged_at
  end

  # We can purge a student in a section when they have a family name.
  test 'can purge a student account with a family name that is in a section' do
    DCDO.stubs(:get).with('family-name-features', false).returns(true)
    user = create :young_student_with_teacher

    # Delete the user
    user.destroy!

    # Now try to purge that user
    purger = AccountPurger.new(log: NULL_STREAM)
    purger.purge_data_for_account(user)

    # Ensure that the purger completed
    assert user.purged_at
  end
end

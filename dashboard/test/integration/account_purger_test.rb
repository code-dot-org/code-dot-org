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
    user = create :young_student_with_teacher

    purger = AccountPurger.new(log: NULL_STREAM)
    purger.purge_data_for_account(user)
  end

  # We can purge a student when they have a family name.
  test 'can purge a student account with a family name that is in a section' do
    DCDO.stubs(:get).with('family-name-features', false).returns(true)
    user = create :young_student_with_teacher

    purger = AccountPurger.new(log: NULL_STREAM)
    purger.purge_data_for_account(user)
  end
end

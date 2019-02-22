require 'test_helper'

class Pd::ScholarshipInfoTest < ActiveSupport::TestCase
  include Pd::ScholarshipInfoConstants
  include Pd::Application::ActiveApplicationModels

  self.use_transactional_test_case = true

  setup_all do
    @user = create :teacher
  end

  test 'application year is set on create' do
    scholarship_info = Pd::ScholarshipInfo.create(user: @user, scholarship_status: YES_CDO)

    assert_equal(APPLICATION_CURRENT_YEAR, scholarship_info.application_year)
  end

  test 'cannot create multiple scholarship infos with same user and year' do
    Pd::ScholarshipInfo.create(user: @user, scholarship_status: YES_CDO)

    assert_raises(ActiveRecord::RecordNotUnique) do
      Pd::ScholarshipInfo.create(user: @user, scholarship_status: YES_CDO)
    end
  end

  test 'application year must be in SCHOLARSHIP_YEARS' do
    scholarship_info = Pd::ScholarshipInfo.create(user: @user, scholarship_status: YES_CDO)
    assert(scholarship_info.errors.empty?)

    scholarship_info.update(application_year: 'not a valid year')
    assert(scholarship_info.errors.full_messages.include?("Application year is not included in the list"))
  end

  test 'scholarship status must be in SCHOLARSHIP_STATUSES' do
    scholarship_info = Pd::ScholarshipInfo.create(user: @user, scholarship_status: 'not a valid status')
    assert(scholarship_info.errors.full_messages.include?("Scholarship status is not included in the list"))

    scholarship_info.scholarship_status = SCHOLARSHIP_STATUSES.first
    scholarship_info.save
    assert(scholarship_info.errors.empty?)
  end

  test 'update or create' do
    user = create :teacher
    application_year = APPLICATION_CURRENT_YEAR

    assert_creates(Pd::ScholarshipInfo) do
      Pd::ScholarshipInfo.update_or_create(user, application_year, Pd::ScholarshipInfoConstants::NO)
    end

    scholarship_info = Pd::ScholarshipInfo.where(user: user, application_year: application_year).first
    assert_equal Pd::ScholarshipInfoConstants::NO, scholarship_info.scholarship_status

    refute Pd::ScholarshipInfo.update_or_create(user, application_year, 'invalid status')

    refute_creates(Pd::ScholarshipInfo) do
      Pd::ScholarshipInfo.update_or_create(user, application_year, Pd::ScholarshipInfoConstants::YES_OTHER)
    end

    scholarship_info.reload
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, scholarship_info.scholarship_status
  end
end

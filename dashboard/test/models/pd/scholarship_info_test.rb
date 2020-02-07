require 'test_helper'

class Pd::ScholarshipInfoTest < ActiveSupport::TestCase
  include Pd::ScholarshipInfoConstants
  include Pd::WorkshopConstants
  include Pd::Application::ActiveApplicationModels

  self.use_transactional_test_case = true

  setup_all do
    @user = create :teacher
  end

  test 'cannot create multiple scholarship infos with same user, year, and course' do
    course = COURSE_KEY_MAP[COURSE_CSD]
    Pd::ScholarshipInfo.create(user: @user, application_year: '2019-2020', scholarship_status: YES_CDO, course: course)

    assert_raises(ActiveRecord::RecordNotUnique) do
      Pd::ScholarshipInfo.create(user: @user, application_year: '2019-2020', scholarship_status: YES_CDO, course: course)
    end
  end

  test 'update or create' do
    user = create :teacher
    application_year = APPLICATION_CURRENT_YEAR
    course = COURSE_KEY_MAP[COURSE_CSD]

    assert_creates(Pd::ScholarshipInfo) do
      Pd::ScholarshipInfo.update_or_create(user, application_year, course, Pd::ScholarshipInfoConstants::NO)
    end

    scholarship_info = Pd::ScholarshipInfo.where(user: user, application_year: application_year, course: course).first
    assert_equal Pd::ScholarshipInfoConstants::NO, scholarship_info.scholarship_status
    assert_equal course, scholarship_info.course

    refute Pd::ScholarshipInfo.update_or_create(user, application_year, course, 'invalid status')

    refute_creates(Pd::ScholarshipInfo) do
      Pd::ScholarshipInfo.update_or_create(user, application_year, course, Pd::ScholarshipInfoConstants::YES_OTHER)
    end

    scholarship_info.reload
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, scholarship_info.scholarship_status
  end
end

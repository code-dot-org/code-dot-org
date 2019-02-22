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
end

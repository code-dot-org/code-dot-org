require 'test_helper'

module Pd::Application
  class ApplicationBaseTest < ActiveSupport::TestCase
    include ApplicationConstants

    test 'required fields' do
      application = ApplicationBase.new
      refute application.valid?
      assert_equal(
        [
          'Form data is required',
          'User is required',
          'Application type is not included in the list',
          'Application year is not included in the list',
          'Type is required'
        ],
        application.errors.full_messages
      )
    end

    test 'derived classes override type and year' do
      application = TeacherApplication1819.new
      assert_equal TEACHER_APPLICATION, application.application_type
      assert_equal YEAR_18_19, application.application_year

      # with form_data and user, it is valid
      application.form_data = {}.to_json
      application.user = create(:user)
      assert application.valid?
    end

    test 'default status is unreviewed' do
      application = ApplicationBase.new

      assert_equal 'unreviewed', application.status
      assert application.unreviewed?
    end
  end
end

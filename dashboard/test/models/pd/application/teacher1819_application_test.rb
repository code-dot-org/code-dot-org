require 'test_helper'

module Pd::Application
  class Teacher1819ApplicationTest < ActiveSupport::TestCase
    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher1819_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      assert_not_nil teacher_application.application_guid
    end

    test 'existing guid is preserved' do
      guid = SecureRandom.uuid
      teacher_application = create :pd_teacher1819_application, application_guid: guid
      assert_equal guid, teacher_application.application_guid

      # save again
      teacher_application.save!
      assert_equal guid, teacher_application.application_guid
    end

    test 'principal_greeting' do
      hash_with_principal_title = build :pd_teacher1819_application_hash
      hash_without_principal_title = build :pd_teacher1819_application_hash, principal_title: nil

      application_with_principal_title = build :pd_teacher1819_application, form_data_hash: hash_with_principal_title
      application_without_principal_title = build :pd_teacher1819_application, form_data_hash: hash_without_principal_title

      assert_equal 'Dr. Dumbledore', application_with_principal_title.principal_greeting
      assert_equal 'Albus Dumbledore', application_without_principal_title.principal_greeting
    end
  end
end

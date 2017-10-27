require 'test_helper'
require 'state_abbr'

module Pd::Application
  class Facilitator1819ApplicationTest < ActiveSupport::TestCase
    test 'course is filled in from the form program before validation' do
      [:csf, :csd, :csp].each do |program|
        program_name = Facilitator1819Application::PROGRAMS[program]
        application_hash = build :pd_facilitator1819_application_hash, program: program_name
        application = build :pd_facilitator1819_application, form_data_hash: application_hash
        assert application.valid?
        assert_equal program.to_s, application.course
      end
    end

    test 'match regional partner' do
      # match
      regional_partner = create :regional_partner
      RegionalPartner.expects(:find_by_region).with('11111', 'WA').returns(regional_partner)
      application_hash = build :pd_facilitator1819_application_hash, zip_code: '11111', state: 'Washington'
      application = create :pd_facilitator1819_application, form_data_hash: application_hash
      assert_equal regional_partner, application.regional_partner

      # No match
      RegionalPartner.expects(:find_by_region).with('22222', 'WA').returns(nil)
      application_hash = build :pd_facilitator1819_application_hash, zip_code: '22222', state: 'Washington'
      application.form_data_hash = application_hash
      application.save!
      assert_nil application.regional_partner
    end

    test 'open until Dec 1, 2017' do
      Timecop.freeze Time.zone.local(2017, 11, 30, 23, 59) do
        assert Facilitator1819Application.open?
      end
      Timecop.freeze Time.zone.local(2017, 12, 1) do
        refute Facilitator1819Application.open?
      end
    end

    test 'only one application allowed per user' do
      teacher = create :teacher
      create :pd_facilitator1819_application, user: teacher

      e = assert_raises ActiveRecord::RecordInvalid do
        create :pd_facilitator1819_application, user: teacher
      end
      assert_equal 'Validation failed: User has already been taken', e.message
    end

    test 'state_code and state_name' do
      application_hash = build :pd_facilitator1819_application_hash, state: 'Washington'
      application = build :pd_facilitator1819_application, form_data_hash: application_hash
      assert_equal 'Washington', application.state_name
      assert_equal 'WA', application.state_code
    end

    test 'answer_with_additional_text with defaults' do
      application_hash = build :pd_facilitator1819_application_hash
      application_hash[:institution_type] = ['School district', 'Other:']
      application_hash[:institution_type_other] = 'School of Witchcraft and Wizardry'
      application = build :pd_facilitator1819_application, form_data_hash: application_hash

      assert_equal(
        [
          'School district',
          'Other: School of Witchcraft and Wizardry'
        ],
        application.answer_with_additional_text(application_hash, :institution_type)
      )
    end

    test 'answer_with_additional_text with custom field' do
      OPTION = 'A Code.org Regional Partner (please share name):'
      application_hash = build :pd_facilitator1819_application_hash
      application_hash[:how_heard] = [OPTION]
      application_hash[:how_heard_regional_partner] = 'Hogwarts Coding Wizards'
      application = build :pd_facilitator1819_application, form_data_hash: application_hash

      assert_equal(
        [
          "#{OPTION} Hogwarts Coding Wizards"
        ],
        application.answer_with_additional_text(application_hash, :how_heard, OPTION, :how_heard_regional_partner)
      )
    end
  end
end

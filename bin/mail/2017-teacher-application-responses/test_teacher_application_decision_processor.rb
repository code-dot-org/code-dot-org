require_relative '../../../pegasus/src/env'
require 'minitest/autorun'
require 'mocha/mini_test'
require_relative './teacher_application_decision_processor'

# Execute via RAILS_ENV=test bundle exec ruby -Itest ./test_teacher_application_decision_processor.rb

class TeacherApplicationDecisionProcessorTest < Minitest::Test
  def setup
    TeacherApplicationDecisionProcessor.any_instance.stubs(:load_workshop_map).returns({})
    @processor = TeacherApplicationDecisionProcessor.new
    @processor.expects(:update_primary_email).never

    @mock_teacher_application = OpenStruct.new(
      teacher_name: 'Tracy Teacher',
      primary_email: 'tracy.teacher@example.net',
      teacher_first_name: 'Tracy',
      program_name: Pd::Workshop::COURSE_CSP
    )
    Pd::TeacherApplication.stubs(:find).with(is_a(Integer)).returns(@mock_teacher_application)
  end

  def test_load_workshop_map_csv_missing
    File.stubs(:exist?).with('workshops.csv').returns(false)
    TeacherApplicationDecisionProcessor.any_instance.unstub(:load_workshop_map)

    e = assert_raises RuntimeError do
      @processor.load_workshop_map
    end
    assert_equal 'Unable to find required dependency: workshops.csv', e.message
  end

  def test_load_workshop_map
    mock_workshops_csv
    Pd::Workshop.expects(:exists?).with(1234).returns(true)

    workshop_map = @processor.load_workshop_map
    expected = {
      'Sample Partner : June 1 - 5, 2017' => {
        id: 1234,
        partner_name: 'Sample Partner',
        dates: 'June 1 - 5, 2017',
        partner_contact: 'Mr. Contact',
        partner_email: 'partner.contact@example.net'
      }
    }
    assert_equal expected, workshop_map
  end

  def test_load_workshop_map_bad_workshop_id_error
    mock_workshops_csv
    Pd::Workshop.expects(:exists?).with(1234).returns(false)

    e = assert_raises RuntimeError do
      @processor.load_workshop_map
    end
    assert_equal 'Workshop 1234 not found.', e.message
  end

  def test_process_decision_row_bad_id
    Pd::TeacherApplication.expects(:find).with(1).raises(ActiveRecord::RecordNotFound)
    assert_raises ActiveRecord::RecordNotFound do
      @processor.process_decision_row({'Application ID' => 1})
    end
  end

  def test_is_teachercon
    # Match substring, with or without "(travel expenses paid)"
    assert @processor.teachercon? 'July 16 - 21, 2017: Phoenix'
    assert @processor.teachercon? 'June 18 - 23, 2017: Houston (travel expenses paid)'
    refute @processor.teachercon? 'not teachercon'
  end

  def test_process_decisions_row_accept_teachercon
    teachercon_name = 'June 18 - 23, 2017: Houston'
    @processor.expects(:save_accepted_workshop).with(@mock_teacher_application, 'csd', teachercon_name, nil)
    @mock_teacher_application.program_name = Pd::Workshop::COURSE_CSD
    @mock_teacher_application.expects(:regional_partner_name).returns('Code Partner')

    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Accept',
        'Workshop' => teachercon_name,
        'Program' => 'CSD'
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSD,
      teachercon_location_s: 'Houston',
      teachercon_dates_s: 'June 18 - 23, 2017',
      regional_partner_name_s: 'Code Partner'
    }
    assert_equal expected, result
    assert_result_in_set :accept_teachercon, result
  end

  def test_process_decisions_row_accept_teachercon_with_partner_override
    teachercon_name = 'June 18 - 23, 2017: Houston'
    new_partner_name = 'manually selected partner override'
    @processor.expects(:save_accepted_workshop).with(@mock_teacher_application, 'csd', teachercon_name, new_partner_name)
    @mock_teacher_application.expects(:regional_partner_name).returns(new_partner_name)

    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Accept',
        'Workshop' => teachercon_name,
        'Program' => 'csd',
        'Partner Name' => new_partner_name
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSP,
      teachercon_location_s: 'Houston',
      teachercon_dates_s: 'June 18 - 23, 2017',
      regional_partner_name_s: 'manually selected partner override'
    }
    assert_equal expected, result
    assert_result_in_set :accept_teachercon, result
  end

  def test_process_decisions_row_accept_partner
    partner_workshop = 'Code Partner: June 1 - 5, 2017'
    @processor.expects(:save_accepted_workshop).with(@mock_teacher_application, 'csp', partner_workshop)
    @processor.expects(:lookup_workshop).with(partner_workshop).returns(
      {
        id: 1234,
        partner_name: 'Code Partner',
        dates: 'June 1-5, 2017',
        partner_contact: 'Mr. Contact',
        partner_email: 'partner.contact@example.net'
      }
    )

    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Accept',
        'Workshop' => partner_workshop,
        'Program' => 'csp'
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSP,
      regional_partner_name_s: 'Code Partner',
      regional_partner_contact_person_s: 'Mr. Contact',
      regional_partner_contact_person_email_s: 'partner.contact@example.net',
      workshop_registration_url_s: 'https://studio.code.org/pd/workshops/1234/enroll',
      workshop_dates_s: 'June 1-5, 2017'
    }
    assert_equal expected, result
    assert_result_in_set :accept_partner, result
  end

  def test_process_decisions_row_accept_nonexistent_workshop
    e = assert_raises RuntimeError do
      @processor.process_decision_row(
        {
          'Application ID' => 1,
          'Decision' => 'Accept',
          'Workshop' => 'nonexistent'
        }
      )
    end

    assert_equal 'Unexpected workshop: nonexistent', e.message
  end

  def test_process_decisions_row_decline_csp
    @mock_teacher_application.expects(:regional_partner_name).returns('Code Partner')
    @mock_teacher_application.expects(:selected_course).returns('csp')

    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Decline',
        'Workshop' => "doesn't matter"
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSP,
      regional_partner_name_s: 'Code Partner'
    }
    assert_equal expected, result
    assert_result_in_set :decline_csp, result
  end

  def test_process_decisions_row_decline_csd
    @mock_teacher_application.program_name = Pd::Workshop::COURSE_CSD
    @mock_teacher_application.expects(:regional_partner_name).returns('Code Partner')
    @mock_teacher_application.expects(:selected_course).returns('csd')

    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Decline',
        'Workshop' => "doesn't matter"
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSD,
      regional_partner_name_s: 'Code Partner'
    }
    assert_equal expected, result
    assert_result_in_set :decline_csd, result
  end

  def test_process_decisions_row_waitlist
    @mock_teacher_application.id = 12345
    result = @processor.process_decision_row(
      {
        'Application ID' => 1,
        'Decision' => 'Waitlist',
        'Workshop' => "doesn't matter"
      }
    )

    expected = {
      name: 'Tracy Teacher',
      email: 'tracy.teacher@example.net',
      preferred_first_name_s: 'Tracy',
      course_name_s: Pd::Workshop::COURSE_CSP,
      teacher_application_id_s: 12345
    }
    assert_equal expected, result
    assert_result_in_set :waitlist, result
  end

  def test_update_primary_email
    new_primary_email = 'new.primary.email@example.net'
    @processor.expects(:update_primary_email).with(@mock_teacher_application, new_primary_email).once
    @processor.process_decision_row(
      {
        'Application ID' => 1,
        # It doesn't matter which decision: any will update the primary_email.
        # Using Waitlist so we don't need a matching workshop, as that
        # functionality is tested separately.
        'Decision' => 'Waitlist',
        'Workshop' => "doesn't matter",
        'Primary Email' => new_primary_email
      }
    )
  end

  def test_teachercon_acceptance_without_partner_raises_error
    teachercon_name = 'June 18 - 23, 2017: Houston'
    @processor.expects(:save_accepted_workshop).with(@mock_teacher_application, 'csd', teachercon_name, nil)
    @mock_teacher_application.expects(:regional_partner_name).returns(nil)
    @mock_teacher_application.stubs(id: 1)

    e = assert_raises RuntimeError do
      @processor.process_decision_row(
        {
          'Application ID' => 1,
          'Decision' => 'Accept',
          'Workshop' => teachercon_name,
          'Program' => 'csd'
        }
      )
    end

    assert_equal 'Missing regional partner name for application id: 1', e.message
  end

  def partner_override_name_is_applied_to_params
    params = {
      regional_partner_name_s: 'Share Fair Nation and Colorado Education Initiative'
    }
    result = @processor.process 'decision', @mock_teacher_application, params
    assert_equal(
      'mindSpark Learning (formerly Share Fair Nation) and Colorado Education Initiative',
      result[:regional_partner_name_s]
    )
  end

  private

  def assert_result_in_set(type, result)
    assert_equal 1, @processor.results[type].size
    assert_equal result, @processor.results[type].first

    # Make sure all other types are empty
    @processor.results.each do |key, value|
      next if key == type
      assert_empty value
    end
  end

  def mock_workshops_csv
    File.stubs(:exist?).with('workshops.csv').returns(true)
    TeacherApplicationDecisionProcessor.any_instance.unstub(:load_workshop_map)

    mock_csv = mock
    mock_csv.expects(:each).yields(
      {
        'Workshop String' => 'Sample Partner : June 1 - 5, 2017',
        'Workshop Id' => 1234,
        'Partner Contact' => 'Mr. Contact',
        'Partner Email' => 'partner.contact@example.net'
      }
    )
    CSV.expects(:foreach).with('workshops.csv', headers: true).returns(mock_csv)
  end
end

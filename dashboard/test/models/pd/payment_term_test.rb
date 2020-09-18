require 'test_helper'

class Pd::PaymentTermTest < ActiveSupport::TestCase
  freeze_time

  self.use_transactional_test_case = true

  setup_all do
    pms = create_list :regional_partner_program_manager, 2
    @program_manager_1, @program_manager_2 = pms.map(&:program_manager)
    @regional_partner_1, @regional_partner_2 = pms.map(&:regional_partner)

    @workshop_1 = create :workshop, num_sessions: 1, sessions_from: Date.today, organizer: @program_manager_1
    @workshop_2 = create :workshop, num_sessions: 1, sessions_from: 3.months.from_now.to_date, organizer: @program_manager_1
    @workshop_3 = create :workshop, organizer: @program_manager_2
  end

  test 'raises error if no applicable payment terms' do
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: 4.months.from_now.to_date
    [@workshop_1, @workshop_2, @workshop_3].each do |workshop|
      error = assert_raises(RuntimeError) do
        Pd::PaymentTerm.for_workshop(workshop)
      end

      assert error.message.include? "No payment terms were found for workshop #{workshop.inspect}"
    end
  end

  test 'raises error if too many payment terms' do
    term_1 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: 45.days.from_now.to_date, end_date: 4.months.from_now.to_date

    # Generate the overlap by updating while skipping callbacks - theoretically this
    # shouldn't be possible because of the truncation logic but trying it anyway
    term_1.update_column(:end_date, nil)

    error = assert_raises(RuntimeError) do
      Pd::PaymentTerm.for_workshop(@workshop_2)
    end

    assert_equal "Multiple payment terms were found for workshop #{@workshop_2.id}", error.message
  end

  test 'handles date ranges correctly' do
    term_1 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today - 1.month, end_date: 1.month.from_now.to_date
    term_2 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date

    assert_equal term_1, Pd::PaymentTerm.for_workshop(@workshop_1)
    assert_equal term_2, Pd::PaymentTerm.for_workshop(@workshop_2)
  end

  test 'handles course and subject correctly' do
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, course: Pd::Workshop::COURSE_CSF)
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)
    term_3 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1)

    params = {num_sessions: 1, sessions_from: 2.months.from_now.to_date, organizer: @program_manager_1}
    assert_equal term_1, Pd::PaymentTerm.for_workshop(create(:workshop, **params, course: Pd::Workshop::COURSE_CSF))
    assert_equal term_2, Pd::PaymentTerm.for_workshop(create(:workshop, **params, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP))
    assert_equal term_3, Pd::PaymentTerm.for_workshop(create(:csp_academic_year_workshop, **params))
  end

  test 'validations for payment terms' do
    term_1 = build(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today, properties: {})
    refute term_1.valid?

    assert_equal ['Must have either per attendee payment or fixed payment'], term_1.errors.full_messages

    term_2 = build(:pd_payment_term, start_date: Date.today)
    term_2.save

    assert_equal ['Regional partner is required'], term_2.errors.full_messages

    term_3 = build(:pd_payment_term, regional_partner: @regional_partner_1, start_date: nil)
    term_3.save

    assert_equal ['Start date is required'], term_3.errors.full_messages
  end

  test 'Old payment terms get truncated' do
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today)

    # A term for a specific course should not truncate this
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, course: Pd::Workshop::COURSE_CSF)

    term_1.reload
    assert_nil term_1.end_date

    # this should not truncate term 1 or 2
    create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 2.months, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1)

    [term_1, term_2].map(&:reload)
    assert_empty [term_1, term_2].map(&:end_date).compact

    # this should truncate term 2
    create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 3.months.from_now.to_date, course: Pd::Workshop::COURSE_CSF)
    term_2.reload
    assert_equal 3.months.from_now.to_date, term_2.end_date

    # this should truncate term 1
    create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 4.months.from_now.to_date)
    term_1.reload
    assert_equal 4.months.from_now.to_date, term_1.end_date
  end

  test 'Truncate on all overlap cases' do
    # Old ends new as detailed in payment_term.rb has been handled by the above test case

    # Old contains new
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today)
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, end_date: 2.months.from_now.to_date)

    term_1.reload
    assert_equal Date.today..1.month.from_now.to_date, term_1.date_range
    new_terms = Pd::PaymentTerm.where(regional_partner: @regional_partner_1, start_date: 2.months.from_now.to_date)
    assert_equal 2.months.from_now.to_date..Date::Infinity.new, new_terms.first.date_range
    assert_equal 1, new_terms.size

    [term_1, term_2, new_terms.first].map(&:destroy)

    # New ends during old
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date)
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today, end_date: 2.months.from_now.to_date)

    term_1.reload
    assert_equal 2.months.from_now.to_date..Date::Infinity.new, term_1.date_range

    [term_1, term_2].map(&:destroy)

    # New contains old
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 1.month.from_now.to_date, end_date: 2.months.from_now.to_date)
    create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today)

    refute Pd::PaymentTerm.exists?(term_1.id)
  end

  test 'No overlap means no changes' do
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today, end_date: 1.month.from_now)
    create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: 2.months.from_now)

    term_1.reload
    assert_equal Date.today..1.month.from_now.to_date, term_1.date_range
  end
end

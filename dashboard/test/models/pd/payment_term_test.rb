require 'test_helper'

class Pd::PaymentTermTest < ActiveSupport::TestCase
  freeze_time

  self.use_transactional_test_case = true

  setup_all do
    @regional_partner_1 = create :regional_partner
    @regional_partner_2 = create :regional_partner

    @workshop_1 = create :pd_workshop, num_sessions: 1, sessions_from: Date.today, regional_partner: @regional_partner_1
    @workshop_2 = create :pd_workshop, num_sessions: 1, sessions_from: Date.today + 3.months, regional_partner: @regional_partner_1
    @workshop_3 = create :pd_workshop, regional_partner: @regional_partner_2
  end

  test 'raises error if no applicable payment terms' do
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 4.months
    [@workshop_1, @workshop_2, @workshop_3].each do |workshop|
      error = assert_raises(RuntimeError) do
        Pd::PaymentTerm.for_workshop(workshop)
      end

      assert_equal "No payment terms were found for workshop #{workshop.id}", error.message
    end
  end

  test 'raises error if too many payment terms' do
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 1.month
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 45.days, end_date: Date.today + 4.months

    error = assert_raises(RuntimeError) do
      Pd::PaymentTerm.for_workshop(@workshop_2)
    end

    assert_equal "Multiple payment terms were found for workshop #{@workshop_2.id}", error.message
  end

  test 'handles date ranges correctly' do
    term_1 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today - 1.month, end_date: Date.today + 1.month
    term_2 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 1.month

    assert_equal term_1, Pd::PaymentTerm.for_workshop(@workshop_1)
    assert_equal term_2, Pd::PaymentTerm.for_workshop(@workshop_2)
  end

  test 'handles course and subject correctly' do
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 1.month, course: Pd::Workshop::COURSE_CSF)
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 1.month, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)
    term_3 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.today + 1.month, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1)

    assert_equal term_1, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.today + 2.months, regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSF))
    assert_equal term_2, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.today + 2.months, regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP))
    assert_equal term_3, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.today + 2.months, regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1))
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
end

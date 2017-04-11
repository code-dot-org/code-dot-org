require 'test_helper'

class Pd::PaymentTermTest < ActiveSupport::TestCase
  setup do
    @regional_partner_1 = create :regional_partner
    @regional_partner_2 = create :regional_partner

    @workshop_1 = create :pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 1, 1), regional_partner: @regional_partner_1
    @workshop_2 = create :pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 3, 1), regional_partner: @regional_partner_1
    @workshop_3 = create :pd_workshop, regional_partner: @regional_partner_2
  end

  test 'throws exception if no applicable payment terms' do
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 4, 1)
    [@workshop_1, @workshop_3].each do |workshop|
      exception = assert_raises(Exception) do
        Pd::PaymentTerm.for_workshop(workshop)
      end

      assert_equal "No payment terms were found for workshop #{workshop.id}", exception.message
    end
  end

  test 'throws exception if too many payment terms' do
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 1)
    create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 15), end_date: Date.new(2017, 4, 1)

    exception = assert_raises(Exception) do
      Pd::PaymentTerm.for_workshop(@workshop_2)
    end

    assert_equal "Multiple payment terms were found for workshop #{@workshop_2.id}", exception.message
  end

  test 'handles date ranges correctly' do
    term_1 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2016, 12, 1), end_date: Date.new(2017, 2, 1)
    term_2 = create :pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 1)

    assert_equal term_1, Pd::PaymentTerm.for_workshop(@workshop_1)
    assert_equal term_2, Pd::PaymentTerm.for_workshop(@workshop_2)
  end

  test 'handles course and subject correctly' do
    term_1 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 1), course: Pd::Workshop::COURSE_CSF)
    term_2 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 1), course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)
    term_3 = create(:pd_payment_term, regional_partner: @regional_partner_1, start_date: Date.new(2017, 2, 1), course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1)

    assert_equal term_1, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 3, 1), regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSF))
    assert_equal term_2, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 3, 1), regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP))
    assert_equal term_3, Pd::PaymentTerm.for_workshop(create(:pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 3, 1), regional_partner: @regional_partner_1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1))
  end
end

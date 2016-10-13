require 'test_helper'

module Pd::Payment
  class PaymentFactoryTest < ActiveSupport::TestCase
    test 'district calculator' do
      workshop_cs_in_a = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_equal PaymentCalculatorDistrict, PaymentFactory.get_calculator_class(workshop_cs_in_a)
      assert_equal PaymentCalculatorDistrict, PaymentFactory.get_calculator_class(workshop_cs_in_s)
    end

    test 'CSF calculator' do
      workshop_csf_public = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PUBLIC
      workshop_csf_private = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PRIVATE

      assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_public)
      assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_private)
    end

    test 'standard calculator' do
      # Mix of public and private types
      workshop_ecs = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PRIVATE,
        course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2

      workshop_csp = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1

      workshop_cs_in_a = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PRIVATE,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_ecs)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_csp)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_cs_in_a)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_cs_in_s)
    end

    test 'counselor admin calculator' do
      # Mix of public and private types
      workshop_counselor = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PRIVATE,
        course: Pd::Workshop::COURSE_COUNSELOR

      workshop_admin = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_ADMIN

      assert_equal PaymentCalculatorCounselorAdmin, PaymentFactory.get_calculator_class(workshop_counselor)
      assert_equal PaymentCalculatorCounselorAdmin, PaymentFactory.get_calculator_class(workshop_admin)
    end

    test 'calculate payment' do
      # Use a standard payment for example:
      workshop_standard = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1

      workshop_no_payment = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CSF

      standard_summary = PaymentFactory.get_payment(workshop_standard)
      assert standard_summary
      assert_equal PaymentCalculatorStandard, standard_summary.calculator_class

      assert_nil PaymentFactory.get_payment(workshop_no_payment)
    end

    test 'no payment' do
      workshop_district_wrong_type = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CSF

      workshop_csd = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSD

      assert_nil PaymentFactory.get_calculator_class(workshop_district_wrong_type)
      assert_nil PaymentFactory.get_calculator_class(workshop_csd)
    end

    test 'no workshop' do
      e = assert_raises RuntimeError do
        PaymentFactory.get_payment(nil)
      end

      assert_equal 'Workshop required.', e.message
    end
  end
end

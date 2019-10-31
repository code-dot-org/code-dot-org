require 'test_helper'

module Pd::Payment
  class PaymentFactoryTest < ActiveSupport::TestCase
    test 'district calculator' do
      workshop_cs_in_a = create :workshop, :ended, on_map: false, funded: false,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :workshop, :ended, on_map: false, funded: false,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_equal PaymentCalculatorDistrict, PaymentFactory.get_calculator_class(workshop_cs_in_a)
      assert_equal PaymentCalculatorDistrict, PaymentFactory.get_calculator_class(workshop_cs_in_s)
    end

    test 'CSF calculator' do
      workshop_csf_public = create :workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, on_map: true
      workshop_csf_private = create :workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, on_map: false

      assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_public)
      assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_private)
    end

    test 'standard calculator' do
      # Mix of public and private types
      workshop_ecs = create :workshop, :ended, on_map: false, funded: true,
        course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2

      workshop_csp = create :csp_academic_year_workshop, :ended, on_map: true, funded: true

      workshop_cs_in_a = create :workshop, :ended, on_map: false, funded: true,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :workshop, :ended, on_map: true, funded: true,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_ecs)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_csp)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_cs_in_a)
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_cs_in_s)
    end

    test 'counselor admin calculator' do
      # Mix of public and private types
      workshop_counselor = create :counselor_workshop, :ended, :funded
      workshop_admin = create :admin_workshop, :ended, :funded

      assert_equal PaymentCalculatorCounselorAdmin, PaymentFactory.get_calculator_class(workshop_counselor)
      assert_equal PaymentCalculatorCounselorAdmin, PaymentFactory.get_calculator_class(workshop_admin)
    end

    test 'unpaid' do
      workshop_district_wrong_type = create :workshop, :ended, on_map: false, funded: false,
        course: Pd::Workshop::COURSE_CSF

      workshop_csd = create :workshop, :ended, on_map: true, funded: true,
        course: Pd::Workshop::COURSE_CSD

      assert_equal PaymentCalculatorUnpaid, PaymentFactory.get_calculator_class(workshop_district_wrong_type)
      assert_equal PaymentCalculatorUnpaid, PaymentFactory.get_calculator_class(workshop_csd)
    end

    test 'workshops that do not match a known payment type fall through to unpaid' do
      # Build instead of create since this course is invalid and can't be saved
      workshop = build :workshop, :ended, course: 'unexpected course'

      assert_equal PaymentCalculatorUnpaid, PaymentFactory.get_calculator_class(workshop)
    end

    test 'calculate payment' do
      # Use a standard payment for example:
      workshop_standard = create :csp_academic_year_workshop, :ended, on_map: true, funded: true

      standard_summary = PaymentFactory.get_payment(workshop_standard)
      assert_not_nil standard_summary
      assert standard_summary.instance_of?(WorkshopSummary)
      assert_equal PaymentCalculatorStandard, standard_summary.calculator_class
    end

    test 'no workshop' do
      e = assert_raises RuntimeError do
        PaymentFactory.get_payment(nil)
      end

      assert_equal 'Workshop required.', e.message
    end
  end
end

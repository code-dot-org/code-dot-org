require 'test_helper'

module Pd::Payment
  test 'CSF calculator' do
    workshop_csf_public = create :workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, on_map: true
    workshop_csf_private = create :workshop, :ended, :funded, course: Pd::Workshop::COURSE_CSF, on_map: false

    assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_public)
    assert_equal PaymentCalculatorCSF, PaymentFactory.get_calculator_class(workshop_csf_private)
  end
  class PaymentFactoryTest < ActiveSupport::TestCase
    test 'standard calculator' do
      workshop_csp = create :csp_academic_year_workshop, :ended, on_map: true, funded: true
      assert_equal PaymentCalculatorStandard, PaymentFactory.get_calculator_class(workshop_csp)
    end

    test 'counselor admin calculator' do
      # Mix of public and private types
      workshop_admin_counselor = create :admin_counselor_workshop, :ended

      assert_equal PaymentCalculatorCounselorAdmin, PaymentFactory.get_calculator_class(workshop_admin_counselor)
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
      refute_nil standard_summary
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

require 'test_helper'

class Pd::PaymentTermTest < ActiveSupport::TestCase
  setup do
    @regional_partner_1 = create :regional_partner
    @regional_partner_2 = create :regional_partner

    @workshop_1 = create :pd_workshop, sessions_from: Date.new(2017, 1, 1), regional_partner: @regional_partner_1
    @workshop_2 = create :pd_workshop, sessions_from: Date.new(2017, 3, 1), regional_partner: @regional_partner_1
  end

  test 'throws exception if no applicable payment terms' do
    create :pd_payment_term, start_date: Date.new(2017, 4, 1)
    exception = assert_raises(Exception) do
      Pd::PaymentTerm.for_workshop(@workshop_1)
    end

    assert_equal "No payment terms were found for workshop #{@workshop_1.id}", exception.message
  end

  test 'throws exception if too many payment terms' do

  end

  test 'handles date ranges correctly' do

  end

  test 'handles course and subject correctly' do

  end
end

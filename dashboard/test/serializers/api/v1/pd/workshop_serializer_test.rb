require 'test_helper'

class Api::V1::Pd::WorkshopSerializerTest < ::ActionController::TestCase
  test 'workshop_starts_within_a_month returns false if more than month out from workshop start date' do
    workshop = create :workshop, sessions_from: Date.today + 2.months
    workshop_serializer = Api::V1::Pd::WorkshopSerializer.new(workshop)
    refute workshop_serializer.workshop_starts_within_a_month
  end

  test 'workshop_starts_within_a_month returns true if exactly one month out from workshop start date' do
    workshop = create :workshop, sessions_from: Date.today + 1.month
    workshop_serializer = Api::V1::Pd::WorkshopSerializer.new(workshop)
    assert workshop_serializer.workshop_starts_within_a_month
  end

  test 'workshop_starts_within_a_month returns true if less than one month out from workshop start date' do
    workshop = create :workshop, sessions_from: Date.today + 1.week
    workshop_serializer = Api::V1::Pd::WorkshopSerializer.new(workshop)
    assert workshop_serializer.workshop_starts_within_a_month
  end

  test 'workshop_starts_within_a_month returns true if day of workshop start date' do
    workshop = create :workshop, sessions_from: Date.today
    workshop_serializer = Api::V1::Pd::WorkshopSerializer.new(workshop)
    assert workshop_serializer.workshop_starts_within_a_month
  end

  test 'workshop_starts_within_a_month returns false if past workshop start date' do
    workshop = create :workshop, sessions_from: Date.today - 1.week
    workshop_serializer = Api::V1::Pd::WorkshopSerializer.new(workshop)
    refute workshop_serializer.workshop_starts_within_a_month
  end
end

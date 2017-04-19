# == Schema Information
#
# Table name: pd_payment_terms
#
#  id                  :integer          not null, primary key
#  regional_partner_id :integer          not null
#  start_date          :date             not null
#  end_date            :date
#  course              :string(255)
#  subject             :string(255)
#  properties          :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_payment_terms_on_regional_partner_id  (regional_partner_id)
#

class Pd::PaymentTerm < ApplicationRecord
  include SerializedProperties

  belongs_to :regional_partner

  validates_presence_of :regional_partner
  validates_presence_of :start_date
  validate :sufficient_contract_terms

  serialized_attrs %w(
    per_attendee_payment
    fixed_payment
    minimum_attendees_for_payment
    maximum_attendees_for_payment
    facilitator_payment
    pay_facilitators
  )

  def self.for_workshop(workshop)
    raise "Cannot calculate payment for workshop #{workshop.id} because there is no regional partner" unless workshop.regional_partner

    found_payment_terms = nil # Should always be exactly one term, otherwise we are in bad state

    # First - look for the given date range. So all terms with start date <= workshop
    # date, and either nil end_date or end_date in the future
    payment_terms = where(regional_partner: workshop.regional_partner).
        where('start_date <= ?', workshop.workshop_starting_date).
        where('end_date > ? or end_date IS NULL', workshop.workshop_starting_date)

    # Now, look for ones with the course that matches. If there are none, fall back to nil
    payment_terms_for_course = payment_terms.where(course: workshop.course)

    if payment_terms_for_course.any?
      payment_terms_with_course_and_subject = payment_terms_for_course.where(subject: workshop.subject)
      found_payment_terms = payment_terms_with_course_and_subject.any? ? payment_terms_with_course_and_subject : payment_terms_for_course
    else
      found_payment_terms = payment_terms
    end

    # We should have exactly one payment term at this point, raise exception if we don't
    if found_payment_terms.empty?
      raise "No payment terms were found for workshop #{workshop.id}"
    elsif found_payment_terms.size > 1
      raise "Multiple payment terms were found for workshop #{workshop.id}"
    end

    found_payment_terms[0]
  end

  private

  def sufficient_contract_terms
    unless per_attendee_payment? || fixed_payment
      errors.add(:base, 'Must have either per attendee payment or fixed payment')
    end
  end
end

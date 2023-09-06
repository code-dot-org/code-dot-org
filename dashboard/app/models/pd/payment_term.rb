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

  validates_presence_of :start_date
  validate :sufficient_contract_terms

  before_create :truncate_previous_term

  serialized_attrs %w(
    per_attendee_payment
    fixed_payment
    minimum_enrollees_for_payment
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
      raise "No payment terms were found for workshop #{workshop.inspect} - full list of payment terms for this regional partner is #{where(regional_partner: workshop.regional_partner).map(&:inspect)}"
    elsif found_payment_terms.size > 1
      raise "Multiple payment terms were found for workshop #{workshop.id}"
    end

    found_payment_terms[0]
  end

  def date_range
    start_date..(end_date || Date::Infinity.new)
  end

  private def sufficient_contract_terms
    unless per_attendee_payment? || fixed_payment
      errors.add(:base, 'Must have either per attendee payment or fixed payment')
    end
  end

  private def truncate_previous_term
    extant_payment_terms = Pd::PaymentTerm.where(
      regional_partner: regional_partner,
      course: course,
      subject: subject
    )

    # Payment terms that conflict with the start date
    extant_payment_terms.each do |old_payment_term|
      old_term_range = old_payment_term.start_date..(old_payment_term.end_date || Date::Infinity.new)

      next unless date_range.overlaps?(old_term_range)

      # Four possible overlaps, illustrated by this ascii art
      # Old ends during new
      #  <---Old--->
      #       <---New--->

      # Old contains new
      #  <---Old------------>
      #       <---New--->

      # New ends during old
      #       <---Old--->
      #  <---New--->

      # New contains old
      #      <---Old--->
      #  <----------New--->
      if old_payment_term.start_date < start_date
        unless end_date.nil? || (old_payment_term.end_date && old_payment_term.end_date < end_date)
          # Old contains new means we have to create a new payment term
          Pd::PaymentTerm.create!(
            start_date: end_date,
            end_date: old_payment_term.end_date,
            regional_partner: regional_partner,
            course: course,
            subject: subject,
            properties: old_payment_term.properties
          )
        end
        # in both old ends during new and old contains new, update
        # the old payment term
        old_payment_term.update!(end_date: start_date)
      else
        if end_date && end_date < (old_payment_term.end_date || Date::Infinity.new)
          # New ends during old, move the old start date up
          old_payment_term.update(start_date: end_date)
        else
          # New contains old - no need for the old term
          old_payment_term.destroy
        end
      end
    end
  end
end

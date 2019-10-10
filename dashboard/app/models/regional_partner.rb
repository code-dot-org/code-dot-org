# == Schema Information
#
# Table name: regional_partners
#
#  id                 :integer          not null, primary key
#  name               :string(255)      not null
#  group              :integer
#  urban              :boolean
#  attention          :string(255)
#  street             :string(255)
#  apartment_or_suite :string(255)
#  city               :string(255)
#  state              :string(255)
#  zip_code           :string(255)
#  phone_number       :string(255)
#  notes              :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deleted_at         :datetime
#  properties         :text(65535)
#

require 'state_abbr'

class RegionalPartner < ActiveRecord::Base
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  has_many :regional_partner_program_managers
  has_many :program_managers,
    class_name: 'User',
    through: :regional_partner_program_managers

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', through: :regional_partner_program_managers
  has_many :mappings, -> {order :state, :zip_code}, class_name: Pd::RegionalPartnerMapping, dependent: :destroy

  has_many :pd_workshops, class_name: 'Pd::Workshop', foreign_key: 'regional_partner_id'

  include Pd::SharedWorkshopConstants

  include SerializedProperties

  serialized_attrs %w(
    cohort_capacity_csd
    cohort_capacity_csp
    apps_open_date_csd_teacher
    apps_open_date_csd_facilitator
    apps_open_date_csp_teacher
    apps_open_date_csp_facilitator
    apps_close_date_csd_teacher
    apps_close_date_csd_facilitator
    apps_close_date_csp_teacher
    apps_close_date_csp_facilitator
    apps_priority_deadline_date
    applications_principal_approval
    applications_decision_emails
    link_to_partner_application
    csd_cost
    csp_cost
    cost_scholarship_information
    additional_program_information
    contact_name
    contact_email
    has_csf
  )

  PRINCIPAL_APPROVAL_TYPES = [
    ALL_REQUIRE_APPROVAL = 'all_teachers_required'.freeze,
    SELECTIVE_APPROVAL = 'required_per_teacher'.freeze
  ].freeze

  APPLICATION_DECISION_EMAILS = [
    SENT_BY_PARTNER = 'sent_by_partner'.freeze,
    SENT_BY_SYSTEM = 'sent_by_system'.freeze
  ].freeze

  # Upcoming and not ended
  def future_pd_workshops_organized
    pd_workshops_organized.future
  end

  def summer_workshops_application_state
    # Now closed.  (Closed date has passed.)
    if summer_workshops_latest_apps_close_date && summer_workshops_latest_apps_close_date <= Time.zone.now
      return WORKSHOP_APPLICATION_STATES[:now_closed]
    # Currently open.  (Not closed, but open date has passed.)
    elsif summer_workshops_earliest_apps_open_date && summer_workshops_earliest_apps_open_date <= Time.zone.now
      return WORKSHOP_APPLICATION_STATES[:currently_open]
    # Applications open at a known date.  (Not closed, not open, but we do have an opening date in the future.)
    elsif summer_workshops_earliest_apps_open_date && summer_workshops_earliest_apps_open_date > Time.zone.now
      return WORKSHOP_APPLICATION_STATES[:opening_at]
    # Applications open, but not sure when.  (Not closed, not open, but we have no opening date yet.)
    else
      return WORKSHOP_APPLICATION_STATES[:opening_sometime]
    end
  end

  # If there is a priority deadline date and it is still upcoming, then return it.  Otherwise return nil.
  def upcoming_priority_deadline_date
    if apps_priority_deadline_date && apps_priority_deadline_date > Time.zone.now
      Date.parse(apps_priority_deadline_date).strftime('%B %e, %Y')
    else
      nil
    end
  end

  def summer_workshops_earliest_apps_open_date
    if apps_open_date_csd_teacher || apps_open_date_csp_teacher
      Date.parse([apps_open_date_csd_teacher, apps_open_date_csp_teacher].compact.min).strftime('%B %e, %Y')
    end
  end

  def summer_workshops_latest_apps_close_date
    if apps_close_date_csd_teacher || apps_close_date_csp_teacher
      Date.parse([apps_close_date_csd_teacher, apps_close_date_csp_teacher].compact.max).strftime('%B %e, %Y')
    end
  end

  def upcoming_summer_workshops
    pd_workshops.
      future.
      where(subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP).
      map {|w| w.slice(:location_name, :location_address, :workshop_date_range_string, :course)}
  end

  # Make sure the phone number contains at least 10 digits.
  # Allow any format and additional text, such as extensions.
  PHONE_NUMBER_VALIDATION_REGEX = /(\d.*){10}/

  validates :name, length: {minimum: 1, maximum: 255}
  validates :group, numericality: {only_integer: true, greater_than: 0}, if: -> {group.present?}
  validates_format_of :phone_number, with: PHONE_NUMBER_VALIDATION_REGEX, if: -> {phone_number.present?}
  validates :zip_code, us_zip_code: true, if: -> {zip_code.present?}
  validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: -> {state.present?}
  validates_inclusion_of :applications_principal_approval, in: PRINCIPAL_APPROVAL_TYPES, if: -> {applications_principal_approval.present?}
  validates_inclusion_of :applications_decision_emails, in: APPLICATION_DECISION_EMAILS, if: -> {applications_decision_emails.present?}
  validates :csd_cost, numericality: {greater_than: 0}, if: -> {csd_cost.present?}
  validates :csp_cost, numericality: {greater_than: 0}, if: -> {csp_cost.present?}

  # assign a program manager to a regional partner
  def program_manager=(program_manager_id)
    regional_partner_program_managers << regional_partner_program_managers.find_or_create_by!(
      regional_partner_id: id,
      program_manager_id: program_manager_id
    )
  end

  # Since contact_email is defined dynamically by SerializedProperties, that will take precedence,
  # and we can't 'override' it in this class.
  # In order to fallback to another value when contact_email is missing, we need a wrapper method:
  # @return contact_email, or the first program manager's email
  def contact_email_with_backup
    contact_email || program_managers&.first&.email
  end

  # find a Regional Partner that services a particular region
  # @param [String] zip_code
  # @param [String] state - 2-letter state code
  def self.find_by_region(zip_code, state)
    return nil if zip_code.nil? && state.nil?

    base_query = RegionalPartner.joins(:mappings)
    state_query = base_query.where(pd_regional_partner_mappings: {state: state}) if state
    zip_code_query = base_query.where(pd_regional_partner_mappings: {zip_code: zip_code}) if zip_code

    find_by_region_query =
      if state && zip_code.nil?
        state_query
      elsif state.nil? && zip_code
        zip_code_query
      elsif state && zip_code
        state_query.or(zip_code_query)
      end

    # prefer match by zip code when multiple partners cover the same state
    return find_by_region_query.order('pd_regional_partner_mappings.zip_code IS NOT NULL DESC').first
  end

  # Find a Regional Partner that services a particular ZIP.
  # This works similarly to find_by_region, above, but it does one extra thing: if a US ZIP is provided
  # and we don't find a partner with that ZIP, we geocode that ZIP to get a state and try with that
  # state.
  # @param [String] zip_code
  def self.find_by_zip(zip_code)
    partner = nil
    state = nil

    if RegexpUtils.us_zip_code?(zip_code)
      # Try to find the matching partner using the ZIP code.
      partner = RegionalPartner.find_by_region(zip_code, nil)

      # Otherwise, get the state for the ZIP code and try to find the matching partner using that.
      unless partner
        begin
          Geocoder.with_errors do
            # Geocoder can raise a number of errors including SocketError, with a common base of StandardError
            # See https://github.com/alexreisner/geocoder#error-handling
            Retryable.retryable(on: StandardError) do
              state = Geocoder.search(zip_code)&.first&.state_code
            end
          end
        rescue StandardError => e
          # Log geocoding errors to honeybadger but don't fail
          Honeybadger.notify(e,
            error_message: 'Error geocoding regional partner workshop zip_code',
            context: {
              zip_code: zip_code
            }
          )
        end

        if state
          partner = RegionalPartner.find_by_region(nil, state)
        end
      end
    end

    return partner, state
  end

  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true}.freeze

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      params = {
        name: row['name'],
        group: row['group'],
      }
      RegionalPartner.where(params).first_or_create!
    end
  end
end

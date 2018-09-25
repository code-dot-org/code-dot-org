# == Schema Information
#
# Table name: pd_workshop_material_orders
#
#  id                           :integer          not null, primary key
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  pd_enrollment_id             :integer          not null
#  user_id                      :integer          not null
#  school_or_company            :string(255)
#  street                       :string(255)      not null
#  apartment_or_suite           :string(255)
#  city                         :string(255)      not null
#  state                        :string(255)      not null
#  zip_code                     :string(255)      not null
#  phone_number                 :string(255)      not null
#  order_attempted_at           :datetime
#  ordered_at                   :datetime
#  order_response               :text(65535)
#  order_error                  :text(65535)
#  order_id                     :string(255)
#  order_status                 :string(255)
#  order_status_last_checked_at :datetime
#  order_status_changed_at      :datetime
#  tracking_id                  :string(255)
#  tracking_url                 :string(255)
#
# Indexes
#
#  index_pd_workshop_material_orders_on_pd_enrollment_id  (pd_enrollment_id) UNIQUE
#  index_pd_workshop_material_orders_on_user_id           (user_id) UNIQUE
#

require_dependency 'pd/mimeo_rest_client'
require 'state_abbr'

module Pd
  class WorkshopMaterialOrder < ActiveRecord::Base
    SYSTEM_DELETED = 'system_deleted'.freeze
    # Make sure the phone number contains at least 10 digits.
    # Allow any format and additional text, such as extensions.
    PHONE_NUMBER_VALIDATION_REGEX = /(\d.*){10}/

    ADDRESS_NOT_VERIFIED = "Address could not be verified. Please double-check."
    DOES_NOT_MATCH_ADDRESS = "doesn't match the address. Did you mean"
    INVALID_STREET_ADDRESS = "must be a valid street address (no PO boxes)"

    belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
    belongs_to :user
    has_one :workshop, class_name: 'Pd::Workshop', through: :enrollment, foreign_key: :pd_workshop_id

    validates :enrollment, presence: true, uniqueness: true
    validates :user, presence: true, uniqueness: true, if: -> {new_record? || user_id_changed?}
    validates_presence_of :street, if: -> {!user.try(:deleted?)}
    validates_presence_of :city, if: -> {!user.try(:deleted?)}
    validates_presence_of :state
    validates_presence_of :zip_code, if: -> {!user.try(:deleted?)}
    validates_presence_of :phone_number, if: -> {!user.try(:deleted?)}
    validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: -> {state.present?}

    validates_format_of :phone_number, with: PHONE_NUMBER_VALIDATION_REGEX, if: -> {phone_number.present? && !User.with_deleted.find_by_id(user_id).try(:deleted?)}
    validates :zip_code, us_zip_code: true, if: -> {zip_code.present? && !User.with_deleted.find_by_id(user_id).try(:deleted?)}

    validate :valid_address?, if: -> {address_fields_changed? && !address_override? && !user.try(:deleted?)}

    attr_accessor :address_override

    def address_override?
      @address_override == "1"
    end

    def valid_address?
      # only run this validation once others pass
      return unless errors.empty?

      found = Geocoder.search(full_address)
      if found.empty?
        errors.add(:base, ADDRESS_NOT_VERIFIED)
      else
        if found.first.city != city
          errors.add(:city, "#{DOES_NOT_MATCH_ADDRESS} #{found.first.city}?")
        end
        if found.first.postal_code != zip_code
          errors.add(:zip_code, "#{DOES_NOT_MATCH_ADDRESS} #{found.first.postal_code}?")
        end
        if found.first.state_code != state
          errors.add(:state, "#{DOES_NOT_MATCH_ADDRESS} #{found.first.state_code}?")
        end
        unless found.first.street_number
          errors.add(:street, INVALID_STREET_ADDRESS)
        end
      end
    end

    def address_unverified?
      geocoder_errors = [ADDRESS_NOT_VERIFIED, DOES_NOT_MATCH_ADDRESS, INVALID_STREET_ADDRESS]
      errors.full_messages.any? do |error|
        geocoder_errors.any? do |geo_error|
          error.include?(geo_error)
        end
      end
    end

    validate :allowed_course?
    def allowed_course?
      return unless workshop

      unless workshop.course == Pd::Workshop::COURSE_CSF
        errors.add(:workshop, 'must be CSF')
      end
    end

    scope :active, -> {where(tracking_id: nil)}
    scope :unordered, -> {where(order_id: nil)}
    scope :successfully_ordered, -> {where.not(order_id: nil)}
    scope :shipped, -> {where(order_status: MimeoRestClient::STATUS_SHIPPED)}
    scope :with_order_errors, -> {where.not(order_error: nil)}
    scope :search_emails, ->(email_substring) do
      joins(:enrollment).where('pd_enrollments.email LIKE ?', "%#{email_substring.strip.downcase}%")
    end

    def full_address
      [street, apartment_or_suite, city, state, zip_code].compact.join(', ')
    end

    def address_fields_changed?
      street_changed? || apartment_or_suite_changed? || city_changed? || state_changed? || zip_code_changed?
    end

    def expected_ship_date
      return nil unless order_response
      MimeoRestClient.parse_date order_response['RecipientDetails'].first['ExpectedShipDate']
    end

    def expected_delivery_date
      return nil unless order_response
      MimeoRestClient.parse_date order_response['RecipientDetails'].first['ExpectedDeliveryDate']
    end

    def order_response
      raw = read_attribute :order_response
      raw.nil? ? nil : JSON.parse(raw)
    end

    def order_error
      raw = read_attribute :order_error
      raw.nil? ? nil : JSON.parse(raw)
    end

    def order_error_body
      order_error.try(:[], 'body')
    end

    def ordered?
      ordered_at.present?
    end

    def shipped?
      order_status == MimeoRestClient::STATUS_SHIPPED
    end

    # Place order with the Mimeo API, based on shipping info in a valid model
    # Set order_attempted_at, and
    #   on success: ordered_at, order_response, order_id
    #   on error: order_error
    # This is idempotent. Once an order has been successfully placed, subsequent calls will
    #   return the existing response.
    # @param max_attempts [Integer] Number of attempts on known retryable errors for each API call
    #   (Default 2, i.e. one retry)
    # @return [Hash, nil] either the raw order response, or nil if no order was made or it failed
    # @raise [RuntimeError] if the model fails validation.
    def place_order(max_attempts: 2)
      raise "Fix errors before ordering: #{errors.full_messages}" unless valid?
      raise "Cannot order for deleted users" if user.try(:deleted?)
      return order_response if ordered?

      update! order_attempted_at: Time.zone.now
      response = nil
      begin
        client_params = {max_attempts: max_attempts}
        response = MimeoRestClient.new(client_params).place_order(
          first_name: enrollment.first_name,
          last_name: enrollment.last_name,
          company_name: school_or_company,
          street: street,
          apartment_or_suite: apartment_or_suite,
          city: city,
          state_or_province: state,
          country: 'US',
          postal_code: zip_code,
          email: enrollment.email,
          phone_number: phone_number
        )

        update!(
          ordered_at: order_attempted_at,
          order_response: response.to_json,
          order_error: nil,
          order_id: response['OrderFriendlyId']
        )
      rescue RestClient::ExceptionWithResponse => error
        update! order_error: report_error(:place_order, error).to_json
      end

      response
    end

    # Update status and tracking info.
    # @param max_attempts [Integer] Number of attempts on known retryable errors for each API call
    #   (Default 2, i.e. one retry)
    # @return [Pd::WorkshopMaterialOrder] this object (with updated status and tracking)
    def refresh(max_attempts: 2)
      client_params = {max_attempts: max_attempts}
      check_status(client_params)
      update_tracking_info(client_params)

      self
    end

    # Removes all PII related to the order in the form_data column.
    def clear_data
      update!(
        school_or_company: nil,
        street: SYSTEM_DELETED,
        apartment_or_suite: SYSTEM_DELETED,
        city: SYSTEM_DELETED,
        zip_code: SYSTEM_DELETED,
        phone_number: SYSTEM_DELETED,
        tracking_url: SYSTEM_DELETED
      )
    end

    private

    # Check the status of an order with the Mimeo API
    # Set order_status_last_checked_at, and when the status changes:
    #   order_status and order_status_changed_at
    # See MimeoRestClient::STATUS for available status strings.
    # Once 'Shipped', it will not be checked again.
    # @param client_params [Hash] params for the client initialization
    def check_status(client_params)
      return nil unless order_id
      return order_status if MimeoRestClient.final_status? order_status

      update! order_status_last_checked_at: Time.zone.now
      begin
        new_status = MimeoRestClient.new(client_params).get_status order_id

        if new_status != order_status
          update!(
            order_status: new_status,
            order_status_changed_at: order_status_last_checked_at
          )
        end
      rescue RestClient::ExceptionWithResponse => error
        report_error :check_status, error
      end
    end

    # Update order tracking info via the Mimeo API
    # Set tracking_id and tracking_url, if present
    # This is idempotent. Once a tracking id is received, it will be kept on
    #   subsequent calls (without contacting Mimeo)
    # @param client_params [Hash] params for the client initialization
    def update_tracking_info(client_params)
      return nil unless shipped?

      unless tracking_id.present?
        begin
          response = MimeoRestClient.new(client_params).track order_id
          update!(
            tracking_id: response['TrackingNumber'],
            tracking_url: response['TrackingUrl']
          )
        rescue RestClient::ExceptionWithResponse => error
          report_error :track, error
        end
      end
    end

    # Parse and report error
    # @param method [Symbol]
    # @param error [RestClient::ExceptionWithResponse]
    # @param notify_honeybadger [Boolean] default: true
    # @return [Hash] hash of parsed error details, code: and body:
    def report_error(method, error, notify_honeybadger: true)
      # error response should have a JSON body, but in case the response is missing (i.e. timeout), or
      # the body is a different format and can't be parsed, use the raw string
      body_raw = error.response.try(:body)
      body_parsed = JSON.parse(body_raw) rescue body_raw
      error_details = {code: error.response.try(:code), body: body_parsed}

      if notify_honeybadger
        Honeybadger.notify(error,
          error_message: "Error in MimeoRestClient.#{method}: #{error.message}",
          context: {
            pd_workshop_material_order_id: id,
            error_details: error_details
          }
        )
      end

      error_details
    end
  end
end

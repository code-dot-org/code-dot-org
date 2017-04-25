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

require 'pd/mimeo_rest_client'
require 'state_abbr'
module Pd
  class WorkshopMaterialOrder < ActiveRecord::Base
    USER_CORRECTABLE_ORDER_ERRORS = [{
      match_text: 'Address found, but requires a apartment/suite.',
      field: :apartment_or_suite,
      message: 'is required for this address'
    }]

    # Make sure the phone number contains at least 10 digits.
    # Allow any format and additional text, such as extensions.
    PHONE_NUMBER_VALIDATION_REGEX = /(\d.*){10}/

    # Make sure the street address does not appear to be a PO Box
    PO_BOX_REGEX = /\A\W*p[ .]?o[ .]?/i

    belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
    belongs_to :user
    has_one :workshop, class_name: 'Pd::Workshop', through: :enrollment, foreign_key: :pd_workshop_id

    validates :enrollment, presence: true, uniqueness: true
    validates :user, presence: true, uniqueness: true
    validates_presence_of :street
    validates_presence_of :city
    validates_presence_of :state
    validates_presence_of :zip_code
    validates_presence_of :phone_number
    validates_inclusion_of :state, in: STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s), if: -> {state.present?}

    validates_format_of :street, without: PO_BOX_REGEX,
      if: -> {street.present?}, message: 'must be a street address, not a PO Box'

    validates_format_of :phone_number, with: PHONE_NUMBER_VALIDATION_REGEX, if: -> {phone_number.present?}
    validates :zip_code, us_zip_code: true, if: -> {zip_code.present?}

    validate :valid_address?, if: :address_fields_changed?
    def valid_address?
      # only run this validation once others pass
      return unless errors.empty?

      found = Geocoder.search(full_address)
      if found.empty?
        errors.add(:base, 'Address could not be verified. Please double-check.')
      elsif found.first.postal_code != zip_code
        errors.add(:zip_code, "doesn't match the address. Did you mean #{found.first.postal_code}?")
      end
    end

    validate :allowed_course?
    def allowed_course?
      return unless workshop

      unless workshop.course == Pd::Workshop::COURSE_CSF
        errors.add(:workshop, 'must be CSF')
      end
    end

    validate :no_user_correctable_order_errors?
    # Validates that the order error is not a known user-correctable error.
    # Note: the order error response body has fields ErrorCode and Message, for example:
    # {
    #   ErrorCode: 'InternalServerError',
    #   Message: "PlaceOrder error occurs for andrew@code.org :
    #             The recipient Andrew Oberhardt has address validation issue:
    #             Address found, but requires a apartment/suite."
    # }
    def no_user_correctable_order_errors?
      return if shipped?
      error_message = order_error_body.try(:[], 'Message')
      if error_message
        USER_CORRECTABLE_ORDER_ERRORS.each do |user_correctable_error|
          if error_message.include? user_correctable_error[:match_text]
            errors.add(user_correctable_error[:field], user_correctable_error[:message])
          end
        end
      end
    end

    scope :active, -> {where(tracking_id: nil)}
    scope :successfully_ordered, -> {where.not(order_id: nil)}
    scope :shipped, -> {where(order_status: MimeoRestClient::STATUS_SHIPPED)}
    scope :with_order_errors, -> {where.not(order_error: nil)}

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
    # @return [Hash, nil] either the raw order response, or nil if no order was made or it failed
    # @raise [RuntimeError] if the model fails validation.
    def place_order
      raise "Fix errors before ordering: #{errors.full_messages}" unless valid?
      return order_response if ordered?

      self.order_attempted_at = Time.zone.now
      response = nil
      begin
        response = MimeoRestClient.new.place_order(
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

        self.ordered_at = order_attempted_at
        self.order_response = response.to_json
        self.order_error = nil
        self.order_id = response['OrderFriendlyId']
      rescue RestClient::ExceptionWithResponse => error
        is_correctable = USER_CORRECTABLE_ORDER_ERRORS.any? do |uce|
          error.response.try(:body).include?(uce[:match_text])
        end
        self.order_error = report_error(:place_order, error, notify_honeybadger: !is_correctable).to_json
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

      self.order_status_last_checked_at = Time.zone.now
      begin
        new_status = MimeoRestClient.new(client_params).get_status order_id

        if new_status != order_status
          self.order_status = new_status
          self.order_status_changed_at = order_status_last_checked_at
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
    # @param method [String]
    # @param error [RestClient::ExceptionWithResponse]
    # @return [Hash] hash of parsed error details, code: and body:
    def report_error(method, error, notify_honeybadger: true)
      # error response should have a JSON body, but in case the response is missing (i.e. timeout), or
      # the body is a different format and can't be parsed, use the raw string
      body_raw = error.response.try(:body)
      body_parsed = JSON.parse(body_raw) rescue body_raw
      error_details = {code: error.response.code, body: body_parsed}

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

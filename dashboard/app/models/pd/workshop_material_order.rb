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
    validates :phone_number, us_phone_number: true, if: -> {phone_number.present?}
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

    def ordered?
      ordered_at.present?
    end

    def shipped?
      order_status == 'Shipped'
    end

    # Place order with the Mimeo API, based on shipping info in a valid model
    # Save order_attempted_at to the DB, and
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
        self.order_error = report_error(:place_order, error).to_json
      ensure
        save!
      end

      response
    end

    # Check the status of an order with the Mimeo API
    # Save order_status_last_checked_at in the DB, and when the status changes:
    #   order_status and order_status_changed_at
    # @return [String, nil] last known order status string, or nil if no order has been made
    # See MimeoRestClient::STATUS for available status strings.
    # Once 'Shipped', it will not be checked again.
    def check_status
      return nil unless order_id
      return order_status if MimeoRestClient.final_status? order_status

      self.order_status_last_checked_at = Time.zone.now
      begin
        new_status = MimeoRestClient.new.get_status order_id

        if new_status != order_status
          self.order_status = new_status
          self.order_status_changed_at = order_status_last_checked_at
        end
      rescue RestClient::ExceptionWithResponse => error
        puts "error: #{error}"
        report_error :check_status, error
      ensure
        save!
      end

      order_status
    end

    # Track the order via the Mimeo API
    # Save tracking_id and tracking_url, if present
    # This is idempotent. Once a tracking id is received, it will be returned on
    #   subsequent calls (without contacting Mimeo)
    # @return [Hash, nil] hash of tracking :id and :url, or nil if it hasn't shipped.
    def track
      return nil unless shipped?

      unless tracking_id.present?
        begin
          response = MimeoRestClient.new.track order_id
          update!(
            tracking_id: response['TrackingNumber'],
            tracking_url: response['TrackingUrl']
          )
        rescue RestClient::ExceptionWithResponse => error
          report_error :track, error
          return nil
        end
      end

      {tracking_id: tracking_id, tracking_url: tracking_url}
    end

    # Update status and tracking info
    def refresh
      check_status
      track
    end

    private

    # Parse and report error
    # @param method [String]
    # @param error [RestClient::ExceptionWithResponse]
    # @return [Hash] hash of parsed error details, code: and body:
    def report_error(method, error)
      # error response should have a JSON body, but in case the response is missing (i.e. timeout), or
      # the body is a different format and can't be parsed, use the raw string
      body_raw = error.response.try(:body)
      body_parsed = JSON.parse(body_raw) rescue body_raw
      error_details = {code: error.response.code, body: body_parsed}

      Honeybadger.notify(error,
        error_message: "Error in MimeoRestClient.#{method}: #{error.message}",
        context: {
          pd_workshop_material_order_id: id,
          error_details: error_details
        }
      )

      error_details
    end
  end
end

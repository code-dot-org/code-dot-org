# Wrapper for Mimeo's REST API.
# Mimeo (mimeo.com) is our partner for order fulfillment.
# API docs: https://mimeo.3scale.net/REST
class Pd::MimeoRestClient
  STATUS = {
    Submitted: 1,
    Canceled: 18,
    Shipped: 19,
    Processing: 24,
    Current: 100,
    Saved: 101,
    Scheduled: 102,
    Pending: 103,
    Expired: 104
  }.freeze

  STATUS_SHIPPED = 'Shipped'.freeze

  RETRYABLE_ERROR_TEXT = 'An unexpected error occurred while processing the request. '\
      'Information related to the error has been logged and will be reviewed. '\
			'Please attempt to submit your request again at a future time.'.freeze

  # @param max_attempts [Integer] Number of attempts on known retryable errors
  #   (Default 2, i.e. one retry)
  def initialize(max_attempts: 2)
    @max_attempts = max_attempts
    @document_name = get_config_value :document_name
    @document_id = get_config_value :document_id
    @shipping_method_id = get_config_value :shipping_method_id

    @resource = RestClient::Resource.new(
      get_config_value(:endpoint),
      user: get_config_value(:user),
      password: get_config_value(:password),
      headers: {
        content_type: :json,
        accept: :json
      }
    )
  end

  # Places an order with Mimeo
  # @return [Hash] order info.
  # See http://connect.sandbox.mimeo.com/2012/02/Orders/help/operations/PlaceOrder
  def place_order(
    first_name:,
    last_name:,
    company_name: nil, # optional
    street:,
    apartment_or_suite: nil, # optional
    city:,
    state_or_province:, # 2-letter code, e.g. WA
    country:, # 2-letter code, e.g. US
    postal_code:,
    email:,
    phone_number:
  )
    order_params = {
      LineItems: [
        {
          Name: @document_name,
          StoreItemReference: {
            Id: @document_id,
          },
          Quantity: 1,
        }
      ],
      Recipients: [
        {
          Address: {
            FirstName: first_name,
            LastName: last_name,
            CompanyName: company_name,
            Street: street,
            ApartmentOrSuite: apartment_or_suite,
            City: city,
            StateOrProvince: state_or_province,
            Country: country,
            PostalCode: postal_code,
            TelephoneNumber: phone_number,
            Email: email,

            # Guidance from the Mimeo API support team on 2017-04-10 is to always set IsResidential to true
            IsResidential: true
          },
          ShippingMethodId: @shipping_method_id
        }
      ],
      PaymentMethod: {
        __type: 'UserCreditLimitPaymentMethod:http://schemas.mimeo.com/EnterpriseServices/2008/09/OrderService'
      },
      Options: {
        RecipientNotificationOptions: {
          SendShippingAlerts: false,
          ShouldNotifyRecipients: false,
          IncludeSenderContactInformation: false
        }
      }
    }

    response = post 'Orders/PlaceOrder', order_params
    JSON.parse response.body
  end

  # Check the status of an order
  # @param order_friendly_id [String]
  # @return [Symbol] one of the values in the STATUS enum
  # See http://connect.sandbox.mimeo.com/2012/02/Orders/help/operations/GetOrderStatus
  def get_status(order_friendly_id)
    response = get "Orders/#{order_friendly_id}/status"
    status = STATUS.key(response.body.to_i)
    raise "Unrecognized status #{response.body}" unless status
    status.to_s
  end

  # Track an order
  # @param order_friendly_id [String]
  # @return [Hash] order tracking info
  # See http://connect.sandbox.mimeo.com/2012/02/Orders/help/operations/GetOrderTracking
  # Note - observation shows that the above doc is incorrect. Instead of "RecipientId" and "Packages",
  #   the actual JSON returned from Mimeo uses "Key" and "Value" for those fields respectively.
  def track(order_friendly_id)
    response = get "Orders/#{order_friendly_id}/tracking"

    # We order a single item, so it's always one package.
    # The tracking data is the first item in the "Value" (Packages) array,
    # in the first item of the outer array.
    JSON.parse(response.body)[0]['Value'][0]
  end

  # Parse a date string returned from the Mimeo API.
  # These dates are in the format: "/Date(%Q%z)/" or "/Date(%Q)/",
  #   where %Q is microseconds since Unix epoch and %z is the UTC offset. The offset is not always present.
  # See http://www.newtonsoft.com/json/help/html/DatesInJSON.htm
  # and https://apidock.com/ruby/DateTime/strftime
  # Here we only care about the date, not the time
  # @return [Date]
  def self.parse_date(date_string)
    match = /^\/Date\((\d+)([-+]\d+)?\)\/$/.match(date_string)
    raise ArgumentError unless match
    format_string = match[2] ? '%Q%z' : '%Q'
    DateTime.strptime(match[1..2].compact.join, format_string).to_date
  end

  # Determines if a status is final.
  # @param status [String]
  # @return [Boolean]
  def self.final_status?(status)
    %w(Canceled Shipped Expired).include? status.to_s
  end

  private

  # Determines if the error is a known retriable error,
  # a spurious internal server error in the Mimeo API
  # @param [RestClient::ExceptionWithResponse] error
  # @return [Boolean] true if the error is retryable, otherwise false
  def retryable_error?(error)
    error.try(:response).try(:body).try(:include?, RETRYABLE_ERROR_TEXT)
  end

  # Executes the block with retries for retriable errors
  def with_retries
    # get or post
    calling_method_name = caller_locations(1, 1)[0].label

    exception_cb = ->(exception) do
      raise exception unless retryable_error?(exception)
      CDO.log.info("Retrying Pd::MimeoRestClient.#{calling_method_name} after receiving error: #{exception}")
    end

    Retryable.retryable(tries: @max_attempts, exception_cb: exception_cb) do
      yield
    end
  end

  # Makes a POST call to the specified path with params
  # @param path [String]
  # @param params [Hash]
  # @return [RestClient::Response]
  # @raises [RestClient::ExceptionWithResponse] on known error codes.
  # See https://github.com/rest-client/rest-client#exceptions-see-httpwwww3orgprotocolsrfc2616rfc2616-sec10html
  def post(path, params)
    with_retries do
      @resource[path].post params.to_json
    end
  end

  # Makes a GET call to the specified path
  # @param path [String]
  # @return [RestClient::Response]
  # @raises [RestClient::ExceptionWithResponse] on known error codes.
  # See https://github.com/rest-client/rest-client#exceptions-see-httpwwww3orgprotocolsrfc2616rfc2616-sec10html
  def get(path)
    with_retries do
      @resource[path].get
    end
  end

  def get_config_value(key)
    raise KeyError, "Unable to find mimeo setting: #{key}" unless CDO.mimeo_api.try(:key?, key.to_s)
    CDO.mimeo_api[key.to_s]
  end
end

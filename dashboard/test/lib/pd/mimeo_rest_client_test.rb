require 'test_helper'
require 'pd/mimeo_rest_client'

class Pd::MimeoRestClientTest < ActiveSupport::TestCase
  KNOWN_RETRYABLE_ERROR_FILENAME = 'mimeo_rest_client_known_retryable_errors.json'

  ORDER_ID = '00-1111-22222-33333'.freeze

  # This is the subset of fields we care about. The actual response has additional data.
  ORDER_RESPONSE_BODY = {
    OrderFriendlyId: ORDER_ID,
    RecipientDetails: [{
      ExpectedShipDate: '/Date(1491951599000)/',
      ExpectedDeliveryDate: '/Date(1492491540000-0500)/'
    }]
  }.to_json.freeze

  # This is the subset of fields we care about. The actual response has additional data.
  TRACKING_DATA = {
    TrackingNumber: '123456789',
    TrackingUrl: 'http://www.fedex.com/Tracking?tracknumbers=123456789&action=track&language=english&cntry_code=us&mps=y'
  }.stringify_keys.freeze

  TRACK_RESPONSE_BODY = [
    {
      Key: ORDER_ID,
      Value: [TRACKING_DATA]
    }
  ].to_json.freeze

  setup do
    @settings = {
      endpoint: 'http://connect.sandbox.mimeo.com/2012/02/',
      user: 'api_user',
      password: 'password',
      document_id: '11111111-1111-1111-1111-111111111111',
      document_name: 'Code.org Teacher Kit',
      shipping_method_id: '22222222-2222-2222-2222-222222222222'
    }
    CDO.stubs(:mimeo_api).returns(@settings.stringify_keys)

    @mock_resource = mock
    RestClient::Resource.stubs(:new).returns(@mock_resource)
  end

  test 'initialize' do
    RestClient::Resource.expects(:new).with(
      @settings[:endpoint],
      user: @settings[:user],
      password: @settings[:password],
      headers: {
        content_type: :json,
        accept: :json
      }
    )

    client = Pd::MimeoRestClient.new
    assert client
    assert_equal @settings[:document_id], client.instance_variable_get(:@document_id)
    assert_equal @settings[:document_name], client.instance_variable_get(:@document_name)
    assert_equal @settings[:shipping_method_id], client.instance_variable_get(:@shipping_method_id)
  end

  test 'initialize fails for missing settings' do
    @settings.keys.each do |key|
      CDO.stubs(:mimeo_api).returns(@settings.except(key).stringify_keys)
      e = assert_raises KeyError do
        Pd::MimeoRestClient.new
      end
      assert_equal "Unable to find mimeo setting: #{key}", e.message
    end
  end

  test 'place_order' do
    expected_params = {
      LineItems: [
        {
          Name: @settings[:document_name],
          StoreItemReference: {
            Id: @settings[:document_id],
          },
          Quantity: 1,
        }
      ],
      Recipients: [
        {
          Address: {
            FirstName: 'first_name',
            LastName: 'last_name',
            CompanyName: 'Code.org',
            Street: '1501 4th Ave',
            ApartmentOrSuite: 'Suite 900',
            City: 'Seattle',
            StateOrProvince: 'WA',
            Country: 'US',
            PostalCode: '98101',
            TelephoneNumber: '555-111-2222',
            Email: 'test@code.org',
            IsResidential: true
          },
          ShippingMethodId: @settings[:shipping_method_id]
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

    client = Pd::MimeoRestClient.new
    client.expects(:post).with('Orders/PlaceOrder', expected_params).returns(mock_response(ORDER_RESPONSE_BODY))

    response = client.place_order(
      first_name: 'first_name',
      last_name: 'last_name',
      street: '1501 4th Ave',
      apartment_or_suite: 'Suite 900',
      city: 'Seattle',
      state_or_province: 'WA',
      country: 'US',
      postal_code: '98101',
      email: 'test@code.org',
      phone_number: '555-111-2222',
      company_name: 'Code.org'
    )

    assert_equal JSON.parse(ORDER_RESPONSE_BODY), response
  end

  test 'get_status' do
    client = Pd::MimeoRestClient.new
    client.expects(:get).with("Orders/#{ORDER_ID}/status").returns(mock_response('1'))
    assert_equal 'Submitted', client.get_status(ORDER_ID)
  end

  test 'get_status raises error for unrecognized status' do
    client = Pd::MimeoRestClient.new
    client.expects(:get).with("Orders/#{ORDER_ID}/status").returns(mock_response('-1'))
    e = assert_raises RuntimeError do
      client.get_status(ORDER_ID)
    end
    assert_equal 'Unrecognized status -1', e.message
  end

  test 'track' do
    client = Pd::MimeoRestClient.new
    client.expects(:get).with("Orders/#{ORDER_ID}/tracking").returns(mock_response(TRACK_RESPONSE_BODY))
    assert_equal TRACKING_DATA, client.track(ORDER_ID)
  end

  test 'retry known retriable errors' do
    client = Pd::MimeoRestClient.new(max_attempts: 3)

    # Load known retryable errors from file, and test each one
    known_retryable_error_path = File.join(File.dirname(__FILE__), KNOWN_RETRYABLE_ERROR_FILENAME)
    known_errors = JSON.parse(File.read(known_retryable_error_path))
    known_errors.each do |known_error_details|
      method = known_error_details['method']
      path = known_error_details['path']

      error = new_exception_with_response(
        known_error_details['code'],
        known_error_details['body'].to_json
      )
      mock_subresource = mock('RestClient::Resource')
      @mock_resource.stubs(:[]).with(path).returns(mock_subresource)
      expected_success_response = mock('RestClient::Response')

      # Raise the error twice (due to max_attempts: 3 above), then succeed
      retry_sequence = sequence('retries')
      mock_subresource.expects(method).raises(error).twice.in_sequence(retry_sequence)
      mock_subresource.expects(method).returns(expected_success_response).in_sequence(retry_sequence)

      # Verify that it logs the retried errors
      mock_log = mock
      mock_log.expects(:info).with(includes("Retrying Pd::MimeoRestClient.#{method} after receiving error")).twice
      CDO.expects(:log).returns(mock_log).twice

      # send message to private get and post methods
      actual_response = (
        case method
          when 'get'
            client.send :get, path
          when 'post'
            client.send :post, path, {} # empty params
          else
            fail "Unexpected method in #{KNOWN_RETRYABLE_ERROR_FILENAME}: #{method}"
        end
      )

      assert_equal(
        expected_success_response,
        actual_response,
        "Unexpected response for known error #{known_error_details}"
      )
    end
  end

  test 'does not retry non-retriable error' do
    client = Pd::MimeoRestClient.new

    error = new_exception_with_response(400, 'This is an unexpected error')
    mock_subresource = mock('RestClient::Resource')
    @mock_resource.stubs(:[]).returns(mock_subresource)

    mock_subresource.expects(:get).raises(error).once
    actual_error = assert_raises RestClient::ExceptionWithResponse do
      client.send :get, 'a path'
    end
    assert_equal error, actual_error

    mock_subresource.expects(:post).raises(error).once
    actual_error = assert_raises RestClient::ExceptionWithResponse do
      client.send :post, 'a path', {}
    end
    assert_equal error, actual_error
  end

  private

  def new_exception_with_response(code, body)
    RestClient::ExceptionWithResponse.new(
      OpenStruct.new(
        code: code,
        body: body
      )
    )
  end

  def mock_response(body)
    mock.tap do |mock_response|
      mock_response.expects(:body).returns(body).at_least_once
    end
  end
end

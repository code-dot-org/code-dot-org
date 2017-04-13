require 'test_helper'
require 'pd/mimeo_rest_client'

class Pd::MimeoRestClientTest < ActiveSupport::TestCase
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

  private

  def mock_response(body)
    mock.tap do |mock_response|
      mock_response.expects(:body).returns(body).at_least_once
    end
  end
end

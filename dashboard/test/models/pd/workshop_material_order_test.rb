require 'test_helper'

class Pd::WorkshopMaterialOrderTest < ActiveSupport::TestCase
  freeze_time

  ORDER_ID = '00-1111-22222-33333'.freeze

  # This is the subset of fields we care about. The actual response has additional data.
  ORDER_RESPONSE = {
    OrderFriendlyId: ORDER_ID,
    RecipientDetails: [{
      ExpectedShipDate: '/Date(1491951599000)/',
      ExpectedDeliveryDate: '/Date(1492491540000-0500)/'
    }]
  }.deep_stringify_keys.freeze

  TRACKING_ID = '123456789'.freeze
  TRACKING_URL = 'http://www.fedex.com/Tracking?tracknumbers=123456789&action=track&language=english&cntry_code=us&mps=y'.freeze

  TRACKING_RESPONSE = {
    TrackingNumber: TRACKING_ID,
    TrackingUrl: TRACKING_URL
  }.deep_stringify_keys.freeze

  ORDER_ERROR = {
    ErrorCode: 'Bad Request',
    Message: 'Recipient address information is invalid'
  }.deep_stringify_keys.freeze

  self.use_transactional_test_case = true
  setup_all do
    @workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF
    @teacher = create :teacher
    @enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop
  end

  setup do
    @fake_geocoder_response = [
      OpenStruct.new(
        city: 'Seattle',
        postal_code: '98101',
        state_code: 'WA',
        street_number: '1501'
      )
    ]
    Geocoder.stubs(:search).returns(@fake_geocoder_response)
    @mock_mimeo_rest_client = mock('Pd::MimeoRestClient')
    Pd::MimeoRestClient.stubs(:new).returns(@mock_mimeo_rest_client)
  end

  test 'required fields' do
    order = Pd::WorkshopMaterialOrder.new
    refute order.valid?
    assert_equal [
      'Enrollment is required',
      'User is required',
      'Street is required',
      'City is required',
      'State is required',
      'Zip code is required',
      'Phone number is required'
    ], order.errors.full_messages

    order.assign_attributes(
      enrollment: @enrollment,
      user: @teacher,
      street: '1501 4th Ave',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
      phone_number: '555-111-2222'
    )
    assert order.valid?
  end

  test 'clear_data leaves valid order' do
    order = create :pd_workshop_material_order
    order.user.destroy!
    order.clear_data
    assert order.reload.valid?
  end

  test 'user must be unique' do
    create :pd_workshop_material_order, user: @teacher

    order = build :pd_workshop_material_order, user: @teacher
    refute order.valid?
    assert_equal ['User has already been taken'], order.errors.full_messages
  end

  test 'enrollment must be unique' do
    create :pd_workshop_material_order, enrollment: @enrollment

    order = build :pd_workshop_material_order, enrollment: @enrollment
    refute order.valid?
    assert_equal ['Enrollment has already been taken'], order.errors.full_messages
  end

  test 'workshop must be CSF' do
    non_csf_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSD
    non_csf_enrollment = create :pd_enrollment, workshop: non_csf_workshop
    non_csf_order = build :pd_workshop_material_order, enrollment: non_csf_enrollment
    refute non_csf_order.valid?
    assert_equal ['Workshop must be CSF'], non_csf_order.errors.full_messages
  end

  test 'state must be in list' do
    order = build :pd_workshop_material_order, state: 'invalid'
    refute order.valid?
    assert_equal ['State is not included in the list'], order.errors.full_messages
  end

  test 'phone number must be a valid format' do
    order = build :pd_workshop_material_order, phone_number: 'invalid'
    refute order.valid?
    assert_equal ['Phone number is invalid'], order.errors.full_messages
  end

  test 'phone number validation regex' do
    valid_phone_numbers = [
      '111-222-3333',
      '111-222-3333, ex 400',
      '(111)222-3333',
      '(111) 222 3333',
      'mobile: 111-222-3333'
    ]

    invalid_phone_numbers = [
      '1234567',
      'abc',
      '111 2222',
      '((((((((((((((((('
    ]

    valid_phone_numbers.each do |valid_phone_number|
      assert (valid_phone_number =~ Pd::WorkshopMaterialOrder::PHONE_NUMBER_VALIDATION_REGEX),
        "expected #{valid_phone_number} to be valid"
    end

    invalid_phone_numbers.each do |invalid_phone_number|
      refute (invalid_phone_number =~ Pd::WorkshopMaterialOrder::PHONE_NUMBER_VALIDATION_REGEX),
        "expected #{invalid_phone_number} to be invalid"
    end
  end

  test 'zip code must be a valid format' do
    order = build :pd_workshop_material_order, zip_code: 'invalid'
    refute order.valid?
    assert_equal ['Zip code is invalid'], order.errors.full_messages
  end

  test 'address validation fails for nonexistent address' do
    Geocoder.expects(:search).with("i don't exist, Suite 900, Seattle, WA, 98101").returns([])
    order = build :pd_workshop_material_order, street: "i don't exist"
    refute order.valid?
    assert_equal ['Address could not be verified. Please double-check.'], order.errors.full_messages
  end

  test 'address validation fails for incorrect city' do
    Geocoder.expects(:search).with('1501 4th Ave, Suite 900, Downtown Seattle, WA, 98101').returns(@fake_geocoder_response)

    order = build :pd_workshop_material_order, city: 'Downtown Seattle'
    refute order.valid?
    assert_equal ["City doesn't match the address. Did you mean Seattle?"], order.errors.full_messages
  end

  test 'address validation fails for incorrect zip code' do
    Geocoder.expects(:search).with('1501 4th Ave, Suite 900, Seattle, WA, 99999').returns(@fake_geocoder_response)

    order = build :pd_workshop_material_order, zip_code: '99999'
    refute order.valid?
    assert_equal ["Zip code doesn't match the address. Did you mean 98101?"], order.errors.full_messages
  end

  test 'address validation fails for incorrect state' do
    Geocoder.expects(:search).with('1501 4th Ave, Suite 900, Seattle, OR, 98101').returns(@fake_geocoder_response)

    order = build :pd_workshop_material_order, state: 'OR'
    refute order.valid?
    assert_equal ["State doesn't match the address. Did you mean WA?"], order.errors.full_messages
  end

  test 'address validation fails for PO boxes' do
    Geocoder.expects(:search).with('PO Box 123, Seattle, WA, 98155').returns(
      [OpenStruct.new(
        city: 'Seattle',
        postal_code: '98155',
        state_code: 'WA'
      )]
    )

    order = build :pd_workshop_material_order, street: 'PO Box 123', apartment_or_suite: nil, zip_code: '98155'
    refute order.valid?
    assert_equal ['Street must be a valid street address (no PO boxes)'], order.errors.full_messages
  end

  test 'address verification override allows order with previously invalid address' do
    Geocoder.expects(:search).with("i don't exist, Suite 900, Seattle, WA, 98101").returns([])
    order = build :pd_workshop_material_order, street: "i don't exist"
    refute order.valid?

    order.address_override = "1"
    assert order.valid?
  end

  test 'place_order' do
    @mock_mimeo_rest_client.expects(:place_order).with(
      first_name: @enrollment.first_name,
      last_name: @enrollment.last_name,
      company_name: nil,
      street: '1501 4th Ave',
      apartment_or_suite: 'Suite 900',
      city: 'Seattle',
      state_or_province: 'WA',
      country: 'US',
      postal_code: '98101',
      email: @enrollment.email,
      phone_number: '555-111-2222'
    ).returns(ORDER_RESPONSE).once

    order = build :pd_workshop_material_order, user: @teacher, enrollment: @enrollment
    refute order.ordered?
    response = order.place_order
    assert_equal ORDER_RESPONSE, response
    assert_equal ORDER_RESPONSE, order.order_response
    assert_equal ORDER_ID, order.order_id
    assert_equal Time.zone.now, order.order_attempted_at
    assert_equal Time.zone.now, order.ordered_at
    assert order.ordered?

    # second call returns existing response and does not re-query API (verified by .once in above expectation)
    assert_equal ORDER_RESPONSE, order.place_order
  end

  test 'place_order error' do
    @mock_mimeo_rest_client.expects(:place_order).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: ORDER_ERROR.to_json))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order
    order.place_order
    assert_equal Time.zone.now, order.order_attempted_at
    assert_nil order.ordered_at
    refute order.ordered?
    assert_equal ({'code' => 400, 'body' => ORDER_ERROR}), order.order_error
  end

  test 'refresh checks status' do
    @mock_mimeo_rest_client.expects(:get_status).with(ORDER_ID).returns('Pending')

    order = build :pd_workshop_material_order, order_id: ORDER_ID
    order.refresh
    assert_equal 'Pending', order.order_status
    refute order.shipped?
    assert_equal Time.zone.now, order.order_status_last_checked_at
    assert_equal Time.zone.now, order.order_status_changed_at
  end

  test 'refresh does not check status if not ordered' do
    @mock_mimeo_rest_client.expects(:get_status).never

    order = build :pd_workshop_material_order
    refute order.ordered?
    order.refresh
  end

  test 'refresh does not check status again once it reaches a final status' do
    @mock_mimeo_rest_client.expects(:get_status).never
    Pd::MimeoRestClient.expects(:final_status?).with('a final status').returns(true)

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'a final status'
    order.refresh
    assert_equal 'a final status', order.order_status
  end

  test 'refresh logs to honeybadger but does not fail for get_status error' do
    @mock_mimeo_rest_client.expects(:get_status).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: nil))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order, order_id: ORDER_ID
    order.refresh
    assert_nil order.order_status
  end

  test 'refresh for shipped order gets tracking info' do
    @mock_mimeo_rest_client.expects(:track).with(ORDER_ID).returns(TRACKING_RESPONSE).once

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Shipped'

    # second call does not re-query API (verified by .once in above expectation)
    2.times do
      order.refresh
      assert_equal TRACKING_ID, order.tracking_id
      assert_equal TRACKING_URL, order.tracking_url
    end
  end

  test 'refresh does not track before it ships' do
    @mock_mimeo_rest_client.expects(:get_status).returns('Pending')
    @mock_mimeo_rest_client.expects(:track).never

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Pending'
    order.refresh
    assert_nil order.tracking_id
    assert_nil order.tracking_url
  end

  test 'refresh logs to honeybadger but does not fail for track error' do
    @mock_mimeo_rest_client.expects(:track).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: nil))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Shipped'
    order.refresh
    assert_nil order.tracking_id
  end

  test 'order must have a user on creation' do
    order = build :pd_workshop_material_order, user: nil
    refute order.valid?
    assert_equal ['User is required'], order.errors.full_messages
  end

  test 'existing orders are still valid if the user is deleted' do
    teacher = create :teacher
    order = create :pd_workshop_material_order, user: teacher

    teacher.destroy
    order.reload
    assert order.valid?
    assert_nil order.user
  end

  test 'existing orders are not valid if the user association is removed' do
    order = create :pd_workshop_material_order, user: @teacher

    order.user = nil
    refute order.valid?
  end

  test 'search_emails' do
    included = [
      create(:pd_workshop_material_order, enrollment: create(:pd_enrollment, email: 'included1@example.net')),
      create(:pd_workshop_material_order, enrollment: create(:pd_enrollment, email: 'included2@example.net')),
      create(:pd_workshop_material_order, enrollment: create(:pd_enrollment, email: 'IncludedWithMismatchedCase@example.net'))
    ]

    # excluded
    create(:pd_workshop_material_order, enrollment: create(:pd_enrollment, email: 'excluded@example.net'))

    found = Pd::WorkshopMaterialOrder.search_emails('include')
    assert_equal included.map(&:id).sort, found.pluck(:id).sort
  end
end

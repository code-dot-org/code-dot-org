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
    Geocoder.stubs(:search).returns([stub(postal_code: '98101')])
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

  test 'zip code must be a valid format' do
    order = build :pd_workshop_material_order, zip_code: 'invalid'
    refute order.valid?
    assert_equal ['Zip code is invalid'], order.errors.full_messages
  end

  test 'address validation' do
    Geocoder.expects(:search).with("i don't exist, Suite 900, Seattle, WA, 98101").returns([])
    Geocoder.expects(:search).with('1501 4th Ave, Suite 900, Seattle, WA, 99999').returns([stub(postal_code: 98101)])

    order = build :pd_workshop_material_order, street: "i don't exist"
    refute order.valid?
    assert_equal ['Address could not be verified. Please double-check.'], order.errors.full_messages

    order.assign_attributes(street: '1501 4th Ave', zip_code: '99999')
    refute order.valid?
    assert_equal ["Zip code doesn't match the address. Did you mean 98101?"], order.errors.full_messages
  end

  test 'place_order' do
    Pd::MimeoRestClient.any_instance.expects(:place_order).with(
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
    Pd::MimeoRestClient.any_instance.expects(:place_order).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: ORDER_ERROR.to_json))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order
    order.place_order
    assert_equal Time.zone.now, order.order_attempted_at
    assert_nil order.ordered_at
    refute order.ordered?
    assert_equal ({'code' => 400, 'body' => ORDER_ERROR}), order.order_error
  end

  test 'check_status' do
    Pd::MimeoRestClient.any_instance.expects(:get_status).with(ORDER_ID).returns('Pending')

    order = build :pd_workshop_material_order, order_id: ORDER_ID
    assert_equal 'Pending', order.check_status
    refute order.shipped?
    assert_equal Time.zone.now, order.order_status_last_checked_at
    assert_equal Time.zone.now, order.order_status_changed_at
  end

  test 'check_status returns nil if not ordered' do
    Pd::MimeoRestClient.any_instance.expects(:get_status).never

    order = build :pd_workshop_material_order
    refute order.ordered?
    assert_nil order.check_status
  end

  test 'check_status skipped once for final status' do
    Pd::MimeoRestClient.any_instance.expects(:get_status).never

    order_shipped = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Shipped'
    assert_equal 'Shipped', order_shipped.check_status

    order_canceled = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Canceled'
    assert_equal 'Canceled', order_canceled.check_status
  end

  test 'check_status error' do
    Pd::MimeoRestClient.any_instance.expects(:get_status).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: nil))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order, order_id: ORDER_ID
    assert_nil order.check_status
  end

  test 'track' do
    Pd::MimeoRestClient.any_instance.expects(:track).with(ORDER_ID).returns(TRACKING_RESPONSE).once

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Shipped'
    expected_respone = {tracking_id: TRACKING_ID, tracking_url: TRACKING_URL}
    assert_equal expected_respone, order.track
    assert_equal TRACKING_ID, order.tracking_id
    assert_equal TRACKING_URL, order.tracking_url

    # second call does not re-query API (verified by .once in above expectation)
    assert_equal expected_respone, order.track
  end

  test 'track skipped before it ships' do
    Pd::MimeoRestClient.any_instance.expects(:track).never

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Pending'
    assert_nil order.track
    assert_nil order.tracking_id
    assert_nil order.tracking_url
  end

  test 'track error' do
    Pd::MimeoRestClient.any_instance.expects(:track).raises(RestClient::BadRequest)
    RestClient::BadRequest.any_instance.stubs(:response).returns(stub(code: 400, body: nil))
    Honeybadger.expects(:notify)

    order = build :pd_workshop_material_order, order_id: ORDER_ID, order_status: 'Shipped'
    assert_nil order.track
  end
end

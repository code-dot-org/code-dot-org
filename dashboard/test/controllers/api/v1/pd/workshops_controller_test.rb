require 'test_helper'

class Api::V1::Pd::WorkshopsControllerTest < ::ActionController::TestCase
  freeze_time

  setup do
    @admin = create(:admin)
    @organizer = create(:workshop_organizer)
    @facilitator = create(:facilitator)

    @workshop = create(:pd_workshop, organizer: @organizer, facilitators: [@facilitator])
    @standalone_workshop = create(:pd_workshop)

    # Don't actually call the geocoder.
    Pd::Workshop.stubs(:process_location)
  end

  # Action: Index

  test 'admins can list all workshops' do
    sign_in @admin
    assert_equal 2, Pd::Workshop.count

    get :index
    assert_response :success
    assert_equal 2, JSON.parse(@response.body).length
  end

  test 'workshop organizers can list all their workshops' do
    sign_in @organizer
    get :index
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length
  end

  test 'with the facilitated param, workshop organizers only view workshops they facilitated' do
    workshop_2 = create(:pd_workshop, organizer: @organizer, facilitators: [@organizer])

    sign_in @organizer
    get :index, params: {facilitator_view: 1}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    assert_equal workshop_2.id, response[0]['id']
  end

  test 'workshop organizers cannot list workshops they are not organizing' do
    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test 'facilitators can list workshops they are facilitating' do
    sign_in @facilitator
    get :index
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length
    sign_out @facilitator
  end

  test 'facilitators cannot list workshops they are not facilitating' do
    sign_in create(:facilitator)
    get :index
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test 'filter by state' do
    sign_in @admin
    workshop_in_progress = create :pd_workshop
    workshop_in_progress.sessions << create(:pd_session)
    workshop_in_progress.start!
    assert_equal Pd::Workshop::STATE_IN_PROGRESS, workshop_in_progress.state

    get :index, state: Pd::Workshop::STATE_IN_PROGRESS
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    assert_equal workshop_in_progress.id, response[0]['id']
  end

  # Action: Show

  test 'admins can view workshops' do
    sign_in @admin
    get :show, id: @workshop.id
    assert_response :success
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test 'workshop organizers can view their workshops' do
    sign_in @organizer
    get :show, id: @workshop.id
    assert_response :success
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test 'workshop organizers cannot view a workshop they are not organizing' do
    sign_in @organizer
    get :show, id: @standalone_workshop.id
    assert_response :forbidden
  end

  test 'facilitators can view a workshop they are facilitating' do
    sign_in @facilitator
    get :show, id: @workshop
    assert_response :success
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test 'facilitators cannot view a workshop they are not facilitating' do
    sign_in @facilitator
    get :show, id: @standalone_workshop
    assert_response :forbidden
  end

  # Action: Create

  test 'admins can create workshops' do
    sign_in @admin

    Pd::Workshop.expects(:process_location)
    assert_creates(Pd::Workshop) do
      post :create, pd_workshop: workshop_params
      assert_response :success
    end

    id = JSON.parse(@response.body)['id']
    workshop = Pd::Workshop.find id
    assert_equal 1, workshop.sessions.length
  end

  test 'workshop organizers can create workshops' do
    sign_in @organizer

    Pd::Workshop.expects(:process_location)
    assert_creates(Pd::Workshop) do
      post :create, pd_workshop: workshop_params
      assert_response :success
    end
  end

  test 'facilitators cannot create workshops' do
    sign_in @facilitator
    post :create, pd_workshop: workshop_params
    assert_response :forbidden
  end

  # Action: Destroy

  test 'organizers can delete their workshops' do
    sign_in @organizer
    assert_difference 'Pd::Workshop.count', -1 do
      delete :destroy, id: @workshop.id
    end
    assert_response :success
  end

  test 'admins can delete any workshop' do
    sign_in @admin
    assert_difference 'Pd::Workshop.count', -1 do
      delete :destroy, id: @workshop.id
    end
    assert_response :success
  end

  test 'organizers cannot delete workshops they do not own' do
    sign_in @organizer
    delete :destroy, id: @standalone_workshop.id
    assert_response :forbidden
  end

  test 'facilitators cannot delete workshops' do
    sign_in @facilitator
    delete :destroy, id: @workshop.id
    assert_response :forbidden
  end

  # Action: Update

  test 'admins can update any workshop' do
    sign_in @admin
    Pd::Workshop.expects(:process_location)
    put :update, id: @workshop.id, pd_workshop: workshop_params
    assert_response :success
  end

  test 'organizers can update their workshops' do
    sign_in @organizer
    Pd::Workshop.expects(:process_location)
    put :update, id: @workshop.id, pd_workshop: workshop_params
    assert_response :success
  end

  test 'organizers cannot update workshops they are not organizing' do
    sign_in @organizer
    put :update, id: @standalone_workshop.id, pd_workshop: workshop_params
    assert_response :forbidden
  end

  test 'facilitators cannot update workshops' do
    sign_in @facilitator
    put :update, id: @workshop.id, pd_workshop: workshop_params
    assert_response :forbidden
  end

  test 'updating with the same location_address does not re-process location' do
    sign_in @organizer
    params = workshop_params
    params[:location_address] = @workshop.location_address
    Pd::Workshop.expects(:process_location).never
    put :update, id: @workshop.id, pd_workshop: params
  end

  test 'updating with notify true sends detail change notification emails' do
    sign_in @admin

    # create some enrollments
    5.times do
      create :pd_enrollment, workshop: @workshop
    end
    mock_mail = stub(deliver_now: nil)
    Pd::WorkshopMailer.any_instance.expects(:detail_change_notification).times(5).returns(mock_mail)
    Pd::WorkshopMailer.any_instance.expects(:facilitator_detail_change_notification).returns(mock_mail)
    Pd::WorkshopMailer.any_instance.expects(:organizer_detail_change_notification).returns(mock_mail)

    put :update, id: @workshop.id, pd_workshop: workshop_params, notify: true
  end

  test 'updating with notify false does not send detail change notification emails' do
    sign_in @admin

    # create some enrollments
    5.times do
      create :pd_enrollment, workshop: @workshop
    end
    Pd::WorkshopMailer.any_instance.expects(:detail_change_notification).never

    put :update, id: @workshop.id, pd_workshop: workshop_params, notify: false
  end

  # Update sessions via embedded attributes

  test 'organizers can add workshop sessions' do
    sign_in @organizer
    assert_equal 0, @workshop.sessions.count

    session_start = tomorrow_at 9
    session_end = tomorrow_at 17
    params = {sessions_attributes: [{start: session_start, end: session_end}]}

    put :update, id: @workshop.id, pd_workshop: params
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.sessions.count
    assert_equal session_start, @workshop.sessions.first[:start]
    assert_equal session_end, @workshop.sessions.first[:end]
  end

  test 'organizers can update existing workshop sessions' do
    sign_in @organizer
    session_initial_start = tomorrow_at 9
    session_initial_end = tomorrow_at 15
    session = create(:pd_session, start: session_initial_start, end: session_initial_end)
    @workshop.sessions << session
    @workshop.save!
    assert_equal 1, @workshop.sessions.count

    session_updated_start = session_initial_start + 2.days
    session_updated_end = session_initial_end + 2.days + 2.hours
    params = {
      sessions_attributes: [{id: session.id, start: session_updated_start, end: session_updated_end}]
    }

    put :update, id: @workshop.id, pd_workshop: params
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.sessions.count
    assert_equal session_updated_start, @workshop.sessions.first[:start]
    assert_equal session_updated_end, @workshop.sessions.first[:end]
  end

  test 'organizers can destroy workshop sessions' do
    sign_in @organizer
    session = create(:pd_session)
    @workshop.sessions << session
    @workshop.save!
    assert_equal 1, @workshop.sessions.count

    params = {sessions_attributes: [{id: session.id, _destroy: true}]}

    put :update, id: @workshop.id, pd_workshop: params
    assert_response :success
    @workshop.reload
    assert_equal 0, @workshop.sessions.count
  end

  test 'organizers can add and remove facilitators' do
    sign_in @organizer
    new_facilitator = create :facilitator
    assert_equal 1, @workshop.facilitators.length
    assert_equal @facilitator, @workshop.facilitators.first

    params = workshop_params.merge({
      facilitators: [new_facilitator.id]
    })
    put :update, id: @workshop.id, pd_workshop: params
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.facilitators.length
    assert_equal new_facilitator, @workshop.facilitators.first
  end

  # Actions: Start, End

  test 'admins can start and end workshops' do
    Pd::AsyncWorkshopHandler.expects(:process_ended_workshop).with(@workshop.id)

    sign_in @admin
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, id: @workshop.id
    assert_response :success
    @workshop.reload
    assert_equal 'In Progress', @workshop.state

    post :end, id: @workshop.id
    assert_response :success
    @workshop.reload
    assert_equal 'Ended', @workshop.state
  end

  test 'organizers can start and stop their workshops' do
    Pd::AsyncWorkshopHandler.expects(:process_ended_workshop).with(@workshop.id)

    sign_in @organizer
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, id: @workshop.id
    assert_response :success
    @workshop.reload
    assert_equal 'In Progress', @workshop.state

    post :end, id: @workshop.id
    assert_response :success
    @workshop.reload
    assert_equal 'Ended', @workshop.state
  end

  test 'organizers cannot start and stop workshops they are not organizing' do
    sign_in create(:workshop_organizer)
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, id: @workshop.id
    assert_response :forbidden

    post :end, id: @workshop.id
    assert_response :forbidden
    @workshop.reload
    assert_equal 'Not Started', @workshop.state
  end

  # No access

  test 'teachers cannot access workshops' do
    sign_in create(:teacher)
    all_forbidden
  end

  test 'normal users cannot access workshops' do
    sign_in create(:user)
    all_forbidden
  end

  test 'anyone can see the K5 public map index' do
    get :k5_public_map_index
    assert_response :success
  end

  test 'facilitators can get summary for their workshops' do
    sign_in @facilitator
    get :summary, id: @workshop.id
    assert_response :success
  end

  test 'facilitators cannot get summary for other workshops' do
    sign_in @facilitator
    get :summary, id: @standalone_workshop.id
    assert_response :forbidden
  end

  test 'organizers can get summary for their workshops' do
    sign_in @organizer
    get :summary, id: @workshop.id
    assert_response :success
  end

  test 'organizers cannot get summary for other workshops' do
    sign_in @organizer
    get :summary, id: @standalone_workshop.id
    assert_response :forbidden
  end

  test 'summary' do
    sign_in @admin
    workshop = create :pd_workshop, num_sessions: 3
    workshop.start!

    get :summary, id: workshop.id
    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal workshop.state, response['state']
    assert_equal workshop.section.code, response['section_code']
    assert_equal 3, response['sessions'].count
  end

  private

  def all_forbidden
    get :index
    assert_response :forbidden
    get :show, id: @workshop.id
    assert_response :forbidden
  end

  def tomorrow_at(hour, minute = nil)
    tomorrow = Time.zone.now + 1.day
    Time.zone.local(tomorrow.year, tomorrow.month, tomorrow.mday, hour, minute)
  end

  def workshop_params
    session_start = tomorrow_at 9
    session_end = session_start + 8.hours
    {
      location_address: 'Seattle, WA',
      workshop_type: Pd::Workshop::TYPE_PUBLIC,
      course: Pd::Workshop::COURSE_CSF,
      capacity: 10,
      sessions_attributes: [
        {
          start: session_start,
          end: session_end
        }
      ]
    }
  end
end

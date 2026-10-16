require 'test_helper'

class Services::TeacherDirectoryVerification::TicketClientTest < ActiveSupport::TestCase
  setup do
    @teacher = create(:teacher, :with_school_info, name: 'Morgan Teacher')
    school = @teacher.school_info.school
    @verification_request = @teacher.teacher_directory_verification_requests.create!(
      school_id: school.id,
      school_name: school.name,
      email: @teacher.email,
      status: 'submitted',
      evidence_url: 'https://school.example.edu/staff',
      evidence_title: 'Staff Directory',
      evidence_email: @teacher.email,
      confirmed_at: Time.current,
      ticket_external_id: SecureRandom.uuid,
      purge_after: 90.days.from_now,
    )
  end

  test 'creates a private ticket with teacher and directory evidence' do
    search_response = mock
    search_response.stubs(:success?).returns(true)
    search_response.stubs(:parsed_response).returns({'results' => []})
    HTTParty.expects(:get).with do |url, options|
      url == 'https://codeorg.zendesk.com/api/v2/search.json' &&
        options[:query][:query] == "type:ticket external_id:#{@verification_request.ticket_external_id}"
    end.returns(search_response)

    ticket_id = 'zendesk-123'
    post_response = mock
    post_response.stubs(:success?).returns(true)
    post_response.stubs(:parsed_response).returns({'ticket' => {'id' => ticket_id}})
    HTTParty.expects(:post).with do |url, options|
      ticket = JSON.parse(options[:body]).fetch('ticket')
      url == 'https://codeorg.zendesk.com/api/v2/tickets.json' &&
        ticket.dig('requester', 'email') == @teacher.email &&
        ticket.dig('comment', 'public') == false &&
        ticket.dig('comment', 'body').include?(@verification_request.evidence_url) &&
        ticket.dig('comment', 'body').include?(@verification_request.evidence_email) &&
        ticket['external_id'] == @verification_request.ticket_external_id
    end.returns(post_response)

    assert_equal ticket_id, Services::TeacherDirectoryVerification::TicketClient.create_for(@verification_request)
  end

  test 'returns an existing ticket without creating a duplicate' do
    existing_ticket = mock
    existing_ticket.stubs(:success?).returns(true)
    existing_ticket.stubs(:parsed_response).returns(
      {'results' => [{'id' => 'existing-123', 'external_id' => @verification_request.ticket_external_id}]}
    )
    HTTParty.expects(:get).returns(existing_ticket)
    HTTParty.expects(:post).never

    assert_equal 'existing-123', Services::TeacherDirectoryVerification::TicketClient.create_for(@verification_request)
  end
end

# Tests for the routes in form_routes.rb

require_relative './test_helper'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'
require_relative 'sequel_test_case'
require pegasus_dir 'helper_modules/forms'

class FormRoutesTest < SequelTestCase
  include SetupTest

  describe 'Form Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'POST /forms/:kind' do
      it 'returns 400 for non-existent form kind' do
        @pegasus.post '/forms/nonexistent', '{}', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 400, @pegasus.last_response.status
      end
    end

    describe 'POST /forms/:kind/query' do
      it 'returns 400 for non-existent form kind' do
        @pegasus.post '/forms/nonexistent/query', '{}', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 400, @pegasus.last_response.status
      end
    end
  end

  DEFAULT_DATA = {
    email_s: 'fake@example.com',
    name_s: 'fake_name',
    experience_s: 'university_student_or_researcher',
    location_s: 'somewhere',
    location_flexibility_ss: ['onsite'],
    description_s: 'description',
    allow_contact_b: '1',
    age_18_plus_b: '1',
    email_preference_opt_in_s: 'yes'
  }.freeze

  def test_volunteer_engineer_submission_2015
    stubs(:dashboard_user).returns(nil)
    Pegasus.stubs(:logger).returns(nil)
    stubs(:request).returns(stub(ip: '1.2.3.4'))
    row = insert_or_upsert_form('VolunteerEngineerSubmission2015', DEFAULT_DATA.dup)
    @form = Form.find(id: row[:id])

    @form.update(processed_data: {location_p: '37.774929,-122.419416'}.to_json)

    assert_equal 0.8236209090344097,
      JSON.parse(
        VolunteerEngineerSubmission2015.query('coordinates' => '37.774368,-122.428760')
      )['response']['docs'].first['distance']
  end
end

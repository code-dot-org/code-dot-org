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

  describe 'volunteer_engineer_submission_2015' do
    before do
      # Delete all volunteer sign-ups in the test database before each test
      ::PEGASUS_DB[:forms].where(kind: 'VolunteerEngineerSubmission2015').delete

      Pegasus.stubs(:logger)
      stubs(:dashboard_user)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
    end

    it 'returns local results' do
      create_volunteer name: 'Local Person', location: '37.774929,-122.419416'
      results = search location: '37.774368,-122.428760'
      assert_equal 0.8236209090344097, results.first['distance']
    end

    it 'uses reverse chronological order' do
      here = '35.774929,-122.419416'
      create_volunteer name: 'Oldest', location: here
      create_volunteer name: 'Middle', location: here
      create_volunteer name: 'Newest', location: here
      results = search location: here
      assert_equal %w(Newest Middle Oldest), results.map {|r| r['name_s']}
    end

    def create_volunteer(name:, location:)
      row = insert_or_upsert_form(
        'VolunteerEngineerSubmission2015',
        DEFAULT_DATA.dup.merge(name_s: name)
      )
      Form.find(id: row[:id]).update(
        processed_data: {location_p: location}.to_json
      )
    end

    def search(location:, num_volunteers: nil)
      JSON.parse(
        VolunteerEngineerSubmission2015.query(
          'coordinates' => location,
          'num_volunteers' => num_volunteers
        )
      )['response']['docs']
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
  end
end

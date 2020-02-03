require 'test_helper'

module Api::V1::Pd
  class RegionalPartnerWorkshopsControllerTest < ::ActionController::TestCase
    freeze_time Time.new(2018, 2, 1)

    self.use_transactional_test_case = true
    setup_all do
      Pd::Workshop.any_instance.stubs(:process_location)
      first_session_time = Time.new(2018, 3, 15, 9)

      @program_manager = create :program_manager
      @partner_organizer = create :workshop_organizer, regional_partners: [@program_manager.regional_partners.first]
      @non_partner_organizer = create :workshop_organizer

      csd_options = {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP}
      csp_options = {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP}

      @program_manager_csd_workshop,
      @program_manager_csp_workshop,
      @partner_organizer_csd_workshop,
      @partner_organizer_csp_workshop,
      @non_partner_organizer_csd_workshop,
      @non_partner_organizer_csp_workshop =
        [@program_manager, @partner_organizer, @non_partner_organizer].map do |organizer|
          [csd_options, csp_options].map do |course_options|
            create :workshop, organizer: organizer, num_sessions: 5, sessions_from: first_session_time,
              location_address: 'Code.org, Seattle, WA', **course_options
          end
        end.flatten

      @school = create :school, zip: '99999'
      @regional_partner = @program_manager.regional_partners.first
      @regional_partner.mappings << Pd::RegionalPartnerMapping.create!(regional_partner: @regional_partner, zip_code: '99999')

      @teacher = create :teacher
      @student = create :student
    end

    test_redirect_to_sign_in_for :find
    test_redirect_to_sign_in_for :index

    test_user_gets_response_for :find, user: :teacher, response: :success
    test_user_gets_response_for :find, user: :student, response: :forbidden
    test_user_gets_response_for :index, user: :teacher, response: :success
    test_user_gets_response_for :index, user: :student, response: :forbidden

    test 'index with no params returns all workshops associated with regional partners' do
      sign_in @teacher
      get :index
      assert_response :success

      assert workshop_in_index_results @program_manager_csd_workshop
      assert workshop_in_index_results @program_manager_csp_workshop
      assert workshop_in_index_results @partner_organizer_csd_workshop
      assert workshop_in_index_results @partner_organizer_csp_workshop
      refute workshop_in_index_results @non_partner_organizer_csd_workshop
      refute workshop_in_index_results @non_partner_organizer_csp_workshop
    end

    test 'index filters on course and subject' do
      sign_in @teacher
      get :index, params: {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP}
      assert_response :success

      assert workshop_in_index_results @program_manager_csd_workshop
      refute workshop_in_index_results @program_manager_csp_workshop
      assert workshop_in_index_results @partner_organizer_csd_workshop
      refute workshop_in_index_results @partner_organizer_csp_workshop
      refute workshop_in_index_results @non_partner_organizer_csd_workshop
      refute workshop_in_index_results @non_partner_organizer_csp_workshop
    end

    test 'index with no match returns empty set' do
      sign_in @teacher
      get :index, params: {course: 'nonexistent'}
      assert_response :success

      assert_equal [], JSON.parse(response.body)
    end

    test 'find by school' do
      sign_in @teacher
      get :find, params: {school: @school.id}
      assert_response :success
      data = JSON.parse(response.body).deep_symbolize_keys

      assert_equal expected_partner_workshops_all, data
    end

    test 'find by school with filters' do
      sign_in @teacher
      get :find, params: {school: @school.id, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP}
      assert_response :success
      data = JSON.parse(response.body).deep_symbolize_keys

      assert_equal expected_partner_workshops_csd, data
    end

    test 'find by zip_code and state' do
      sign_in @teacher
      get :find, params: {zip_code: '99999', state: 'WA'}
      assert_response :success
      data = JSON.parse(response.body).deep_symbolize_keys

      assert_equal expected_partner_workshops_all, data
    end

    test 'find by zip_code and state with filters' do
      sign_in @teacher
      get :find, params: {
        zip_code: '99999',
        state: 'WA',
        course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP
      }
      assert_response :success
      data = JSON.parse(response.body).deep_symbolize_keys

      assert_equal expected_partner_workshops_csd, data
    end

    test 'find with no workshops' do
      sign_in @teacher
      get :find, params: {
        zip_code: '99999',
        state: 'WA',
        course: 'nonexistent'
      }
      assert_response :success
      data = JSON.parse(response.body).deep_symbolize_keys

      assert_equal expected_partner_no_workshops, data
    end

    test 'find converts full state name into 2 letter code' do
      sign_in @teacher
      RegionalPartner.expects(:find_by_region).with('98101', 'WA').at_least_once
      get :find, params: {zip_code: '98101', state: 'Washington'}
    end

    test 'find preserves 2 letter state codes' do
      sign_in @teacher
      RegionalPartner.expects(:find_by_region).with('98101', 'WA').at_least_once
      get :find, params: {zip_code: '98101', state: 'WA'}
    end

    test 'find accepts Washington DC' do
      sign_in @teacher
      RegionalPartner.expects(:find_by_region).with(nil, 'DC').at_least_once
      get :find, params: {state: 'Washington DC'}
    end

    private

    def workshop_in_index_results(expected_workshop)
      JSON.parse(response.body).any? do |partner|
        partner['workshops'].any? do |workshop|
          workshop['id'] == expected_workshop.id
        end
      end
    end

    def expected_partner_workshops_all
      {
        id: @regional_partner.id,
        name: @regional_partner.name,
        has_csf: nil,
        group: @regional_partner.group,
        workshops: [{
          id: @program_manager_csd_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }, {
          id: @program_manager_csp_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }, {
          id: @partner_organizer_csd_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }, {
          id: @partner_organizer_csp_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }]
      }
    end

    def expected_partner_workshops_csd
      {
        id: @regional_partner.id,
        name: @regional_partner.name,
        group: @regional_partner.group,
        has_csf: nil,
        workshops: [{
          id: @program_manager_csd_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }, {
          id: @partner_organizer_csd_workshop.id,
          dates: 'March 15-19, 2018',
          location: 'Code.org, Seattle, WA'
        }]
      }
    end

    def expected_partner_no_workshops
      {
        id: @regional_partner.id,
        name: @regional_partner.name,
        group: @regional_partner.group,
        has_csf: nil,
        workshops: []
      }
    end
  end
end

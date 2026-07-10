# frozen_string_literal: true

require 'base64'
require 'test_helper'

class Api::V1::CertificatesCompletionsControllerTest < ActionController::TestCase
  tests Api::V1::Certificates::CompletionsController

  RESPONSE_KEYS = %w[certificates courseKind recommendations].freeze
  RECOMMENDATION_KEYS = %w[actionLabel description imageUrl path title].freeze

  describe 'GET /api/v1/certificates/completion' do
    subject(:get_completion) do
      get :show, params: {course: encoded_course}
    end

    let(:course_name) {'third-party-tutorial'}
    let(:encoded_course) {Base64.urlsafe_encode64(course_name)}
    let(:user) {nil}

    before {sign_in user if user}

    context 'with a third-party tutorial' do
      it 'returns the Hour of Code fallback contract' do
        _get_completion

        _(response.status).must_equal 200
        _(response.headers['Cache-Control']).must_equal 'private, no-store'
        _(response_body.keys.sort).must_equal RESPONSE_KEYS
        _(response_body['courseKind']).must_equal 'hour_of_code'
        _(response_body['certificates']).must_equal [
          {
            'courseName' => course_name,
            'coursePath' => '/s/hourofcode',
          }
        ]
        _(response_body['recommendations']).wont_be_empty
        response_body['recommendations'].each do |recommendation|
          _(recommendation.keys.sort).must_equal RECOMMENDATION_KEYS
        end
      end
    end

    context 'with malformed base64' do
      let(:encoded_course) {'%%%'}

      it 'returns a stable invalid-parameter error' do
        _get_completion

        _(response.status).must_equal 400
        _(response_body).must_equal(
          'code' => 'invalid_course',
          'message' => 'course must be URL-safe base64'
        )
      end
    end

    context 'with an incomplete professional learning unit' do
      let(:user) {create(:teacher)}
      let(:pl_course) {create(:single_unit_course, :pl_course)}
      let(:course_name) {pl_course.default_units.first.name}

      before {CourseOffering.add_course_offering(pl_course)}

      it 'returns no certificate and the 6-12 discriminator' do
        _get_completion

        _(response.status).must_equal 200
        _(response_body['certificates']).must_equal []
        _(response_body['courseKind']).must_equal 'professional_learning_6_12'
      end
    end

    context 'with K-5 professional learning' do
      let(:user) {create(:teacher)}
      let(:pl_offering) {create(:course_offering)}
      let(:pl_course) {create(:single_unit_course, :pl_course)}
      let(:course_name) {pl_course.default_units.first.name}

      before do
        create(:course_version, content_root: pl_course, course_offering: pl_offering)
        create(
          :course_offering,
          grade_levels: 'K,1,2,3,4,5',
          self_paced_pl_course_offering: pl_offering
        )
      end

      it 'returns the K-5 discriminator and workshop path' do
        _get_completion

        _(response.status).must_equal 200
        _(response_body['courseKind']).must_equal 'professional_learning_k5'
        _(response_body['recommendations'].map {|item| item['path']}).must_include(
          'https://code.org/professional-development-workshops'
        )
      end
    end
  end

  private def response_body
    @response_body ||= JSON.parse(response.body)
  end
end

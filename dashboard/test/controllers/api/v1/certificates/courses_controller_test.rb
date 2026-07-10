# frozen_string_literal: true

require 'test_helper'

class Api::V1::CertificatesCoursesControllerTest < ActionDispatch::IntegrationTest
  CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=31536000, stale-if-error=31536000'
  RESPONSE_KEYS = %w[
    courseKind
    durationHours
    localizedTitle
    prefilledTitle
    resolution
    templateFilename
    unitGroupTitle
  ].freeze

  describe 'GET /api/v1/certificates/courses/:course' do
    let(:locale) {'en-US'}
    let(:course_name) {'totally-unrecognized-course-xyz'}

    subject(:get_course) do
      get api_v1_certificates_course_path(course: course_name), params: {locale: locale}
    end

    context 'with a matched course' do
      let(:course_name) {'course-info-known'}

      before do
        unit = create(:unit, name: course_name)
        course = create(:single_unit_course, :stable, unit: unit, name: course_name)
        CourseOffering.add_course_offering(course)
      end

      it 'returns only public renderer metadata' do
        _get_course

        _(response.status).must_equal 200
        _(response.headers['Cache-Control']).must_equal CACHE_CONTROL
        _(response.headers['Set-Cookie'].to_s).must_be_empty
        _(response_body.keys.sort).must_equal RESPONSE_KEYS
        _(response_body['resolution']).must_equal 'matched'
        _(response_body['templateFilename']).must_equal 'blank_certificate.png'
        _(response_body['unitGroupTitle']).must_be_nil
        _(response_body['prefilledTitle']).must_equal false
        _(response_body['durationHours']).must_be_nil
      end
    end

    context 'with a unit inside a unit group' do
      let(:course_name) {'course-info-child-unit'}
      let(:unit) {create(:unit, name: course_name)}
      let(:unit_group) do
        create(:single_unit_course, :stable, unit: unit, name: 'course-info-parent-group')
      end

      before {CourseOffering.add_course_offering(unit_group)}

      it 'returns both titles' do
        _get_course

        _(response.status).must_equal 200
        _(response_body['localizedTitle']).must_equal unit.localized_title
        _(response_body['unitGroupTitle']).must_equal unit_group.localized_title
      end
    end

    context 'with an unknown course' do
      it 'uses the public policy and Hour of Code fallback' do
        _get_course

        _(response.status).must_equal 200
        _(response.headers['Cache-Control']).must_equal CACHE_CONTROL
        _(response.headers['Set-Cookie'].to_s).must_be_empty
        _(response_body.keys.sort).must_equal RESPONSE_KEYS
        _(response_body['resolution']).must_equal 'hour_of_code_fallback'
        _(response_body['localizedTitle']).must_equal I18n.t('certificates.one_hour_of_code')
        _(response_body['templateFilename']).must_equal 'hour_of_ai_certificate.png'
        _(response_body['courseKind']).must_equal 'hoc'
        _(response_body['durationHours']).must_be_nil
      end
    end

    context 'with a self-paced professional learning course' do
      let(:course_version) {create(:course_version, :with_single_unit_course)}
      let(:course_name) {course_version.name}

      before do
        course_version.content_root.update!(
          instructor_audience: 'facilitator',
          participant_audience: 'teacher'
        )
      end

      it 'includes the rounded duration' do
        _get_course

        _(response.status).must_equal 200
        _(response_body['templateFilename']).must_equal 'self_paced_pl_certificate.png'
        _(response_body['courseKind']).must_equal 'pl'
        _(response_body['durationHours']).must_equal 0.5
      end
    end

    context 'with an unsupported locale' do
      let(:locale) {'not-a-real-locale'}

      it 'falls back to en-US' do
        _get_course

        _(response.status).must_equal 200
        _(response_body['localizedTitle']).must_equal(
          I18n.t('certificates.one_hour_of_code', locale: 'en-US')
        )
      end
    end
  end

  private def response_body
    @response_body ||= JSON.parse(response.body)
  end
end

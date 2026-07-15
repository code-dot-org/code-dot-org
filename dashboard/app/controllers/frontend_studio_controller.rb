class FrontendStudioController < ApplicationController
  include CertificatesHelper

  skip_before_action :initialize_statsig_stable_id

  CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=31536000, stale-if-error=31536000'

  def index
    # Only render the app in preprod while the frontend is being built.
    return head :not_found if Rails.env.production?

    response.headers['Cache-Control'] = CACHE_CONTROL
    @certificate_social_metadata = certificate_social_metadata(params[:path])
    render 'frontend_studio/index', layout: false
  end

  private def certificate_social_metadata(path)
    certificate_params = certificate_params_from_path(path)
    return unless certificate_params

    course = certificate_params.fetch('course', ScriptConstants::HOC_NAME)
    course_title = CurriculumHelper.find_matching_unit_or_unit_group(course)&.localized_title ||
      I18n.t('certificates.one_hour_of_code')

    {
      image: twitter_certificate_image_url(certificate_params['name'], course, certificate_params['donor']),
      title: I18n.t('certificates.alt_text_no_name', course_name: course_title),
    }
  end

  private def certificate_params_from_path(path)
    return {'course' => ScriptConstants::HOC_NAME} if path == 'certificates/blank'

    encoded_params = path&.match(%r{\Acertificates/([^/]+)\z})&.captures&.first
    return unless encoded_params

    JSON.parse(Base64.urlsafe_decode64(encoded_params))
  rescue ArgumentError, JSON::ParserError
    nil
  end
end

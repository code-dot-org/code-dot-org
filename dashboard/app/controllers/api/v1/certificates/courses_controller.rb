# frozen_string_literal: true

require 'cdo/i18n'

class Api::V1::Certificates::CoursesController < ApplicationController
  skip_before_action :initialize_statsig_stable_id

  CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=31536000, stale-if-error=31536000'

  # API v1 response fields are additive during rolling deploys. Breaking
  # changes require a new API version.
  def show
    response.headers['Cache-Control'] = CACHE_CONTROL
    locale = Cdo::I18n.available_locale?(params[:locale]) ? params[:locale] : Cdo::I18n::DEFAULT_LOCALE

    I18n.with_locale(locale) do
      render json: course_payload(params[:course])
    end
  end

  private def course_payload(course_name)
    curriculum = CurriculumHelper.find_matching_unit_or_unit_group(course_name)
    template_filename = CertificateImage.certificate_template_for(course_name)

    {
      courseKind: CertificateImage.course_type(course_name),
      durationHours: duration_hours(curriculum, template_filename),
      localizedTitle: curriculum&.localized_title || I18n.t('certificates.one_hour_of_code'),
      prefilledTitle: CertificateImage.prefilled_title_course?(course_name),
      resolution: curriculum ? 'matched' : 'hour_of_code_fallback',
      templateFilename: template_filename,
      unitGroupTitle: unit_group_title(curriculum),
    }
  end

  private def duration_hours(curriculum, template_filename)
    return unless curriculum && template_filename == 'self_paced_pl_certificate.png'

    total_minutes = curriculum.duration_in_minutes || 0
    rounded_hours = (total_minutes / 30).round / 2.0
    rounded_hours.zero? ? 0.5 : rounded_hours
  end

  private def unit_group_title(curriculum)
    return unless curriculum.is_a?(Unit)

    curriculum.get_original_unit_group&.localized_title
  end
end

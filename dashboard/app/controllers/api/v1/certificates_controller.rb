require 'base64'
require 'cdo/i18n'

class Api::V1::CertificatesController < ApplicationController
  skip_before_action :initialize_statsig_stable_id, only: :course_info

  UNKNOWN_COURSE_CACHE_CONTROL = 'public, s-maxage=300'.freeze
  KNOWN_COURSE_CACHE_CONTROL = 'public, s-maxage=86400'.freeze

  # GET /api/v1/certificates/course_info/:locale/:course
  def course_info
    locale = Cdo::I18n.available_locale?(params[:locale]) ? params[:locale] : Cdo::I18n::DEFAULT_LOCALE

    I18n.with_locale(locale) do
      unit_or_unit_group = CurriculumHelper.find_matching_unit_or_unit_group(params[:course])
      template_filename = CertificateImage.certificate_template_for(params[:course])

      unless unit_or_unit_group
        response.headers['Cache-Control'] = UNKNOWN_COURSE_CACHE_CONTROL
        next render json: {
          localizedTitle: I18n.t('certificates.one_hour_of_code'),
          unitGroupTitle: nil,
          templateFilename: template_filename,
          courseType: CertificateImage.course_type(params[:course]),
          durationHours: nil,
          prefilledTitle: CertificateImage.prefilled_title_course?(params[:course]),
        }
      end

      unit_group_title = nil
      if unit_or_unit_group.is_a?(Unit) && unit_or_unit_group.get_original_unit_group.present?
        unit_group_title = unit_or_unit_group.get_original_unit_group.localized_title
      end

      duration_hours = nil
      if template_filename == 'self_paced_pl_certificate.png'
        total_minutes = unit_or_unit_group.duration_in_minutes || 0
        total_hours_to_half_hour = (total_minutes / 30).round / 2.0
        # Round up to half an hour if less than 30 minutes.
        total_hours_to_half_hour = 0.5 if total_hours_to_half_hour == 0
        duration_hours = total_hours_to_half_hour
      end

      response.headers['Cache-Control'] = KNOWN_COURSE_CACHE_CONTROL
      render json: {
        localizedTitle: unit_or_unit_group.localized_title,
        unitGroupTitle: unit_group_title,
        templateFilename: template_filename,
        courseType: CertificateImage.course_type(params[:course]),
        durationHours: duration_hours,
        prefilledTitle: CertificateImage.prefilled_title_course?(params[:course]),
      }
    end
  end

  # GET /api/v1/certificates/user_info
  def user_info
    response.headers['Cache-Control'] = 'private, no-store'

    render json: {
      userName: current_user&.name,
      under13: current_user&.under_13? || false,
      userType: current_user&.user_type,
      csrfToken: form_authenticity_token,
    }
  end

  # GET /api/v1/certificates/congrats
  def congrats
    response.headers['Cache-Control'] = 'private, no-store'

    begin
      course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    data = Api::V1::CongratsSerializer.new(current_user, course_name).as_json
    render json: data.merge(csrfToken: form_authenticity_token)
  end
end

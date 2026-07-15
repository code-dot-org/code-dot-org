# frozen_string_literal: true

class Api::V1::Certificates::ViewersController < ApplicationController
  SHARE_TARGETS = %w[facebook x linkedin].freeze

  def show
    response.headers['Cache-Control'] = 'private, no-store'
    render json: {
      allowedShareTargets: current_user&.under_13? ? [] : SHARE_TARGETS,
      canBulkPrint: !current_user&.student?,
      certificateName: certificate_name,
    }
  end

  private def certificate_name
    return unless current_user&.given_name.present? && current_user&.family_name.present?

    "#{current_user.given_name} #{current_user.family_name}"
  end
end

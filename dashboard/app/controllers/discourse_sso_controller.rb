require 'single_sign_on'

class DiscourseSsoController < ApplicationController
  before_action :authenticate_user! # ensures user must login

  VERIFIED_TEACHERS_GROUP_NAME = 'Verified-Teachers'.freeze

  FACILITATOR_COURSE_NAMES_TO_GROUP_NAMES = {
    Pd::Workshop::COURSE_CSF => 'CSF-Facilitators',
    Pd::Workshop::COURSE_CSD => 'CSD-Facilitators',
    Pd::Workshop::COURSE_CSP => 'CSP-Facilitators'
  }.freeze

  def sso
    secret = CDO.discourse_sso_secret
    sso = SingleSignOn.parse(request.query_string, secret)
    sso.email = current_user.email # from devise
    sso.name = current_user.name # this is a custom method on the User class
    sso.username = current_user.email # from devise
    sso.external_id = current_user.id # from devise
    sso.sso_secret = secret

    add_groups = []
    remove_groups = []

    if current_user.verified_teacher?
      add_groups << VERIFIED_TEACHERS_GROUP_NAME
    else
      remove_groups << VERIFIED_TEACHERS_GROUP_NAME
    end

    FACILITATOR_COURSE_NAMES_TO_GROUP_NAMES.each do |course_name, group_name|
      if Pd::CourseFacilitator.where(facilitator: current_user, course: course_name).exists?
        add_groups << group_name
      else
        remove_groups << group_name
      end
    end

    sso.add_groups = add_groups.join(',')
    sso.remove_groups = remove_groups.join(',')

    redirect_to sso.to_url(sso.return_sso_url)
  end
end

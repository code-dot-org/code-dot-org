require 'cdo/throttle'

class BadgeLoginsController < ApplicationController
  include Devise::Controllers::Rememberable
  before_action :prevent_caching

  def show
    return head :not_found unless Policies::StudentBadges.authentication_enabled?
    @badge_page = {mode: 'scan', signedIn: current_user.present?, name: current_user&.name}
  end

  def create
    return head :not_found unless Policies::StudentBadges.authentication_enabled?
    return render json: {error: 'switch_required'}, status: :conflict if current_user
    return render json: {error: 'reauthentication_required'}, status: :forbidden if session[:badge_reauthentication_user_id]

    payload = params[:badge_payload]
    parts = StudentLoginBadge.parse(payload)
    source_key = Digest::SHA256.hexdigest(request.remote_ip)
    throttled = Cdo::Throttle.throttle("badge-ip:#{source_key}", 300, 60, throttle_for: 60)
    throttled ||= parts && Cdo::Throttle.throttle("badge-id:#{parts[1]}", 20, 60, throttle_for: 60)
    return render json: {error: 'try_later'}, status: :too_many_requests if throttled

    badge = StudentLoginBadge.authenticate(payload)
    return render json: {error: 'invalid_badge'}, status: :unauthorized unless badge

    user = badge.user
    return render json: {error: 'invalid_badge'}, status: :unauthorized unless user.active_for_authentication?
    cookies.delete(remember_key(user, :user), forget_cookie_values(user))
    reset_session
    sign_in(:user, user)
    session[Services::StudentBadges::Session::KEY] = Services::StudentBadges::Session.provenance(badge)
    badge.audit!('login', user.id)
    render json: {redirect: destination(badge)}
  end

  def switch
    forget_me(current_user) if current_user
    sign_out
    reset_session
    redirect_to Policies::StudentBadges.authentication_enabled? ? badge_login_path : new_user_session_path, status: :see_other
  end

  def reauthenticate
    authenticate_user!
    return if performed?
    @badge_page = {mode: 'reauthenticate'}
    render :show
  end

  def begin_reauthentication
    authenticate_user!
    return if performed?
    expected_user = current_user.id
    forget_me(current_user)
    sign_out
    reset_session
    session[:badge_reauthentication_user_id] = expected_user
    session[:user_return_to] = edit_user_registration_path
    redirect_to new_user_session_path, status: :see_other
  end

  def activity
    return head :unauthorized unless badge_authenticated? && current_user
    data = session[Services::StudentBadges::Session::KEY]
    data['last_activity_at'] = Time.current.to_i
    render json: {expires_at: [data['authenticated_at'] + Policies::StudentBadges::ABSOLUTE_TIMEOUT,
                               data['last_activity_at'] + Policies::StudentBadges::IDLE_TIMEOUT].min}
  end

  private def destination(badge)
    section = Section.find_by(id: badge.section_id)
    return home_path unless section&.students&.exists?(id: badge.user_id)
    if section.script && section.unit_group
      assignment = Queries::Courses.unit_group_unit(section.script, section.unit_group)
      return course_unit_path(section.unit_group, assignment.position) if assignment
    elsif section.unit_group
      return course_path(section.unit_group)
    end
    home_path
  end
end

class StudentLoginBadgesController < ApplicationController
  prepend_around_action :use_primary_database
  before_action :authenticate_user!
  before_action :require_non_badge_authentication
  before_action :prevent_caching
  before_action :load_section, except: [:account, :revoke_own]

  rescue_from StudentLoginBadge::Conflict do
    render json: {error: 'badge_changed'}, status: :conflict
  end
  rescue_from StudentLoginBadge::KeyUnavailable do
    render json: {error: 'badge_unavailable'}, status: :service_unavailable
  end

  def show
    @badge_page = {mode: 'manage', sectionId: @section.id, sectionName: @section.name}
    render 'badge_logins/show'
  end

  def index
    students = StudentLoginBadge.on_primary do
      @section.students.map do |student|
        eligible = Policies::StudentBadges.manageable?(current_user, student, @section)
        {id: student.id, name: student.name, eligible: eligible,
         badge: eligible ? StudentLoginBadge.find_by(user_id: student.id)&.status : nil}
      end
    end
    render json: {students: students, issuance_enabled: Policies::StudentBadges.issuance_enabled?(current_user)}
  end

  def availability
    available = Policies::StudentBadges.issuance_enabled?(current_user) ||
      StudentLoginBadge.exists?(user_id: @section.students.select(:id))
    render json: {available: available, label: I18n.t('student_badges.manage'), continuity: I18n.t('student_badges.continuity')}
  end

  def update
    operation = params[:operation]
    return head :bad_request unless %w[issue replace renew revoke].include?(operation)
    if operation != 'revoke' && !Policies::StudentBadges.issuance_enabled?(current_user)
      return head :forbidden
    end
    student = @section.students.find(params[:student_id])
    authorize_student!(student)
    badge = StudentLoginBadge.change!(student: student, actor: current_user, section: @section,
      operation: operation, request_id: params[:request_id], expected_generation: params[:generation]
    )
    render json: {badge: badge.status}
  rescue ArgumentError
    head :bad_request
  end

  def print
    students = if params[:student_id]
                 [@section.students.find(params[:student_id])]
               else
                 @section.students.select {|student| Policies::StudentBadges.manageable?(current_user, student, @section)}
               end
    cards = StudentLoginBadge.on_primary do
      students.filter_map do |student|
        authorize_student!(student)
        badge = StudentLoginBadge.find_by(user_id: student.id)
        next unless badge&.usable?
        payload = badge.payload
        badge.audit!('print', current_user.id)
        {name: student.name, badge_payload: payload, expires_at: badge.expires_at}
      end
    end
    render json: {cards: cards, scanner_url: badge_login_url}
  end

  def account
    badge = StudentLoginBadge.find_by(user_id: current_user.id)
    return head :not_found unless badge
    @badge_page = {mode: 'account', badge: badge.status}
    render 'badge_logins/show'
  end

  def revoke_own
    badge = StudentLoginBadge.change!(student: current_user, actor: current_user, operation: 'revoke',
      request_id: params[:request_id], expected_generation: params[:generation]
    )
    render json: {badge: badge.status}
  rescue ArgumentError
    head :bad_request
  end

  private def load_section
    @section = Section.find(params[:section_id])
    authorize! :manage_badges, @section
  end

  private def use_primary_database(&action)
    StudentLoginBadge.on_primary(&action)
  end

  private def authorize_student!(student)
    raise CanCan::AccessDenied unless Policies::StudentBadges.manageable?(current_user, student, @section)
  end
end

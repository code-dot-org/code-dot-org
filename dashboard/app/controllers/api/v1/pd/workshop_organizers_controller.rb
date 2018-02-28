class Api::V1::Pd::WorkshopOrganizersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_workshop_admin

  def require_workshop_admin
    return if current_user.permission?(UserPermission::WORKSHOP_ADMIN)
    raise(CanCan::AccessDenied, 'user must be a workshop admin')
  end

  # GET /api/v1/pd/workshop_organizers
  def index
    organizers = User.joins(:permissions).where(
      user_permissions: {permission: [UserPermission::WORKSHOP_ORGANIZER, UserPermission::PROGRAM_MANAGER]}
    )
    render json: organizers, each_serializer: Api::V1::Pd::WorkshopOrganizerSerializer
  end
end

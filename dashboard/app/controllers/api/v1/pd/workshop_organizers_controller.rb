class Api::V1::Pd::WorkshopOrganizersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  # GET /api/v1/pd/workshop_organizers
  def index
    organizers = User.joins(:permissions).where(user_permissions: {permission: UserPermission::WORKSHOP_ORGANIZER})
    render json: organizers, each_serializer: Api::V1::Pd::WorkshopOrganizerSerializer
  end
end

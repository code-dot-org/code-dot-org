# The Tutor+ class project gallery: students' saved work on the project levels
# a unit tags `class_gallery`, for a class section or for the signed-in user
# alone ("My projects"). See ClassGallery.
class ClassGalleryProjectsController < ApplicationController
  before_action :authenticate_user!

  # GET /class_gallery_projects?unit_id=:unit_id[&section_id=:section_id][&sort=oldest]
  def index
    gallery = ClassGallery.new(user_ids: gallery_user_ids, unit_ids: [params.require(:unit_id).to_i])
    render json: gallery.entries(viewer: current_user, oldest_first: params[:sort] == 'oldest')
  end

  # GET /class_gallery_projects/unit_counts?unit_ids=:id,:id[&section_id=:section_id]
  #
  # {unit_id => count} over the same scope as index, for the gallery's unit
  # list.
  def unit_counts
    unit_ids = params.require(:unit_ids).to_s.split(',').map(&:to_i)
    render json: ClassGallery.new(user_ids: gallery_user_ids, unit_ids: unit_ids).unit_counts
  end

  # The section's students, authorized as the challenge gallery authorizes
  # its section listing, or the caller alone.
  private def gallery_user_ids
    return [current_user.id] if params[:section_id].blank?
    section = Section.find(params[:section_id])
    authorize! :list_projects, section
    section.students.pluck(:id)
  end
end

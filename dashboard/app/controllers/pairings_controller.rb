class PairingsController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def show
    render json: {pairings: pairings_summary, sections: sections_summary}
  end

  def update
    self.pairings = {pairings: params[:pairings], section_id: params[:sectionId]}

    render json: {pairings: pairings_summary, sections: sections_summary}
  end

  private

  # Serialization helpers

  def pairings_summary
    pairings.map do |user|
      {id: user.id, name: user.name}
    end
  end

  def sections_summary
    pairing_sections = current_user.sections_as_student.select(&:pairing_allowed)
    pairing_sections.map do |section|
      {
        id: section.id,
        name: section.name,
        students:
          (section.students - [current_user]).map do |student|
            {id: student.id, name: student.name}
          end
      }
    end
  end
end

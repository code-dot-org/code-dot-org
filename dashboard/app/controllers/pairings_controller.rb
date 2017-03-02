class PairingsController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def show
    render json: {pairings: pairings_summary, sections: sections_summary}
  end

  def update
    self.pairings = params[:pairings]

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
    current_user.sections_as_student.map do |section|
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

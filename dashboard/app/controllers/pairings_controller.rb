class PairingsController < ApplicationController

  def show
    respond_to do |format|
      format.html do
        @props = {source: url_for()}.to_json
        render
      end
      format.js { render json: summary }
    end
  end

  def update
    # check permissions

    logger.debug params
    logger.debug params[:pairings]
    if params[:pairings].present?
      self.pairings = params[:pairings]
    else
      self.pairings = nil
    end

    head :ok
  end

  private

  def pairings=(pairings_from_params)
    session[:pairings] = pairings_from_params.map do |pairing_param|
      User.find(pairing_param[:id])
    end
  end

  def pairings_summary
    return [] if session[:pairings].blank?

    session[:pairings].map do |user|
      {id: user.id, name: user.name}
    end
  end

  def summary
    # [{id: 1, name: "A section"}, {id: 15, name: "Anotther section"}]
    sections = current_user.sections_as_student.map do |section|
      {id: section.id, name: section.name, students:
       (section.students - [current_user]).map do |student|
         {id: student.id, name: student.name}
       end
      }
    end

    {pairings: pairings, sections: sections}
  end
end

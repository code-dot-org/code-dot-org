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
    return if pairings_from_params.blank?

    session[:pairings] = pairings_from_params.map do |pairing_param|
      other_user = User.find(pairing_param[:id])
      if current_user.can_pair_with? other_user
        other_user
      else
        nil
      end
    end.compact
  end

  def pairings_summary
    return [] if session[:pairings].blank?

    session[:pairings].map do |user|
      {id: user.id, name: user.name}
    end
  end

  def sections_summary
    current_user.sections_as_student.map do |section|
      {id: section.id, name: section.name, students:
       (section.students - [current_user]).map do |student|
         {id: student.id, name: student.name}
       end
      }
    end
  end

  def summary
    {pairings: pairings_summary, sections: sections_summary}
  end
end

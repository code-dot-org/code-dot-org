class PairingsController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: {pairings: pairings_summary, sections: sections_summary}
  end

  def update
    if params[:pairings].present?
      self.pairings = params[:pairings]
    else # turn off pair programming
      self.pairings = nil
    end

    head :ok
  end

  private

  # Pairings are stored as an array of user ids in the session
  # (storing full objects is not a good idea because the session is
  # saved as a cookie)

  def pairings=(pairings_from_params)
    return if pairings_from_params.blank?

    session[:pairings] = pairings_from_params.map do |pairing_param|
      other_user = User.find(pairing_param[:id])
      if current_user.can_pair_with? other_user
        other_user.id
      else
        # TODO: should this cause an error to be returned to the user?
        nil
      end
    end.compact
  end

  def pairings
    return [] if session[:pairings].blank?

    User.find(session[:pairings])
  end

  # Serialization helpers

  def pairings_summary
    pairings.map do |user|
      {id: user.id, name: user.name}
    end
  end

  def sections_summary
    current_user.sections_as_student.map do |section|
      {id: section.id,
       name: section.name,
       students:
         (section.students - [current_user]).map do |student|
           {id: student.id, name: student.name}
         end
      }
    end
  end
end

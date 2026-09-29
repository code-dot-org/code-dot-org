# The signed-in viewer's emoji reactions on a gallery challenge response.
# Anyone who may read a response may react to it — its author, the author's
# teachers, and (for final submissions) the author's section peers — so both
# actions authorize against the parent response's :read ability rather than a
# separate reaction ability.
#
# Both actions return the response's updated reaction tallies, so the gallery
# can reconcile its chips (counts include other viewers' reactions) from the
# single response.
class ChallengeResponseReactionsController < ApplicationController
  before_action :authenticate_user!
  before_action :load_response
  before_action :authorize_react!

  # POST /challenge_responses/:challenge_response_id/reactions {emoji}
  #
  # Adds the current user's reaction with the given emoji. Idempotent:
  # re-adding an emoji the user already reacted with is a no-op, not an error,
  # so a double click or a click racing a stale UI cannot 422.
  def create
    @response.challenge_response_reactions.
      find_or_create_by!(user: current_user, emoji: params.require(:emoji))
    render json: reactions_json
  rescue ActiveRecord::RecordInvalid => exception
    render status: :unprocessable_entity, json: {error: exception.message}
  end

  # DELETE /challenge_responses/:challenge_response_id/reactions/:emoji
  #
  # Removes the current user's reaction with the given emoji. A no-op when
  # the reaction is absent, so toggling off twice is harmless.
  def destroy
    @response.challenge_response_reactions.
      where(user: current_user, emoji: params[:emoji]).destroy_all
    render json: reactions_json
  end

  private def load_response
    @response = ChallengeResponse.find(params[:challenge_response_id])
  end

  private def authorize_react!
    authorize! :read, @response
  end

  # Only the reaction tallies are returned: the reacting viewer already has
  # the rest of the response, and this keeps the private student_feedback /
  # evaluation fields out of a payload every peer can request.
  private def reactions_json
    {reactions: @response.reaction_summary(current_user)}
  end
end

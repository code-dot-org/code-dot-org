module Lti
  module V1
    class FeedbackController < ApplicationController
      before_action :authenticate_user!
      before_action -> {head :no_content}, unless: -> {Policies::Lti.feedback_available?(current_user)}

      def create
        @lti_feedback = Lti::Feedback.new(feedback_params)

        @lti_feedback.user = current_user
        @lti_feedback.locale = I18n.locale
        @lti_feedback.early_access = false

        respond_to do |format|
          if @lti_feedback.save
            format.json {render json: @lti_feedback, status: :created}
          else
            format.json {render json: @lti_feedback.errors.full_messages, status: :unprocessable_entity}
          end
        end
      end

      def show
        @lti_feedback = Lti::Feedback.find_by(user: current_user)

        respond_to do |format|
          format.json {render json: @lti_feedback}
        end
      end

      private def feedback_params
        params.require(:lti_feedback).permit(:satisfied)
      end
    end
  end
end

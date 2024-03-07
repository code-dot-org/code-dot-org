module Lti
  module V1
    class FeedbacksController < ApplicationController
      before_action :authenticate_user!
      before_action -> {head :forbidden}, unless: -> {Policies::Lti.feedback_available?(current_user)}, on: :create

      def create
        @lti_feedback = Lti::Feedback.new(feedback_params)

        @lti_feedback.user = current_user
        @lti_feedback.locale = I18n.locale
        @lti_feedback.early_access = Policies::Lti.early_access?

        respond_to do |format|
          if @lti_feedback.save
            format.js {head :created}
          else
            format.js {render json: @lti_feedback.errors.full_messages, status: :unprocessable_entity}
          end
        end
      end

      private

      def feedback_params
        params.require(:lti_feedback).permit(:satisfaction_level)
      end
    end
  end
end

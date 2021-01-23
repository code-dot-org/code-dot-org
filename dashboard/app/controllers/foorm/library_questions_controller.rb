module Foorm
  # Foorm Library Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
  class LibraryQuestionsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    load_and_authorize_resource

    # GET /foorm/library_questions/:id
    def show
      # Maybe update this to only return certain parts of the question?
      render json: @library_question.to_json
    end

    # PUT /foorm/library_questions/:id/update
    def update
      @library_question.question = params[:question].to_json

      if @library_question.save
        # Maybe update this to only return the question content?
        return render json: @library_question
      else
        return render status: :bad_request, json: @library_question.errors
      end
    end
  end
end

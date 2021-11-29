module Foorm
  # Foorm Library Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
  class LibraryQuestionsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    before_action :require_question, only: [:create, :update]
    load_and_authorize_resource

    # POST /foorm/library_questions
    def create
      library = Foorm::Library.find_by(id: params[:library_id])
      # This needs to be put in a transaction, or another solution.
      # If library question save fails, we end up with a created
      # library with no associated library question.
      if library.nil?
        library = Foorm::Library.create(
          {
            name: params[:library_name],
            version: 0,
            published: true
          }
        )
      end

      @library_question.assign_attributes(
        {
          library_name: library.name,
          library_version: library.version,
          question: JSON.pretty_generate(params[:question].as_json),
          question_name: params[:name],
          published: true
        }
      )

      if @library_question.save
        return render json: {
          library_question: @library_question,
          library: @library_question.library
        }
      else
        return render status: :bad_request, json: @library_question.errors
      end
    end

    # GET /foorm/library_questions/:id
    def show
      if @library_question
        data_to_return = {
          id: @library_question.id,
          name: @library_question.question_name,
          question: JSON.parse(@library_question.question),
          published: @library_question.published
        }
        render json: data_to_return
      else
        render json: {}
      end
    end

    # PUT /foorm/library_questions/:id/update
    def update
      @library_question.question = JSON.pretty_generate(params[:question].as_json)

      if @library_question.save
        return render json: @library_question
      else
        return render status: :bad_request, json: @library_question.errors
      end
    end

    # GET /foorm/library_questions/:id/published_forms_appeared_in
    def published_forms_appeared_in
      published_forms = @library_question.published_forms_appeared_in

      # A form "key" is of the format "surveys/pd/pre_workshop_survey.0"
      # It combines the name and version of the form.
      data_to_return = published_forms.map(&:key)

      return render json: data_to_return
    end

    def require_question
      render(status: :bad_request, plain: "no question provided") unless params[:question]
    end
  end
end

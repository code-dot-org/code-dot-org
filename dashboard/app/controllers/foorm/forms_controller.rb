module Foorm
  class FormsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    load_and_authorize_resource

    # PUT foorm/form/:id/update_questions
    def update_questions
      questions_json = get_questions
      published_state = questions_json['published']

      if published_state.nil?
        questions_json['published'] = @form.published
      elsif !published_state && @form.published
        return render(status: :bad_request, plain: "A previously published form cannot be changed to draft state.")
      else
        @form.published = published_state
      end

      form_questions = JSON.pretty_generate(questions_json)
      @form.questions = form_questions
      save_form(@form)
    end

    # POST foorm/form
    def create
      form_name = params[:name]
      form_version = params[:version] || 0

      if Foorm::Form.where(name: form_name, version: form_version).any?
        return render(status: :conflict, plain: "Form with name #{form_name} and version #{form_version} already exists.")
      end

      questions_json = get_questions
      published = questions_json['published']
      published_params = params[:published]
      # If questions do not contain a published state, either use published state provided by params or default to false.
      if published.nil?
        published = published_params || false
        questions_json['published'] = published
        # If questions does contain a published state and a published state was provided as a param, verify they match.
      elsif !published_params.nil? && published != published_params
        return render(status: :bad_request, plain: "Published state in questions did not match provided published parameter.")
      else
        published = published
      end

      form_questions = JSON.pretty_generate(questions_json)
      form = Foorm::Form.new(name: form_name, version: form_version, questions: form_questions, published: published)
      save_form(form)
    end

    # PUT foorm/form/:id/publish
    def publish
      if @form.published
        return render plain: "success"
      end

      parsed_questions = JSON.parse(@form.questions)
      parsed_questions['published'] = true
      @form.questions = JSON.pretty_generate(parsed_questions)
      @form.published = true
      save_form(@form)
    end

    def save_form(form)
      if form.save
        return render json: {id: form.id}
      else
        return render status: :bad_request, json: form.errors
      end
    end

    def get_questions
      questions_json = params[:questions].as_json
      unless questions_json
        return render(status: :bad_request, plain: "no questions provided")
      end
      questions_json
    end
  end
end

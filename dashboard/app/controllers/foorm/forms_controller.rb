module Foorm
  class FormsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    before_action :require_questions, only: [:create, :update_questions]
    load_and_authorize_resource

    # GET '/foorm/forms/editor'
    def editor
      formatted_names_and_versions = Foorm::Form.all.map {|form| {name: form.name, version: form.version, id: form.id}}
      categories = formatted_names_and_versions.map {|data| data[:name].slice(0, data[:name].rindex('/'))}.uniq

      @unit_data = {
        props: {
          formNamesAndVersions: formatted_names_and_versions,
          formCategories: categories
        }.to_json
      }

      render 'foorm/forms/editor'
    end

    # PUT foorm/form/:id/update_questions
    def update_questions
      questions_json = params[:questions].as_json
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

    # POST foorm/forms
    def create
      form_name = params[:name]
      form_version = params[:version] || 0

      if Foorm::Form.where(name: form_name, version: form_version).any?
        return render(status: :conflict, plain: "Form with name #{form_name} and version #{form_version} already exists.")
      end

      questions_json = params[:questions].as_json
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
        return render json: form
      end

      parsed_questions = JSON.parse(@form.questions)
      parsed_questions['published'] = true
      @form.questions = JSON.pretty_generate(parsed_questions)
      @form.published = true
      save_form(@form)
    end

    def save_form(form)
      if form.save
        return render json: form
      else
        return render status: :bad_request, json: form.errors
      end
    end

    def require_questions
      render(status: :bad_request, plain: "no questions provided") unless params[:questions]
    end
  end
end

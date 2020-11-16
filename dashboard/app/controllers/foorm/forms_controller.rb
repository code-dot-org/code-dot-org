module Foorm
  class FormsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    authorize_resource

    # PUT foorm/form/:name/:version
    def update
      form_questions = JSON.pretty_generate(params[:questions].as_json)
      form_name = params[:name]
      form_version = params[:version]
      form_query = Foorm::Form.where(name: form_name, version: form_version)
      unless form_query.any?
        return render(status: 500, plain: "Form with name #{form_name} and version #{form_version} does not already exist.")
      end

      form = Foorm::Form.where(name: form_name, version: form_version).first
      form.questions = form_questions
      save_form(form)
    end

    # POST foorm/form/:name/:version
    def create
      form_questions = JSON.pretty_generate(params[:questions].as_json)
      form_name = params[:name]
      form_version = params[:version]
      if Foorm::Form.where(name: form_name, version: form_version).any?
        return render(status: 409, plain: "Form with name #{form_name} and version #{form_version} already exists")
      end

      form = Foorm::Form.new(name: form_name, version: form_version, questions: form_questions)
      save_form(form)
    end

    def save_form(form)
      if form.save
        return render plain: "success"
      else
        return render status: :unprocessable_entity, json: form.errors
      end
    end
  end
end

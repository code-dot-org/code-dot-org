class FoormPreviewController < ApplicationController
  # GET '/foorm/preview/:name'
  def index
    render_404 if Rails.env.production?

    name = params[:name]

    form_questions, latest_version = Foorm::Form.get_questions_and_latest_version_for_name(name)

    render_404 unless form_questions

    survey_data = {
      facilitators: [
        {
          facilitatorId: 1,
          facilitatorName: 'Alice'
        },
        {
          facilitatorId: 2,
          facilitatorName: 'Bob'
        },
        {
          facilitatorId: 3,
          facilitatorName: 'Chris'
        }
      ],
      workshop_course: "Summer Course"
    }

    @script_data = {
      props: {
        formQuestions: form_questions,
        formName: name,
        formVersion: latest_version,
        surveyData: survey_data,
        submitApi: "/none",
        submitParams: {
          user_id: current_user&.id,
          pd_workshop_id: Pd::Workshop.first.id
        }
      }.to_json
    }

    view_options(full_width: true, responsive_content: true)

    render 'foorm/preview/index'
  end
end

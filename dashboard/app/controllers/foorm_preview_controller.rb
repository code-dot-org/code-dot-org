class FoormPreviewController < ApplicationController
  # GET '/foorm/preview'
  def index
    return render_404 if Rails.env.production?

    forms = Foorm::Form.all.map do |form|
      {
        name: form.name,
        url: '/foorm/preview/' + form.name
      }
    end

    @unit_data = {
      props: {
        forms: forms
      }.to_json
    }

    render 'foorm/preview/index'
  end

  # GET '/foorm/preview/:name'
  def name
    return render_404 if Rails.env.production?

    name = params[:name]

    form_questions, latest_version = Foorm::Form.get_questions_and_latest_version_for_name(name)

    return render_404 unless form_questions

    survey_data = {
      facilitators: [
        {
          facilitator_id: 1,
          facilitator_name: 'Alice',
          facilitator_position: 1
        },
        {
          facilitator_id: 2,
          facilitator_name: 'Bob',
          facilitator_position: 2
        },
        {
          facilitator_id: 3,
          facilitator_name: 'Chris',
          facilitator_position: 3
        }
      ],
      workshop_course: params[:workshopCourse] || "Summer Course",
      workshop_subject: params[:workshopSubject] || "Sample Subject",
      regional_partner_name: params[:regionalPartnerName] || "Regional Partner A",
      is_virtual: params[:isVirtual] == 'true' || false,
      is_friday_institute: params[:isFridayInstitute] == 'true' || false,
      num_facilitators: 3,
      workshop_agenda: params[:workshopAgenda] || "module1"
    }

    @unit_data = {
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

    render 'foorm/preview/name'
  end
end

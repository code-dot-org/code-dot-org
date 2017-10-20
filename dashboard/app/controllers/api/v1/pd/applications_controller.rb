class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # GET /api/v1/pd/applications
  def index
    application_data = {}
    application_types = [
      {
        course: :csf,
        role: :csf_facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csd,
        role: :csd_facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csp,
        role: :csp_facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csd,
        role: :csd_teacher,
        klass: 'Pd::Application::Teacher1819Application'

      },
      {
        course: :csp,
        role: :csp_teacher,
        klass: 'Pd::Application::Teacher1819Application'
      },
    ]

    regional_partner_id = params[:regional_partner]

    application_types.each do |app_type|
      klass = app_type[:klass]
      course = app_type[:course]
      role = app_type[:role]
      application_data[role] = {}
      applications = Object.const_get(klass).send(course)

      if regional_partner_id
        applications = applications.where(regional_partner: regional_partner_id)
      end

      apps_by_status = applications.group_by(&:status)
      apps_by_status.each do |status, apps_with_status|
        application_data[role][status] = {}
        grouped_apps = apps_with_status.group_by {|app| app.locked? ? 'locked' : 'unlocked'}
        grouped_apps.each do |locked_state, apps|
          application_data[role][status][locked_state] = apps.size
        end
      end
    end

    render json: application_data
  end

  # GET /api/v1/pd/applications/1
  def show
    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end
end

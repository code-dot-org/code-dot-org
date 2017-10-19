class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # GET /api/v1/pd/applications
  def index
    application_data = {}
    application_types = [
      {
        course: :csf,
        role: :facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csd,
        role: :facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csp,
        role: :facilitator,
        klass: 'Pd::Application::Facilitator1819Application'

      },
      {
        course: :csd,
        role: :teacher,
        klass: 'Pd::Application::Teacher1819Application'

      },
      {
        course: :csp,
        role: :teacher,
        klass: 'Pd::Application::Teacher1819Application'
      },
    ]

    regional_partner_id = params[:regional_partner]

    application_types.each do |app_type|
      klass = app_type[:klass]
      course = app_type[:course]
      key = "#{app_type[:course]}_#{app_type[:role]}"
      application_data[key] = {}
      applications = Object.const_get(klass).send(course)

      if regional_partner_id
        applications = applications.where(regional_partner: regional_partner_id)
      end

      apps_by_status = applications.group_by(&:status)
      apps_by_status.each do |status, apps_with_status|
        application_data[key][status] = {}
        grouped_apps = apps_with_status.group_by {|app| app.locked? ? 'locked' : 'unlocked'}
        grouped_apps.each do |locked_state, apps|
          application_data[key][status][locked_state] = apps.size
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

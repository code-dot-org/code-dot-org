Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins CDO.pegasus_site_host
    resource '/dashboardapi/*', headers: :any, methods: [:get]
  end
end

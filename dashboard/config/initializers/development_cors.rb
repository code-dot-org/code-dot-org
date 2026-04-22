if Rails.env.development?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins %r{\Ahttp://localhost-studio.code.org:\d+\z}

      resource '*',
               headers: :any,
               methods: :any,
               credentials: true
    end
  end
end

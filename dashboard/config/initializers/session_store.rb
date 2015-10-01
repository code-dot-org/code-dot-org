require 'cdo/session'
Dashboard::Application.config.session_store :cookie_store,
                                            key: Session::KEY,
                                            secure: !Rails.env.development? || CDO.https_development,
                                            domain: :all

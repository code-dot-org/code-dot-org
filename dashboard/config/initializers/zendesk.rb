# configuration for zendesk sso
Dashboard::Application.config.zendesk_secret = CDO.zendesk_secret || "not really a secret"
Dashboard::Application.config.zendesk_subdomain = 'codeorg'

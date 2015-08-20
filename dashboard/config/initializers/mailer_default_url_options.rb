# generate https://studio.code.org urls in mails (the actual
# hostname varies based on the CDO.canonical_hostname which
# depends on the environment)
Dashboard::Application.config.action_mailer.default_url_options = { host: CDO.canonical_hostname('studio.code.org'), protocol: 'https' }

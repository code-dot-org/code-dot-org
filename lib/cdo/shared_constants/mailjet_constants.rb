module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: 5_421_128,
        staging: 5_421_128,
        development: 5_421_128
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    }
  }.freeze
end

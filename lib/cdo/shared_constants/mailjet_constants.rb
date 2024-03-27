module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: 5_421_128,
        staging: 5_826_411,
        development: 5_808_078
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    }
  }.freeze
end

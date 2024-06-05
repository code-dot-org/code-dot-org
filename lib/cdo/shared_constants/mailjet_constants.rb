module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: 5_831_384,
        staging: 5_917_989,
        development: 5_917_988
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    }
  }.freeze
end

module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: {
          default: 5_831_384,
          'es-MX': 5_973_069,
          'es-ES': 5_973_070
        },
        staging: {
          default: 5_917_989
        },
        development: {
          default: 5_917_988,
          'es-MX': 6_104_709,
        }
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    }
  }.freeze
end

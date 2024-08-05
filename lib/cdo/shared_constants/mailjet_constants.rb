module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: {
          default: 5_831_384,
          'es-MX': 6_135_180,
          'es-ES': 6_135_179
        },
        staging: {
          default: 5_917_989
        },
        development: {
          default: 5_917_988,
          'es-MX': 6_142_048,
        }
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    },
    cap_section_warning: {
      template_id: {
        staging: {
          default: 6_190_124,
        },
        development: {
          default: 6_189_697,
        }
      },
      from_address: 'hadi_partovi@code.org',
      from_name: 'Hadi Partovi',
    }
  }.freeze
end

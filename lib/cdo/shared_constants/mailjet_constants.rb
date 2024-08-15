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
        production: {
          default: 6_195_698,
        },
        staging: {
          default: 6_205_189,
        },
        development: {
          default: 6_205_188,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    }
  }.freeze

  CONTACT_LISTS = {
    welcome_series: {
      default: 10_353_815,
      'es-MX': 10_353_822,
      'es-ES': 10_353_822,
    }
  }
end

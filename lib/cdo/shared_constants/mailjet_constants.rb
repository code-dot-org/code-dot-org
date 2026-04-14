module MailjetConstants
  MAILJET_RETRY_LIMIT = 5

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
    teacher_workshop_reminder: {
      template_id: {
        production: {
          default: 7_182_428,
        },
        development: {
          default: 7_208_545,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    regional_partner_workshop_reminder: {
      template_id: {
        production: {
          default: 7_243_794,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    teacher_workshop_detail_change_notification: {
      template_id: {
        production: {
          default: 7_192_319,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    regional_partner_workshop_detail_change_notification: {
      template_id: {
        production: {
          default: 7_249_336,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    teacher_post_workshop_survey: {
      template_id: {
        production: {
          default: 7_192_300,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    facilitator_post_workshop_survey: {
      template_id: {
        production: {
          default: 7_243_888,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    },
    inactive_teacher_deletion_warning: {
      template_id: {
        production: {
          default: 7_237_548,
        }
      },
      from_address: 'noreply@code.org',
      from_name: 'Code.org',
    }
  }.freeze

  CONTACT_LISTS = {
    welcome_series: {
      production: {
        default: 10_353_815,
        'es-MX': 10_353_822,
        'es-ES': 10_353_822,
      },
      staging: {
        default: 407_739,
      },
      development: {
        default: 10_443_291,
        'es-MX': 10_443_295,
      },
    },
    hoai_web_design: {
      production: {
        default: 0, # TODO: Replace with actual MailJet list ID
      },
    }
  }

  # Maps UnitGroup name to CONTACT_LISTS key. When a teacher assigns one of
  # these courses to a section, they are added to the corresponding contact list.
  MAILJET_COURSE_ASSIGNMENT_CONTACT_LISTS = {
    'hoai-web-design-pilot-v2' => :hoai_web_design,
  }.freeze
end

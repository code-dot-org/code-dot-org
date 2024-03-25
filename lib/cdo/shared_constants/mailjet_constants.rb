module MailJetConstants
  EMAILS = {
    welcome: {
      template_id: {
        production: 5_421_128,
        staging: 5_421_128,
        development: 5_808_078
      },
      from_address: 'bethany@code.org',
      from_name: 'Bethany',
    }
  }.freeze
end

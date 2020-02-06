require 'honeybadger/ruby'

# Note: as of February 2020, this controller is deprecated
# in favor of the regional_partner_mini_contact form.
# That form is embedded at educate/professional-learning/contact-regional-partner,
# which is what we redirect to here.
# Not fully deprecating yet in case regional partners or Code.org staff
# have saved links that use this controller.

class Pd::RegionalPartnerContactController < ApplicationController
  # GET /pd/regional_partner_contacts/new
  def new
    Honeybadger.notify(
      error_class: 'DeprecatedEndpointWarning',
      error_message: <<~MESSAGE,
      Somebody called GET #{request.path}, which was deprecated in February 2020.
      This might be a regional partner or Code.org staff member sharing a saved link,
      but we should follow up and see if we have a leftover link to this route somewhere.
      See <Ben to insert PR link here!> for details.
      MESSAGE
      context: {
        referer: request.referer
      }
    )
    redirect_to code_org_url('educate/professional-learning/contact-regional-partner')
  end
end

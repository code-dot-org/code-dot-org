require 'honeybadger/ruby'

#
# This controller is deprecated as of June 2019.  All certificates should be served
# through WorkshopCertificateController now.
# We're not immediately removing this because teachers may have bookmarked their
# certificate link and would expect to get the same certificate, here.
#
class Pd::CsfCertificateController < ApplicationController
  def generate_certificate
    Honeybadger.notify(
      error_class: 'DeprecatedEndpointWarning',
      error_message: <<~MESSAGE,
      Somebody called GET #{request.path}, which was deprecated in June 2019.
      This might be someone visiting a bookmark or browser history, but we should
      follow up and see if we have a leftover link to this route somewhere.
      See https://github.com/code-dot-org/code-dot-org/pull/28762 for details.
      MESSAGE
      context: {
        referer: request.referer
      }
    )
    redirect_to controller: 'pd/workshop_certificate', action: 'generate_certificate'
  end
end

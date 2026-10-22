module OmniAuth
  module Strategies
    # The gem's GoogleOauth2 strategy, minus the tokeninfo round trip.
    #
    # omniauth-google-oauth2 POSTs every new access token to Google's tokeninfo
    # endpoint during the callback, only to read back the granted scope. Google
    # documents that endpoint as a debugging aid rather than a production
    # dependency, and the token response already carries the same scope string.
    # Skipping the call removes one of the three Google requests per login.
    class GoogleOauth2WithoutTokeninfo < GoogleOauth2
      # Overrides OmniAuth::Strategy#credentials, which merges every ancestor's
      # credentials block; GoogleOauth2's is the one that calls tokeninfo.
      def credentials
        base = merge_stack(OAuth2.credentials_stack(self))
        base.merge(prune!('scope' => access_token['scope']))
      end
    end
  end
end

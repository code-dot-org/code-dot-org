
#
# =========================================================================
#   LTI uses Oauth 1 for SSO, and generates a HMAC-SHA1 signature
#
#   Stub model for now until it is decided how credentials should be
#   administered. This one is used in the test suite.
#
#   To create consumer_key/consumer_secret
#   > SecureRandom.uuid.gsub("-", "")
# =========================================================================
#

class OauthCredentials
  @@credentials = {}
  @@credentials["f10ee9fc082219227976f2c1603a3d77"] = {
    consumer_secret: "dc3872a4b605f1f36242a837172ce2c0",
    description: "Proof of concept for Code-Dot-Org" }

  def self.get_credential(consumer_key)
    @@credentials[consumer_key]
  end

  def self.get_secret(consumer_key)
    return nil if @@credentials[consumer_key].nil?
    @@credentials[consumer_key][:consumer_secret]
  end
end

# A class for returning an "offline mode" flag to toggle users' ability to
# download courses available offline
#
# This class currently returns a simple global offline mode defined by a DCDO
# variable.
class OfflineModeBase
  DEFAULT_OFFLINE_MODE = nil
  OFFLINE_MODE_KEY = 'om'.freeze

  # Returns a boolean stating whether the request allows for offline use.
  # @param {ActionDispatch::Request} request
  # @return {boolean}
  def get(request)
    offline_mode = false

    (request && request.cookies[OFFLINE_MODE_KEY]) ||
        DCDO.get('offline_mode', DEFAULT_OFFLINE_MODE) ||
        offline_mode
  end

  # Sets the default page mode for all requests.
  # @param {string} offline_mode
  def set_default(offline_mode)
    DCDO.set('offline_mode', offline_mode)
  end
end

OfflineMode = OfflineModeBase.new

# A class for returning a "page mode" use by views to decide how to render
# a request.
#
# This class currently returns a simple global page mode defined by a DCDO
# variable. In the future we will support more complicated page mode policies
# (e.g. A-B testing of different modes with session stickiness).
class PageModeBase
  # The default page mode to use for all requests if no page mode has
  # been explicitly set.
  DEFAULT_PAGE_MODE = 'starwars'

  PAGE_MODE_KEY = 'pm'

  # Returns the page mode to use for rendering the given request.
  # @param {ActionDispatch::Request} request
  # @return {string}
  def get(request)
    # If a session page mode is set the 'pm' cookie, return that,
    # otherwise return the default page mode from DCDO.
    (request && request.cookies[PAGE_MODE_KEY]) ||
        DCDO.get('page_mode', DEFAULT_PAGE_MODE)
  end

  # Sets the default page mode for all requests.
  # @param {string} page_mode
  def set_default(page_mode)
    DCDO.set('page_mode', page_mode)
  end
end

PageMode = PageModeBase.new

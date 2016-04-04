# A class for returning a "page mode" use by views to decide how to render
# a request.
#
# This class currently returns a simple global page mode defined by a DCDO
# variable. In the future we will support more complicated page mode policies
# (e.g. A-B testing of different modes with session stickiness).
class PageModeBase
  DEFAULT_PAGE_MODE = nil
  PAGE_MODE_KEY = 'pm'

  # Returns the page mode to use for rendering the given request.
  # @param {ActionDispatch::Request} request
  # @return {string}
  def get(request)
    # If a session page mode is set the 'pm' cookie, return that,
    # or return the default page mode from DCDO,
    # otherwise return a sw or mc page mode.

    # 50/50 chance of being in sw or mc page mode
    page_mode = rand(2) == 0 ? "feature-starwars" : "feature-mc"

    (request && request.cookies[PAGE_MODE_KEY]) ||
        DCDO.get('page_mode', DEFAULT_PAGE_MODE) ||
        page_mode
  end

  # Sets the default page mode for all requests.
  # @param {string} page_mode
  def set_default(page_mode)
    DCDO.set('page_mode', page_mode)
  end
end

PageMode = PageModeBase.new

require 'test_helper'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'update_from_new_contacts creates one row per email' do
    # requires a) stub for get request to Pardot, and
    # b) contents of that response to be XML similar to what Pardot currently shares?
  end

  test 'import_from_raw_table works when more than 200 records' do
    # use part b) above,
    # but need to be able to stub 200+ XML responses with distinct emails?
  end
end

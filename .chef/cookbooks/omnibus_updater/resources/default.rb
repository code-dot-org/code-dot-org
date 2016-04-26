# Chef Resource that keeps the Chef Client up to date using the omnibus_updater cookbook.

actions :update
default_action :update

attribute :version, kind_of: String, name_attribute: true

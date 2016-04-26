#node.set[:omnibus_updater][:upgrade_behavior] = nil
#node.set[:omnibus_updater][:version] = false
#include_recipe "omnibus_updater"

omnibus_updater :latest

node.set[:omnibus_updater][:version] = '11.18'
node.set[:omnibus_updater][:upgrade_behavior] = nil
include_recipe "omnibus_updater"

The `update_gatekeeper.sh` script in this directory updates the Gatekeeper
dynamic configuration from a YAML file of rules; `update_dcdo.sh` does the same
for DCDO. The rule format is documented at the top of
`lib/dynamic_config/loaders/gatekeeper_loader.rb`.

For example, to load Gatekeeper rules from a file you have written:

    ./update_gatekeeper.sh my_rules.yml

The only file kept here is `dcdo.yml`, which is empty.

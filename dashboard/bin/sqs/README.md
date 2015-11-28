# SQS Queue processor

The `process_queues` script requires an mandatory argument giving an
argument to the JSON config file which can also contain embedded Ruby:

./process_queues ../../config/queue_config.json.erb

It also supports an optional second argument telling how long in
seconds to wait between status updates.

The `process_queues_daemon` script requires a single 'init-script'
argument: start, stop, reload, restart, or status and uses the script
in queue_config.json.erb as its configuration.

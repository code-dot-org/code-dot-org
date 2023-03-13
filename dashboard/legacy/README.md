# Dashboard Legacy

This directory should contain only code which meets the following criteria:
* The code runs in dashboard server, and does not run in pegasus server.
  Code in `bin/` (including cronjobs) may access this code too.
* The code may access Dashboard DB, and must not access Pegasus DB
* A technical limitation prevents us from moving it to `dashboard/lib` 
* and `dashboard/test`.

The main technical limitation we have run into so far is that the tests for this
code depends on `common_test_helper.rb`, which is not currently compatible with
`dashboard/test/test_helper.rb` or the rest of the dashboard unit test suite.

As we try to separate the contents of `shared/` and `lib/` into dashboard and
pegasus, it is best to move dashboard server code into `dashboard/lib` and 
`dashboard/test`, but if that's not possible then the next best option is 
to move it here.

If we get to a point where dashboard unit tests are no longer being run inside
a single long-running transaction, then it would be worth trying again to
consolidate this directory into `dashboard/lib` and `dashboard/test`.

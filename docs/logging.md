# Logging

## Overview

Hourly, each front-end automatically uploads their logs to the `cdo-logs` S3 bucket.

Once per day, each front-end compresses that day's logs, adds a timestamp to the filename, and truncates the log file for the next day.

Logs are captured in the `dashboard/log` and `pegasus/log` directories.

## Log Upload Specifics

The `bin/upload-logs-to-s3` cronjob runs at 45 minutes after the hour, every hour. This uses the [AWS command-line interface](http://aws.amazon.com/cli/) to *sync* the logs to S3. Their definition if sync means it uploads new and modified files, but doesn't delete remote files when local copies are deleted.

### Usage

```
$ upload-logs-to-s3 dashboard
$ upload-logs-to-s3 pegasus
$ upload-logs-to-s3 dashboard pegasus
```

### Destination

Logs are uploaded to the `cdo-logs` bucket, in the `hosts/<hostname>/<appname>` directory.
  
*Today's* activity (where 'today' begins at midnight GMT) is in the uncompressed `.log` files.

Historical activity is suffixed with a date, e.g. `-20141131`, and then compressed.

### Preservation During Termination

When terminating an application instance it's import to make sure all of the logs have been rotated and uploaded before terminating it. In practice, the simplest way to do this is to:

1. Remove the instance from service
1. `ssh` to the instance.
1. Eliminate activity that generates new log events:
  1. Stop all of our services on the instance (`sudo systemctl varnish stop`, repeat for `dashboard` and `pegasus`)
  1. Disable all cronjobs (`crontab -e`, use `#` to comment out lines)
1. `logrotate -f /etc/logrotate.d/dashboard`
1. `logrotate -f /etc/logrotate.d/pegasus`
1. Verify that `dashboard/log` and `pegasus/log` have been properly rotated:
  1. A `-YYYYMMDD.gz` file was created for today.
  1. All remainning logs are empty or very small.
1. `upload-logs-to-s3 dashboard pegasus`
1. Terminate the instane.

**WARNING** `logrotate` will only rotate the logs once per day so if you run it too soon (e.g. while still handling traffic) you'll be stuck waiting until tomorrow (GMT) before you can run it again to finish the termination.

## Log Analysis: Counting Lines of Code

`bin/count-lines-of-code-from-milestone-logs` is a template for performing log analysis. It is also what we use to analyze the `milestone.log[-YYYYMMDD.gz]` files to count lines of code.

### Usage

Run it. If you've never run it, and you're not on an AWS instance, it'll take hours to run. It spits out the total lines of code written. It's interface is simple because it is used by the `pegasus/bin/analyze_hoc_activity` cronjob.

### Design

`count-lines-of-code-from-milestone-logs` starts by loading a cache of previously counted values (initially empty, not checked in).

Then it enumerates the objects in the `cdo-logs` S3 bucket looking for ones that match the `milestone.log` pattern.

For historical logs (identified by being compressed) in the bucket, the script checks the cache for a count for that log and skips analysis if one is available. Otherwise it downloads the log, counts the lines in it, adds the count to the cache, and deletes the log file.

For today's log (identified by not being compressed) in the bucket, the script downloads the log and analyzes it every time. It does not cache the result.

The process repeats until all of the objects in `cdo-logs` have been enumerated.

The cache is stored in a `.json` file as a simple hash of log path to result.

*Note:* Some directories are explicitly excluded, e.g. `staging` and `test`.

*Note:* This process could be parallelized but caching seems to keep the runtime reasonable for now.

*Note:* This design only requires enough local space for the one log at a time, i.e. enough room for the largest to perform analysis.

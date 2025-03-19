## export unit progress

This directory contains ruby scripts for exporting unit progress data from the database,
adding student source code from S3, and filtering the results to exclude PII.

## 💰💰 WARNING 💰💰

The PII filtering step can incur substantial costs. Please be sure to double-check your requirements
before running through these steps.

## Overview
  
the export process is broken into a few distinct steps: 

| step                    | command                  | output location                                         |
|-------------------------|--------------------------|---------------------------------------------------------|
| export from redshift    | export_unit_progress.rb  | s3://cdo-data-sharing-internal/unloaded-unit-progress/  |
| add project source code | add_unit_source.rb       | production-daemon:/mnt/tmp-curriculum-export/sourced/   |
| filter pii              | filter_unit_pii.rb       | production-daemon:/mnt/tmp-curriculum-export/filtered/  |
| upload to s3            | aws s3 cp --recursive    | s3://cdo-data-sharing/filtered-unit-progress/           |

note that we write to:
* **s3://cdo-data-sharing-internal** in the first step because this is where redshift has permission to write to, and
* **s3://cdo-data-sharing** in the last step because this is a more appropriate location for data to be shared externally.

## Usage

To export progress for a given unit:

1. connect to production-daemon
```bash
ssh -t gateway ssh production-daemon
cd production
```

2. export unit progress from redshift
```bash
SKIP_SCRIPT_PRELOAD=1 bin/curriculum/export/export_unit_progress.rb -u unit_name
```

3. add student source code from S3
```bash
SKIP_SCRIPT_PRELOAD=1 bin/curriculum/export/add_unit_source.rb -i unit_name
```

4. inspect the output for validity before performing the expensive PII filtering step
```bash
ls -l /mnt/tmp-curriculum-export/sourced/<unit-name>
less /mnt/tmp-curriculum-export/sourced/<unit-name>/<filename>
```

5. filter the output to exclude PII
```bash
bin/curriculum/export/filter_unit_pii.rb -i unit_name
```

6. inspect the output for validity before uploading to S3
```bash
ls -l /mnt/tmp-curriculum-export/filtered/<unit-name>
less /mnt/tmp-curriculum-export/filtered/<unit-name>/<filename>
```

7. upload the filtered output to S3
```bash
# s3 dir should be empty to start
aws s3 ls s3://cdo-data-sharing/filtered-unit-progress/<unit-name>/
# if the dir is empty, go ahead and upload 
aws s3 cp --recursive /mnt/tmp-curriculum-export/filtered/<unit-name> s3://cdo-data-sharing/filtered-unit-progress/<unit-name>
```

8. share the data with the requester

- login to AWS console in your web browser
- navigate to https://us-east-1.console.aws.amazon.com/s3/buckets/cdo-data-sharing?region=us-east-1&bucketType=general&prefix=unit-export/&showversions=false 

9. clean up

Once you are happy with the data you've uploaded to S3, you should clean up the temporary files on production-daemon:
```bash
rm -rf /mnt/tmp-curriculum-export/sourced/<unit-name>
rm -rf /mnt/tmp-curriculum-export/filtered/<unit-name>
```
## Troubleshooting

* some of the above steps can fail. to make this less painful, `add_unit_source.rb` and `filter_unit_pii.rb` are safe to rerun, as they are designed to skip over any input files if the output file already exists.
* if you need to rerun any of the scripts and the output location dir is already in use from a previous run, you can specify a new output location with `-o`
* for more options, see the `--help` output for each script.

## Development

to minimize time and cost while iterating during development, you should work on a small dataset.  In case the unit you're working on has many progress rows, ways you can accomlish this include:
* pass `-l <level_id>` to `export_unit_progress.rb` 
* truncate the files output by `export_unit_progress.rb`, for example:
```bash
aws s3 cp s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023/csd3-2023_0000_part_00.jsonl <local-file-1>
head -n 1000 <local-file-1> > <local-file-2> 
aws s3 cp <local-file-2> s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023-1K/csd3-2023_0000_part_00.jsonl    
```
then use `csd3-2023-1K` as the unit name for subsequent steps. 
* To use a dataset that's already been truncated, look at `s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023-30K/`. this directory should contain 3 files with 10K lines each.

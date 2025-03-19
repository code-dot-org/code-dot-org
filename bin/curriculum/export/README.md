## export unit progress

This directory contains ruby scripts for exporting unit progress data from the curriculum database,
adding student source code from S3, and filtering the results to exclude PII.

## 💰💰 WARNING 💰💰

The PII filtering step can incur substantial costs. Please be sure to double-check your requirements
before running through these steps.

## Usage

To export unit progress data, follow the following steps:

1. connect to production-daemon
```bash
ssh -t gateway ssh production-daemon
cd production
```

2. export unit progress from redshift
```bash
bin/curriculum/export/export_unit_progress.rb -u unit_name
```

3. add student source code from S3
```bash
bin/curriculum/export/add_unit_source.rb -i unit_name
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
aws s3 ls s3://cdo-data-sharing/unit-progress/<unit-name>/
# if the dir is empty, go ahead and upload 
aws s3 cp --recursive /mnt/tmp-curriculum-export/filtered/<unit-name> s3://cdo-data-sharing/unit-progress/<unit-name>
```

8. share the data with the requester

- login to AWS console in your web browser
- navigate to https://us-east-1.console.aws.amazon.com/s3/buckets/cdo-data-sharing?region=us-east-1&bucketType=general&prefix=unit-export/&showversions=false 

9. clean up

Once the requester has confirmed that they have received the data and that it looks valid, you should clean up the temporary files on the production-daemon:

```bash
rm -rf /mnt/tmp-curriculum-export/sourced/<unit-name>
rm -rf /mnt/tmp-curriculum-export/filtered/<unit-name>
```

## Development

to minimize time and costs while iterating during development, you should work on a smaller dataset. ways to do this include:
* pass a level_id to the export_unit_progress script via `-l <level_id>`
* after the export_unit_progress step, truncate the files before running the add_unit_source step. here is one way to do it:
```bash
mkdir /mnt/tmp-curriculum-export/unloaded/
cd /mnt/tmp-curriculum-export/unloaded/
aws s3 cp s3://cdo-data-sharing-internal/stanford/unloaded/csd3-2023/csd3-2023_0000_part_00.jsonl csd3-2023/
head -n 1000 csd3-2023/csd3-2023_0000_part_00.jsonl > csd3-2023-1K/csd3-2023_0000_part_00.jsonl 
aws s3 cp --recursive csd3-2023-1K/ s3://cdo-data-sharing-internal/stanford/unloaded/csd3-2023-1K/    
```
then use `csd3-2023-1K` as the unit name for subsequent steps. 
* To use a dataset that's already been trimmed, look at:
```bash
aws s3 ls s3://cdo-data-sharing-internal/stanford/unloaded/csd3-2023-30K/
```
 

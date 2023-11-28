#!/bin/bash

gcloud storage cp `gsutil ls -l gs://cdo-v3-prod-backups/*data* | sort -k 2 | tail -n 2 | head -1 | tr -s ' ' | cut -d ' ' -f 3` firebase-data.json.gz
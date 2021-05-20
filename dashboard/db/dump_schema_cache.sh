#!/bin/sh
# Unmarshal schema_cache.dump file to YAML for a human-readable git diff.

# Default argument is ./schema_cache.dump
FILE="${1:-"$(dirname "$0")/schema_cache.dump"}"

ruby \
  -ractive_record \
  -ractive_record/connection_adapters/mysql2_adapter \
  -ryaml \
  -e 'puts Marshal.load(ARGF.read).to_yaml' \
  < "$FILE"

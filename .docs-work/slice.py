#!/usr/bin/env python3
"""Print the inventory items assigned to one domain: python3 .docs-work/slice.py <domain>"""
import sys, yaml, pathlib

domain = sys.argv[1]
doc = yaml.safe_load(open(pathlib.Path(__file__).with_name('inventory.yaml')))
items = doc['items'] if isinstance(doc, dict) and 'items' in doc else doc
mine = [i for i in items if i.get('assigned_domain') == domain]
print(f"# {domain}: {len(mine)} items\n")
print(yaml.safe_dump(mine, sort_keys=False, allow_unicode=True, width=100))

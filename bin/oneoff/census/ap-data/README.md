# Scripts for AP Data

When the College Board gives us data about which schools teach AP Computer Science the schools are identified by the College Board's own school codes. We need to map those codes the NCES school ids before we can use the data. The collection of scripts here were used to help perform that mapping.

* `load-ap-school-data.rb` - This script reads the NCES/AI Crosswalk and AP CS offering data from S3, pulls out the school codes, and then hits an undocumented API exposed from [the College Board site](https://collegereadiness.collegeboard.org/k-12-school-code-search) to get the school name and address data. The output is written to `ap-school-data.csv` 
* `map-ap-school-data.rb` - This script reads in `ap-school-data.csv`, normalizing the school addresses. It then iterates over every school in the database, normalizes that address, and compares it with the addresses from the AP data. Any matches are output to `ap-school-code-map.csv`
* `dedupe-ap-school-codes.rb` - After the mapping above, we may have multiple matches for a given school code. This is because there can be multiple schools at the same address. This script reads `ap-school-code-map.csv`, groups the data by school code, and asks the user to select the best match for any code with multiple NCES school matches. The deduped data is output to `ap-school-code-map-deduped.csv`
* `merge-ap-school-codes.rb` - Reads in `ap-school-code-map-deduped.csv` and merges that data with the data from the NCES/AI crosswalk and what already exists in the database. Outputs to `ap-school-code-map-merged.csv`
* `check-school-codes.rb` - This script was initially used to compare the mapping between AP school codes and NCES ids that we got from the College Board. That mapping had multiple AP codes for the same NCES id and this script showed that even for the schools without duplicates there were many mapping that seemed to be incorrect since they disagreed on either the state or zip code.
* `upload-ap-school-code-data.rb` - Used to upload a the school code mapping data file to S3.
* `upload-ap-offering-data.rb` - Used to upload a data file to S3 for a given AP course and school year.

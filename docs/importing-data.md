# Pegasus

## Importing Data

Data may be imported from Google Sheets or CSV files into SQL tables. Columns in these spreedsheets must be named using type suffixes.

### Importing Google Sheets

1. Create a sheet in the "Pegasus" Google Docs folder, naming your columns using type suffixes.
1. In the Dropbox folder for a site, create a file named `data/table_name.gsheet` where table_name is the name you'd like the database table to have. The file should contain the "Pegasus" Google Docs path to the sheet you created in step 1. For example, `code.org/data/about_team.gsheet` would contain `Data/About/Team` and the data will be imported into a table named `about_team`.
1. The data should import on staging automatically within a few minutes.

### Importing CSV files

1. In the Dropbox folder for a site, create a file named `data/table_name.csv` where table_name is the name you'd like the database table to have naming your columns using type suffixes.

### Type Suffixes

- `_dt` DateTime
- `_f` Float
- `_i` Integer
- `_s` String (limited to 255 characters)
- `_t` Text (limited  to 65,535 characters)

A column can also, optionally, have one of the following modifiers:

- `*` Index this field
- `!` Index this field, values must be unique.

### Example


Here's an example spreadsheet for implementing a zipcode-based geocoding service, `code.org/data/zip_codes.csv`:

| code_s! | city_s* | state_s* | latitude_f | longtude_f |
| ------- |:----:|:-----:|:----------:| ----------:|
| 10451   | Bronx | NY | 40.84 | -73.87 |
| 10452   | Bronx | NY | 40.84 | -73.87 |
| 10453   | Bronx | NY | 40.84 | -73.87 |
| ...   | ... | ... | ... | ... |

This spreadsheet defines a table with the following schema:

- `code_s` - String - Unique, Indexed
- `city_s` - String - Indexed
- `state_s` - String - Indexed
- `latitude_f` and `longitude_f` - Floats

Note that the column names include the type suffix, but do *not* include the index modifier (i.e. `*` or `!`).

And here's an example document using it:

`code.org/zip_codes/splat.md`:

```
<%
# Requests are prefixed with a '/' so turn '/98109' into '98109'
zip_code = request.splat_path_info[1..-1]

# Look for a row with that zip code and pass if we don't find one
pass unless row = DB[:zip_codes].where(code_s:zip_code).first

%>

Zip code: <%= row[:code_s] %>
City: <%= row[:city_s] %>
State: <%= row[:state_s] %>
Location: (<%= row[:latitude_f] %>, <%= row[:longitude_f] %>)

```

### Developer Details

- `rake seed:sync` will detect modified gsheets, download updated versions as .csv files, and then perform a `seed:migrate`.
- `rake seed:migrate` will import any modified .csv files into the database.
- `rake seed:reset` will import all .csv files into the database regardless of their modification status.
# Pegasus

## Importing Data

Data may be imported from Google Sheets into SQL tables. Columns in these spreedsheets must be named using type suffixes.

### Importing Google Sheets

1. Create a new gsheet in the "Pegasus" Google Docs folder, naming your columns using type suffixes.
  - Make SiteCloud (`site.googlecloud@code.org`) the owner of the gsheet.
1. Add a new `table-name.gsheet` file locally in the `pegasus/data` folder.
1. Paste the gsheet ID in the file. (See more context in [this PR](https://github.com/code-dot-org/code-dot-org/pull/54047))
1. Run the following commands to populate the data locally:
  - `cd pegasus`
  - `bundle exec rake seed:sync`

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
Make sure you're in the `cd pegasus` directory.

- `bundle exec rake seed:sync` will detect modified gsheets, download updated versions as .csv files, and then perform a `seed:migrate`.
- `bundle exec rake seed:migrate` will import any modified .csv files into the database.
- `bundle exec rake seed:reset` will import all .csv files into the database regardless of their modification status.

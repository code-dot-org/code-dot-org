create or replace function is_json(j varchar(max))
  returns boolean
  stable as $$
    import json
    try:
      json_object = json.loads(j)
    except ValueError, e:
      return False
    return True
  $$ language plpythonu;

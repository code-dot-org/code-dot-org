## Pegasus/Dashboard Integration!

Pegaus now provides access to the dashboard database and knows which user is signed in (if any).

### Accessing the Dashboard User

The current user is accessible via `dashboard_user`, e.g.:

#### who-am-i.haml

```
-content_type :json
-cache_control :private, :must_revalidate, max_age:0
-pass unless user = dashboard_user
=JSON.pretty_generate(user)
```

**Note:** The cache_control header is required to indicate that this page is private for each user and shouldn't be cached by Varnish.

**Note:** A max_age of 0 means the browser should refresh the page immediately if ever requested again. This is typical for an API, but setting this higher (in seconds) is reasonable if the data rarely changes, or if the call is expensive and we want to minimize hammering by clients.

### Accessing Dashboard Tables

Use `DASHBOARD_DB` where you'd normally use `DB` and you're done, e.g.

```
def section_student?(section_id, student_id)
  DASHBOARD_DB[:followers].where(section_id:section_id).and(student_user_id:student_id).count > 0
end
```

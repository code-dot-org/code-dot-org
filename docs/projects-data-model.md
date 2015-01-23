This is the data model/technical design of a feature to support "projects" -- where a user can save their code, come back to it, play and edit it, save it again, share it etc. The initial design is in the context of artist and playlab but this will also be used in msm/algebra and csp.

This uses both the existing dashboard tables (to avoid big data migrations and rewrites of existing apps) and the new Apps API method of storing data. This is the attempt to follow the principles of "new things use the new thing" and "don't break (or spend forever rewriting) the old thing". However, this conflicts with the principle "don't do the same thing in two different ways".

The user-facing design/spec for this feature is here: https://docs.google.com/a/code.org/document/d/19CikyJFeIw5ER2UBKYoE5CPHAjVrWLMhG6MxGtZt8e0/edit#

Store in the user properties of a "Code.org Projects" app:
````
projects: [{app_id: 'xxxxx'}, {app_id: 'yyyyy'}]
````
Each of these apps is an app (as in AppsAPI) owned by the user/storageid who owns the project.

For each app, store in the shared properties:
````
{
 name: "My Fun Story",
 screenshot: , # I was thinking this is probably an S3 url. how are you storing images that are part of an app in applab?
               # currently screenshots are level_source_images which is basically a table mapping from level_sources to the existence of an image in S3
 level_source_id: 111, # this is the code: referencing the existing dashboard.level_sources table.
                       # We could also just store the code itself here
 level_id: 222, # this defines the 'interpreter' for the code: referencing the existing dashboard.levels table
                # (may not need to duplicate this here if we are always using level_source_id because the level_sources table knows)
                # standalone playlab/artist will be a level, is this true for CSP/applab?
 # other metadata TBD (description, instructions)
 # source code revision history TBD
 created_at: DATE
 updated_at: DATE
} 
````
When a user creates a project, we:
 * create an app with appropriate shared properties
 * update the user's "projects" property in the "Code.org Projects" app to add this app_id

When a user saves an existing project, we:
 * find/create the level_source (same as we do now) to store the code
 * update the the app shared properties

When a user wants to see a list of projects they own (eg. the progress page, homepage):
 * get the user's "projects" property in the "Code.org Projects:" app
    * for each app id get the shared properties of the app (we need to display the metadata in the list)
 * do we want to support filtering/sorting/pagination in the apps api or do this all client-side? Eg: my projects that I created in this level; the most recent 10 projects
 * either way, do we want to store the metadata that we want to 'index' in the projects property instead/also so we don't have to do a join or n+1 queries
 * do we actually want projects to be a table in this case? (I think no because then anyone can modify it for anyone, is that correct?)

When a user shares a project they share a url like: http://studio.code.org/projects/<app_id>

When another user goes to a /projects url
 * everything we need to render the project is in the shared properties of the app
 * for CSP/applab there may be user data stored in the user properties of the app (for artist and playlab there is not)
 * the viewer may make a copy of the project, which creates their own project. Possibly save a reference to the "forked project" in the new project if we are interested in tracing history.
 * do we need permissions on projects/is there api support for this (if I have not shared a project should the project url be inaccessible to other users)

When a user deletes a project
 * delete the app
 * update the user's "projects" property in the "Code.org Projects" app to add this app_id
 * this means the /projects url stops working
 * this means if anyone has copied the project they still have it

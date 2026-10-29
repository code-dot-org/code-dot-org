This is the data model/technical design of a feature to support "projects" -- where a user can save their code, come back to it, play and edit it, save it again, share it etc. The initial design is in the context of artist and playlab but this will also be used in msm/algebra and csp.

The user-facing design/spec for this feature is here: https://docs.google.com/a/code.org/document/d/19CikyJFeIw5ER2UBKYoE5CPHAjVrWLMhG6MxGtZt8e0/edit#

We will use both the existing dashboard tables (to avoid big data migrations and rewrites of existing apps) and the new AppsAPI method of storing data. This is an attempt to follow the principles of "new things use the new thing" (projects use the AppsAPI for the new project-specifict data) and "don't break (or spend forever rewriting) the old thing" (data that is used both by projects and non-projects (level_sources, screenshots) is stored same way we have been). One thing to watch out for -- there is currently a sharp line between "things that are projects and are not part of the course progression" and "things that are part of the course progression and are not projects", however, if this is not true in the future (MSM...) this may end up causing conflicts with the "don't do the same thing in two different ways" principle.

For each app, store in the JSON blob of an AppsAPI app, eg:
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
 * create an app with appropriate JSON blob

When a user saves an existing project, we:
 * find/create the level_source (same as we do now) to store the code
 * read/modify/write the the app JSON blob to update the level_source_id

When a user wants to see a list of projects they own (eg. the progress page, homepage):
 * list the user's apps
    * for each app get the JSON blob of the app (we need to display the metadata in the list)
 * filtering/sorting/pagination can be done with SOLR
 
When a user shares a project they share a url like: http://studio.code.org/projects/<app_id>

When another user goes to a /projects url
 * everything we need to render the project is in the JSON blob of the app
 * for CSP/applab there may be additional data stored in the properties/tables of the app
 * for artist and playlab we do not use properties/tables
 * the viewer may make a copy of the project, which creates their own project. Possibly save a reference to the "forked project" in the new project if we are interested in tracing history.
 * do we need permissions on projects/is there api support for this (if I have not shared a project should the project url be inaccessible to other users)

When a user deletes a project
 * delete the app
 * this means the /projects url stops working
 * this means if anyone has copied the project they still have it

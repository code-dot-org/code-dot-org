# Web Lab 2
Web Lab 2 allows students to make web pages using HTML, CSS and vanilla JS.

## How it works
See the htmlPreview folder for the bulk of the display logic. There are 2 iframes that support the preview.
The outer iframe, hosted by HTMLPreview.tsx points to `<unique-project-id>.preview.codeprojects.org`, 
which eventually routes to InnerHTMlPreview.tsx. The outer iframe sends the student code to the inner iframe via
message passing. The inner iframe sets up a service worker (weblab2_project_service_worker), which acts as a false
"server" for the student code. This allows file links to work as expected in a student project. The service worker
also handles appropriately showing images from the student project by fetching the url for the image as stored
in the student's project.

## How to run locally
The local code.org setup is not ideal for a service worker, because service workers assume localhost is setup in a
specific way that we do not do. Therefore, we have to do some workarounds to get the service worker working locally.
The easiest way to do this is on Chrome. You can set a flag with chrome://flags/#unsafely-treat-insecure-origin-as-secure
(search that in chrome to load the flag settings). I would recommend setting this flag to the following so you can run on either port:
```
http://localhost-studio.code.org:9000,http://localhost-studio.code.org:3000,http://localtesting.preview.localhost.codeprojects.org:9000,http://localtesting.preview.localhost.codeprojects.org:3000
```

By default on localhost we use a fixed prefix for the preview url because otherwise you would need to add an exception for every channel id you test. 
If you want to use the channel id based prefix, use the flag ?weblab2-full-urls=true or ?enableExperiments=weblab2-full-urls (only works on localhost, otherwise we always use the full url).

Note that another side effect of this issue is drone tests that rely on the preview won't work, because drone runs a "localhost" version of the app.
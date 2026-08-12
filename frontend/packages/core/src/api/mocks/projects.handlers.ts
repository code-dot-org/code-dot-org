import {http, HttpResponse} from 'msw';

import {getActiveScenario} from './scenario';
import {commentOnVersion} from './sources.handlers';
import {writeResource} from './scenarioStore';

function activeChannelId(): string {
  return getActiveScenario()?.tag ?? '';
}

const channelForLevel = () =>
  HttpResponse.json({
    channel: activeChannelId(),
    started: true,
    reduceChannelUpdates: false,
  });

// The Rails `extra_links` response is snake_case; the API client's schema
// applies `camelcaseKeys` during parse. Return snake_case here so the
// schema's transform produces the expected camelCase shape downstream.
const extraLinksPayload = () => ({
  owner_info: {storage_id: 1, name: 'Mock Owner'},
  project_info: {
    id: 1,
    sources_link: '#',
    is_featured_project: false,
    featured_status: 'none',
    remix_ancestry: [],
    is_published_project: 'no',
    abuse_score: 0,
  },
});

export const projectsHandlers = [
  // GET /projects/[script/:scriptId/]level/:levelId[/user/:userId] — list
  // every variant explicitly; MSW path patterns don't support optional
  // segments. Most specific first.
  http.get(
    '*/projects/script/:scriptId/level/:levelId/user/:userId',
    channelForLevel,
  ),
  http.get('*/projects/script/:scriptId/level/:levelId', channelForLevel),
  http.get('*/projects/level/:levelId/user/:userId', channelForLevel),
  http.get('*/projects/level/:levelId', channelForLevel),

  // POST /project_commits — the NAME on a named version.
  //
  // Returned `{}` and recorded nothing, so saving "before I broke it" produced
  // a version whose row in the panel was a bare timestamp. The comment is the
  // whole reason a student presses that button.
  http.post('*/project_commits', async ({request}) => {
    const body = (await request.json()) as {
      version_id?: string;
      comment?: string;
    };
    if (body?.version_id && body?.comment) {
      commentOnVersion(body.version_id, body.comment);
    }
    return HttpResponse.json({});
  }),

  // GET /projects/:channelId/extra_links
  http.get('*/projects/:channelId/extra_links', () =>
    HttpResponse.json(extraLinksPayload()),
  ),

  // PUT /v3/files/:channelId/.metadata/thumbnail.png
  http.put('*/v3/files/:channelId/.metadata/thumbnail.png', () => {
    writeResource('thumbnail', true);
    return HttpResponse.json({});
  }),

  // PUT /featured_projects/:channelId/bookmark
  http.put('*/featured_projects/:channelId/bookmark', () => {
    writeResource('featured', true);
    return HttpResponse.json({});
  }),
];

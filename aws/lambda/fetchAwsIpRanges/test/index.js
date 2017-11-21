process.env.GITHUB_TOKEN = 'xyz';

const nock = require('nock');
nock.disableNetConnect();

const LambdaTester = require('lambda-tester');
const myHandler = require('../index').handler;

describe( 'handler', ()=> {
  it('creates a pull request', () => {
    const content = Buffer.from(JSON.stringify({
      "comment": "Generated from https://ip-ranges.amazonaws.com/ip-ranges.json",
      "syncToken": "1510864931",
      "ranges": [
        "1.2.3.4",
        '5.6.7.8'
      ]
    }, null, 2)).toString('base64');
    let scope = nock('https://api.github.com')
      .get('/repos/code-dot-org/code-dot-org/git/refs/heads/staging').reply(200, {object: {sha: "mySha"}})
      .post('/repos/code-dot-org/code-dot-org/git/refs').reply(201)
      .get('/repos/code-dot-org/code-dot-org/contents/lib%2Fcdo%2Ftrusted_proxies.json').reply(200, {content: content, sha: 'contentSha'})
      .put('/repos/code-dot-org/code-dot-org/contents/lib%2Fcdo%2Ftrusted_proxies.json').reply(201)
      .post('/repos/code-dot-org/code-dot-org/pulls').reply(201, {number: 1})
      .post('/repos/code-dot-org/code-dot-org/pulls/1/requested_reviewers').reply(201)
    ;

    let scope2 = nock('https://ip-ranges.amazonaws.com')
      .get('/ip-ranges.json')
      .reply(200, {
        syncToken: '1510864932',
        prefixes: [
          {ip_prefix: '1.2.3.4', region: 'us-east-1', service: 'CLOUDFRONT'}
        ]
      });

    return LambdaTester(myHandler)
      .expectResult(_ => {
        scope.done();
        scope2.done();
      });
  });
});

afterEach(done => {
  nock.cleanAll();
  done();
});

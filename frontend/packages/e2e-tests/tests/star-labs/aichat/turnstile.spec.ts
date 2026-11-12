import {type Page, type Request, type Route} from '@playwright/test';

import {expect, test} from '../../fixtures';
import {AichatLab} from '../../pages/aichat-lab';
import {createTeacherAssociatedStudent, resetSession} from '../../shared/auth';
import {setAiChatAccessLevelOnCreate} from '../../shared/sections';

// A Gemini image model, which always goes through the gateway; see
// dashboard/test/ui/config/levels/custom/aichat/UI Test AI Gateway Chat.level.
const GATEWAY_LEVEL = {course: 'ui-test-ai-gateway', lesson: 1, level: 1};

const GATEWAY_URL = 'https://ai-gateway.code.org/**';

const STUB_REPLY = 'Hello from the stubbed gateway.';

// Serves the input filter, the reply and the output filter alike.
const STUB_RESPONSE = {
  text: STUB_REPLY,
  finishReason: 'stop',
  output: {classification: 'OK'},
  files: [],
};

// The browser applies CORS to fulfilled responses, preflights included.
const corsHeaders = (request: Request) => ({
  'Access-Control-Allow-Origin': request.headers()['origin'] ?? '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

/**
 * Stub the access token so the test needs neither the signing key nor the
 * DCDO flag, and require a Turnstile token on every request.
 */
async function enforceTurnstile(page: Page): Promise<void> {
  await page.route('**/ai_gateway/access_token', route =>
    route.fulfill({
      json: {
        token: 'e2e-access-token',
        turnstileEnforcementMode: 'enforce',
      },
    }),
  );
}

/** Answer every gateway request with STUB_RESPONSE, recording its Turnstile header. */
async function stubGateway(page: Page): Promise<(string | undefined)[]> {
  const turnstileTokens: (string | undefined)[] = [];
  await page.route(GATEWAY_URL, async (route: Route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({status: 204, headers: corsHeaders(request)});
      return;
    }
    turnstileTokens.push(request.headers()['x-turnstile-token']);
    await route.fulfill({json: STUB_RESPONSE, headers: corsHeaders(request)});
  });
  return turnstileTokens;
}

test.describe('AI gateway Turnstile challenge', {tag: '@no_mobile'}, () => {
  test.beforeEach(async ({page}) => {
    await resetSession(page);
    await page.goto('/');
    await createTeacherAssociatedStudent(page, {
      studentName: 'Turnstile Student',
      authorized: true,
      onSectionCreated: setAiChatAccessLevelOnCreate(page, 'enabled'),
    });
    await enforceTurnstile(page);
  });

  /**
   * Net-new coverage (no Cucumber source): the widget loads from Cloudflare,
   * and its token reaches the gateway on every request a message makes.
   */
  test('A passing challenge sends its token to the gateway', async ({page}) => {
    const turnstileTokens = await stubGateway(page);
    const lab = new AichatLab(page);
    await lab.gotoLevel(GATEWAY_LEVEL, {turnstileSiteKey: 'pass'});

    await lab.sendMessage('Hello');

    await expect(lab.botMessages.last()).toContainText(STUB_REPLY);
    expect(turnstileTokens.length).toBeGreaterThan(0);
    for (const token of turnstileTokens) {
      expect(token).toBeTruthy();
    }
  });

  /**
   * Net-new coverage (no Cucumber source): under enforce, a challenge that
   * Cloudflare keeps failing stops the request and tells the student, and
   * nothing is sent to the gateway.
   */
  test('A failing challenge blocks the request and says so', async ({page}) => {
    // The manager waits out its 30 second deadline while Cloudflare retries.
    test.slow();
    const turnstileTokens = await stubGateway(page);
    const lab = new AichatLab(page);
    await lab.gotoLevel(GATEWAY_LEVEL, {turnstileSiteKey: 'fail'});

    await lab.sendMessage('Hello');

    await expect(
      page.getByText("We couldn't complete a security check."),
    ).toBeVisible({timeout: 45_000});
    expect(turnstileTokens).toEqual([]);
  });

  /**
   * Net-new coverage (no Cucumber source): under enforce, a network that blocks
   * Cloudflare, as some school filters do, stops the request and tells the
   * student the check could not load.
   */
  test('A blocked challenge script blocks the request and says so', async ({
    page,
  }) => {
    await page.route('https://challenges.cloudflare.com/**', route =>
      route.abort('blockedbyclient'),
    );
    const turnstileTokens = await stubGateway(page);
    const lab = new AichatLab(page);
    await lab.gotoLevel(GATEWAY_LEVEL);

    await lab.sendMessage('Hello');

    await expect(
      page.getByText("A security check couldn't load."),
    ).toBeVisible();
    expect(turnstileTokens).toEqual([]);
  });
});

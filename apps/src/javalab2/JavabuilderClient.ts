// Lab2-side Javabuilder WebSocket client.
//
// Owns the full run lifecycle for a single Run/Test invocation:
//   1. POST to /javabuilder/access_token_with_override_sources to get a
//      short-lived token plus the WebSocket URL. The override-sources path
//      is the only one we use here: lab2 saves sources via ProjectManager,
//      not the legacy project.js S3 path, so we cannot rely on Javabuilder
//      pulling them itself by channelId.
//   2. Open the WebSocket and pump frames to the registered listeners.
//   3. Notify a done callback on close or fatal error.
//
// All side effects (console output, redux state, miniApp signal dispatch)
// happen via listener callbacks supplied by the runner — the client knows
// nothing about codebridge or redux.
import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from '@cdo/apps/util/AuthenticityTokenStore';

import {
  AuthorizerSignalType,
  ExecutionType,
  JavabuilderMessage,
  WebSocketMessageType,
} from './javabuilderConstants';
import {JavabuilderSourceBundle} from './sourceBundleAdapter';

const WEBSOCKET_CLOSED_NORMAL_CODE = 1000;
const SERVER_WAIT_TIME_MS = 10_000;

export interface AccessTokenResponse {
  javabuilder_url: string;
  token: string;
}

export interface JavabuilderClientOptions {
  levelId: number;
  channelId: string | undefined;
  miniAppType: string | undefined;
  executionType: ExecutionType;
  /** Lab-level options that reach Javabuilder via the access-token request. */
  options?: Record<string, unknown>;
  bundle: JavabuilderSourceBundle;
  /** Optional override for the validation hash, e.g. start-mode testing. */
  overrideValidation?: Record<string, string>;
}

export interface JavabuilderListeners {
  onMessage: (msg: JavabuilderMessage) => void;
  /** Fired when the run is over for any reason — close, exit, or error. */
  onDone: () => void;
  onWaitingForServer?: () => void;
  onCaptchaRequired?: () => void;
  onUnauthorized?: (responseJson: unknown) => void;
  onError?: (err: unknown) => void;
}

export class JavabuilderClient {
  private socket: WebSocket | null = null;
  private seenMessage = false;
  private waitTimer: ReturnType<typeof setTimeout> | null = null;
  private done = false;

  constructor(
    private opts: JavabuilderClientOptions,
    private listeners: JavabuilderListeners
  ) {}

  async run(): Promise<void> {
    const projectAssetUrls = this.opts.bundle.projectAssetUrls;
    const body = {
      levelId: this.opts.levelId,
      channelId: this.opts.channelId,
      executionType: this.opts.executionType,
      miniAppType: this.opts.miniAppType,
      useDashboardSources: false,
      overrideSources: this.opts.bundle.sources,
      overrideValidation:
        this.opts.overrideValidation ??
        (Object.keys(this.opts.bundle.validation).length > 0
          ? this.opts.bundle.validation
          : undefined),
      // Friendly-name → URL map for images/binaries uploaded to the
      // project's asset bucket via codebridge. Rails uses this to seed the
      // Javabuilder assetUrls hash so student code can refer to images by
      // their user-facing filename.
      projectAssetUrls:
        Object.keys(projectAssetUrls).length > 0 ? projectAssetUrls : undefined,
      options: this.opts.options ?? {},
    };

    let res: Response;
    try {
      const csrfToken = await getAuthenticityToken();
      res = await fetch('/javabuilder/access_token_with_override_sources', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          [AUTHENTICITY_TOKEN_HEADER]: csrfToken,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      this.listeners.onError?.(err);
      this.finish();
      return;
    }

    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.clone().json();
      } catch {
        try {
          body = await res.text();
        } catch {
          /* nothing more we can do */
        }
      }
      if (
        res.status === 403 &&
        (body as {captcha_required?: boolean})?.captcha_required === true
      ) {
        this.listeners.onCaptchaRequired?.();
      } else if (res.status === 403) {
        this.listeners.onUnauthorized?.(body);
      } else {
        this.listeners.onError?.({status: res.status, body});
      }
      this.finish();
      return;
    }

    const tokenJson = (await res.json()) as AccessTokenResponse;
    this.openSocket(tokenJson.javabuilder_url, tokenJson.token);
  }

  sendInput(message: string, type = 'SYSTEM_IN'): void {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({messageType: type, message}));
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.finish();
  }

  // ---- private ----

  private openSocket(url: string, token: string): void {
    this.socket = new WebSocket(`${url}?Authorization=${token}`);
    this.socket.onopen = () => this.onOpen();
    this.socket.onmessage = ev => this.onSocketMessage(ev);
    this.socket.onclose = ev => this.onClose(ev);
    this.socket.onerror = ev => this.onSocketError(ev);
  }

  private onOpen(): void {
    // Initial probe — see the comment in the legacy JavabuilderConnection
    // for the token-edge-case rationale.
    this.socket?.send(WebSocketMessageType.CONNECTED);
    this.waitTimer = setTimeout(() => {
      if (
        !this.seenMessage &&
        this.socket?.readyState === WebSocket.OPEN &&
        !this.done
      ) {
        this.listeners.onWaitingForServer?.();
      }
    }, SERVER_WAIT_TIME_MS);
  }

  private onSocketMessage(event: MessageEvent): void {
    this.seenMessage = true;
    let data: JavabuilderMessage;
    try {
      data = JSON.parse(event.data) as JavabuilderMessage;
    } catch {
      return;
    }
    this.listeners.onMessage(data);
    if (
      data.type === WebSocketMessageType.AUTHORIZER &&
      isHardLockoutValue(data.value)
    ) {
      this.close();
    }
  }

  private onClose(event: CloseEvent): void {
    if (event.code === WEBSOCKET_CLOSED_NORMAL_CODE || event.wasClean) {
      // Normal close — the EXITED status message (already delivered as a
      // regular onMessage) is what flips run state off.
    } else {
      this.listeners.onError?.(
        new Error(`Javabuilder connection closed: code=${event.code}`)
      );
    }
    this.finish();
  }

  private onSocketError(ev: Event): void {
    this.listeners.onError?.(ev);
    this.finish();
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    if (this.waitTimer) {
      clearTimeout(this.waitTimer);
      this.waitTimer = null;
    }
    this.listeners.onDone();
  }
}

const isHardLockoutValue = (value: string | undefined): boolean =>
  value === AuthorizerSignalType.USER_BLOCKED ||
  value === AuthorizerSignalType.USER_BLOCKED_TEMPORARY ||
  value === AuthorizerSignalType.CLASSROOM_BLOCKED;

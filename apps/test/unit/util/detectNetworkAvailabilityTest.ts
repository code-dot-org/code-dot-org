/* eslint-disable @typescript-eslint/no-explicit-any */
import DCDO from '@cdo/apps/dcdo';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';
import {detectNetworkAvailability} from '@cdo/apps/util/detectNetworkAvailability';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
jest.mock('@cdo/apps/metrics/StatsigReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));
jest.mock('@cdo/apps/metrics/MetricsReporter', () => ({
  __esModule: true,
  default: {publishMetric: jest.fn()},
}));

describe('detectNetworkAvailability', () => {
  let imageInstance: HTMLImageElement;
  let OriginalImage: typeof window.Image;

  beforeAll(() => {
    OriginalImage = window.Image;
  });

  afterAll(() => {
    window.Image = OriginalImage;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    imageInstance = undefined as any;

    // Mock out Image
    window.Image = function MockImage(this: any) {
      // Directly assign to the outer variable without aliasing 'this'
      (imageInstance as any) = this;
      return this;
    } as any;

    Object.defineProperties(window.Image.prototype, {
      onload: {
        set(fn: ((e: Event) => void) | null) {
          this._onload = fn;
        },
        get() {
          return this._onload;
        },
      },
      onerror: {
        set(fn: ((e: Event) => void) | null) {
          this._onerror = fn;
        },
        get() {
          return this._onerror;
        },
      },
      onabort: {
        set(fn: ((e: UIEvent) => void) | null) {
          this._onabort = fn;
        },
        get() {
          return this._onabort;
        },
      },
      src: {
        set(_url: string) {},
      },
    });
  });

  afterEach(() => {
    window.Image = OriginalImage;
  });

  it('does nothing if network detection is disabled', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 0,
    });
    detectNetworkAvailability(123);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('sends available event on image load', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
      backend: 'statsig',
    });
    detectNetworkAvailability(1);
    imageInstance.onload && imageInstance.onload({} as Event);
    expect(statsigReporter.sendEvent).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      {network: 'available', endpoint: 'http://code.org'}
    );
  });

  it('sends available event on image load (cloudwatch backend)', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
      backend: 'cloudwatch',
    });
    detectNetworkAvailability(1);
    imageInstance.onload && imageInstance.onload({} as Event);
    expect(MetricsReporter.publishMetric).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      1,
      'Count',
      expect.arrayContaining([
        expect.objectContaining({name: 'networkStatus', value: 'available'}),
        expect.objectContaining({name: 'endpoint', value: 'http://code.org'}),
      ])
    );
  });

  it('sends available event on image load (both backends)', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
      backend: 'both',
    });
    detectNetworkAvailability(1);
    imageInstance.onload && imageInstance.onload({} as Event);
    expect(statsigReporter.sendEvent).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      expect.objectContaining({
        network: 'available',
        endpoint: 'http://code.org',
      })
    );
    expect(MetricsReporter.publishMetric).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      1,
      'Count',
      expect.arrayContaining([
        expect.objectContaining({name: 'networkStatus', value: 'available'}),
        expect.objectContaining({name: 'endpoint', value: 'http://code.org'}),
      ])
    );
  });

  it('sends error event on image error', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      backend: 'both',
      sampleRate: 100,
    });
    detectNetworkAvailability(2);
    imageInstance.onerror && imageInstance.onerror({} as Event);
    expect(statsigReporter.sendEvent).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      {network: 'error', endpoint: 'http://code.org'}
    );
  });

  it('sends error event on image error (cloudwatch backend)', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
      backend: 'cloudwatch',
    });
    detectNetworkAvailability(2);
    imageInstance.onerror && imageInstance.onerror({} as Event);
    expect(MetricsReporter.publishMetric).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      1,
      'Count',
      expect.arrayContaining([
        expect.objectContaining({name: 'networkStatus', value: 'error'}),
        expect.objectContaining({name: 'endpoint', value: 'http://code.org'}),
      ])
    );
  });

  it('sends abort event on image abort', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      backend: 'both',
      sampleRate: 100,
    });
    detectNetworkAvailability(3);
    imageInstance.onabort && imageInstance.onabort(new UIEvent('abort'));
    expect(statsigReporter.sendEvent).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      {network: 'abort', endpoint: 'http://code.org'}
    );
  });

  it('sends abort event on image abort (cloudwatch backend)', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
      backend: 'cloudwatch',
    });
    detectNetworkAvailability(3);
    imageInstance.onabort && imageInstance.onabort(new UIEvent('abort'));
    expect(MetricsReporter.publishMetric).toHaveBeenCalledWith(
      'Remote Network Availability Check',
      1,
      'Count',
      expect.arrayContaining([
        expect.objectContaining({name: 'networkStatus', value: 'abort'}),
        expect.objectContaining({name: 'endpoint', value: 'http://code.org'}),
      ])
    );
  });

  it('does nothing if DCDO config is undefined', () => {
    (DCDO.get as jest.Mock).mockReturnValue(undefined);
    detectNetworkAvailability(123);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('does nothing if DCDO config is null', () => {
    (DCDO.get as jest.Mock).mockReturnValue(null);
    detectNetworkAvailability(123);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('does nothing if DCDO config is missing url', () => {
    (DCDO.get as jest.Mock).mockReturnValue({sampleRate: 100});
    detectNetworkAvailability(123);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('does nothing if DCDO config is missing sampleRate', () => {
    (DCDO.get as jest.Mock).mockReturnValue({url: 'http://code.org'});
    detectNetworkAvailability(123);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('does nothing if teacherId is undefined', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
    });
    detectNetworkAvailability(undefined as any);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });

  it('does nothing if teacherId is null', () => {
    (DCDO.get as jest.Mock).mockReturnValue({
      url: 'http://code.org',
      sampleRate: 100,
    });
    detectNetworkAvailability(null as any);
    expect(statsigReporter.sendEvent).not.toHaveBeenCalled();
  });
});

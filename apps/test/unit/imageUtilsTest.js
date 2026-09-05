// setupJest stubs toImage and dataURIToSourceSize suite-wide (they need
// live image callbacks); requireActual gets the real functions.
const {toImage, downloadBlobAsPng} = jest.requireActual('@cdo/apps/imageUtils');

describe('imageUtils object URL lifecycle', () => {
  let originalImage;
  let originalCreate;
  let originalRevoke;
  beforeEach(() => {
    // jsdom images never load; fire onload as soon as src is set (toImage
    // assigns the handlers first, so synchronous is safe and keeps these
    // tests independent of timers).
    originalImage = global.Image;
    global.Image = class {
      set src(value) {
        this.onload && this.onload();
      }
    };
    // Plain assignment: jsdom doesn't implement these, so there is nothing
    // to spy on.
    originalCreate = URL.createObjectURL;
    originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:fake-url');
    URL.revokeObjectURL = jest.fn();
  });
  afterEach(() => {
    global.Image = originalImage;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  describe('toImage', () => {
    it('revokes the object URL it created for a Blob, not the Blob', async () => {
      const blob = new Blob(['x'], {type: 'image/png'});
      await toImage(blob);
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    });

    it('revokes on a failed load too', async () => {
      global.Image = class {
        set src(value) {
          this.onerror && this.onerror(new Error('bad image'));
        }
      };
      await expect(toImage(new Blob(['x']))).rejects.toBeTruthy();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    });

    it('creates no object URL for a string input', async () => {
      await toImage('data:image/png;base64,xyz');
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('downloadBlobAsPng', () => {
    it('clicks a download link and leaves its URL alive', () => {
      jest.useFakeTimers();
      const click = jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});
      try {
        downloadBlobAsPng(new Blob(['x'], {type: 'image/png'}), 'x.png');
        expect(click).toHaveBeenCalled();
        jest.runAllTimers();
        // Deliberate: a download dereferences the URL at an unobservable
        // time, so there is no safe point to revoke.
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
      } finally {
        click.mockRestore();
        jest.useRealTimers();
      }
    });
  });
});

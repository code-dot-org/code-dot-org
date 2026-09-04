import {downloadBlobAsPng} from '@cdo/apps/imageUtils';

// setupJest mocks toImage suite-wide (it needs live image callbacks); this
// test is about the real one's object-URL lifecycle, with Image stubbed.
const {toImage} = jest.requireActual('@cdo/apps/imageUtils');

describe('imageUtils object URL lifecycle', () => {
  let originalImage;
  beforeEach(() => {
    // jsdom images never load; fire onload once src is set.
    originalImage = global.Image;
    global.Image = class {
      set src(value) {
        this._src = value;
        setTimeout(() => this.onload && this.onload());
      }
      get src() {
        return this._src;
      }
    };
    URL.createObjectURL = jest.fn(() => 'blob:fake-url');
    URL.revokeObjectURL = jest.fn();
  });
  afterEach(() => {
    global.Image = originalImage;
  });

  describe('toImage', () => {
    it('revokes the object URL it created for a Blob, not the Blob', async () => {
      const blob = new Blob(['x'], {type: 'image/png'});
      await toImage(blob);
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    });

    it('creates no object URL for a string input', async () => {
      await toImage('data:image/png;base64,xyz');
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('downloadBlobAsPng', () => {
    it('revokes the object URL after starting the download', () => {
      downloadBlobAsPng(new Blob(['x'], {type: 'image/png'}), 'x.png');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    });
  });
});

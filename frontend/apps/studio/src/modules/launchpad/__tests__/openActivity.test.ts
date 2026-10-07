import {ACTIVITIES} from '@/modules/launchpad/activities';
import {openActivity} from '@/modules/launchpad/openActivity';

const {open, native} = vi.hoisted(() => ({open: vi.fn(), native: vi.fn()}));
vi.mock('@capacitor/core', () => ({
  Capacitor: {isNativePlatform: native},
  registerPlugin: () => ({open}),
}));

describe('openActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    native.mockReturnValue(true);
    open.mockResolvedValue(undefined);
  });

  it('should pass only the selected hosted activity and its navigation policy to the native view', async () => {
    await openActivity(ACTIVITIES[1]);
    expect(open).toHaveBeenCalledWith({
      title: 'AI for Oceans',
      url: 'https://studio.code.org/s/oceans',
      allowedPaths: ['/s/oceans', '/courses/oceans'],
    });
  });

  it('should reject embedded opening in a browser without calling a native plugin', async () => {
    native.mockReturnValue(false);
    await expect(openActivity(ACTIVITIES[0])).rejects.toThrow(
      'requires an installed app',
    );
    expect(open).not.toHaveBeenCalled();
  });
});

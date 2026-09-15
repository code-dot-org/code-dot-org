import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {KioskSignalType} from '@cdo/apps/miniApps/kiosk/constants';
import {handleKioskScene} from '@cdo/apps/pythonlab/pythonHelpers/kioskScene';

const SCENE_JSON = JSON.stringify({
  elements: [{type: 'label', id: 'greeting', text: 'Hello', x: 5, y: 10}],
});

describe('handleKioskScene', () => {
  let handleSignal: jest.Mock;

  beforeEach(() => {
    handleSignal = jest.fn();
    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getKiosk: () => ({handleSignal}),
    } as unknown as CodebridgeRegistry);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the parsed scene to the kiosk', () => {
    handleKioskScene(SCENE_JSON);

    expect(handleSignal).toHaveBeenCalledTimes(1);
    expect(handleSignal).toHaveBeenCalledWith({
      value: KioskSignalType.SCENE,
      detail: {
        elements: [{type: 'label', id: 'greeting', text: 'Hello', x: 5, y: 10}],
      },
    });
  });

  it('sends an empty screen', () => {
    handleKioskScene(JSON.stringify({elements: []}));

    expect(handleSignal).toHaveBeenCalledWith({
      value: KioskSignalType.SCENE,
      detail: {elements: []},
    });
  });

  it('does nothing when no kiosk is registered', () => {
    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getKiosk: () => null,
    } as unknown as CodebridgeRegistry);

    expect(() => handleKioskScene(SCENE_JSON)).not.toThrow();
    expect(handleSignal).not.toHaveBeenCalled();
  });

  it('ignores a scene it cannot parse', () => {
    expect(() => handleKioskScene('not json')).not.toThrow();
    expect(handleSignal).not.toHaveBeenCalled();
  });
});

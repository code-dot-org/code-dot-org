/**
 * @jest-environment node
 */
import {getStage} from '../stage';
import {getStudioUrl} from '../studio';

jest.mock('../stage');

describe('getStudioUrl', () => {
  it('should return the development URL when stage is development', () => {
    (getStage as jest.Mock).mockReturnValue('development');
    expect(getStudioUrl()).toBe('http://localhost-studio.code.org:3000');
  });

  it('should return the development URL when stage is pr', () => {
    (getStage as jest.Mock).mockReturnValue('pr');
    expect(getStudioUrl()).toBe('http://localhost-studio.code.org:3000');
  });

  it('should return the test URL when stage is test', () => {
    (getStage as jest.Mock).mockReturnValue('test');
    expect(getStudioUrl()).toBe('https://test-studio.code.org');
  });

  it('should return the production URL when stage is production', () => {
    (getStage as jest.Mock).mockReturnValue('production');
    expect(getStudioUrl()).toBe('https://studio.code.org');
  });

  it('should return the production URL by default when stage is unknown', () => {
    (getStage as jest.Mock).mockReturnValue('unknown');
    expect(getStudioUrl()).toBe('https://studio.code.org');
  });
});

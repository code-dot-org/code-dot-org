import {expect} from '../../../../util/reconfiguredChai';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import LibraryIdCopier from '@cdo/apps/code-studio/components/libraries/LibraryIdCopier.jsx';

describe('LibraryIdCopier', () => {
  const channelId = '123';
  it('displays the channel id', async () => {
    render(<LibraryIdCopier channelId={channelId} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    const clipText = await navigator.clipboard.readText();
    expect(clipText).to.equal(channelId);
  });
});

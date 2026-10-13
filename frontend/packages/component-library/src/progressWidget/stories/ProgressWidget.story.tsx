import {Button} from '@mui/material';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import ProgressWidget, {
  ProgressBubble,
  ProgressBubbleLevelType,
  ProgressBubbleStatus,
} from '../index';

export default {
  title: 'DesignSystem/Progress Widget',
  component: ProgressWidget,
} as Meta;
type Story = StoryObj<typeof ProgressWidget>;

const statuses: ProgressBubbleStatus[] = [
  'notStarted',
  'inProgress',
  'passed',
  'completed',
  'keepWorking',
  'error',
];
const levelTypes: ProgressBubbleLevelType[] = ['default', 'panelLevel'];

const continueButton = (
  <Button
    variant="contained"
    color="secondary"
    size="extraSmall"
    endIcon={<FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />}
  >
    Continue
  </Button>
);

const lessonBubbles = (
  <>
    <ProgressBubble
      status="completed"
      ariaLabel="Level 1, completed"
      href="#"
    />
    <ProgressBubble
      levelType="panelLevel"
      status="completed"
      ariaLabel="Level 2, completed"
      href="#"
    />
    <ProgressBubble
      status="completed"
      ariaLabel="Level 3, completed"
      href="#"
    />
    <ProgressBubble
      status="completed"
      isAssessment
      ariaLabel="Level 4, completed"
      href="#"
    />
    <ProgressBubble status="passed" ariaLabel="Level 5, passed" href="#" />
    <ProgressBubble
      status="inProgress"
      isActive
      levelNumber={6}
      ariaLabel="Level 6, in progress"
    />
    <ProgressBubble ariaLabel="Level 7, not started" href="#" />
    <ProgressBubble isAssessment ariaLabel="Level 8, not started" href="#" />
    <ProgressBubble
      levelType="lessonExtras"
      ariaLabel="Lesson extras"
      tooltip="Lesson extras"
      href="#"
    />
  </>
);

export const DefaultProgressWidget: Story = {
  args: {
    lessonLabel: 'Lesson 3: Introduction to Online Puzzles',
    saveStatus: 'saved',
    saveStatusLabel: 'Saved 6 days ago',
    children: lessonBubbles,
    action: continueButton,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', {name: /Lesson 3/})).toBeInTheDocument();
    expect(canvas.getByLabelText('Level 6, in progress')).toHaveAttribute(
      'aria-current',
      'step',
    );
  },
};

export const UnsavedNoAction: Story = {
  args: {
    lessonLabel: 'Lesson 3: Introduction to Online Puzzles',
    saveStatus: 'offline',
    saveStatusLabel: "You're offline",
    children: lessonBubbles,
  },
};

export const BubbleMatrix: StoryObj<typeof ProgressBubble> = {
  render: () => (
    <table style={{borderSpacing: 16}}>
      <tbody>
        {levelTypes.flatMap(levelType =>
          [false, true].map(isActive => (
            <tr key={`${levelType}-${isActive}`}>
              <th style={{textAlign: 'left', fontSize: 12}}>
                {levelType}
                {isActive ? ', active' : ''}
              </th>
              {statuses.map(status => (
                <td key={status}>
                  <ProgressBubble
                    levelType={levelType}
                    status={status}
                    isActive={isActive}
                    levelNumber={10}
                    ariaLabel={`${levelType} ${status}`}
                    href="#"
                  />
                </td>
              ))}
              <td>
                <ProgressBubble
                  levelType={levelType}
                  isActive={isActive}
                  levelNumber={10}
                  disabled
                  ariaLabel={`${levelType} disabled`}
                />
              </td>
              <td>
                <ProgressBubble
                  levelType={levelType}
                  status="completed"
                  isActive={isActive}
                  isAssessment
                  levelNumber={10}
                  ariaLabel={`${levelType} assessment`}
                  href="#"
                />
              </td>
            </tr>
          )),
        )}
        <tr>
          <th style={{textAlign: 'left', fontSize: 12}}>lessonExtras</th>
          <td>
            <ProgressBubble
              levelType="lessonExtras"
              ariaLabel="Lesson extras"
              href="#"
            />
          </td>
          <td>
            <ProgressBubble
              levelType="lessonExtras"
              isActive
              ariaLabel="Lesson extras, current"
            />
          </td>
        </tr>
      </tbody>
    </table>
  ),
};

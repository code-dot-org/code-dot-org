import Snackbar, {SnackbarProps} from '@mui/material/Snackbar';
import {Meta, StoryFn} from '@storybook/react-webpack5';
import {useState, useCallback} from 'react';

import Alert, {AlertProps} from '@/alert';

export default {
  title: 'DesignSystem/Snackbar',
  component: Snackbar,
} as Meta;

type SnackBarRealProps = SnackbarProps & {alertProps: AlertProps};

//
// TEMPLATE
//
const SingleTemplate: StoryFn<SnackBarRealProps> = args => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSnackbar = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen],
  );
  const {alertProps, ...snackbarProps} = args;

  return (
    <div>
      <div>
        <p>
          <strong>Important!</strong> Use <code>@mui/material</code> Snackbar
          and <code>@code-dot-org/component-library</code> Alert
        </p>
        <pre
          style={{background: '#f7f7f7', padding: '1rem', overflowX: 'auto'}}
        >
          <code>
            {`import Snackbar from '@mui/material/Snackbar';
import Alert from '@code-dot-org/component-library/alert';

<>
  <Snackbar
    open={isOpen}
    onClose={toggleSnackbar}
    {...snackbarProps}
  >
    <Alert {...alertProps} onClose={toggleSnackbar} />
  </Snackbar>
</>`}
          </code>
        </pre>
      </div>
      <button type="button" onClick={toggleSnackbar}>
        Open Snackbar
      </button>
      <Snackbar open={isOpen} onClose={toggleSnackbar} {...snackbarProps}>
        <Alert {...alertProps} onClose={toggleSnackbar} />
      </Snackbar>
    </div>
  );
};

const MultipleTemplate: StoryFn<{
  components: SnackBarRealProps[];
}> = args => {
  const [isOpen, setIsOpen] = useState({} as {[key: string]: boolean});
  const toggleSnackbar = useCallback(
    (key: string | number) =>
      setIsOpen(
        !isOpen[key] ? {...isOpen, [key]: true} : {...isOpen, [key]: false},
      ),
    [setIsOpen, isOpen],
  );

  return (
    <>
      <div>
        <p>
          <strong>Important!</strong> Use <code>@mui/material</code> Snackbar
          and <code>@code-dot-org/component-library</code> Alert
        </p>
        <pre
          style={{background: '#f7f7f7', padding: '1rem', overflowX: 'auto'}}
        >
          <code>
            {`import Snackbar from '@mui/material/Snackbar';
import Alert from '@code-dot-org/component-library/alert';

<>
  <Snackbar
    open={isOpen}
    onClose={toggleSnackbar}
    {...snackbarProps}
  >
    <Alert {...alertProps} onClose={toggleSnackbar} />
  </Snackbar>
</>`}
          </code>
        </pre>
      </div>

      <p>
        * Margins on this screen do not represent the component's margins, and
        are only added to improve Storybook view *
      </p>
      <p>Multiple SnackBars:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components?.map(({alertProps, ...snackbarProps}, index) => (
          <div key={index}>
            <button type="button" onClick={() => toggleSnackbar(index)}>
              Open Snackbar
            </button>
            <Snackbar
              open={isOpen[index]}
              onClose={() => toggleSnackbar(index)}
              {...snackbarProps}
            >
              <Alert {...alertProps} onClose={() => toggleSnackbar(index)} />
            </Snackbar>
          </div>
        ))}
      </div>
    </>
  );
};

//
// Stories
//

export const Default = SingleTemplate.bind({});
Default.args = {
  alertProps: {
    text: 'This is a SnackBar alert',
    type: 'primary',
    size: 'm',
  },
  autoHideDuration: 3000,
  anchorOrigin: {vertical: 'top', horizontal: 'center'},
};

export const WithLinkAndIcon = SingleTemplate.bind({});
WithLinkAndIcon.args = {
  alertProps: {
    text: 'Saved successfully. Learn more?',
    type: 'success',
    size: 'm',
    icon: {iconName: 'circle-check'},
    link: {
      href: '#',
      text: 'Learn more',
    },
  },
};

export const WithAutoClose = SingleTemplate.bind({});
WithAutoClose.args = {
  autoHideDuration: 3000,
  alertProps: {
    text: 'Auto-dismiss after 3s',
    type: 'info',
    size: 'm',
  },
};

export const SnackBarTypes = MultipleTemplate.bind({});
SnackBarTypes.args = {
  components: [
    {alertProps: {text: 'Primary', type: 'primary', size: 'm'}},
    {alertProps: {text: 'Success', type: 'success', size: 'm'}},
    {alertProps: {text: 'Danger', type: 'danger', size: 'm'}},
    {alertProps: {text: 'Warning', type: 'warning', size: 'm'}},
    {alertProps: {text: 'Info', type: 'info', size: 'm'}},
    {alertProps: {text: 'Gray', type: 'gray', size: 'm'}},
    {alertProps: {text: 'Aqua', type: 'aqua', size: 'm'}},
  ],
};

export const SnackBarAnchorPositions = MultipleTemplate.bind({});
SnackBarAnchorPositions.args = {
  components: [
    {
      anchorOrigin: {vertical: 'top', horizontal: 'left'},
      alertProps: {text: 'Top Left', type: 'gray', size: 'm'},
    },
    {
      anchorOrigin: {vertical: 'top', horizontal: 'right'},
      alertProps: {text: 'Top Right', type: 'info', size: 'm'},
    },
    {
      anchorOrigin: {vertical: 'bottom', horizontal: 'left'},
      alertProps: {text: 'Bottom Left', type: 'warning', size: 'm'},
    },
    {
      anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
      alertProps: {text: 'Bottom Right', type: 'danger', size: 'm'},
    },
  ],
};

export const SnackBarWithAutoClose = MultipleTemplate.bind({});
SnackBarWithAutoClose.args = {
  components: [
    {
      autoHideDuration: 2000,
      alertProps: {text: 'Closes in 2s', type: 'info', size: 'm'},
    },
    {
      autoHideDuration: 4000,
      alertProps: {text: 'Closes in 4s', type: 'warning', size: 'm'},
    },
    {
      autoHideDuration: 6000,
      alertProps: {text: 'Closes in 6s', type: 'success', size: 'm'},
    },
  ],
};

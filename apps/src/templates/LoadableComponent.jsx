import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

/**
 * A wrapper component that loads data for another component and
 * renders it once loading is complete, or displays an error message
 * if loading fails.
 *
 * This is primarily meant to be used for components that need to
 * load data via an API call (or another async process) before fully
 * rendering.
 */
export default function LoadableComponent({
  loadFunction,
  loadArgs,
  renderFunction,
  spinnerStyle,
  spinnerSize,
  errorMessageStyle,
  errorMessage,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [renderArgs, setRenderArgs] = useState([]);

  const onLoadSuccess = renderArgs => {
    setRenderArgs(renderArgs);
    setIsLoading(false);
  };

  const onLoadError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFunction(...loadArgs, onLoadSuccess, onLoadError);
  }, [loadArgs, loadFunction, renderFunction]);

  if (isLoading) {
    return <Spinner size={spinnerSize} style={spinnerStyle} />;
  }

  if (hasError) {
    return (
      <div style={{...styles.errorMessage, ...errorMessageStyle}}>
        {errorMessage}
      </div>
    );
  }

  return renderFunction(...renderArgs);
}

LoadableComponent.propTypes = {
  /**
   * Required. This function is used to load data for the
   * loaded component. The function is invoked with the
   * arguments provided in `loadArgs`, an onLoadSuccess
   * callback, and on onLoadError callback. The `onLoadSuccess`
   * callback should be called with the data needed to render the
   * component, which is passed to `renderFunction`. Example usage:
   *
   * function myLoadFunction(...loadArgs, onLoadSuccess, onLoadError) {
   *    someAsyncRequest()
   *      .then((renderData1, renderData1) => onLoadSuccess([renderData1, renderData1]))
   *      .fail(() => onLoadError());
   * }
   */
  loadFunction: PropTypes.func.isRequired,
  /** Required. The arguments passed to `loadFunction` */
  loadArgs: PropTypes.array.isRequired,
  /**
   * Required. This function is used to render the component
   * once data has loaded. Example usage:
   *
   * function myRenderFunction(renderData1, renderData1) {
   *    return <MyLoadedComponent prop1={renderData1} prop2={renderData2} />;
   * }
   */
  renderFunction: PropTypes.func.isRequired,
  /** Optional. Additional styles to apply to the loading spinner. */
  spinnerStyle: PropTypes.object,
  /** Optional. Size of the loading spinner. Defaults to `medium` */
  spinnerSize: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Optional. Additional styles to apply to the error message. */
  errorMessageStyle: PropTypes.object,
  /** Optional. Custom error message text. Defaults to a standard load error message. */
  errorMessage: PropTypes.string,
};

LoadableComponent.defaultProps = {
  spinnerSize: 'medium',
  errorMessage: i18n.loadingError(),
};

const styles = {
  errorMessage: {
    fontSize: 12,
    color: color.red,
  },
};

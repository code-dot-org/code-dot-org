/**
 * @fileoverview This component is designed to be lazy-loaded loaded, so that
 * all js and css related to it are kept out of the initial download.
 */

import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

export default VirtualizedSelect;

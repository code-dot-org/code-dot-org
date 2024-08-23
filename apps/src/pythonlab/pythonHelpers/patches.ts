import {HOME_FOLDER} from './constants';

export const MATPLOTLIB_IMG_TAG = 'MATPLOTLIB_SHOW_IMG';

export const TEARDOWN_CODE = `from pythonlab_setup import teardown_pythonlab
teardown_pythonlab('/${HOME_FOLDER}')
`;

export const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MATPLOTLIB_IMG_TAG}')
`;

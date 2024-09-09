import {DecoratorFunction} from '@storybook/addons';
import {Store} from 'redux';

export declare const reduxStore: (reducers?: object, state?: object) => Store;

export declare const reduxStoreDecorator: DecoratorFunction;

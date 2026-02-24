/*
 * Type to map from an event property name to a value.  This is used to pass analytics data to
 * Statsig and Amplitude where the exact key (name) and data type isn't known ahead of time.
 **/
export type AnalyticsProperties = {[name: string]: string | number | boolean};

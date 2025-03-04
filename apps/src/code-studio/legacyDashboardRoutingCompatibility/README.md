# Legacy Dashboard Routing Compatibility

Other areas of the application have already started using `react-router-dom` which is the browser package for react router version 6. V6 is set up to work with functional react components, so a lot of routing functionality has been moved to hooks. This shim updates the workshop dashboard routing to use v6 without needing to refactor all the child route components from react classes to functional components (which would have also required full refactors of any existing unit tests). Since we're planning on adding/replacing new workshop routes, this paves the way for new functional component routes, and we can gradually deprecate the class based components. Once all components rendered by `Route`s are replaced with functional components we can remove the custom context and hoc and use the provided hooks directly. Now the application dashboard is the last component using `react-router` v3.

## RouterContext

`react-router` v3 used context to pass routing methods:

- `push`
- `replace`
- `createHref`
- `goBack`

The custom `RouterContext` is intended to provide backwards compatibility for class based components used in `Route` components that used `this.context.router.push('/new/page')` and other routing methods. V3 of `react-router` provided the `router` object with these methods through context.

## WithRouterProps

`react-router` v3 used props to pass these properties:

- `routes`
- `params`
- `location`
- `location.query`

The higher order component `WithRouterProps` is intended to provide backwards compatibility for class based components used in `Route` components that used `this.props.location` and other routing properties. V3 of `react-router` passed these properties through props from the `Route` component to the child component it rendered.

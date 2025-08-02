declare module 'content/app' {
  // eslint-disable-next-line import/no-default-export
  export default function App(props: {
    Component: React.ComponentType<Record<string, unknown>>;
  }): JSX.Element;
}
declare module 'content/page' {
  // eslint-disable-next-line import/no-default-export
  export default function Page(): JSX.Element;
}

declare module 'navigation/app' {
  // eslint-disable-next-line import/no-default-export
  export default function App(props: {
    Component: React.ComponentType<Record<string, unknown>>;
  }): JSX.Element;
}
declare module 'navigation/header' {
  // eslint-disable-next-line import/no-default-export
  export default function Header(): JSX.Element;
}
declare module 'navigation/footer' {
  // eslint-disable-next-line import/no-default-export
  export default function Footer(): JSX.Element;
}

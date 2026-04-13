type NavigationBlocker = () => boolean | Promise<boolean>;

let activeNavigationBlocker: NavigationBlocker | undefined;

export function registerLevelNavigationBlocker(
  blocker: NavigationBlocker
): () => void {
  activeNavigationBlocker = blocker;
  return () => {
    if (activeNavigationBlocker === blocker) {
      activeNavigationBlocker = undefined;
    }
  };
}

export function shouldAllowLevelNavigation(): Promise<boolean> {
  return activeNavigationBlocker
    ? Promise.resolve(activeNavigationBlocker())
    : Promise.resolve(true);
}

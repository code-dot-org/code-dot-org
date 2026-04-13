export type NavigationBlocker = () => boolean | Promise<boolean>;

type LevelNavigationBlocker = {
  register: (blocker: NavigationBlocker) => () => void;
  shouldAllow: () => Promise<boolean>;
};

export default function createLevelNavigationBlocker(): LevelNavigationBlocker {
  let activeNavigationBlocker: NavigationBlocker | undefined;

  const register = (blocker: NavigationBlocker) => {
    activeNavigationBlocker = blocker;
    return () => {
      if (activeNavigationBlocker === blocker) {
        activeNavigationBlocker = undefined;
      }
    };
  };

  const shouldAllow = () =>
    activeNavigationBlocker
      ? Promise.resolve(activeNavigationBlocker())
      : Promise.resolve(true);

  return {
    register,
    shouldAllow,
  };
}

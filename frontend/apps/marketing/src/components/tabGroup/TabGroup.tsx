const TabGroupContentful: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({children}) => {
  return (
    <div>
      <h1>Tab Group Demo</h1>
      <section>{children}</section>
    </div>
  );
};

export default TabGroupContentful;

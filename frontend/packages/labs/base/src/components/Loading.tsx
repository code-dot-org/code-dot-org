interface LoadingProps {
  isLoading: boolean;
}

export default function Loading({isLoading}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: isLoading ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      {isLoading ? 'Loading…' : ''}
    </div>
  );
}

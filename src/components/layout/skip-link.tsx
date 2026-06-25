export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="bg-background text-foreground focus:ring-ring focus:border-border sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:border focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

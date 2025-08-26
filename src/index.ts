export function hello(): string {
  return 'Hello world!';
}

// Only start server if this is the main module (not being imported for tests)
if (import.meta.main) {
  // Dynamically import Bun's serve function to avoid build-time resolution issues
  const { serve } = await import('bun');

  serve({
    port: 3000,
    fetch(_req) {
      return new Response('👋 Hello from Bun + Changesets + Commitizen template!', {
        headers: { 'Content-Type': 'text/plain' },
      });
    },
  });

  console.info('🚀 Server running at http://localhost:3000');
}

export default function AboutPage() {
  return (
    <>
      <h1>One project, two runtimes.</h1>
      <p>
        The browser runs a React Router SPA. A Tsuki application on Hono serves configuration and
        tRPC requests from the same origin.
      </p>
      <p>
        Run the production server with Node or Docker, or publish static assets and one API function
        with Vercel Build Output API.
      </p>
      <a href="https://github.com/lobehub/vite-spa-template">Read the template guide</a>
    </>
  );
}

export default function NotFound() {
  return (
    <main id="main" className="content-section">
      <div className="container section-copy center">
        <p className="section-kicker">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <a className="primary-button" href="/">
          Return home
        </a>
      </div>
    </main>
  );
}

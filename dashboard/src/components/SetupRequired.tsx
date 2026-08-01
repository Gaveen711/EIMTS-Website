export function SetupRequired() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <span className="setup-icon">EI</span>
        <p className="eyebrow">One-time setup needed</p>
        <h1>Connect the free content database</h1>
        <p>
          Create a Supabase project, run the included database migration, and
          add the project URL and publishable key to the dashboard environment.
        </p>
        <ol>
          <li>Create the Supabase project.</li>
          <li>Run the SQL migration included in this repository.</li>
          <li>Add the two environment values and restart the dashboard.</li>
        </ol>
      </section>
    </main>
  );
}

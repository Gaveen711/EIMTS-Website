import Link from "next/link";
import { signOut } from "@/app/actions";

export function DashboardHeader({ email }: { email: string }) {
  return (
    <header className="dashboard-header">
      <Link className="dashboard-brand" href="/">
        <span>EI</span>
        <strong>
          Emerald Isle
          <small>Content desk</small>
        </strong>
      </Link>
      <nav>
        <Link href="/">Jobs</Link>
        <Link href="/popups">Popups</Link>
        <Link href="/jobs/new">Add vacancy</Link>
      </nav>
      <form action={signOut}>
        <span>{email}</span>
        <button className="text-button" type="submit">
          Sign out
        </button>
      </form>
    </header>
  );
}

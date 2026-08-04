import Link from "next/link";
import { signOut } from "@/app/actions";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

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
      <NavLinks />
      <form action={signOut}>
        <span>{email}</span>
        <ThemeToggle />
        <button className="ghost-button" type="submit">
          Sign out
        </button>
      </form>
    </header>
  );
}

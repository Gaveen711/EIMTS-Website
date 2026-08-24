"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/popups", label: "Popups" },
  { href: "/hero", label: "Hero" },
  { href: "/projects", label: "Projects" },
];

function isActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/jobs");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard">
      {links.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

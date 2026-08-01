import ContactPage from "@/features/contact/ContactPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Contact Emerald Isle Manpower",
  "Contact Emerald Isle Manpower offices in Colombo, Kurunegala, Batticaloa, Kandy, Nepal and the UAE.",
  "/contact",
);

export default function Page() {
  return <ContactPage />;
}

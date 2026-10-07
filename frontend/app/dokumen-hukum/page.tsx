import { ScrollText } from "lucide-react";
import { ProdukHukumTable } from "@/components/produk-hukum-table";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function ProdukHukumPage() {
  return (
    <>
      <Navbar />



      <main>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProdukHukumTable />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

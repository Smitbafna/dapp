import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
// import { dapp3_backend } from 'declarations/dapp3_backend';
export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Create Lottery</h1>
        </div>
      </section>
    </DefaultLayout>
  );
}

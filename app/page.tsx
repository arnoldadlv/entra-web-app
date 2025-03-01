// app/page.tsx
import { title, subtitle } from "@/components/primitives";
import TenantLookupForm from "@/components/tenant-lookup-form";

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block max-w-xl text-center justify-center">
				<span className={title()}>Entra ID&nbsp;</span>
				<span className={title({ color: "blue" })}>Tenant&nbsp;</span>
				<br />
				<span className={title()}>Lookup Tool</span>
				<div className={subtitle({ class: "mt-4" })}>Look up Microsoft Entra ID tenant information by tenant ID</div>
			</div>

			{/* Client component for interactive form */}
			<div className="w-full max-w-md mt-4">
				<TenantLookupForm />
			</div>
		</section>
	);
}

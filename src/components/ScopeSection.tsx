export function ScopeSection() {
  return (
    <section aria-labelledby="scope-heading" className="py-8 px-8 bg-cream text-center border-y-4 border-navy/10">
      <details className="max-w-2xl mx-auto cursor-pointer group inline-block">
        <summary className="font-headline font-bold text-lg text-navy/60 hover:text-navy transition flex items-center justify-center gap-2 focus:text-navy">
          <span className="text-amber text-xl group-open:rotate-90 transition-transform duration-200 font-sans" aria-hidden="true">▸</span>
          Scope and limitations
        </summary>
        <div className="mt-5 text-left bg-white p-6 border-3 border-navy/10 shadow-craft leading-relaxed">
          <p className="mb-2"><strong>Scope:</strong> Common JS/TS patterns useful for builders.</p>
          <p><strong>Limitation:</strong> Educational awareness only. Not a professional audit. We do not run your code.</p>
        </div>
      </details>
    </section>
  );
}
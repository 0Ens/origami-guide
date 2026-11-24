import { lazy, Suspense, useMemo, useState } from 'react'
import { foldSequence } from '../fold-engine'
import { sampleModel } from './sampleModel'
import './PlaygroundPage.css'

const PaperViewer = lazy(() => import('../viewer/PaperViewer'))

/**
 * Development-only page for trying the viewer without the API or seed data.
 * Not translated on purpose: users never see it.
 */
export default function PlaygroundPage() {
  const sequence = useMemo(() => foldSequence(sampleModel), [])
  const last = sequence.plans.length
  const [step, setStep] = useState(0)

  return (
    <section className="playground">
      <h1>Viewer playground</h1>
      <Suspense fallback={<div className="playground__loading">Loading viewer…</div>}>
        <PaperViewer
          sequence={sequence}
          step={step}
          frontColor="#d9502f"
          backColor="#f4efe6"
          label={`Sample model, step ${step} of ${last}`}
        />
      </Suspense>
      <div className="playground__controls">
        <button type="button" onClick={() => setStep((s) => Math.max(0, Math.ceil(s) - 1))}>
          ◀ Prev
        </button>
        <input
          type="range"
          min={0}
          max={last}
          step={0.01}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-label="Position"
        />
        <button type="button" onClick={() => setStep((s) => Math.min(last, Math.floor(s) + 1))}>
          Next ▶
        </button>
        <output>
          {step.toFixed(2)} / {last}
          {Number.isInteger(step) && step < last && ` · next: ${sampleModel[step].kind}`}
        </output>
      </div>
    </section>
  )
}

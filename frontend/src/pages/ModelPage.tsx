import { useParams } from 'react-router'

export function ModelPage() {
  const { slug } = useParams()

  return (
    <section>
      <h1>{slug}</h1>
    </section>
  )
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ModelPage } from './pages/ModelPage'

// In production builds import.meta.env.DEV is false, so the bundler drops the playground entirely.
const PlaygroundPage = import.meta.env.DEV ? lazy(() => import('./playground/PlaygroundPage')) : null

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="models/:slug" element={<ModelPage />} />
          {PlaygroundPage && (
            <Route
              path="playground"
              element={
                <Suspense fallback={null}>
                  <PlaygroundPage />
                </Suspense>
              }
            />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

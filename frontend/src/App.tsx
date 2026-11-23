import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ModelPage } from './pages/ModelPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="models/:slug" element={<ModelPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

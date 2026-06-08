import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/features/home/HomePage';
import { PreviewPage } from '@/features/preview/PreviewPage';
import { ThreadProvider } from '@/store/threadStore';

function App() {
  return (
    <ThreadProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/preview/:threadId" element={<PreviewPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </ThreadProvider>
  );
}

export default App;

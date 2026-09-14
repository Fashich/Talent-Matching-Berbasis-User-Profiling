import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootGate from './components/RootGate';
import LostSignal from './components/LostSignal';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login/Login';
import DashboardHome from './pages/Dashboard/DashboardHome';
import Siswa from './pages/Siswa/Siswa';
import Perusahaan from './pages/Perusahaan/Perusahaan';
import KelompokMagang from './pages/KelompokMagang/KelompokMagang';
import Penempatan from './pages/Penempatan/Penempatan';
import Profil from './pages/Profil/Profil';
import Kompetensi from './pages/Kompetensi/Kompetensi';
import Jurnal from './pages/Jurnal/Jurnal';
import Recommendation from './pages/Recommendation/Recommendation';
import Laporan from './pages/Laporan/Laporan';
import User from './pages/User/User';
import Pengaturan from './pages/Pengaturan/Pengaturan';

function App() {
  return (
    <ThemeProvider>
    <ConnectionProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <LostSignal />
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <RootGate>
                    <DashboardLayout />
                  </RootGate>
                }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route
                path="siswa"
                element={
                  <ProtectedRoute roles={['Administrator', 'Petugas', 'Guru']}>
                    <Siswa />
                  </ProtectedRoute>
                }
              />
              <Route path="perusahaan" element={<Perusahaan />} />
              <Route path="kelompok-magang" element={<KelompokMagang />} />
              <Route
                path="penempatan"
                element={
                  <ProtectedRoute roles={['Administrator', 'Petugas']}>
                    <Penempatan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profil"
                element={
                  <ProtectedRoute roles={['Siswa']}>
                    <Profil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kompetensi"
                element={
                  <ProtectedRoute roles={['Siswa']}>
                    <Kompetensi />
                  </ProtectedRoute>
                }
              />
              <Route
                path="jurnal"
                element={
                  <ProtectedRoute roles={['Administrator', 'Siswa']}>
                    <Jurnal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recommendation"
                element={
                  <ProtectedRoute roles={['Siswa']}>
                    <Recommendation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="laporan"
                element={
                  <ProtectedRoute roles={['Administrator']}>
                    <Laporan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user"
                element={
                  <ProtectedRoute roles={['Administrator']}>
                    <User />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pengaturan"
                element={
                  <ProtectedRoute roles={['Administrator']}>
                    <Pengaturan />
                  </ProtectedRoute>
                }
              />
            </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;

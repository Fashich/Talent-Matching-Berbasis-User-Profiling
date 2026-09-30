import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  NotebookPen,
  UserCog,
  FileBarChart,
  Settings,
  UsersRound,
  UserRound,
  Sparkles,
  Target,
} from 'lucide-react';

// Konfigurasi menu sidebar EduPKL — mengikuti struktur UI Design (5.10) pada
// Dokumen Perancangan Sistem. `roles` menentukan peran mana saja yang boleh
// melihat & mengakses menu tersebut.
export const ALL_ROLES = ['Administrator', 'Petugas', 'Guru', 'Siswa'];

export const menuItems = [
  { key: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { key: 'siswa', name: 'Siswa', path: '/siswa', icon: Users, roles: ['Administrator', 'Petugas', 'Guru'] },
  { key: 'perusahaan', name: 'Perusahaan', path: '/perusahaan', icon: Building2, roles: ['Administrator', 'Petugas', 'Guru', 'Siswa'] },
  { key: 'kelompokMagang', name: 'Kelompok Magang', path: '/kelompok-magang', icon: UsersRound, roles: ['Administrator', 'Petugas', 'Guru', 'Siswa'] },
  { key: 'penempatan', name: 'Penempatan & Penerimaan', path: '/penempatan', icon: Briefcase, roles: ['Administrator', 'Petugas'] },
  { key: 'profil', name: 'Profil', path: '/profil', icon: UserRound, roles: ['Siswa'] },
  { key: 'kompetensi', name: 'Kompetensi', path: '/kompetensi', icon: Target, roles: ['Siswa'] },
  { key: 'jurnal', name: 'Jurnal', path: '/jurnal', icon: NotebookPen, roles: ['Administrator', 'Siswa'] },
  { key: 'recommendation', name: 'Recommendation', path: '/recommendation', icon: Sparkles, roles: ['Siswa'] },
  { key: 'laporan', name: 'Laporan', path: '/laporan', icon: FileBarChart, roles: ['Administrator'] },
  { key: 'user', name: 'User', path: '/user', icon: UserCog, roles: ['Administrator'] },
  { key: 'pengaturan', name: 'Pengaturan', path: '/pengaturan', icon: Settings, roles: ['Administrator'] },
];

export function menuForRole(role) {
  return menuItems.filter((m) => m.roles.includes(role));
}

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
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { name: 'Siswa', path: '/siswa', icon: Users, roles: ['Administrator', 'Petugas', 'Guru'] },
  { name: 'Perusahaan', path: '/perusahaan', icon: Building2, roles: ['Administrator', 'Petugas', 'Guru', 'Siswa'] },
  { name: 'Kelompok Magang', path: '/kelompok-magang', icon: UsersRound, roles: ['Administrator', 'Petugas', 'Guru', 'Siswa'] },
  { name: 'Penempatan & Penerimaan', path: '/penempatan', icon: Briefcase, roles: ['Administrator', 'Petugas'] },
  { name: 'Profil', path: '/profil', icon: UserRound, roles: ['Siswa'] },
  { name: 'Kompetensi', path: '/kompetensi', icon: Target, roles: ['Siswa'] },
  { name: 'Jurnal', path: '/jurnal', icon: NotebookPen, roles: ['Administrator', 'Siswa'] },
  { name: 'Recommendation', path: '/recommendation', icon: Sparkles, roles: ['Siswa'] },
  { name: 'Laporan', path: '/laporan', icon: FileBarChart, roles: ['Administrator'] },
  { name: 'User', path: '/user', icon: UserCog, roles: ['Administrator'] },
  { name: 'Pengaturan', path: '/pengaturan', icon: Settings, roles: ['Administrator'] },
];

export function menuForRole(role) {
  return menuItems.filter((m) => m.roles.includes(role));
}

// Kontak admin untuk tombol "Hubungi Admin" (WhatsApp) di halaman Login.
// Ditaruh di sini (bukan hardcode di komponen) biar gampang diubah kalau
// nomor/pesan admin berganti — lihat design_handoff_landing_login/README.md
// bagian "Kartu CTA Hubungi Admin".

export const ADMIN_WHATSAPP_NUMBER = '62881036501919';
export const ADMIN_WHATSAPP_MESSAGE = 'Halo Admin EduPKL, saya tidak bisa login ke sistem. Mohon bantuannya, terima kasih 🙏';

/**
 * Normalisasi nomor WhatsApp: buang semua karakter selain digit, lalu ganti
 * awalan "0" jadi "62" (format lokal -> internasional tanpa tanda +).
 */
function normalizeWhatsAppNumber(raw) {
  const digitsOnly = String(raw).replace(/\D/g, '');
  return digitsOnly.replace(/^0/, '62');
}

export function buildWhatsAppLink(number = ADMIN_WHATSAPP_NUMBER, message = ADMIN_WHATSAPP_MESSAGE) {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

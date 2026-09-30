import React from 'react';
import LegalPageLayout, { LegalSection, renderParts } from '../../components/LegalPageLayout';
import { useLanguage } from '../../context/LanguageContext';

// Syarat & Ketentuan Penggunaan EduPKL.
// Konten ini adalah implementasi dari draft
// "SYARAT_KETENTUAN_EDUPKL_DRAFT.md" (folder documents capstone) — kalau
// draft itu direvisi, sinkronkan juga isi di sini secara manual (di kedua
// bahasa, lihat src/i18n/translations.js namespace "terms").
//
// CATATAN: Bagian "Kontak" sengaja DIHAPUS sementara — satu-satunya kontak
// yang ada adalah nomor WA pribadi Fashich (src/config/contact.js, awalnya
// cuma buat tombol demo "Hubungi Admin" di halaman Login), bukan kontak
// resmi tim/kelompok. TAMBAHKAN KEMBALI begitu ada kontak resmi (email/WA
// kelompok) — lihat catatan sama di PrivacyPolicy.jsx.

const TermsOfService = () => {
  const { t } = useLanguage();
  const sections = t('terms', 'sections');

  return (
    <LegalPageLayout title={t('terms', 'pageTitle')} updatedLabel={t('terms', 'updatedLabel')}>
      {sections.map((section, idx) => (
        <LegalSection key={idx} heading={section.heading}>
          {section.paragraphs?.map((parts, pIdx) => (
            <p key={pIdx}>{renderParts(parts)}</p>
          ))}
          {section.list && (
            <ul className="list-disc pl-5 space-y-1.5">
              {section.list.map((parts, lIdx) => (
                <li key={lIdx}>{renderParts(parts)}</li>
              ))}
            </ul>
          )}
          {section.pre && (
            <pre
              className="rounded-xl border p-4 text-[0.82rem] leading-relaxed whitespace-pre-wrap"
              style={{ background: 'var(--lp-surface-bg)', borderColor: 'var(--lp-surface-border)' }}
            >
              {section.pre}
            </pre>
          )}
          {section.paragraphsAfterPre?.map((parts, pIdx) => (
            <p key={`after-pre-${pIdx}`}>{renderParts(parts)}</p>
          ))}
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
};

export default TermsOfService;

import React from 'react';
import LegalPageLayout, { LegalSection, renderParts } from '../../components/LegalPageLayout';
import { useLanguage } from '../../context/LanguageContext';

// Kebijakan Privasi EduPKL.
// Konten ini adalah implementasi dari draft
// "KEBIJAKAN_PRIVASI_EDUPKL_DRAFT.md" (folder documents capstone) — kalau
// draft itu direvisi, sinkronkan juga isi di sini secara manual (di kedua
// bahasa, lihat src/i18n/translations.js namespace "privacy").
//
// CATATAN PENTING: Pasal 6 (data anak/di bawah umur) mengasumsikan sekolah
// punya mekanisme persetujuan wali — INI BELUM DIVERIFIKASI. Jangan anggap
// kepatuhan Pasal 25 UU PDP otomatis terpenuhi hanya karena kalimat ini ada
// di halaman.
//
// CATATAN: Bagian "Kontak" (termasuk channel pengajuan hak subjek data di
// Pasal 10) sengaja DIHAPUS sementara — satu-satunya kontak yang ada adalah
// nomor WA pribadi Fashich (src/config/contact.js), bukan kontak resmi
// tim/kelompok. TAMBAHKAN KEMBALI begitu ada kontak resmi (email/WA
// kelompok) — lihat catatan sama di TermsOfService.jsx.

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const sections = t('privacy', 'sections');
  const tableHeaders = t('privacy', 'tableHeaders');
  const tableRows = t('privacy', 'tableRows');

  return (
    <LegalPageLayout title={t('privacy', 'pageTitle')} updatedLabel={t('privacy', 'updatedLabel')}>
      {sections.map((section, idx) => (
        <LegalSection key={idx} heading={section.heading}>
          {section.intro && <p>{section.intro}</p>}
          {section.paragraphs?.map((parts, pIdx) => (
            <p key={pIdx}>{renderParts(parts)}</p>
          ))}
          {section.hasTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.85rem] border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--lp-surface-border)' }}>
                    {tableHeaders.map((header, hIdx) => (
                      <th key={hIdx} className={`py-2 font-bold ${hIdx < tableHeaders.length - 1 ? 'pr-4' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid var(--lp-surface-border)' }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 pr-4 align-top" style={{ color: 'var(--lp-text-secondary)' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.paragraphsAfterTable?.map((parts, pIdx) => (
            <p key={`after-table-${pIdx}`}>{renderParts(parts)}</p>
          ))}
          {section.list && (
            section.listType === 'ol' ? (
              <ol className="list-decimal pl-5 space-y-1.5">
                {section.list.map((parts, lIdx) => (
                  <li key={lIdx}>{renderParts(parts)}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc pl-5 space-y-1.5">
                {section.list.map((parts, lIdx) => (
                  <li key={lIdx}>{renderParts(parts)}</li>
                ))}
              </ul>
            )
          )}
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;

import React from 'react';
import { Language, SiteSettingsCMS } from '../types';

interface StatsSectionProps {
  lang: Language;
  stats?: SiteSettingsCMS;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ lang, stats }) => {
  const membersVal = stats?.statMembers || '14,850+';
  const savingsVal = stats?.statSavings || 'Rs. 92.4 Cr';
  const loansVal = stats?.statLoans || 'Rs. 81.6 Cr';
  const assetsVal = stats?.statCapital || 'Rs. 114.2 Cr';

  return (
    <section className="stats-section">
      <div className="container stats grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat">
          <span>♟</span>
          <div>
            <strong>{membersVal}</strong>
            <small>{lang === 'np' ? 'सदस्य संख्या' : 'Active Members'}</small>
          </div>
        </div>

        <div className="stat">
          <span>♙</span>
          <div>
            <strong>{savingsVal}</strong>
            <small>{lang === 'np' ? 'कुल बचत निक्षेप' : 'Total Savings'}</small>
          </div>
        </div>

        <div className="stat">
          <span>₹</span>
          <div>
            <strong>{loansVal}</strong>
            <small>{lang === 'np' ? 'कुल ऋण लगानी' : 'Total Loans'}</small>
          </div>
        </div>

        <div className="stat">
          <span>▥</span>
          <div>
            <strong>{assetsVal}</strong>
            <small>{lang === 'np' ? 'कुल पुँजी / सम्पत्ति' : 'Total Assets'}</small>
          </div>
        </div>
      </div>
    </section>
  );
};

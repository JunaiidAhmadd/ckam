import { useI18n } from '../context/I18nContext.jsx';

export default function PlaceholderPage({ titleKey, fallback }) {
  const { t } = useI18n();

  return (
    <main className="react-placeholder-page">
      <div className="container">
        <div className="react-placeholder-card">
          <span>C-KAM React Migration</span>
          <h1>{titleKey ? t(titleKey, fallback) : fallback}</h1>
          <p>This route is ready. We will convert its HTML content into React in the next migration step.</p>
        </div>
      </div>
    </main>
  );
}

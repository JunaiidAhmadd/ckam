import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('theme-dark', dark);
    document.body.classList.toggle('theme-light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="switch-theme-mode">
      <label className="switch" htmlFor="theme-slider">
        <input id="theme-slider" type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} />
        <span className="slider round" />
      </label>
    </div>
  );
}

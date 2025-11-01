import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = e => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang); // met à jour i18next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', newLang); // persiste la préférence
    }
  };

  return (
    <select onChange={changeLang} value={i18n.language} className="appearance-none bg-transparent border-none text-white cursor-pointer p-1">
      <option value="en">EN</option>
      <option value="fr">FR</option>
      <option value="es">ES</option>
      <option value="de">DE</option>
      <option value="pt">PT</option>
      <option value="ar">AR</option>
    </select>
  );
}

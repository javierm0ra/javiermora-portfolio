import { useCallback, useEffect, useState } from "react";
import { STRINGS, type Lang, type Strings } from "../data/i18n";

const KEY = "lang";

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    // localStorage puede no estar disponible (modo privado); se usa el idioma del navegador.
  }
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
}

export function useLang(): { lang: Lang; t: Strings; setLang: (l: Lang) => void } {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = STRINGS[lang].docTitle;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      // sin persistencia: el cambio sigue valiendo en esta sesion
    }
  }, []);

  return { lang, t: STRINGS[lang], setLang };
}

import { useState, useEffect } from 'react';

/** Returns true when the `dark` class is present on <html>. Updates live on theme toggle. */
export function useIsDark(): boolean {
 const [isDark, setIsDark] = useState<boolean>(
 () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
 );

 useEffect(() => {
 const el = document.documentElement;
 const update = () => setIsDark(el.classList.contains('dark'));
 update();
 const observer = new MutationObserver(update);
 observer.observe(el, { attributes: true, attributeFilter: ['class'] });
 return () => observer.disconnect();
 }, []);

 return isDark;
}

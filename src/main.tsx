import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import './style.css';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import { auth, supabase } from './lib/supabase';

type Page = 'home' | 'about' | 'contact';

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'home', label: 'トップ' },
  { id: 'about', label: '事業紹介' },
  { id: 'contact', label: 'お問い合わせ' },
];

function App() {
  const [page, setPage] = useState<Page>('home');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  function navigate(next: Page) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => navigate('home')} aria-label="ゆっくり27works トップへ">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="ゆっくり27works" />
          </button>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-link${page === item.id ? ' is-active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
            {session ? (
              <button className="nav-link nav-auth" onClick={() => supabase.auth.signOut()}>
                ログアウト
              </button>
            ) : (
              <button className="nav-link nav-auth" onClick={() => auth.openSignInModal()}>
                ログイン
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About onNavigate={navigate} />}
        {page === 'contact' && <Contact />}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="footer-brand">ゆっくり27works</p>
          <nav className="footer-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className="footer-link" onClick={() => navigate(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <p className="copyright">© {new Date().getFullYear()} ゆっくり27works</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

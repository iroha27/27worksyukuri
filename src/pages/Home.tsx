import { useEffect, useState } from 'react';
import { fetchLatestVideos, type VideoItem } from '../lib/supabase';

type LoadState = 'loading' | 'ok' | 'error';

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Home({ onNavigate }: { onNavigate: (page: 'about' | 'contact') => void }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    fetchLatestVideos()
      .then((items) => {
        if (cancelled) return;
        setVideos(items);
        setState('ok');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">YUKKURI 27 WORKS</p>
          <h1>
            丁寧に、じっくり。
            <br />
            ゆっくり27works です。
          </h1>
          <p className="copy">
            {/* ここにサイトの紹介文を入れてください(ダミーテキスト) */}
            私たちは動画制作を中心に活動しています。
            日々の取り組みは YouTube でも発信中です。
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('contact')}>
              お問い合わせ
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('about')}>
              事業紹介を見る
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">事業内容</h2>
          <p className="section-lead">
            {/* 事業内容のダミーテキスト。実際の内容に差し替えてください。 */}
            主な事業をご紹介します。
          </p>
          <div className="card-grid">
            <article className="card">
              <h3>動画制作</h3>
              <p>
                YouTube 動画の企画・撮影・編集まで一貫。<br />
                ゲーム解説を主軸に投稿しています。
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <h2 className="section-title">運営チャンネル</h2>
          <p className="section-lead">運営している YouTube チャンネルはこちら。</p>
          <div className="card-grid">
            <a
              className="card card-channel"
              href="https://www.youtube.com/@27loveyukuri"
              target="_blank"
              rel="noreferrer"
            >
              <h3>ゆっくり27</h3>
              <p>ゲーム解説を主軸に投稿しているメインチャンネル。</p>
              <span className="channel-link">チャンネルを見る →</span>
            </a>
            <a
              className="card card-channel"
              href="https://www.youtube.com/@%E3%82%86%E3%81%A3%E3%81%8F%E3%82%8A27%E3%81%AE%E5%80%89%E5%BA%AB"
              target="_blank"
              rel="noreferrer"
            >
              <h3>ゆっくり27の倉庫</h3>
              <p>アーカイブやおまけ動画などを投稿しているサブチャンネル。</p>
              <span className="channel-link">チャンネルを見る →</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">最新の動画</h2>
          <p className="section-lead">YouTube チャンネルの最新動画をご紹介します。</p>

          {state === 'loading' && <p className="video-status">読み込み中…</p>}
          {state === 'error' && (
            <div className="video-status">
              動画情報を取得できませんでした。
              <button className="btn btn-ghost video-retry" onClick={() => setReloadKey((k) => k + 1)}>
                再読み込み
              </button>
            </div>
          )}
          {state === 'ok' && videos.length === 0 && (
            <p className="video-status">準備中です。動画の公開をお待ちください。</p>
          )}

          {state === 'ok' && videos.length > 0 && (
            <div className="card-grid card-grid-video">
              {videos.map((v) => (
                <a
                  key={v.videoId}
                  className="card card-video"
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img className="video-thumb" src={v.thumbnail} alt={v.title} loading="lazy" />
                  <div className="video-body">
                    <h3>{v.title}</h3>
                    <p className="video-date">{formatDate(v.published)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container cta-box">
          <h2>お仕事のご依頼・ご相談</h2>
          <p>動画制作のご依頼・ご相談など、お気軽にお問い合わせください。</p>
          <button className="btn btn-primary" onClick={() => onNavigate('contact')}>
            お問い合わせフォームへ
          </button>
        </div>
      </section>
    </>
  );
}

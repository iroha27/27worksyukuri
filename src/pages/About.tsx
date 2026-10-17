export default function About({ onNavigate }: { onNavigate: (page: 'contact') => void }) {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">SERVICES</p>
          <h1>事業紹介</h1>
          <p className="copy">
            {/* このページの内容はすべてダミーです。実際の情報に差し替えてください。 */}
            ゆっくり27works が行っている事業をご紹介します。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">事業概要</h2>
          <p className="section-lead">
            {/* 事業概要のダミーテキスト。実際の内容に差し替えてください。 */}
            現在行っている主な事業をご紹介します。
          </p>
          <div className="card-grid">
            <article className="card">
              <h3>ゲーム解説動画投稿</h3>
              <p>
                YouTube 動画の企画・撮影・編集まで一貫。<br />
                LOLの解説動画を主に投稿しています。
              </p>
            </article>
            <article className="card">
              <h3>その他解説動画投稿</h3>
              <p>非ゲーム系の解説動画の企画・撮影・編集も行っています。</p>
            </article>
            <article className="card">
              <h3>ゲームプレイ動画投稿</h3>
              <p>
                単純なゲーム実況も投稿しています。<br />
                過去投稿シリーズ：パワプロ
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container narrow">
          <h2 className="section-title">挨拶</h2>
          <p className="copy">
            「顧客第一主義」をモットーに動画制作に取り組んでいます。今後ともよろしくお願いいたします。
            <br />
            <br />
            ゆっくり27
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <h2 className="section-title">沿革</h2>
          <ul className="timeline">
            <li>
              <span className="timeline-year">2021年04月</span>
              <span>初投稿</span>
            </li>
            <li>
              <span className="timeline-year">2022年12月</span>
              <span>登録者1000人</span>
            </li>
            <li>
              <span className="timeline-year">2025年12月</span>
              <span>登録者5000人</span>
            </li>
          </ul>
          <div className="about-cta">
            <button className="btn btn-primary" onClick={() => onNavigate('contact')}>
              お問い合わせ
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

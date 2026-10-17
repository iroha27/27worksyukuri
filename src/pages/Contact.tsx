import { useState, type FormEvent } from 'react';
import { submitContactMessage, sendContactNotify } from '../lib/supabase';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState('sending');
    setErrorMessage('');
    try {
      const input = {
        name: String(data.get('name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        subject: String(data.get('subject') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
      };
      await submitContactMessage(input);
      // 保存が成功していれば受信は確定のため、メール転送の失敗は送信完了を妨げない
      await sendContactNotify(input).catch(() => undefined);
      setState('success');
      form.reset();
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : '送信に失敗しました。');
    }
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">CONTACT</p>
          <h1>お問い合わせ</h1>
          <p className="copy">ご依頼・ご相談は下記フォームよりお送りください。</p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          {state === 'success' ? (
            <div className="form-done">
              <h2>送信しました</h2>
              <p>お問い合わせありがとうございました。内容を確認のうえ、ご返信いたします。</p>
              <button className="btn btn-ghost" onClick={() => setState('idle')}>
                新しい問い合わせを送る
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name">
                  お名前 <span className="required">必須</span>
                </label>
                <input id="name" name="name" type="text" required maxLength={100} placeholder="山田 太郎" />
              </div>
              <div className="form-row">
                <label htmlFor="email">
                  メールアドレス <span className="required">必須</span>
                </label>
                <input id="email" name="email" type="email" required maxLength={254} placeholder="example@example.com" />
              </div>
              <div className="form-row">
                <label htmlFor="subject">
                  件名 <span className="required">必須</span>
                </label>
                <input id="subject" name="subject" type="text" required maxLength={200} placeholder="ご依頼内容など" />
              </div>
              <div className="form-row">
                <label htmlFor="message">
                  お問い合わせ内容 <span className="required">必須</span>
                </label>
                <textarea id="message" name="message" required maxLength={5000} rows={7} placeholder="具体的なご依頼内容やご質問をご記入ください" />
              </div>

              {state === 'error' && (
                <p className="form-error">
                  送信に失敗しました。時間をおいて再度お試しください。
                  {errorMessage ? `(エラー: ${errorMessage})` : null}
                </p>
              )}

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={state === 'sending'}>
                  {state === 'sending' ? '送信中…' : '送信する'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

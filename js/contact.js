/* SYNTHERA — Contact form handler */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitButton = document.getElementById('submit-button');
  const formMessage = document.getElementById('form-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject')?.value.trim() || 'お問い合わせ',
      message: document.getElementById('message').value.trim(),
      honeypot: document.getElementById('honeypot')?.value || '',
    };

    submitButton.disabled = true;
    formMessage.className = 'contact-form__message';
    formMessage.textContent = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'エラーが発生しました');

      formMessage.className = 'contact-form__message is-success';
      formMessage.textContent = 'お問い合わせを送信しました。2〜3営業日以内にご返信いたします。';
      form.reset();
    } catch (err) {
      console.error('Error:', err);
      formMessage.className = 'contact-form__message is-error';
      formMessage.textContent = err.message || 'お問い合わせの送信中にエラーが発生しました。しばらく経ってから再度お試しください。';
    } finally {
      submitButton.disabled = false;
    }
  });

  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && field.classList.contains('is-error')) validateField(input);
    });
  });
});

function validateForm() {
  const ids = ['name', 'email', 'message', 'privacy-agree'];
  let isValid = true;
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!validateField(el)) isValid = false;
  });
  return isValid;
}

function validateField(field) {
  if (!field) return true;
  const id = field.id;
  const errorElement = document.getElementById(`${id}-error`);
  const wrap = field.closest('.field');
  let errorMessage = '';
  let isValid = true;

  if (id === 'name') {
    if (!field.value.trim()) { errorMessage = 'お名前を入力してください'; isValid = false; }
    else if (field.value.trim().length < 2) { errorMessage = 'お名前は2文字以上で入力してください'; isValid = false; }
  } else if (id === 'email') {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!field.value.trim()) { errorMessage = 'メールアドレスを入力してください'; isValid = false; }
    else if (!re.test(field.value.trim())) { errorMessage = '有効なメールアドレスを入力してください'; isValid = false; }
  } else if (id === 'message') {
    if (!field.value.trim()) { errorMessage = 'お問い合わせ内容を入力してください'; isValid = false; }
    else if (field.value.trim().length < 10) { errorMessage = 'お問い合わせ内容は10文字以上で入力してください'; isValid = false; }
  } else if (id === 'privacy-agree') {
    if (!field.checked) { errorMessage = 'プライバシーポリシーに同意してください'; isValid = false; }
  }

  if (errorElement) errorElement.textContent = errorMessage;
  if (wrap) wrap.classList.toggle('is-error', !isValid);
  return isValid;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
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
        submitButton.classList.add('loading');
        formMessage.className = 'form-message';
        formMessage.textContent = '';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'エラーが発生しました');
            }

            formMessage.className = 'form-message success';
            formMessage.textContent = 'お問い合わせを送信しました。2〜3営業日以内にご返信いたします。';
            form.reset();

        } catch (err) {
            console.error('Error:', err);
            formMessage.className = 'form-message error';
            formMessage.textContent = err.message || 'お問い合わせの送信中にエラーが発生しました。しばらく経ってから再度お試しください。';
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) validateField(input);
        });
    });
});

function validateForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const privacyAgree = document.getElementById('privacy-agree');

    let isValid = true;
    if (!validateField(name)) isValid = false;
    if (!validateField(email)) isValid = false;
    if (!validateField(message)) isValid = false;
    if (!validateField(privacyAgree)) isValid = false;
    return isValid;
}

function validateField(field) {
    const fieldName = field.id;
    const errorElement = document.getElementById(`${fieldName}-error`);
    let errorMessage = '';
    let isValid = true;

    field.classList.remove('error');

    if (fieldName === 'name') {
        if (!field.value.trim()) {
            errorMessage = 'お名前を入力してください';
            isValid = false;
        } else if (field.value.trim().length < 2) {
            errorMessage = 'お名前は2文字以上で入力してください';
            isValid = false;
        }
    } else if (fieldName === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!field.value.trim()) {
            errorMessage = 'メールアドレスを入力してください';
            isValid = false;
        } else if (!emailRegex.test(field.value.trim())) {
            errorMessage = '有効なメールアドレスを入力してください';
            isValid = false;
        }
    } else if (fieldName === 'message') {
        if (!field.value.trim()) {
            errorMessage = 'お問い合わせ内容を入力してください';
            isValid = false;
        } else if (field.value.trim().length < 10) {
            errorMessage = 'お問い合わせ内容は10文字以上で入力してください';
            isValid = false;
        }
    } else if (fieldName === 'privacy-agree') {
        if (!field.checked) {
            errorMessage = 'プライバシーポリシーに同意してください';
            isValid = false;
        }
    }

    if (errorElement) errorElement.textContent = errorMessage;
    if (!isValid) field.classList.add('error');
    return isValid;
}

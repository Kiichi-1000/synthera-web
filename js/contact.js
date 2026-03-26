const SUPABASE_URL = 'https://aencdwwzwfbvjwduyiws.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmNkd3d6d2Zidmp3ZHV5aXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjgzODcsImV4cCI6MjA5MDA0NDM4N30.o6TSqxKKtg2n0rRoguqdBdgBzmZQaIGLfSyoVnBtl9k';

let supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase module not loaded');
    }

    const form = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim(),
        };

        submitButton.disabled = true;
        submitButton.classList.add('loading');
        formMessage.className = 'form-message';
        formMessage.textContent = '';

        try {
            if (!supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error } = await supabaseClient
                .from('contact_submissions')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        message: formData.message,
                        ip_address: null,
                        user_agent: navigator.userAgent,
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            const emailSubject = encodeURIComponent(`【お問い合わせ】${formData.name}様より`);
            const emailBody = encodeURIComponent(
                `お名前: ${formData.name}\n` +
                `メールアドレス: ${formData.email}\n\n` +
                `お問い合わせ内容:\n${formData.message}\n\n` +
                `---\n` +
                `このメールは synthera ポートフォリオサイトのお問い合わせフォームから送信されました。\n` +
                `送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
            );

            const mailtoLink = `mailto:synthera.2025@gmail.com?subject=${emailSubject}&body=${emailBody}`;

            window.location.href = mailtoLink;

            formMessage.className = 'form-message success';
            formMessage.textContent = 'お問い合わせ内容を保存しました。メールアプリが開きますので、そちらから送信してください。';

            setTimeout(() => {
                form.reset();
            }, 1000);

        } catch (error) {
            console.error('Error submitting form:', error);
            formMessage.className = 'form-message error';
            formMessage.textContent = 'お問い合わせの送信中にエラーが発生しました。しばらく経ってから再度お試しください。';
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
});

function validateForm() {
    let isValid = true;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const privacyAgree = document.getElementById('privacy-agree');

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

    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    if (!isValid) {
        field.classList.add('error');
    }

    return isValid;
}

import './style.css'
import { initI18n } from './i18n.js'
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Initialize Swiper
const swiper = new Swiper('.mySwiper', {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 1.5,
            centeredSlides: true,
        },
    },
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
    });
});

// Header Scroll Effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scroll for Anchor Links (if browser doesn't support scroll-behavior: smooth in CSS)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formMessage = document.getElementById('form-message');
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.textContent;

        // Get Turnstile token
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileToken) {
            formMessage.textContent = '認証チェックを完了してください。';
            formMessage.className = 'form-message error';
            return;
        }

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';
        formMessage.className = 'form-message';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    type: document.getElementById('type').value,
                    message: document.getElementById('message').value,
                    turnstileToken,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                formMessage.textContent = data.message || '送信しました！';
                formMessage.className = 'form-message success';
                contactForm.reset();
                // Reset Turnstile widget
                if (window.turnstile) {
                    window.turnstile.reset();
                }
            } else {
                formMessage.textContent = data.error || '送信に失敗しました。';
                formMessage.className = 'form-message error';
            }
        } catch (err) {
            formMessage.textContent = '通信エラーが発生しました。再度お試しください。';
            formMessage.className = 'form-message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Initialize language switcher
initI18n();

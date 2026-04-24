import './style.css'
import './blog.css'
import { initI18n } from './i18n.js'
import { sanityClient, urlFor, portableTextToHtml } from './sanity-client.js'

// Initialize language switcher
initI18n();

// Mobile Menu Toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
}

// Fetch and render single blog post
async function fetchPost() {
    const loadingEl = document.getElementById('post-loading');
    const errorEl = document.getElementById('post-error');
    const contentEl = document.getElementById('post-content');

    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        loadingEl.style.display = 'none';
        errorEl.textContent = '記事のURLが不正です。';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const query = `*[_type == "post" && slug.current == $slug][0] {
            title,
            publishedAt,
            body,
            heroImage,
            "authorName": author->name,
            "authorAvatar": author->avatar,
            "authorRole": author->role,
            "authorBio": author->bio,
            "categories": categories[]->title
        }`;

        const post = await sanityClient.fetch(query, { slug });

        loadingEl.style.display = 'none';

        if (!post) {
            errorEl.style.display = 'block';
            return;
        }

        renderPost(post);
        contentEl.style.display = 'block';

        // Update page title
        document.title = `${post.title} | Studio VIBE Blog`;

    } catch (error) {
        console.error('Error fetching blog post:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

function renderPost(post) {
    // Basic elements
    const titleEl = document.getElementById('post-title');
    const dateEl = document.getElementById('post-date');
    const categoryEl = document.getElementById('post-category');
    const authorEl = document.getElementById('post-author');
    const heroEl = document.getElementById('post-hero');
    const bodyEl = document.getElementById('post-body');

    // Set title
    titleEl.textContent = post.title;

    // Set date
    dateEl.textContent = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Set categories
    if (post.categories && post.categories.length > 0) {
        categoryEl.innerHTML = post.categories.map(c => `<span class="category-tag">${c}</span>`).join('');
    }

    // Set author block
    const avatarUrl = post.authorAvatar ? urlFor(post.authorAvatar).width(200).height(200).url() : '/img/placeholder-avatar.png';
    authorEl.innerHTML = `
        <div class="author-info">
            <img src="${avatarUrl}" alt="${post.authorName}" class="author-avatar-large">
            <div class="author-details">
                <span class="author-name-large">${post.authorName}</span>
                ${post.authorRole ? `<span class="author-role">${post.authorRole}</span>` : ''}
            </div>
        </div>
    `;

    // Set hero image
    if (post.heroImage) {
        const heroUrl = urlFor(post.heroImage).width(1200).height(630).url();
        heroEl.innerHTML = `<img src="${heroUrl}" alt="${post.title}" class="hero-image">`;
    }

    // Render Portable Text to HTML
    if (post.body) {
        bodyEl.innerHTML = portableTextToHtml(post.body);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchPost);

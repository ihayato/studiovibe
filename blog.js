import './style.css'
import './blog.css'
import { initI18n } from './i18n.js'
import { sanityClient, urlFor } from './sanity-client.js'

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

// Fetch and render blog posts
async function fetchPosts() {
    const loadingEl = document.getElementById('blog-loading');
    const errorEl = document.getElementById('blog-error');
    const gridEl = document.getElementById('blog-grid');

    try {
        // Query to fetch posts, ordered by publish date
        const query = `*[_type == "post"] | order(publishedAt desc) {
            _id,
            title,
            slug,
            publishedAt,
            excerpt,
            heroImage,
            "authorName": author->name,
            "authorAvatar": author->avatar,
            "categories": categories[]->title
        }`;

        const posts = await sanityClient.fetch(query);

        // Hide loading, show grid
        loadingEl.style.display = 'none';

        if (posts.length === 0) {
            gridEl.innerHTML = '<p class="no-posts">まだ記事がありません。</p>';
        } else {
            // Render posts
            gridEl.innerHTML = posts.map(createPostCard).join('');
        }

        gridEl.style.display = 'grid';

    } catch (error) {
        console.error('Error fetching blog posts:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

function createPostCard(post) {
    // Format date string
    const date = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Handle image URL
    const imageUrl = post.heroImage ? urlFor(post.heroImage).width(600).height(400).url() : '/img/placeholder-blog.jpg';

    // Default avatar if none
    const avatarUrl = post.authorAvatar ? urlFor(post.authorAvatar).width(100).height(100).url() : '/img/placeholder-avatar.png';

    // Format categories
    const categoriesHtml = post.categories && post.categories.length > 0
        ? `<div class="post-categories">${post.categories.map(c => `<span class="category-tag">${c}</span>`).join('')}</div>`
        : '';

    return `
        <a href="/blog-post.html?slug=${post.slug.current}" class="blog-card">
            <div class="blog-card-image">
                <img src="${imageUrl}" alt="${post.title}">
            </div>
            <div class="blog-card-content">
                ${categoriesHtml}
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt || ''}</p>
                
                <div class="blog-card-footer">
                    <div class="blog-author">
                        <img src="${avatarUrl}" alt="${post.authorName}" class="author-avatar-small">
                        <span class="author-name">${post.authorName}</span>
                    </div>
                    <span class="blog-date">${date}</span>
                </div>
            </div>
        </a>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchPosts);

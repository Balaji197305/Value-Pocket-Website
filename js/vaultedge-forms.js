/**
 * VaultEdge client-side form processing, storage mock, and notifications
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Inject Toast CSS
    injectToastStyles();

    // 2. Setup Form Handlers
    setupNewsletterHandlers();
    setupBookingHandlers();
    setupCommentHandlers();
});

/**
 * Injects a clean, modern toast notification styling matching the VaultEdge theme
 */
function injectToastStyles() {
    const css = `
        .ve-toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            width: calc(100% - 40px);
        }
        .ve-toast {
            background: #111a24;
            color: #ffffff;
            border-left: 4px solid #f4b400;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ve-toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        .ve-toast-success {
            border-left-color: #2ec4b6;
        }
        .ve-toast-info {
            border-left-color: #0077b6;
        }
        .ve-toast-error {
            border-left-color: #e63946;
        }
        .ve-toast-close {
            background: transparent;
            border: none;
            color: #a0aec0;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            line-height: 1;
            transition: color 0.2s;
        }
        .ve-toast-close:hover {
            color: #ffffff;
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

/**
 * Show a customized toast notification
 */
function showToast(message, type = 'success') {
    let container = document.querySelector('.ve-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 've-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ve-toast ve-toast-${type}`;
    
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap: 10px;">
            <span style="font-size:18px;">${icon}</span>
            <span>${message}</span>
        </div>
        <button class="ve-toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 50);

    // Close button
    toast.querySelector('.ve-toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto dismiss
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.classList.remove('show');
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 400);
}

/**
 * Intercepts newsletter submissions and stores them in localStorage
 */
function setupNewsletterHandlers() {
    const forms = document.querySelectorAll('.ve-nl-form');
    forms.forEach(form => {
        form.removeAttribute('action');
        form.removeAttribute('method');
        
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (!input) return;

            const email = input.value.trim();
            if (!email) {
                showToast('Please enter your email address.', 'error');
                return;
            }

            // Get existing newsletter subscribers
            let subscribers = [];
            try {
                subscribers = JSON.parse(localStorage.getItem('vaultedge_newsletter_subscribers')) || [];
            } catch (err) {
                subscribers = [];
            }

            if (subscribers.includes(email)) {
                showToast('You are already subscribed to our newsletter.', 'info');
            } else {
                subscribers.push(email);
                localStorage.setItem('vaultedge_newsletter_subscribers', JSON.stringify(subscribers));
                showToast('Thank you! You have successfully subscribed to our newsletter.', 'success');
                input.value = '';
            }
        });
    });
}

/**
 * Intercepts consultation booking submissions and stores them in localStorage
 */
function setupBookingHandlers() {
    const form = document.querySelector('.ve-contact-form[action="submit-booking.php"]');
    if (!form) return;

    form.removeAttribute('action');
    form.removeAttribute('method');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const fullNameInput = form.querySelector('input[name="full_name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const serviceSelect = form.querySelector('select[name="service"]');
        const messageTextarea = form.querySelector('textarea[name="message"]');

        if (!fullNameInput || !emailInput) return;

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const service = serviceSelect ? serviceSelect.value : '';
        const message = messageTextarea ? messageTextarea.value.trim() : '';

        if (!fullName || !email) {
            showToast('Please fill in all required fields (Full Name and Email Address).', 'error');
            return;
        }

        // Get existing bookings
        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('vaultedge_bookings')) || [];
        } catch (err) {
            bookings = [];
        }

        const newBooking = {
            id: 'b_' + Date.now(),
            fullName,
            email,
            phone,
            service,
            message,
            timestamp: new Date().toISOString()
        };

        bookings.push(newBooking);
        localStorage.setItem('vaultedge_bookings', JSON.stringify(bookings));

        showToast('Thank you! Your consultation booking has been submitted. We will contact you soon.', 'success');
        
        // Reset form
        form.reset();
    });
}

/**
 * Handles comments submission, dynamic rendering and persistence
 */
function setupCommentHandlers() {
    const commentsContainer = document.getElementById('dynamic-comments');
    const commentForm = document.querySelector('.ve-contact-form[action="post-comment.php"]');
    const commentHeading = document.getElementById('ve-comments-heading');

    // Static default comments details (must match HTML exactly)
    const baseCommentCount = 3;

    function loadAndRenderComments() {
        let comments = [];
        try {
            comments = JSON.parse(localStorage.getItem('vaultedge_comments')) || [];
        } catch (err) {
            comments = [];
        }

        if (commentHeading) {
            const total = baseCommentCount + comments.length;
            commentHeading.textContent = `${total} Comments`;
        }

        if (!commentsContainer) return;

        commentsContainer.innerHTML = '';
        comments.forEach(c => {
            const dateStr = formatDate(c.timestamp);
            const commentEl = document.createElement('div');
            commentEl.className = 've-comment';
            commentEl.innerHTML = `
                <div class="ve-comment-avatar bg-img" style="background-image:url(img/bg-img/14.jpg); background-color: #f4b400; background-position: center; background-size: cover;"></div>
                <div class="ve-comment-body">
                    <div class="ve-comment-meta">
                        <strong>${escapeHTML(c.name)}</strong>
                        <span>${dateStr}</span>
                    </div>
                    <p>${escapeHTML(c.comment).replace(/\n/g, '<br>')}</p>
                    <a href="#" class="ve-reply-btn">Reply</a>
                </div>
            `;
            commentsContainer.appendChild(commentEl);
        });
    }

    // Initialize display
    loadAndRenderComments();

    if (!commentForm) return;

    commentForm.removeAttribute('action');
    commentForm.removeAttribute('method');

    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameInput = commentForm.querySelector('input[name="name"]');
        const emailInput = commentForm.querySelector('input[name="email"]');
        const commentTextarea = commentForm.querySelector('textarea[name="comment"]');

        if (!nameInput || !emailInput || !commentTextarea) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const comment = commentTextarea.value.trim();

        if (!name || !email || !comment) {
            showToast('Please fill in all required fields (Name, Email, and Comment).', 'error');
            return;
        }

        let comments = [];
        try {
            comments = JSON.parse(localStorage.getItem('vaultedge_comments')) || [];
        } catch (err) {
            comments = [];
        }

        const newComment = {
            id: 'c_' + Date.now(),
            name,
            email,
            comment,
            timestamp: new Date().toISOString()
        };

        comments.push(newComment);
        localStorage.setItem('vaultedge_comments', JSON.stringify(comments));

        showToast('Your comment has been posted successfully!', 'success');
        
        // Reset comment form
        nameInput.value = '';
        emailInput.value = '';
        commentTextarea.value = '';

        // Re-render comments list
        loadAndRenderComments();
    });
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return `${month} ${day}, ${year}, ${hours}:${minutesStr} ${ampm}`;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

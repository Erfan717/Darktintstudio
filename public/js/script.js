document.addEventListener('DOMContentLoaded', () => {
    // Mobile hamburger menu
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);

        const setIcon = (name) => {
            menuToggle.innerHTML = `<i data-lucide="${name}"></i>`;
            if (window.lucide) {
                window.lucide.createIcons();
            }
        };

        const closeMenu = () => {
            navLinks.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.classList.remove('nav-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            setIcon('menu');
        };

        const openMenu = () => {
            navLinks.classList.add('active');
            backdrop.classList.add('active');
            document.body.classList.add('nav-open');
            menuToggle.setAttribute('aria-expanded', 'true');
            setIcon('x');
        };

        menuToggle.setAttribute('aria-controls', 'nav-links');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Åpne meny');

        menuToggle.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        backdrop.addEventListener('click', closeMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    // Smooth accordion animation for FAQ items, one open at a time
    const faqItems = document.querySelectorAll('.faq-item');

    const closeFaqItem = (item) => {
        const answer = item.querySelector('.faq-answer');
        if (!item.open || !answer) return;

        answer.style.height = answer.scrollHeight + 'px';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                answer.style.height = '0px';
            });
        });

        answer.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'height') return;
            answer.removeEventListener('transitionend', handler);
            item.open = false;
            answer.style.height = '';
        });
    };

    const openFaqItem = (item) => {
        const answer = item.querySelector('.faq-answer');
        if (!answer) return;

        item.open = true;
        answer.style.height = '0px';
        const targetHeight = answer.scrollHeight + 'px';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                answer.style.height = targetHeight;
            });
        });

        answer.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'height') return;
            answer.removeEventListener('transitionend', handler);
            answer.style.height = 'auto';
        });
    };

    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        if (!summary) return;

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            const wasOpen = item.open;

            faqItems.forEach(other => {
                if (other !== item && other.open) closeFaqItem(other);
            });

            if (wasOpen) {
                closeFaqItem(item);
            } else {
                openFaqItem(item);
            }
        });
    });

    // Reveal elements on scroll
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        for (let i = 0; i < revealElements.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = revealElements[i].getBoundingClientRect().top;
            const elementBottom = revealElements[i].getBoundingClientRect().bottom;
            const elementVisible = 100;
            
            // Sjekker om toppen av elementet er synlig (scrolling ned)
            // ELLER om bunnen av elementet er synlig (scrolling opp)
            if (elementTop < windowHeight - elementVisible && elementBottom > elementVisible) {
                revealElements[i].classList.add('active');
            } else {
                // Fjerner klassen når elementet er utenfor skjermen
                // Dette gjør at det animeres på nytt når man scroller tilbake
                revealElements[i].classList.remove('active');
            }
        }
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once on load
    
    // Smooth scrolling for navigation links (only for anchors on the same page)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact form submission via FormSubmit AJAX
    document.querySelectorAll('.contact-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sender...';
            btn.disabled = true;

            let msgEl = form.querySelector('.form-message');
            if (!msgEl) {
                msgEl = document.createElement('p');
                msgEl.className = 'form-message';
                form.appendChild(msgEl);
            }
            msgEl.textContent = '';
            msgEl.className = 'form-message';

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    form.reset();
                    msgEl.textContent = 'Takk for henvendelsen! Vi tar kontakt med deg så snart som mulig.';
                    msgEl.classList.add('form-message--success');
                } else {
                    throw new Error('Send feilet');
                }
            } catch (err) {
                msgEl.textContent = 'Noe gikk galt. Prøv igjen eller send oss en e-post direkte.';
                msgEl.classList.add('form-message--error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    });

    // Newsletter form submission via Brevo, without leaving the page
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sender...';
            btn.disabled = true;

            let msgEl = form.querySelector('.form-message');
            if (!msgEl) {
                msgEl = document.createElement('p');
                msgEl.className = 'form-message';
                form.appendChild(msgEl);
            }
            msgEl.textContent = '';
            msgEl.className = 'form-message';

            try {
                const formData = new FormData(form);
                // Brevo's form endpoint doesn't return CORS headers, so the
                // response can't be read (mode: 'no-cors'). A network-level
                // failure still lands in the catch block below.
                await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                });

                form.reset();
                msgEl.textContent = 'Sjekk e-posten din for å bekrefte påmeldingen!';
                msgEl.classList.add('form-message--success');
            } catch (err) {
                msgEl.textContent = 'Noe gikk galt. Prøv igjen senere.';
                msgEl.classList.add('form-message--error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    });
});

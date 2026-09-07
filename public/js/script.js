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

    // Match the service-page image gallery height to the text column,
    // so the images line up with the heading above and the last sentence below
    const syncServiceGallery = () => {
        document.querySelectorAll('.service-body').forEach(body => {
            const content = body.querySelector('.service-content');
            const gallery = body.querySelector('.service-gallery');
            if (!content || !gallery) return;

            if (window.innerWidth <= 768) {
                gallery.style.height = '';
            } else {
                gallery.style.height = content.offsetHeight + 'px';
            }
        });
    };

    syncServiceGallery();
    window.addEventListener('load', syncServiceGallery);
    window.addEventListener('resize', syncServiceGallery);

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
                // The plain endpoint answers 200 with an HTML page even when it
                // refuses to deliver, so a 200 says nothing. The /ajax/ endpoint
                // returns JSON that states whether the message actually went out.
                const url = form.action.replace(
                    'https://formsubmit.co/',
                    'https://formsubmit.co/ajax/'
                );
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                let result = null;
                try {
                    result = await response.json();
                } catch (parseErr) {
                    result = null;
                }

                // FormSubmit reports success as the string "true", not a boolean.
                const delivered = result && String(result.success) === 'true';

                if (delivered) {
                    form.reset();
                    msgEl.textContent = 'Takk for henvendelsen! Vi tar kontakt med deg så snart som mulig.';
                    msgEl.classList.add('form-message--success');
                } else {
                    console.warn('Skjemaet ble ikke levert av FormSubmit:', response.status, result);
                    msgEl.textContent = 'Vi fikk ikke sendt henvendelsen. Ring oss på 400 45 037 ' +
                        'eller send en e-post til post@darktintstudio.no.';
                    msgEl.classList.add('form-message--error');
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
                // Brevo's own form script posts to ?isAjax=1, which makes the
                // endpoint answer with JSON instead of a full HTML page. It
                // does send CORS headers, so the reply can be read directly.
                const url = form.action + (form.action.includes('?') ? '&' : '?') + 'isAjax=1';
                const res = await fetch(url, {
                    method: 'POST',
                    body: formData
                });

                let result = null;
                try {
                    result = await res.json();
                } catch (parseErr) {
                    result = null;
                }

                if (result && result.success) {
                    form.reset();
                    msgEl.textContent = result.message || 'Sjekk e-posten din for å bekrefte påmeldingen!';
                    msgEl.classList.add('form-message--success');
                } else {
                    // Brevo answers in English whatever locale we send, so keep
                    // the visible text Norwegian and log the detail instead.
                    console.warn('Nyhetsbrev-påmelding avvist av Brevo:', res.status, result);
                    msgEl.textContent = 'Vi fikk ikke registrert påmeldingen. Sjekk e-postadressen og prøv igjen.';
                    msgEl.classList.add('form-message--error');
                }
            } catch (err) {
                msgEl.textContent = 'Noe gikk galt. Prøv igjen senere.';
                msgEl.classList.add('form-message--error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    });

    // Showcase project modal: clone the card's <template> into the dialog
    const showcaseGrid = document.querySelector('.showcase-grid');
    const showcaseModal = document.getElementById('showcase-modal');

    if (showcaseGrid && showcaseModal) {
        const modalContent = showcaseModal.querySelector('.showcase-modal__content');
        const closeBtn = showcaseModal.querySelector('.showcase-modal__close');
        let lastFocused = null;

        const openModal = (template) => {
            modalContent.innerHTML = '';
            modalContent.appendChild(template.content.cloneNode(true));
            showcaseModal.hidden = false;
            document.body.classList.add('nav-open');
            if (closeBtn) closeBtn.focus();
        };

        const closeModal = () => {
            showcaseModal.hidden = true;
            document.body.classList.remove('nav-open');
            modalContent.innerHTML = '';
            if (lastFocused) lastFocused.focus();
        };

        showcaseGrid.querySelectorAll('.showcase-card').forEach(card => {
            const trigger = card.querySelector('.showcase-card__trigger');
            const template = card.querySelector('.showcase-card__detail');
            if (!trigger || !template) return;

            trigger.addEventListener('click', () => {
                lastFocused = trigger;
                openModal(template);
            });
        });

        showcaseModal.querySelectorAll('[data-close]').forEach(el => {
            el.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !showcaseModal.hidden) {
                closeModal();
            }
        });
    }
});

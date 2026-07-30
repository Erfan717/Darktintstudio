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

    // Flip service cards on click (only one flipped at a time)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const wasFlipped = card.classList.contains('flipped');
            serviceCards.forEach(c => c.classList.remove('flipped'));
            if (!wasFlipped) {
                card.classList.add('flipped');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener("DOMContentLoaded", () => {
    // Marquee animation script
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        const items = document.querySelectorAll('.marquee .cta-quote-card');
        let offset = 0;
        let animationFrameId;

        function update() {
            offset -= 0.7;
            items.forEach((item, index) => {
                const y = (index * (-5)) + offset;
                let rotation;
                switch (index % 3) {
                    case 0:
                        rotation = 5;
                        break;
                    case 1:
                        rotation = -5;
                        break;
                    case 2:
                        rotation = 2;
                        break;
                }
                item.style.transform = `translate3d(0px, ${y}px, 0px) rotateZ(${rotation}deg)`;
                
                if (index % 3 === 0) {
                    item.style.opacity = 1;
                } else if (y < 0 && y > -300) {
                    item.style.opacity = 1 - ((300 + y) / 300);
                } else {
                    item.style.opacity = 1;
                }
            });

            if (-offset >= (250) * items.length) {
                offset = 0;
            }
            animationFrameId = requestAnimationFrame(update);
        }

        update();

        marquee.addEventListener('mouseenter', () => {
            cancelAnimationFrame(animationFrameId);
        });

        marquee.addEventListener('mouseleave', () => {
            update();
        });
    }

    // Copyright year update
    const currentYear = new Date().getFullYear();
    const footerElement = document.querySelector('.footer-link');
    if(footerElement && footerElement.textContent.includes('©')) {
        footerElement.textContent = footerElement.textContent.replace(/© \d{4}/, '© ' + currentYear);
    }

    // Mobile Navigation Toggle
    const navButton = document.querySelector('.menu-button-4');
    const navOverlay = document.querySelector('.w-nav-overlay');
    const navMenu = document.querySelector('.nav-menu-3');
    let isNavOpen = false;

    function toggleNav() {
        isNavOpen = !isNavOpen;
        if (isNavOpen) {
            if (navOverlay && navMenu) {
                navOverlay.style.display = 'block';
                navOverlay.appendChild(navMenu.cloneNode(true));
            }
            document.body.style.overflow = 'hidden';
        } else {
            if (navOverlay) {
                navOverlay.style.display = 'none';
                navOverlay.innerHTML = '';
            }
            document.body.style.overflow = 'auto';
        }
    }

    if (navButton) {
        navButton.addEventListener('click', toggleNav);
    }

    // Close mobile nav when clicking outside
    if (navOverlay) {
        navOverlay.addEventListener('click', function(e) {
            if (e.target === navOverlay) {
                toggleNav();
            }
        });
    }

    // Desktop Dropdown Functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.w-dropdown-toggle');
        const list = dropdown.querySelector('.dropdown-list');
        
        if (toggle && list) {
            // Show dropdown on hover for desktop
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 991) {
                    dropdown.classList.add('w--open');
                    list.style.display = 'block';
                }
            });
            
            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 991) {
                    dropdown.classList.remove('w--open');
                    list.style.display = 'none';
                }
            });
            
            // Click functionality for mobile
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 991) {
                    e.preventDefault();
                    dropdown.classList.toggle('w--open');
                    if (dropdown.classList.contains('w--open')) {
                        list.style.display = 'block';
                    } else {
                        list.style.display = 'none';
                    }
                }
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991 && isNavOpen) {
            toggleNav();
        }
        
        // Reset dropdown states on resize
        dropdowns.forEach(dropdown => {
            const list = dropdown.querySelector('.dropdown-list');
            if (list) {
                dropdown.classList.remove('w--open');
                list.style.display = 'none';
            }
        });
    });

    // Initialize markdown blog loader
    console.log('Checking for MarkdownLoader...');
    if (window.MarkdownLoader) {
        console.log('MarkdownLoader found, initializing...');
        const markdownLoader = new MarkdownLoader();
        
        // Load the markdown file and render the blog content
        console.log('Starting to load markdown content...');
        markdownLoader.loadAndRenderBlog(
            'URL_ Los Algodones - Pillar Topic.md', 
            '#blog-content'
        ).then((result) => {
            console.log('Markdown loading completed successfully:', result);
            // Hide loading state
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.style.display = 'none';
                console.log('Loading state hidden');
            }
            // Remove any <h1> tags inside #blog-content
            const blogContent = document.getElementById('blog-content');
            if (blogContent) {
                const h1s = blogContent.querySelectorAll('h1');
                h1s.forEach(h1 => h1.remove());
            }
        }).catch(error => {
            console.error('Failed to load blog content:', error);
            // Show error message
            const blogContent = document.getElementById('blog-content');
            if (blogContent) {
                blogContent.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Unable to load blog content. Please refresh the page to try again.</p>';
            }
        });
    } else {
        console.error('MarkdownLoader not found on window object');
    }
}); 
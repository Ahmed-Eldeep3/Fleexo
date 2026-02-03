// ==========================================
// STORYLINE SCRIPT - SHIPFLOW CINEMATIC
// ==========================================

// Profit Counter
let profitValue = 0;
const profitCounter = document.getElementById('profitCounter');

function animateProfitCounter() {
    const targetProfit = Math.min(profitValue + Math.random() * 500, 50000);
    const duration = 2000;
    const startTime = Date.now();
    const startValue = profitValue;

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        profitValue = startValue + (targetProfit - startValue) * progress;
        profitCounter.textContent = Math.floor(profitValue).toLocaleString('ar-EG');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Start profit counter animation
setInterval(animateProfitCounter, 3000);

// ==========================================
// GLASS SHATTER EFFECT
// ==========================================
class GlassShatter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.shards = [];
        this.isAnimating = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createShards() {
        this.shards = [];
        const cols = 10;
        const rows = 8;
        const w = this.canvas.width / cols;
        const h = this.canvas.height / rows;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.shards.push({
                    x: i * w,
                    y: j * h,
                    w: w,
                    h: h,
                    vx: (Math.random() - 0.5) * 20,
                    vy: Math.random() * 10 + 5,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    alpha: 1
                });
            }
        }
    }
    
    trigger() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        document.getElementById('glassShatter').classList.add('active');
        this.createShards();
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let allOffScreen = true;
        
        this.shards.forEach(shard => {
            shard.y += shard.vy;
            shard.x += shard.vx;
            shard.vy += 0.5; // gravity
            shard.rotation += shard.rotationSpeed;
            shard.alpha -= 0.01;
            
            if (shard.y < this.canvas.height + 100) {
                allOffScreen = false;
            }
            
            if (shard.alpha > 0) {
                this.ctx.save();
                this.ctx.translate(shard.x + shard.w / 2, shard.y + shard.h / 2);
                this.ctx.rotate(shard.rotation);
                this.ctx.globalAlpha = shard.alpha;
                this.ctx.fillStyle = `rgba(99, 102, 241, 0.3)`;
                this.ctx.fillRect(-shard.w / 2, -shard.h / 2, shard.w, shard.h);
                this.ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
                this.ctx.strokeRect(-shard.w / 2, -shard.h / 2, shard.w, shard.h);
                this.ctx.restore();
            }
        });
        
        if (!allOffScreen) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
            document.getElementById('glassShatter').classList.remove('active');
        }
    }
}

const glassShatter = new GlassShatter('shatterCanvas');

// ==========================================
// SCROLL-TRIGGERED ANIMATIONS WITH GSAP
// ==========================================
function initGSAPAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Trigger glass shatter on scroll past chaos scene
    ScrollTrigger.create({
        trigger: '.scene-chaos',
        start: 'bottom bottom',
        once: true,
        onEnter: () => {
            glassShatter.trigger();
        }
    });
    
    // Animate solution scene
    gsap.from('.logo-reveal', {
        scrollTrigger: {
            trigger: '.scene-solution',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        scale: 0.5,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out'
    });
    
    // Coins Demo Animation
    ScrollTrigger.create({
        trigger: '.scene-coins',
        start: 'top center',
        onEnter: () => animateCoinsDemo()
    });
    
    // Snipe Demo Animation
    ScrollTrigger.create({
        trigger: '.scene-snipe',
        start: 'top center',
        onEnter: () => animateSnipeDemo()
    });
    
    // Screen Steps Animation
    gsap.utils.toArray('.screen-step').forEach(step => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            onEnter: () => step.classList.add('visible')
        });
    });
    
    // Dashboard Stats Animation
    ScrollTrigger.create({
        trigger: '.scene-dashboard',
        start: 'top center',
        onEnter: () => animateDashboardStats()
    });
}

// ==========================================
// COINS MECHANISM ANIMATION
// ==========================================
function animateCoinsDemo() {
    const timeline = gsap.timeline();
    
    // Step 1: Show couriers with empty wallets
    timeline.from('.courier-card', {
        opacity: 0,
        y: 50,
        stagger: 0.3,
        duration: 0.6
    });
    
    // Step 2: Show order notification after 1 second
    timeline.to('.order-notification', {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        onStart: () => {
            document.querySelector('.order-notification').classList.add('visible');
        }
    }, '+=1');
    
    // Step 3: Try to accept (show error)
    timeline.to('.error-messages', {
        delay: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        onStart: () => {
            document.querySelector('.error-messages').classList.add('visible');
            // Play error sound if available
        }
    });
    
    // Step 4: Show solution (charge wallet)
    timeline.to('.charge-solution', {
        delay: 1.5,
        opacity: 1,
        duration: 0.5,
        onStart: () => {
            document.querySelector('.charge-solution').classList.add('visible');
        }
    });
    
    // Setup charge button handlers
    setupChargeButtons();
}

function setupChargeButtons() {
    const buttons = document.querySelectorAll('.charge-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const courierType = button.getAttribute('data-courier');
            const walletId = courierType === 'freelance' ? 'freelanceWallet' : 'staffWallet';
            const wallet = document.getElementById(walletId);
            const courierCard = document.querySelector(`.courier-card.${courierType}`);
            const status = courierCard.querySelector('.courier-status');
            
            // Animate wallet charging
            animateWalletCharge(wallet, 0, 100, () => {
                // Update status
                status.setAttribute('data-status', 'ready');
                status.innerHTML = '<span class="status-icon">✅</span><span class="status-text">جاهز للقنص</span>';
                
                // Check if both are ready
                if (document.querySelectorAll('[data-status="ready"]').length === 2) {
                    // Show success state
                    setTimeout(() => {
                        document.querySelector('.error-messages').classList.remove('visible');
                        document.querySelector('.charge-solution').classList.remove('visible');
                        document.querySelector('.success-state').classList.add('visible');
                    }, 500);
                }
            });
        });
    });
}

function animateWalletCharge(element, from, to, callback) {
    const duration = 1500;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = from + (to - from) * progress;
        
        element.textContent = Math.floor(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (callback) {
            callback();
        }
    }
    
    update();
}

// ==========================================
// SNIPE RACE ANIMATION
// ==========================================
function animateSnipeDemo() {
    const timeline = gsap.timeline();
    
    // Step 1: Show restaurant with radar
    timeline.from('.map-marker.restaurant', {
        scale: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    });
    
    // Step 2: Show couriers
    timeline.to('.map-marker.courier', {
        opacity: 1,
        stagger: 0.1,
        duration: 0.3,
        onStart: () => {
            document.querySelectorAll('.map-marker.courier').forEach(c => c.classList.add('visible'));
        }
    }, '+=0.5');
    
    // Step 3: Show countdown
    timeline.to('.countdown-timer', {
        opacity: 1,
        duration: 0.3,
        onStart: () => {
            document.querySelector('.countdown-timer').classList.add('visible');
            startCountdown();
        }
    }, '+=0.5');
    
    // Step 4: After countdown, show winner
    timeline.call(() => {
        setTimeout(() => {
            showSnipeWinner();
        }, 5500);
    });
}

function startCountdown() {
    let count = 5;
    const countdownValue = document.getElementById('countdownValue');
    
    const interval = setInterval(() => {
        count--;
        countdownValue.textContent = count;
        
        if (count <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

function showSnipeWinner() {
    // Hide countdown
    document.querySelector('.countdown-timer').classList.remove('visible');
    
    // Show winner line
    document.querySelector('.winner-line').classList.add('visible');
    
    // Highlight winner courier
    document.querySelector('.map-marker.c1').style.transform = 'scale(1.3)';
    document.querySelector('.map-marker.c1').style.zIndex = '10';
    
    // Show snipe alert
    setTimeout(() => {
        document.querySelector('.snipe-alert').classList.add('visible');
    }, 500);
    
    // Hide other couriers and show dismissed notification
    setTimeout(() => {
        document.querySelectorAll('.map-marker.courier:not(.c1)').forEach(c => {
            c.style.opacity = '0.3';
        });
        document.querySelector('.dismissed-notification').classList.add('visible');
    }, 1500);
}

// ==========================================
// DASHBOARD STATS ANIMATION
// ==========================================
function animateDashboardStats() {
    // Animate live orders
    animateStatValue('liveOrders', 0, 24, 2000);
    
    // Animate active couriers
    animateStatValue('activeCouriers', 0, 47, 2000);
    
    // Animate today revenue
    animateStatValue('todayRevenue', 0, 12450, 2500, true);
    
    // Animate coins used
    animateStatValue('coinsUsed', 0, 3280, 2000, true);
}

function animateStatValue(elementId, from, to, duration, withComma = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = from + (to - from) * progress;
        
        if (withComma) {
            element.textContent = Math.floor(current).toLocaleString('ar-EG');
        } else {
            element.textContent = Math.floor(current);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// ==========================================
// SCREEN INTERACTION HANDLERS
// ==========================================
function initScreenInteractions() {
    // Order button in customer app
    const orderButtons = document.querySelectorAll('.order-button');
    orderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = 'جاري المعالجة...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'تم الإرسال ✓';
                btn.style.background = 'linear-gradient(135deg, #10b981, #14b8a6)';
            }, 1000);
        });
    });
    
    // Accept order in restaurant panel
    const acceptOrders = document.querySelectorAll('.accept-order');
    acceptOrders.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = 'جاري البث للمناديب...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'تم البث ✓';
            }, 1000);
        });
    });
    
    // Snipe button
    const snipeButtons = document.querySelectorAll('.snipe-button');
    snipeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = 'جاري القنص...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'تم القنص! ✓';
                btn.style.background = 'linear-gradient(135deg, #10b981, #14b8a6)';
            }, 800);
        });
    });
    
    // Star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('filled');
                } else {
                    s.classList.remove('filled');
                }
            });
        });
    });
}

// ==========================================
// PARALLAX EFFECTS
// ==========================================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Parallax for phone mockups
        document.querySelectorAll('.phone-mockup, .tablet-mockup').forEach((mockup, index) => {
            const speed = (index % 2 === 0) ? 0.2 : -0.2;
            mockup.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ==========================================
// SMOOTH SCROLL FOR LINKS
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================
// MAGNETIC CURSOR EFFECT
// ==========================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.cta-btn, .accept-button, .snipe-button');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

// ==========================================
// INTERSECTION OBSERVER
// ==========================================
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.screen-step, .feature-item, .stat-box').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// LIVE UPDATES SIMULATION
// ==========================================
function simulateLiveUpdates() {
    setInterval(() => {
        // Random update to live orders
        const liveOrders = document.getElementById('liveOrders');
        if (liveOrders && Math.random() > 0.5) {
            const currentValue = parseInt(liveOrders.textContent);
            const newValue = currentValue + Math.floor(Math.random() * 3) - 1;
            if (newValue >= 0) {
                liveOrders.textContent = newValue;
            }
        }
    }, 5000);
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press 'S' to trigger glass shatter
        if (e.key === 's' || e.key === 'S') {
            glassShatter.trigger();
        }
        
        // Press 'R' to restart animations
        if (e.key === 'r' || e.key === 'R') {
            ScrollTrigger.refresh();
        }
    });
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
function logPerformance() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                            window.performance.timing.navigationStart;
            console.log(`⚡ Storyline loaded in ${loadTime}ms`);
        });
    }
}

// ==========================================
// INITIALIZE EVERYTHING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 ShipFlow Storyline Initializing...');
    
    // Initialize GSAP animations
    initGSAPAnimations();
    
    // Initialize screen interactions
    initScreenInteractions();
    
    // Initialize parallax
    initParallax();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize magnetic buttons
    initMagneticButtons();
    
    // Initialize intersection observer
    initIntersectionObserver();
    
    // Start live updates simulation
    simulateLiveUpdates();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Log performance
    logPerformance();
    
    console.log('✅ ShipFlow Storyline Ready!');
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations
    gsap.globalTimeline.timeScale(0);
    console.log('⚠️ Animations disabled (prefers-reduced-motion)');
}
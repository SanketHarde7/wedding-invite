// ===== WEDDING INVITATION - INTERACTIVE FEATURES =====

// Configuration
const WEDDING_DATE = new Date('2026-04-21T20:00:00');

// DOM Elements
const openingScreen = document.getElementById('opening-screen');
const weddingCard = document.getElementById('wedding-card');
const openBtn = document.getElementById('open-btn');
const mainContent = document.getElementById('main-content');
const musicControl = document.getElementById('music-control');
const muteBtn = document.getElementById('mute-btn');
const musicIcon = document.getElementById('music-icon');
const weddingMusic = document.getElementById('wedding-music');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const particlesContainer = document.getElementById('particles-container');
const cursorSparkle = document.getElementById('cursor-sparkle');
const scratchCanvas = document.getElementById('scratch-canvas');
const blessingForm = document.getElementById('blessing-form');
const successMessage = document.getElementById('success-message');

// State
let isMusicPlaying = false;
let fireworksInterval = null;
let isFireworksAnimating = false;
let isScratched = false;

// ===== WEDDING CARD OPENING =====
openBtn.addEventListener('click', openWeddingCard);

function openWeddingCard() {
    // Add opened class to flip the card
    weddingCard.classList.add('opened');
    
    // Play music
    playMusic();
   
    
    // Trigger fireworks
    setTimeout(() => {
        startFireworks();
    }, 800);
    
    // Hide opening screen and show main content
    setTimeout(() => {
        openingScreen.classList.add('closing');
        
        setTimeout(() => {
            openingScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.classList.add('visible');
            musicControl.classList.remove('hidden');
            
            // Initialize other features
            initParticles();
            initScrollAnimations();
            initScratchReveal();
        }, 1000);
    }, 2500);
    
    // Stop fireworks after 5 seconds
    setTimeout(stopFireworks, 5800);
}

// ===== MUSIC CONTROL =====
function playMusic() {
    weddingMusic.loop = true;

    // Start from 0 volume
    weddingMusic.volume = 0;

    weddingMusic.play()
        .then(() => {
            isMusicPlaying = true;
            updateMusicIcon();

            // 🔥 Fade-in logic
            let vol = 0;
            const fade = setInterval(() => {
                if (vol < 0.5) {
                    vol += 0.02;
                    weddingMusic.volume = vol;
                } else {
                    clearInterval(fade);
                }
            }, 100);

        })
        .catch(err => {
            console.log('Play failed:', err);
        });
}

muteBtn.addEventListener('click', toggleMusic);

function toggleMusic() {
    if (isMusicPlaying) {
        weddingMusic.pause();
        muteBtn.classList.add('muted');
    } else {
        weddingMusic.play();
        muteBtn.classList.remove('muted');
    }
    isMusicPlaying = !isMusicPlaying;
    updateMusicIcon();
}

function updateMusicIcon() {
    musicIcon.textContent = isMusicPlaying ? '🔊' : '🔇';
}

// ===== FIREWORKS EFFECT =====
const ctx = fireworksCanvas.getContext('2d');
let fireworks = [];
let particles = [];

function resizeCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Firework {
    constructor() {
        this.x = Math.random() * fireworksCanvas.width;
        this.y = fireworksCanvas.height;
        this.targetY = Math.random() * (fireworksCanvas.height * 0.4) + 50;
        this.speed = Math.random() * 3 + 4;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.hue = Math.random() * 60 + 30;
        this.brightness = Math.random() * 30 + 50;
        this.exploded = false;
        this.trail = [];
    }
    
    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        
        if (this.y <= this.targetY || this.vy >= 0) {
            this.explode();
        }
    }
    
    explode() {
        this.exploded = true;
        const particleCount = Math.random() * 30 + 30;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.hue));
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
        for (let point of this.trail) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.hue = hue + Math.random() * 30 - 15;
        this.brightness = Math.random() * 30 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.gravity = 0.05;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.alpha -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function animateFireworks() {
    isFireworksAnimating = true;

    // Bug 2 Fix: ALWAYS reset to source-over before fill
    // 'lighter' was leaking from previous frame, making fillRect (black) a no-op
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Draw rocket trails with source-over
    fireworks = fireworks.filter(fw => {
        if (!fw.exploded) {
            fw.update();
            fw.draw();
            return true;
        }
        return false;
    });

    // Draw explosion particles with lighter (additive glow)
    ctx.globalCompositeOperation = 'lighter';
    particles = particles.filter(p => {
        if (p.alpha > 0) {
            p.update();
            p.draw();
            return true;
        }
        return false;
    });

    // Bug 1 Fix: Keep loop alive while interval is still running,
    // so newly added fireworks get rendered even when arrays are briefly empty
    if (fireworksInterval !== null || fireworks.length > 0 || particles.length > 0) {
        requestAnimationFrame(animateFireworks);
    } else {
        isFireworksAnimating = false;
        ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
}

function startFireworks() {
    // Bug 1 Fix: Push first firework immediately so the animation loop
    // has something to render on frame 1 and doesn't exit early
    fireworks.push(new Firework());

    fireworksInterval = setInterval(() => {
        if (fireworks.length < 3) {
            fireworks.push(new Firework());
        }
    }, 300);

    // Guard: only start loop if not already running (prevents double loops)
    if (!isFireworksAnimating) {
        animateFireworks();
    }
}

function stopFireworks() {
    clearInterval(fireworksInterval);
    // Set to null so the animation loop knows interval is done
    // and can exit cleanly once remaining particles fade out
    fireworksInterval = null;
}

// ===== BACKGROUND PARTICLES =====
function initParticles() {
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.width = (Math.random() * 4 + 2) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle();
        }
    }, 20000);
}

// ===== CURSOR SPARKLE =====
document.addEventListener('mousemove', (e) => {
    cursorSparkle.style.left = e.clientX + 'px';
    cursorSparkle.style.top = e.clientY + 'px';
    cursorSparkle.classList.add('active');
    
    clearTimeout(window.sparkleTimeout);
    window.sparkleTimeout = setTimeout(() => {
        cursorSparkle.classList.remove('active');
    }, 100);
});

// ===== FLOATING HEARTS ON CLICK =====
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || 
        e.target.tagName === 'A' || e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || e.target.closest('.scratch-canvas')) {
        return;
    }
    
    createFloatingHeart(e.clientX, e.clientY);
});

function createFloatingHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['❤️', '💕', '💖', '💗', '💓', '💝'][Math.floor(Math.random() * 6)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (Math.random() * 1 + 1) + 'rem';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 2000);
}

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    
    if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== SCRATCH TO REVEAL =====
function initScratchReveal() {
    if (!scratchCanvas) return;
    
    const scratchCtx = scratchCanvas.getContext('2d');
    const scratchHint = document.querySelector('.scratch-hint');
    
    // Set canvas size
    scratchCanvas.width = scratchCanvas.offsetWidth;
    scratchCanvas.height = scratchCanvas.offsetHeight;
    
    // Fill with gold gradient (scratch layer)
    const gradient = scratchCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    gradient.addColorStop(0, '#D4AF37');
    gradient.addColorStop(0.5, '#F4E4BC');
    gradient.addColorStop(1, '#B8860B');
    scratchCtx.fillStyle = gradient;
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    // Add decorative pattern
    scratchCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    scratchCtx.lineWidth = 2;
    for (let i = 0; i < scratchCanvas.width; i += 20) {
        scratchCtx.beginPath();
        scratchCtx.moveTo(i, 0);
        scratchCtx.lineTo(i, scratchCanvas.height);
        scratchCtx.stroke();
    }
    for (let i = 0; i < scratchCanvas.height; i += 20) {
        scratchCtx.beginPath();
        scratchCtx.moveTo(0, i);
        scratchCtx.lineTo(scratchCanvas.width, i);
        scratchCtx.stroke();
    }
    
    // Add "Scratch Here" text
    scratchCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    scratchCtx.font = 'bold 24px "Cormorant Garamond", serif';
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';
    scratchCtx.fillText('✨ Scratch Here ✨', scratchCanvas.width / 2, scratchCanvas.height / 2);
    
    // Scratch functionality
    let isDrawing = false;
    const brushSize = 30;
    
    function getPos(e) {
        const rect = scratchCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    function scratch(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const pos = getPos(e);
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.beginPath();
        scratchCtx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
        scratchCtx.fill();
        
        // Check scratch percentage
        checkScratchPercentage();
    }
    
    function checkScratchPercentage() {
        const imageData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }
        
        const percentage = (transparentPixels / (pixels.length / 4)) * 100;
        
        if (percentage > 40 && !isScratched) {
            isScratched = true;
            scratchHint.classList.add('hidden');
            
            // Reveal completely
            scratchCanvas.style.transition = 'opacity 0.5s ease';
            scratchCanvas.style.opacity = '0';
            setTimeout(() => {
                scratchCanvas.style.display = 'none';
            }, 500);
            
            // Create celebration hearts
            const rect = scratchCanvas.getBoundingClientRect();
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 200;
                    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 100;
                    createFloatingHeart(x, y);
                }, i * 80);
            }
        }
    }
    
    // Mouse events
    scratchCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        scratch(e);
    });
    scratchCanvas.addEventListener('mousemove', scratch);
    scratchCanvas.addEventListener('mouseup', () => isDrawing = false);
    scratchCanvas.addEventListener('mouseleave', () => isDrawing = false);
    
    // Touch events
    scratchCanvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        scratch(e);
    }, { passive: false });
    scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
    scratchCanvas.addEventListener('touchend', () => isDrawing = false);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-image');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px) scale(${1 + scrolled * 0.0001})`;
    });
});

// ===== MESSAGE FORM =====
if (blessingForm) {
    blessingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(blessingForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Store in localStorage (simulating submission)
        const blessings = JSON.parse(localStorage.getItem('weddingBlessings') || '[]');
        blessings.push({
            name,
            email,
            message,
            date: new Date().toISOString()
        });
        localStorage.setItem('weddingBlessings', JSON.stringify(blessings));
        
        // Show success message
        blessingForm.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Create celebration hearts
        const rect = successMessage.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 300;
                const y = rect.top + rect.height / 2;
                createFloatingHeart(x, y);
            }, i * 100);
        }
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
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

// ===== BUTTON CLICK EFFECTS =====
document.querySelectorAll('button, .location-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple-effect 0.6s ease-out';
        
        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation to styles
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Bug 3 Fix: Auto-trigger fireworks on page load for 3 seconds
    // coming from bottom of screen — visible immediately on opening screen
    startFireworks();
    setTimeout(stopFireworks, 3000);

    // Preload images
    const images = ['assets/couple1.jpg', 'assets/couple2.jpg', 'assets/couple3.jpg', 'assets/couple4.jpg'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ===== VISIBILITY API =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isMusicPlaying) {
        weddingMusic.pause();
    } else if (!document.hidden && isMusicPlaying && mainContent.classList.contains('visible')) {
        weddingMusic.play().catch(() => {});
    }
});

console.log('💕 Gayatri & Raj Wedding Invitation Loaded 💕');

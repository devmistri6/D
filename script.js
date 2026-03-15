// Initialize configuration
const config = window.VALENTINE_CONFIG;

// Validate configuration
function validateConfig() {
    const warnings = [];

    // Check required fields
    if (!config.valentineName) {
        warnings.push("Valentine's name is not set! Using default.");
        config.valentineName = "My Love";
    }

    // Validate colors
    const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    Object.entries(config.colors).forEach(([key, value]) => {
        if (!isValidHex(value)) {
            warnings.push(`Invalid color for ${key}! Using default.`);
            config.colors[key] = getDefaultColor(key);
        }
    });

    // Validate animation values
    if (parseFloat(config.animations.floatDuration) < 5) {
        warnings.push("Float duration too short! Setting to 5s minimum.");
        config.animations.floatDuration = "5s";
    }

    if (config.animations.heartExplosionSize < 1 || config.animations.heartExplosionSize > 3) {
        warnings.push("Heart explosion size should be between 1 and 3! Using default.");
        config.animations.heartExplosionSize = 1.5;
    }

    // Log warnings if any
    if (warnings.length > 0) {
        console.warn("⚠️ Configuration Warnings:");
        warnings.forEach(warning => console.warn("- " + warning));
    }
}

// Default color values
function getDefaultColor(key) {
    const defaults = {
        backgroundStart: "#ffafbd",
        backgroundEnd: "#ffc3a0",
        buttonBackground: "#ff6b6b",
        buttonHover: "#ff8787",
        textColor: "#ff4757"
    };
    return defaults[key];
}

// Set page title
document.title = config.pageTitle;

// Initialize the page content when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Validate configuration first
    validateConfig();

    // Set texts from config
    document.getElementById('valentineTitle').textContent = `${config.valentineName}, my love...`;
    
    // Set first question texts
    document.getElementById('question1Text').textContent = config.questions.first.text;
    document.getElementById('yesBtn1').textContent = config.questions.first.yesBtn;
    document.getElementById('noBtn1').textContent = config.questions.first.noBtn;
    document.getElementById('secretAnswerBtn').textContent = config.questions.first.secretAnswer;
    
    // Set second question texts
    document.getElementById('question2Text').textContent = config.questions.second.text;
    document.getElementById('startText').textContent = config.questions.second.startText;
    document.getElementById('nextBtn').textContent = config.questions.second.nextBtn;
    
    // Set third question texts
    document.getElementById('question3Text').textContent = config.questions.third.text;
    document.getElementById('yesBtn3').textContent = config.questions.third.yesBtn;
    document.getElementById('noBtn3').textContent = config.questions.third.noBtn;

    // Create initial floating elements
    createFloatingElements();

    // Setup music player
    setupMusicPlayer();

    // Setup Share Button
    setupShareButton();
});

// Create floating hearts and bears
function createFloatingElements() {
    const container = document.querySelector('.floating-elements');
    
    // Create hearts
    config.floatingEmojis.hearts.forEach(heart => {
        const div = document.createElement('div');
        div.className = 'heart';
        div.innerHTML = heart;
        setRandomPosition(div);
        container.appendChild(div);
    });

    // Create bears
    config.floatingEmojis.bears.forEach(bear => {
        const div = document.createElement('div');
        div.className = 'bear';
        div.innerHTML = bear;
        setRandomPosition(div);
        container.appendChild(div);
    });
}

// Set random position for floating elements
function setRandomPosition(element) {
    element.style.left = Math.random() * 100 + 'vw';
    element.style.animationDelay = Math.random() * 5 + 's';
    element.style.animationDuration = 10 + Math.random() * 20 + 's';
}

// Function to show next question
function showNextQuestion(questionNumber) {
    window.appState.setState({ currentStep: questionNumber });
}

// Function to move the "No" button when clicked
function moveButton(button) {
    const x = Math.random() * (window.innerWidth - button.offsetWidth);
    const y = Math.random() * (window.innerHeight - button.offsetHeight);
    button.style.position = 'fixed';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
}

// Love meter functionality
const loveMeter = document.getElementById('loveMeter');
const loveValue = document.getElementById('loveValue');
const extraLove = document.getElementById('extraLove');

function setInitialPosition() {
    loveMeter.value = 100;
    loveValue.textContent = 100;
    loveMeter.style.width = '100%';
}

loveMeter.addEventListener('input', () => {
    const value = parseInt(loveMeter.value);
    loveValue.textContent = value;
    window.appState.setState({ loveValue: value });
    
    if (value > 100) {
        extraLove.classList.remove('hidden');
        const overflowPercentage = (value - 100) / 9900;
        const extraWidth = overflowPercentage * window.innerWidth * 0.8;
        loveMeter.style.width = `calc(100% + ${extraWidth}px)`;
        loveMeter.style.transition = 'width 0.3s';
        
        // Show different messages based on the value
        if (value >= 5000) {
            extraLove.classList.add('super-love');
            extraLove.textContent = config.loveMessages.extreme;
        } else if (value > 1000) {
            extraLove.classList.remove('super-love');
            extraLove.textContent = config.loveMessages.high;
        } else {
            extraLove.classList.remove('super-love');
            extraLove.textContent = config.loveMessages.normal;
        }
    } else {
        extraLove.classList.add('hidden');
        extraLove.classList.remove('super-love');
        loveMeter.style.width = '100%';
    }
});

// Initialize love meter
window.addEventListener('DOMContentLoaded', setInitialPosition);
window.addEventListener('load', setInitialPosition);

// Celebration function
function celebrate() {
    window.appState.setState({ currentStep: 'celebration' });
    
    // Expand container for the flipbook player
    document.querySelector('.container').classList.add('celebrating');

    // Set celebration messages
    document.getElementById('celebrationTitle').textContent = config.celebration.title;
    document.getElementById('celebrationMessage').textContent = config.celebration.message;
    document.getElementById('celebrationEmojis').textContent = config.celebration.emojis;
    
    // Create heart explosion effect
    createHeartExplosion();

    // Flipbook removed: the image flipbook was removed from the UI.
    // If you'd like a simple image gallery here instead, we can add it.
}

// Lightweight Book Gallery (replacement for PageFlip)
async function initBookGallery() {
    // Try to load images from images/list.json (auto-discover) first.
    let images = [];
    try {
        const resp = await fetch('images/list.json', { cache: 'no-store' });
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) images = data.slice();
        }
    } catch (e) {
        // ignore fetch errors and fall back to config
    }

    if (images.length === 0) {
        images = Array.isArray(config.flipbookImages) ? config.flipbookImages.slice() : [];
    }
    if (images.length === 0) {
        console.warn('initBookGallery: no images found');
        return;
    }

    console.log('initBookGallery: images list loaded:', images);

    // Ensure even number of pages by padding with blank image
    if (images.length % 2 !== 0) images.push('');

    const leftEl = document.getElementById('page-left');
    const rightEl = document.getElementById('page-right');
    const flipper = document.getElementById('flipper');
    const flipFront = document.getElementById('flip-front');
    const flipBack = document.getElementById('flip-back');
    const prevBtn = document.getElementById('book-prev');
    const nextBtn = document.getElementById('book-next');
    const currentCount = document.getElementById('book-current');
    const totalCount = document.getElementById('book-total');

    let idx = 0; // left page index (0-based), left shows images[idx], right images[idx+1]
    const totalPages = images.length;
    totalCount.textContent = Math.ceil(totalPages / 2);

    function setPageVisuals() {
        const leftImg = images[idx] || '';
        const rightImg = images[idx + 1] || '';
        // Use <img> elements so missing files are visible in DOM and report loading errors
    leftEl.innerHTML = leftImg ? `<img src="${leftImg}" alt="Memory" class="book-img">` : '';
    rightEl.innerHTML = rightImg ? `<img src="${rightImg}" alt="Memory" class="book-img">` : '';
        // set flipper faces to simulate turning from right -> next right
        flipFront.innerHTML = rightImg ? `<img src="${rightImg}" alt="Front" class="book-img">` : '';
        const upcoming = images[idx + 2] || '';
        flipBack.innerHTML = upcoming ? `<img src="${upcoming}" alt="Back" class="book-img">` : '';
        // Page pair index (1-based)
        currentCount.textContent = Math.floor(idx / 2) + 1;
        // Attach load/error handlers for diagnostics
        monitorVisibleImages();
    }

    function monitorVisibleImages() {
        const imgs = Array.from(document.querySelectorAll('.book-img'));
        imgs.forEach(img => {
            if (img.__monitored) return;
            img.__monitored = true;
            img.addEventListener('load', () => {
                console.log('book image loaded:', img.src, 'naturalWidth=', img.naturalWidth);
            });
            img.addEventListener('error', (e) => {
                console.error('book image failed to load:', img.src, e);
                // show a placeholder so user sees a visible box
                img.style.background = '#f2f2f2';
                img.style.objectFit = 'contain';
                img.alt = 'Image failed to load';
            });
        });
    }

    // Initialize visuals
    setPageVisuals();

    let animating = false;

    function goNext() {
        if (animating) return;
        if (idx + 2 >= totalPages) return; // no more
        animating = true;
        // prepare flipper faces (front is current right, back is next-right)
        flipFront.style.backgroundImage = images[idx + 1] ? `url('${images[idx + 1]}')` : '';
        flipBack.style.backgroundImage = images[idx + 2] ? `url('${images[idx + 2]}')` : '';
        flipper.classList.add('flipping');
        // after animation, advance index and refresh visuals
        flipper.addEventListener('transitionend', function handler() {
            flipper.classList.remove('flipping');
            idx += 2;
            setPageVisuals();
            animating = false;
            flipper.removeEventListener('transitionend', handler);
        });
    }

    function goPrev() {
        if (animating) return;
        if (idx - 2 < 0) return;
        animating = true;
        // For prev, we simulate a backward flip by temporarily setting flipper to show previous left
        // We'll swap front/back with previous left image and animate reverse
        flipFront.innerHTML = images[idx - 1] ? `<img src="${images[idx - 1]}" alt="Front" class="book-img">` : '';
        flipBack.innerHTML = images[idx - 2] ? `<img src="${images[idx - 2]}" alt="Back" class="book-img">` : '';
        // Animate reverse flip using a reverse modifier class
        flipper.classList.add('flipping', 'reverse');
        flipper.addEventListener('transitionend', function handler() {
            flipper.classList.remove('flipping', 'reverse');
            idx -= 2;
            setPageVisuals();
            animating = false;
            flipper.removeEventListener('transitionend', handler);
        });
    }

    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);

    // Overlay arrows (on-page) should use same handlers
    const prevOverlay = document.getElementById('book-prev-overlay');
    const nextOverlay = document.getElementById('book-next-overlay');
    if (prevOverlay) prevOverlay.addEventListener('click', goPrev);
    if (nextOverlay) nextOverlay.addEventListener('click', goNext);

    // expose for testing
    window.__bookGallery = { goNext, goPrev, setPageVisuals };
}

// Initialize the book gallery when celebration step is shown
window.appState.subscribe((state, oldState) => {
    if (state.currentStep === 'celebration' && oldState.currentStep !== 'celebration') {
        // Initialize gallery after a small delay so DOM is visible
        setTimeout(initBookGallery, 120);
    }
});

// Create heart explosion animation
function createHeartExplosion() {
    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        const randomHeart = config.floatingEmojis.hearts[Math.floor(Math.random() * config.floatingEmojis.hearts.length)];
        heart.innerHTML = randomHeart;
        heart.className = 'heart';
        document.querySelector('.floating-elements').appendChild(heart);
        setRandomPosition(heart);
    }
}

// Music Player Setup
function setupMusicPlayer() {
    const musicControls = document.getElementById('musicControls');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const musicSource = document.getElementById('musicSource');

    // Only show controls if music is enabled in config
    if (!config.music.enabled) {
        musicControls.style.display = 'none';
        return;
    }

    // Set music source and volume
    musicSource.src = config.music.musicUrl;
    bgMusic.volume = config.music.volume || 0.5;
    bgMusic.load();

    // Try autoplay if enabled
    if (config.music.autoplay) {
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                window.appState.setState({ isMusicPlaying: true });
            }).catch(error => {
                console.log("Autoplay prevented by browser");
            });
        }
    }

    // Toggle music on button click
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            window.appState.setState({ isMusicPlaying: true });
        } else {
            bgMusic.pause();
            window.appState.setState({ isMusicPlaying: false });
        }
    });
}

// Share Link Setup
function setupShareButton() {
    const shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
        window.ValentineConfig.copyShareLink().then(success => {
            if (success) {
                const originalText = shareBtn.textContent;
                shareBtn.textContent = "Link Copied! ❤️";
                setTimeout(() => {
                    shareBtn.textContent = originalText;
                }, 2000);
            }
        });
    });
}

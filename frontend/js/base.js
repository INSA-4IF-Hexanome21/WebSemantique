const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = -1000;
let mouseY = -1000;

// ------------------ Dégradés ------------------
class Gradient {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }
    
    reset() {
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: this.x = Math.random() * canvas.width; this.y = -200; break;
            case 1: this.x = canvas.width + 200; this.y = Math.random() * canvas.height; break;
            case 2: this.x = Math.random() * canvas.width; this.y = canvas.height + 200; break;
            case 3: this.x = -200; this.y = Math.random() * canvas.height; break;
        }
        this.vx = (Math.random() - 0.5) * 0.08;
        this.vy = (Math.random() - 0.5) * 0.08;
        this.size = 200 + Math.random() * 300;
        this.setRandomColor();
        this.colorChangeSpeed = 0.001 + Math.random() * 0.002;
    }
    
    setRandomColor() {
        const colorChoice = Math.random();
        if (colorChoice < 0.2) this.hue = Math.random() * 30;
        else if (colorChoice < 0.35) this.hue = 300 + Math.random() * 40;
        else if (colorChoice < 0.55) this.hue = 260 + Math.random() * 40;
        else if (colorChoice < 0.75) this.hue = 200 + Math.random() * 40;
        else if (colorChoice < 0.9) this.hue = 170 + Math.random() * 30;
        else this.hue = 280 + Math.random() * 20;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.hue += this.colorChangeSpeed;
        if (this.hue > 360) this.hue = 0;

        if (this.x < -this.size || this.x > canvas.width + this.size || 
            this.y < -this.size || this.y > canvas.height + this.size) {
            this.reset();
        }
    }
    
    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 50%, 0.15)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ------------------ Étoiles ------------------
class Star {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }
    
    reset() {
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: this.x = Math.random() * canvas.width; this.y = -50; break;
            case 1: this.x = canvas.width + 50; this.y = Math.random() * canvas.height; break;
            case 2: this.x = Math.random() * canvas.width; this.y = canvas.height + 50; break;
            case 3: this.x = -50; this.y = Math.random() * canvas.height; break;
        }
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.baseOpacity = Math.random() * 0.5 + 0.3;
        this.opacity = this.baseOpacity;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        
        if (Math.random() < 0.7) this.color = 'white';
        else {
            const colorChoice = Math.random();
            if (colorChoice < 0.3) this.hue = Math.random() * 30;
            else if (colorChoice < 0.5) this.hue = 300 + Math.random() * 40;
            else if (colorChoice < 0.7) this.hue = 260 + Math.random() * 40;
            else this.hue = 180 + Math.random() * 60;
            this.color = `hsl(${this.hue}, 80%, 70%)`;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -50 || this.x > canvas.width + 50 || 
            this.y < -50 || this.y > canvas.height + 50) {
            this.reset();
        }

        this.twinklePhase += this.twinkleSpeed;
        this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;

        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
            this.opacity = 1;
            this.size = Math.min(this.size * 1.5, 5);
        } else {
            this.size *= 0.95;
            if (this.size < 0.5) this.size = 0.5;
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        if (this.color === 'white') {
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.3, 'rgba(255,255,255,0.5)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
        } else {
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, this.color);
            gradient.addColorStop(0.5, this.color.replace('70%','40%'));
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ------------------ Animation ------------------
const gradients = [];
const maxGradients = 15;
let gradientSpawnTimer = 0;
const gradientSpawnInterval = 3000;

for (let i = 0; i < 5; i++) gradients.push(new Gradient());

const stars = [];
const maxStars = 200;
let starSpawnTimer = 0;
const starSpawnInterval = 100;

canvas.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gradientSpawnTimer += 16;
    if (gradients.length < maxGradients && gradientSpawnTimer >= gradientSpawnInterval) {
        gradients.push(new Gradient());
        gradientSpawnTimer = 0;
    }

    gradients.forEach(g => { g.update(); g.draw(); });

    starSpawnTimer += 16;
    if (stars.length < maxStars && starSpawnTimer >= starSpawnInterval) {
        stars.push(new Star());
        starSpawnTimer = 0;
    }

    stars.forEach(s => { s.update(); s.draw(); });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();

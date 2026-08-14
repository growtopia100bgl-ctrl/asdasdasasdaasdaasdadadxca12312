/**
 * OathFlix - Cinematic Animated Background Canvas Engine
 * Features: Crimson Embers, Cyber OSINT Mesh Nodes, Interactive Radial Spotlight
 */

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'netflixCanvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: width / 2, y: height / 2, radius: 180 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Particle Class for Netflix Crimson Embers & OSINT Mesh
  class EmberParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height + height * 0.1;
      this.size = Math.random() * 2.8 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.opacity = Math.random() * 0.6 + 0.2;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.hue = 355; // Signature Netflix Crimson Red
      this.pulse = Math.random() * Math.PI;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.03;

      // Mouse displacement interactive effect
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 3;
        this.y -= (dy / dist) * force * 3;
      }

      // Reset when particle floats off top
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      const dynamicOpacity = this.opacity + Math.sin(this.pulse) * 0.15;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 92%, 52%, ${Math.max(0.05, dynamicOpacity)})`;
      ctx.shadowBlur = this.size * 5;
      ctx.shadowColor = 'rgba(229, 9, 20, 0.8)';
      ctx.fill();
      ctx.restore();
    }
  }

  // Create Particle Pool
  const particleCount = Math.floor(Math.min(width, 1400) / 12);
  const particles = Array.from({ length: particleCount }, () => new EmberParticle());

  // Render Cyber Laser Lines Between Nearby Particles
  function drawMesh() {
    const maxDistance = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(229, 9, 20, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  // Main 60FPS Render Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Dark Ambient Overlay Background
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Draw OSINT Crimson Mesh & Floating Particles
    drawMesh();
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

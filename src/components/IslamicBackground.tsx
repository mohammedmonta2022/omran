import React, { useEffect, useRef } from 'react';

export const IslamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes representing Islamic geometric stars and ambient light
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      isStar: boolean;
    }

    const particleCount = Math.min(Math.floor((width * height) / 25000), 45);
    const particles: Particle[] = [];

    const colors = [
      'rgba(16, 185, 129,', // Emerald
      'rgba(245, 158, 11,', // Amber / Gold
      'rgba(5, 150, 105,',  // Deep Emerald
      'rgba(217, 119, 6,',  // Deep Gold
      'rgba(52, 211, 153,', // Light Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        isStar: Math.random() > 0.45,
      });
    }

    // Helper to draw an 8-pointed Islamic Star
    function drawIslamicStar(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      rotation: number,
      color: string,
      alpha: number
    ) {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.save();
      context.beginPath();
      context.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();

      context.fillStyle = `${color} ${alpha * 0.35})`;
      context.fill();
      context.strokeStyle = `${color} ${alpha * 0.8})`;
      context.lineWidth = 0.8;
      context.stroke();
      context.restore();
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.3,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(6, 44, 34, 0.45)');
      bgGrad.addColorStop(0.5, 'rgba(11, 24, 38, 0.6)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Connect nearby particles with subtle arabesque geometric lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles & Islamic stars
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const dynamicAlpha = p.alpha + Math.sin(time + p.x) * 0.1;

        if (p.isStar) {
          drawIslamicStar(
            ctx,
            p.x,
            p.y,
            8,
            p.radius * 3.5,
            p.radius * 1.8,
            p.rotation,
            p.color,
            Math.max(0.1, dynamicAlpha)
          );
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${Math.max(0.1, dynamicAlpha)})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-islamic-pattern opacity-40 mix-blend-overlay" />
      {/* Decorative corner arabesque lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
    </div>
  );
};

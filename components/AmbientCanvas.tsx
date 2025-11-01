import React, { useRef, useEffect } from 'react';

const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const particles = useRef<any[]>([]);

  // Using theme-consistent colors
  const particleColor = 'rgba(209, 213, 219, 0.8)'; // content-primary
  const lineColor = 'rgba(124, 58, 237, 1)'; // brand-secondary

  const PARTICLE_COUNT = 80;
  const MAX_DISTANCE = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // Use devicePixelRatio for sharper rendering on high-DPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      
      particles.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: Math.random() * 0.4 - 0.2, // Slower movement
          vy: Math.random() * 0.4 - 0.2,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const animate = () => {
      // Stop animation if canvas is not visible to save resources
      if (!canvas.offsetParent) { 
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap particles around the screen instead of bouncing for a smoother look
        if (p.x < -p.radius) p.x = canvas.offsetWidth + p.radius;
        if (p.x > canvas.offsetWidth + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.offsetHeight + p.radius;
        if (p.y > canvas.offsetHeight + p.radius) p.y = -p.radius;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

          if (dist < MAX_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Fade line with distance
            const [r, g, b] = lineColor.slice(5, -1).split(',').map(Number);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * (1 - dist / MAX_DISTANCE)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default AmbientCanvas;

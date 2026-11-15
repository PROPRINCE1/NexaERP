import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface GridNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function ReactiveBackground() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();
  const [interactionState, setInteractionState] = useState({
    cursorMoved: false,
    scrolled: false,
    scrollTick: 0,
  });

  // Scroll-linked subtle solid background tone shift (no gradients)
  const scrollBgColor = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    ['#d8e6df', '#cadbd3', '#bfd3c9', '#d2e2da'],
  );

  // Scroll-linked geometric parallax offsets for crisp architectural frames
  const frameOneY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const frameOneRotate = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const frameTwoY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const frameTwoRotate = useTransform(scrollYProgress, [0, 1], [12, -24]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: GridNode[] = [];
    let rafId: number | null = null;

    const pointer = {
      x: width * 0.5,
      y: height * 0.35,
      targetX: width * 0.5,
      targetY: height * 0.35,
      active: false,
    };

    let scrollY = window.scrollY;
    let smoothScrollY = scrollY;
    let lastDrawTime = performance.now();

    const buildGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = width < 640 ? 84 : 74;
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      nodes = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c - 0.5) * spacing;
          const by = (r - 0.5) * spacing;
          nodes.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const drawFrame = () => {
      const now = performance.now();
      const dt = Math.min((now - lastDrawTime) / 16.67, 2);
      lastDrawTime = now;

      ctx.clearRect(0, 0, width, height);

      const spacing = width < 640 ? 84 : 74;
      const totalSpanY = (Math.ceil(height / spacing) + 2) * spacing;

      // Smooth pointer & scroll interpolation
      pointer.x += (pointer.targetX - pointer.x) * 0.16 * dt;
      pointer.y += (pointer.targetY - pointer.y) * 0.16 * dt;
      smoothScrollY += (scrollY - smoothScrollY) * 0.18 * dt;

      const parallaxOffset = smoothScrollY * 0.28;
      const interactionRadius = width < 640 ? 150 : 210;
      const activeNodes: { x: number; y: number; strength: number }[] = [];

      let stillMoving =
        Math.abs(pointer.targetX - pointer.x) > 0.25 ||
        Math.abs(pointer.targetY - pointer.y) > 0.25 ||
        Math.abs(scrollY - smoothScrollY) > 0.25;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // Wrap baseY smoothly with scroll parallax
        const wrappedY =
          ((((node.baseY - parallaxOffset) % totalSpanY) + totalSpanY) % totalSpanY) - spacing * 0.5;

        let targetX = node.baseX;
        let targetY = wrappedY;
        let proximity = 0;

        if (!prefersReducedMotion && pointer.active) {
          const dx = pointer.x - node.baseX;
          const dy = pointer.y - wrappedY;
          const dist = Math.hypot(dx, dy);

          if (dist < interactionRadius && dist > 0.001) {
            proximity = 1 - dist / interactionRadius;
            // Subtle geometric displacement away from cursor
            const push = proximity * 14;
            targetX = node.baseX - (dx / dist) * push;
            targetY = wrappedY - (dy / dist) * push;
          }
        }

        node.x += (targetX - node.x) * 0.2 * dt;
        node.y += (targetY - node.y) * 0.2 * dt;

        if (
          Math.abs(targetX - node.x) > 0.15 ||
          Math.abs(targetY - node.y) > 0.15
        ) {
          stillMoving = true;
        }

        // Draw crisp geometric node markers (no gradients)
        if (proximity > 0.05) {
          activeNodes.push({ x: node.x, y: node.y, strength: proximity });
          const size = 2.5 + proximity * 3;
          ctx.strokeStyle = `rgba(8, 124, 114, ${(0.22 + proximity * 0.42).toFixed(3)})`;
          ctx.lineWidth = 1.25;
          ctx.strokeRect(node.x - size * 0.5, node.y - size * 0.5, size, size);
        } else {
          ctx.fillStyle = 'rgba(8, 124, 114, 0.15)';
          ctx.fillRect(node.x - 1, node.y - 1, 2, 2);
        }
      }

      // Draw crisp geometric connections between cursor-activated nodes (no gradients)
      if (!prefersReducedMotion && activeNodes.length > 1) {
        const maxLinkDist = width < 640 ? 105 : 96;
        ctx.lineWidth = 1;
        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const a = activeNodes[i];
            const b = activeNodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < maxLinkDist) {
              const alpha = Math.min(a.strength, b.strength) * 0.38;
              ctx.strokeStyle = `rgba(8, 124, 114, ${alpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // Crisp geometric reticle ring at cursor position (no gradients)
      if (!prefersReducedMotion && pointer.active) {
        ctx.strokeStyle = 'rgba(8, 124, 114, 0.26)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(126, 210, 188, 0.34)';
        ctx.beginPath();
        ctx.moveTo(pointer.x - 8, pointer.y);
        ctx.lineTo(pointer.x + 8, pointer.y);
        ctx.moveTo(pointer.x, pointer.y - 8);
        ctx.lineTo(pointer.x, pointer.y + 8);
        ctx.stroke();
      }

      if (stillMoving) {
        rafId = window.requestAnimationFrame(drawFrame);
      } else {
        rafId = null;
      }
    };

    const scheduleDraw = () => {
      if (rafId === null) {
        lastDrawTime = performance.now();
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    buildGrid();
    drawFrame();

    const handlePointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.active = true;
      setInteractionState((prev) =>
        prev.cursorMoved ? prev : { ...prev, cursorMoved: true },
      );
      scheduleDraw();
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      setInteractionState((prev) => ({
        ...prev,
        scrolled: true,
        scrollTick: Math.round(scrollY),
      }));
      scheduleDraw();
    };

    const handleResize = () => {
      buildGrid();
      scheduleDraw();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      {/* Scroll-reactive continuous solid canvas tone beneath sections */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundColor: scrollBgColor }}
      />

      {/* Scroll-driven geometric architectural parallax frames + cursor-reactive canvas lattice (no gradients) */}
      <div
        data-testid="reactive-background"
        data-cursor-moved={interactionState.cursorMoved ? 'true' : 'false'}
        data-scrolled={interactionState.scrolled ? 'true' : 'false'}
        data-scroll-y={String(interactionState.scrollTick)}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      >
        {!prefersReducedMotion && (
          <>
            <motion.div
              style={{ y: frameOneY, rotate: frameOneRotate }}
              className="absolute -right-24 top-[22%] h-[340px] w-[340px] rounded-full border border-[#087c72]/15"
            />
            <motion.div
              style={{ y: frameTwoY, rotate: frameTwoRotate }}
              className="absolute -left-20 top-[62%] h-[280px] w-[280px] border border-[#102d40]/12"
            />
          </>
        )}
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </>
  );
}

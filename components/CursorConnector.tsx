import React, { useEffect, useState } from 'react';

interface CursorConnectorProps {
  targetRef: React.RefObject<HTMLButtonElement | null>;
  isVisible: boolean;
}

export const CursorConnector: React.FC<CursorConnectorProps> = ({ targetRef, isVisible }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateMousePos = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const updateTargetPos = () => {
        if (targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setTargetPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }
    };

    window.addEventListener('mousemove', updateMousePos);
    window.addEventListener('resize', updateTargetPos);
    window.addEventListener('scroll', updateTargetPos, true);
    
    // Initial check and polling to handle layout shifts
    setTimeout(updateTargetPos, 100);
    const interval = setInterval(updateTargetPos, 1000);

    return () => {
      window.removeEventListener('mousemove', updateMousePos);
      window.removeEventListener('resize', updateTargetPos);
      window.removeEventListener('scroll', updateTargetPos, true);
      clearInterval(interval);
    };
  }, [targetRef]);

  if (!isVisible || !targetPos) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <svg className="w-full h-full">
        <line
          x1={targetPos.x}
          y1={targetPos.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2"
          strokeDasharray="8,6"
          className="dark:stroke-blue-400/40"
        />
        <circle cx={mousePos.x} cy={mousePos.y} r="4" fill="rgba(59, 130, 246, 0.6)" className="dark:fill-blue-400/60" />
      </svg>
    </div>
  );
};
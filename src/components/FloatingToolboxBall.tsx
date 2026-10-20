import React, { useState, useRef, useEffect } from 'react';

interface FloatingToolboxBallProps {
  onOpen: () => void;
}

export const FloatingToolboxBall: React.FC<FloatingToolboxBallProps> = ({ onOpen }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const initialRight = typeof window !== 'undefined' ? window.innerWidth - 65 : 300;
    const initialBottom = typeof window !== 'undefined' ? window.innerHeight - 150 : 500;
    return { x: initialRight, y: initialBottom };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });
  const hasMovedRef = useRef<boolean>(false);

  const clampPosition = (x: number, y: number) => {
    const ballSize = 48;
    const maxX = window.innerWidth - ballSize - 10;
    const maxY = window.innerHeight - ballSize - 80;
    return {
      x: Math.max(10, Math.min(maxX, x)),
      y: Math.max(60, Math.min(maxY, y)),
    };
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: position.x,
      initY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      const nextPos = clampPosition(
        dragStartRef.current.initX + deltaX,
        dragStartRef.current.initY + deltaY
      );
      setPosition(nextPos);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging]);

  const handleClick = () => {
    if (!hasMovedRef.current) {
      onOpen();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 45,
        touchAction: 'none',
      }}
      onMouseDown={handleTouchStart}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className="cursor-grab active:cursor-grabbing select-none"
      title="百宝箱小浮球"
    >
      <div className="relative group">
        {/* 呼吸微光外环 */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-60 blur-xs group-hover:opacity-100 transition duration-300 pointer-events-none" />

        {/* 纯圆形图标浮球 (无文字，纯粹极简) */}
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-400 p-[2px] shadow-md shadow-amber-900/20 transition-transform active:scale-90 flex items-center justify-center">
          <div className="w-full h-full bg-[#fffdfa] rounded-full flex items-center justify-center text-lg shadow-inner">
            <span>🧰</span>
          </div>
        </div>
      </div>
    </div>
  );
};

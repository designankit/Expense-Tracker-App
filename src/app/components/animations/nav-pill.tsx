'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  variant?: 'default' | 'glass' | 'minimal';
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  activeHref,
  className = '',
  variant = 'default'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderStyle, setSliderStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Find active index based on activeHref
  useEffect(() => {
    const index = items.findIndex(item => item.href === activeHref);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [activeHref, items]);

  // Update slider position when active index changes
  useEffect(() => {
    const updateSliderPosition = () => {
      const activeItem = itemRefs.current[activeIndex];
      if (activeItem && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        setSliderStyle({
          width: `${itemRect.width}px`,
          height: `${itemRect.height}px`,
          transform: `translateX(${itemRect.left - navRect.left}px)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
      }
    };

    updateSliderPosition();
    
    // Update on window resize
    const handleResize = () => updateSliderPosition();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          container: 'bg-white/10 backdrop-blur-md border border-white/20',
          slider: 'bg-white/20 shadow-lg',
          text: 'text-white/80',
          activeText: 'text-white',
          hover: 'hover:text-white/90'
        };
      case 'minimal':
        return {
          container: 'bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50',
          slider: 'bg-white dark:bg-gray-700 shadow-sm',
          text: 'text-gray-700 dark:text-gray-300',
          activeText: 'text-gray-900 dark:text-white',
          hover: 'hover:text-gray-900 dark:hover:text-white' 
        };
      default:
        return {
          container: 'bg-gray-900/90 backdrop-blur-sm border border-gray-700/50',
          slider: 'bg-white shadow-lg',
          text: 'text-gray-400',
          activeText: 'text-gray-900',
          hover: 'hover:text-gray-300'
        };
    }
  };

  const styles = getVariantStyles();

  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-fit">
      <nav
        ref={navRef}
        className={`relative flex items-center rounded-full p-1 ${styles.container} ${className}`}
        aria-label="Primary"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Sliding background */}
        <div
          className={`absolute rounded-full ${styles.slider}`}
          style={sliderStyle}
        />
        
        {/* Navigation items */}
        <div className="relative flex items-center">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            
            const baseClasses = `
              relative z-10 px-4 py-2 rounded-full font-medium text-sm 
              transition-colors duration-200 cursor-pointer whitespace-nowrap
              ${isActive ? styles.activeText : styles.text}
              ${!isActive ? styles.hover : ''}
            `;

            const handleClick = () => {
              setActiveIndex(index);
            };

            return (
              <div
                key={item.href}
                ref={el => { itemRefs.current[index] = el; }}
                className="flex h-full"
              >
                {isExternalLink(item.href) ? (
                  <a
                    href={item.href}
                    className={baseClasses}
                    aria-label={item.ariaLabel || item.label}
                    onClick={handleClick}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={baseClasses}
                    aria-label={item.ariaLabel || item.label}
                    onClick={handleClick}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PillNav;
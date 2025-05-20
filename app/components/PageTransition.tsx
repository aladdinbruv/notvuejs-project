import { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from '@remix-run/react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);
  
  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 300); // Match this with your CSS transition time
      
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location, displayLocation]);
  
  return (
    <div className={`page-transition ${transitionStage}`}>
      {children}
    </div>
  );
} 
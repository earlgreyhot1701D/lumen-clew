import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Candle icon matching header logo */}
        <div className="w-16 h-16 border-4 border-amber bg-navy flex items-center justify-center mx-auto mb-6 shadow-amber-glow">
          <div className="w-3 h-8 bg-amber"></div>
        </div>
        
        <h1 className="font-headline text-6xl font-black text-amber mb-4 tracking-tight">404</h1>
        <p className="text-cream text-xl mb-2">Page not found</p>
        <p className="text-cream/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <a 
          href="/" 
          className="inline-block bg-amber text-navy font-headline font-bold text-lg px-6 py-3 hover:bg-amber/90 transition shadow-md tracking-wider uppercase"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
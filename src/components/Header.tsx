import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import SignInModal from './SignInModal';

export default function Header() {
  const location = useLocation();
  const { getItemCount } = useCart();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const cartCount = getItemCount();
  const isLanding = location.pathname === '/';

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="MWS Shop" className="h-10 w-auto" />
          </Link>

          <nav className="flex items-center space-x-6">
            {isLanding && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Sign In
                </button>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {!isLanding && (
              <>
                <Link
                  to="/shop"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  className="relative text-gray-600 hover:text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}

import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                This Privacy Policy explains how MWS Shop collects, uses, and protects your personal information.
                By using our website, you agree to the terms of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-gray-700">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li>Account information (username, email, password)</li>
                <li>Order information (items purchased, order history)</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li>Provide and maintain our services</li>
                <li>Process your orders and transactions</li>
                <li>Send you account-related communications</li>
                <li>Improve and personalize your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Cookies</h2>
              <p className="text-gray-700">
                We use cookies to maintain your session and authenticate your account.
                When you first visit our site, you will see a cookie consent banner.
                Essential cookies for authentication are necessary for the website to function properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information,
                including password hashing and secure session management.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us through
                our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

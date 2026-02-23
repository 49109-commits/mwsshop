import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
          
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using MWS Shop, you accept and agree to be bound by the terms and
                provisions of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-gray-700">
                Permission is granted to temporarily use MWS Shop for personal, non-commercial use only.
                This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account and password.
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Orders and Payments</h2>
              <p className="text-gray-700">
                All orders placed through MWS Shop are subject to availability. We reserve the right
                to refuse or cancel any order for any reason. This is a demo store - no actual
                payments are processed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Privacy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also
                governs your use of the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                MWS Shop shall not be liable for any damages arising out of or related to your
                use of this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Use, please contact us through
                our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

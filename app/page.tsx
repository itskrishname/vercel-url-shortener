import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
          Universal Shortener Bridge
        </h1>
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Manage your external shortener links with ease. Securely wrap your monetized links, track analytics, and manage multiple providers in one place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition transform hover:-translate-y-1"
          >
            User Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition transform hover:-translate-y-1"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
           <Link href="/owner/login" className="text-sm text-gray-500 hover:text-gray-800 underline">
             Administrator Access
           </Link>
        </div>
      </div>
    </div>
  );
}

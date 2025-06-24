export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email below and we’ll send you a reset link (coming soon).
        </p>

        <form>
          <input
            type="email"
            placeholder="Email address"
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          <button
            type="submit"
            disabled
            className="w-full bg-blue-400 text-white py-2 rounded opacity-50 cursor-not-allowed"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </main>
  );
}
export default function ForgotPasswordPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <p className="mb-4 text-sm text-gray-600 text-center">
          Enter your email and we’ll send you a reset link (not functional yet).
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded border-gray-300"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </main>
  );
}
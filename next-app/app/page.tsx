import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white shadow-md rounded">
        <h1 className="text-3xl font-bold text-center mb-6">EduGo</h1>
        <LoginForm />
      </div>
    </main>
  );
}
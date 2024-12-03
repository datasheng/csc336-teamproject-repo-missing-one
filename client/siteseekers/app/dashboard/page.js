"use client";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center p-24">
        <div className="max-w-4xl w-full">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        </div>
      </div>
    </ProtectedRoute>
  );
}

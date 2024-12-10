"use client";
import Navbar from "../components/Navbar";
import Listing from "../components/Listing";

export default function JobsPage() {
  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
        <div className="max-w-7xl w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Available Jobs
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Browse through the available job listings and find the perfect opportunity.
          </p>
          <Listing />
        </div>
      </div>
    </div>
  );
}

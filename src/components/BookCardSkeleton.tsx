// src/components/BookCardSkeleton.tsx
export default function BookCardSkeleton() {
  return (
    <div className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="relative w-full h-72 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-6 bg-orange-200 dark:bg-orange-900 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
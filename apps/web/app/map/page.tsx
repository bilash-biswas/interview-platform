import MapTrackingLazy from '../../components/MapTrackingLazy';

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Live User Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View users' real-time locations on the map. Your own location is also being shared.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-2 border border-gray-200 dark:border-gray-700">
        <MapTrackingLazy />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Real-time Updates</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200/80 mt-1">Updates are sent via Socket.io with low latency.</p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
          <h3 className="font-semibold text-green-900 dark:text-green-100">Cross-Platform</h3>
          <p className="text-sm text-green-800 dark:text-green-200/80 mt-1">Track users on both Web and Mobile apps.</p>
        </div>
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Privacy</h3>
          <p className="text-sm text-purple-800 dark:text-purple-200/80 mt-1">Location sharing is only active while the map is open.</p>
        </div>
      </div>
    </div>
  );
}

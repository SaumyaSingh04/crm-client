function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Total Users
          </h3>
          <p className="text-3xl font-bold">1,234</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Active Sessions
          </h3>
          <p className="text-3xl font-bold">56</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Revenue
          </h3>
          <p className="text-3xl font-bold">$12,345</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Conversion Rate
          </h3>
          <p className="text-3xl font-bold">24%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="border-b pb-2">
            <p className="font-medium">User signup</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              John Doe - 2 hours ago
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="font-medium">New order placed</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Jane Smith - 3 hours ago
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="font-medium">Payment received</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mike Johnson - 5 hours ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

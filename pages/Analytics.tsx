// src/pages/Analytics.tsx
import React, { useEffect, useState } from "react";

interface Activity {
  id: number;
  user_id: number;
  action: string;
  ip_address: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

const Analytics: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/activities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading activities...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">System Activities</h1>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">IP Address</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  {activity.user
                    ? `${activity.user.first_name} ${activity.user.last_name}`
                    : "Unknown"}
                </td>
                <td className="px-4 py-2 border">{activity.action}</td>
                <td className="px-4 py-2 border">{activity.ip_address}</td>
                <td className="px-4 py-2 border">
                  {new Date(activity.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;

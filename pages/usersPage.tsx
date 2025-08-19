import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  department?: { name: string };
  avatar?: string | null;
}

const UserAvatar: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <FaUsers className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-full object-cover border"
      onError={() => setHasError(true)}
    />
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/users", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        setUsers(await res.json());
      } catch {
        setError("Error loading users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  const getAvatarSrc = (avatar?: string | null) => {
    const DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";
    if (!avatar) return DEFAULT;
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) return avatar;
    const trimmedBase = (baseUrl || "").replace(/\/$/, "");
    return `${trimmedBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const renderSection = (title: string, type: string) => {
    const filtered = users.filter(
      (user) => user.user_type.toLowerCase() === type.toLowerCase()
    );

    if (filtered.length === 0) return null;

    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex items-center mb-4">
                <UserAvatar
                  src={getAvatarSrc(user.avatar)}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {user.user_type.toLowerCase()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Department:</span>{" "}
                {user.department?.name || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <p className="p-4 text-gray-600">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Users</h1>

      {renderSection("Admins", "ADMIN")}
      {renderSection("Heads", "HEAD")}
      {renderSection("Staff", "STAFF")}
    </div>
  );
};

export default UsersPage;

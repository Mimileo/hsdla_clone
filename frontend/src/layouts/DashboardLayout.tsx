// src/layouts/DashboardLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log("Logout response:", response);

      navigate("/login"); // Redirect to the login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const roles = user?.roles || [];
  const isStudent = roles.includes("user");
  const isTeacher = roles.includes("teacher");
  const isAdmin = roles.includes("admin");

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "About", path: "/transcript" },
    { name: "Contact", path: "/profile" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-semibold mb-4">{user?.roles?.includes("admin") ? "Admin Dashboard" : "User Dashboard"}</h2>
        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `block py-2 px-4 hover:bg-blue-600 ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Amin Links */}

         { (isAdmin || isTeacher) && (
            <>
              <NavLink
                to="/dashboard/users"
                className={({ isActive }) =>
                  `block py-2 px-4 hover:bg-blue-600 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                Users
              </NavLink>
              

              <NavLink
                to="/dashboard/requests"
                className={({ isActive }) =>
                  `block py-2 px-4 hover:bg-blue-600 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                Requests
              </NavLink>

               <NavLink
                to={"/dashboard/transcripts"}
                className={({ isActive }) =>
                  `block py-2 px-4 hover:bg-blue-600 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                Transcripts
              </NavLink>
            </>
         )}

          {/* Student Links */}

          {isStudent && (
            <>
              <NavLink
                to="/dashboard/my-transcript"
                className={({ isActive }) =>
                  `block py-2 px-4 hover:bg-blue-600 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                Transcript
              </NavLink>
              <NavLink
                to="/dashboard/request-transcript"
                className={({ isActive }) =>
                  `block py-2 px-4 hover:bg-blue-600 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                Profile
              </NavLink>
            </>
          )}

          <a
            href="#"
            className="mt-auto py-2 px-4 rounded bg-pink-600 hover:bg-pink-500 text-white"
            onClick={handleLogout}
          >
            Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}

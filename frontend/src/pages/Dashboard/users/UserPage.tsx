import { useUserStore } from "@/stores/userStore";
import { IUser } from "@/types/user";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UserPage = () => {
  const { id } = useParams();

  const { fetchUserById } = useUserStore();

  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserById(id).then((user) => {
        setUser(user);
      });
    }
  }, [fetchUserById, id]);

  return (
    <div>
      <div className="bg-gray-100">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-4 sm:grid-cols-12 gap-6 px-4">
            <div className="col-span-4 sm:col-span-12">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="col-span-4 sm:col-span-3">
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          "https://ui-avatars.com/api/?name=" +
                          user?.firstName +
                          "+" +
                          user?.lastName
                        }
                        className="w-32 h-32 bg-gray-300 rounded-full mb-4 shrink-0"
                        alt="John Doe"
                      ></img>
                      <h1 className="text-xl font-bold">
                        {user?.firstName} {user?.lastName}
                      </h1>
                      <p className="text-gray-700">
                        {user?.roles.includes("admin") ||
                        user?.roles.includes("teacher")
                          ? "Teacher"
                          : "Student"}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        <a
                          href="#"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                          Contact
                        </a>
                      </div>
                    </div>
                    <hr className="my-6 border-t border-gray-300"></hr>
                    <div className="flex flex-col">
                      <span className="text-gray-700 uppercase font-bold tracking-wider mb-2">
                        About
                      </span>

                      <ul>
                        <li className="mb-2">
                          <span className="font-semibold">Email:</span>{" "}
                          {user?.email}
                        </li>
                        <li className="mb-2">
                          <span className="font-semibold">Phone:</span>{" "}
                          {user?.phone}
                        </li>
                        <li className="mb-2">
                          <span className="font-semibold">Address:</span>{" "}
                          {user?.address}
                        </li>

                        <li className="mb-2">
                          <span className="font-semibold">City:</span>{" "}
                          {user?.city}
                        </li>
                        <li className="mb-2">
                          <span className="font-semibold">State:</span>{" "}
                          {user?.state}
                        </li>
                        <li className="mb-2">
                          <span className="font-semibold">Country:</span>{" "}
                          {user?.country}
                        </li>

                        <li className="mb-2">
                          <span className="font-semibold">Zip Code:</span>{" "}
                          {user?.zip}
                        </li>

                        <li className="mb-2">
                          <span className="font-semibold">Start Date:</span>{" "}
                          {user?.startDate}
                        </li>
                        <li className="mb-2">
                          <span className="font-semibold">Expected Graduation Date:</span>{" "}
                          {user?.graduationDate}
                        </li>

                        <li className="mb-2">
                          <span className="font-semibold">Updated At:</span>{" "}
                          {user?.graduationDate}
                        </li>

                        <li className="mb-2">
                          <span className="font-semibold">Parent/Guardian Name:</span>{" "}
                          {user?.parentGuardian}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;

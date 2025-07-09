import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useUserStore } from "../../../stores/userStore";
import { IUser } from "../../../types/user";

export const Users = () => {
  const {
    users,
    fetchAllUsers,
    fetchUserById,
    deleteUserById,
  } = useUserStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleView = async (id: string) => {
    try {
      const user = await fetchUserById(id);

      if (!user) {
        console.error("User not found");
        return;
      }
      // found transcript so navigate to transcript page
      navigate(`/dashboard/users/${id}`);
    } catch (err) {
      console.error("Error fetching user:", err);
    
  };
}

 

  const handleEdit = async (id: string) => {
   
    console.log(id);

  };

  const handleDelete = async (id: string) => {
   // await deleteTranscript(id);
   const result = window.confirm("Are you sure you want to delete this user?");
   if (!result) {
     return;
   }

   console.log(result);
   await deleteUserById(id);
    
   
  };

  const handleCreateUser = async () => {
    // await createTranscript({ data });
  };

  return (
    <div>
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-6xl overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden">
            <thead className="flex justify-between"> 
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
               
               <div className="flex justify-center">
                 <label htmlFor="search" className="px-4 py-2 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400">Search</label>
                <input type="text" name="search" id="search" placeholder="Search" className="px-4 py-2 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400" />
               </div>
                
              </thead>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      View
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Edit
                    </th>
                  </tr>
                  
                </thead>
                <tbody>
                  {users.map((user: IUser) => (
                    <tr
                      key={user._id}
                      className="odd:bg-white even:bg-gray-100 dark:odd:bg-neutral-900 dark:even:bg-neutral-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                        {user.firstName}{" "}
                        {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                        {user.roles.join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          onClick={() => handleView(user._id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          Edit
                        </button>

                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        
                      </td>

                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan={6}>
                      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:bg-gray-800 dark:border-neutral-700">
                        <div className="flex flex-1 justify-between sm:hidden">
                          <a
                            href="#"
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Previous
                          </a>
                          <a
                            href="#"
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Next
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-4 text-right">
                <button
                  aria-label="Create transcript"
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateUser}
                >
                  Create
                </button>

                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
 
  );
};

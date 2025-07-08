import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { IUser } from "@/types/user";
import toast from "react-hot-toast";
import Placeholder from "@/components/Placeholder";
import { PenBox } from "lucide-react";

export const SettingsPage = () => {
  const { user, setUser, updateCurrentUser } = useAuthStore();

  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const inputClass = (editable: boolean) =>
    `w-full px-4 py-3 rounded-lg transition duration-150 ease-in-out ${
      editable
        ? "border border-gray-300 bg-white"
        : "bg-transparent border-none"
    }`;

  useEffect(() => {
    if (user) {
      console.log("User loaded:", user);
      setCurrentUser(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    // Build payload correctly
    const update: Partial<IUser> = {
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      email: payload.email as string,
      phone: payload.phone as string,
      dob: payload.dob as string,
      address: payload.address as string,
      country: payload.country as string,
      roles: currentUser?.roles || [],
    };

    try {
      const res = await updateCurrentUser(user!._id, update);
      toast.success("Account updated successfully");
      setCurrentUser(res);
      setUser(res);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update account");
    }
  };

  if (!currentUser) {
    return <Placeholder />;
  }

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <div className="container mx-auto px-4 py-12 max-w-3xl">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Manage Account {user?._id} 
                    </h2>
                    <p className="text-gray-500 mt-2">
                      Update your account details
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {isEditing ? (
                      <span>Cancel</span>
                    ) : (
                      <span className="flex flex-row items-center px-5">
                        <div className="mr-2">
                          <PenBox />
                        </div>
                        <span>Edit</span>
                      </span>
                    )}
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        disabled={!isEditing}
                        value={currentUser.firstName || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) =>
                              prev && { ...prev, firstName: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        disabled={!isEditing}
                        value={currentUser.lastName || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) =>
                              prev && { ...prev, lastName: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        disabled={!isEditing}
                        value={currentUser.email || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) => prev && { ...prev, email: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone{" "}
                        {currentUser.phone
                          ? `(${currentUser.phone})`
                          : "no phone number"}
                      </label>

                      <input
                        name="phone"
                        type="tel"
                        disabled={!isEditing}
                        value={currentUser.phone || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) => prev && { ...prev, phone: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        name="dob"
                        type="date"
                        disabled={!isEditing}
                        value={currentUser.dob || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) => prev && { ...prev, dob: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input type="hidden" name="country" value={currentUser.country} />

                      <CountryDropdown
                        defaultValue={currentUser.country}
                        disabled={!isEditing}
                        placeholder={"Select a country"}
                        onChange={(country) =>
                          setCurrentUser(
                            (prev) =>
                              prev && { ...prev, country: country.alpha3 }
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        disabled={!isEditing}
                        value={currentUser.address || ""}
                        onChange={(e) =>
                          setCurrentUser(
                            (prev) =>
                              prev && { ...prev, address: e.target.value }
                          )
                        }
                        className={inputClass(isEditing)}
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.roles.map((role) => (
                          <div
                            key={role}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

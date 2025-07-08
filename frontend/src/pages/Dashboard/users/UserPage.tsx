import { useUserStore } from "@/stores/userStore";
import { IUser } from "@/types/user";
import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";



const UserPage = () => {

    const { id } = useParams();

   

    const {fetchUserById} = useUserStore();

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
            <h1>User Page</h1>
            {user && (
                <div>
                    <p>Name: {user.firstName}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.roles.splice(0, 1)}</p>
                </div>
            )}
        </div>
    )
};

export default UserPage;
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getUserByID, createUser } from "../neo4j.action";

export default async function Callback() {
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated()))
        return redirect(
          "/api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
          );
    
    const user = await getUser();

    if (!user)
        return redirect(
          "/api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
        );
    
    //Check if user is already there in neo4j
    const dbUser = await getUserByID(user.id);

    if(!dbUser) {
        //Create a new user in Neo4j
        await createUser({ 
          applicationId: user.id,
          email: user.email!,
          firstname: user.given_name!,
          lastname: user.family_name ?? "",
        });
    }

    return redirect("/");
    //If not, create a new user
}
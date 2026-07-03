import { getUsers } from "@/app/actions/users";
import { createClient } from "@/lib/supabase/server";
import UsersTable from "@/app/dashboard/components/UsersTable";

export const metadata = {
  title: "User Directory — LuxeEstate Admin",
};

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const users = await getUsers();

  return (
    <div className="py-6">
      <UsersTable
        users={users}
        currentUserId={currentUser?.id ?? ""}
      />
    </div>
  );
}

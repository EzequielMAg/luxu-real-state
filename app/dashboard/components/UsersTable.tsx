"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UserWithRole, AppRole } from "@/app/types/user";
import { updateUserRole } from "@/app/actions/users";
import { useTranslation } from "@/app/i18n/I18nProvider";

interface UsersTableProps {
  users: UserWithRole[];
  currentUserId: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  google: "https://www.svgrepo.com/show/475656/google-color.svg",
  github: "https://www.svgrepo.com/show/512317/github-142.svg",
};

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const { t } = useTranslation();
  const d = (t as any).dashboard;
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localRoles, setLocalRoles] = useState<Record<string, AppRole>>(
    Object.fromEntries(users.map((u) => [u.user_id, u.role]))
  );

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    setLocalRoles((prev) => ({ ...prev, [userId]: newRole }));
    setLoadingId(userId);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        // Revertir si falla
        setLocalRoles((prev) => ({
          ...prev,
          [userId]: users.find((u) => u.user_id === userId)?.role ?? "user",
        }));
      }
      setLoadingId(null);
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
            <th className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-white/40 uppercase text-xs tracking-wider">
              {d?.colEmail ?? "Email"}
            </th>
            <th className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-white/40 uppercase text-xs tracking-wider">
              {d?.colProvider ?? "Provider"}
            </th>
            <th className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-white/40 uppercase text-xs tracking-wider">
              {d?.colRole ?? "Role"}
            </th>
            <th className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-white/40 uppercase text-xs tracking-wider">
              {d?.colJoined ?? "Joined"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {users.map((user) => {
            const isCurrentUser = user.user_id === currentUserId;
            const currentRole = localRoles[user.user_id] ?? user.role;
            const isLoading = isPending && loadingId === user.user_id;

            return (
              <tr
                key={user.user_id}
                className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
              >
                {/* Email + Avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.email ?? "User"}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-icons text-gray-400 dark:text-white/30 text-lg">
                          person
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.full_name || user.email}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-mosque/10 text-mosque dark:text-[#4db8a0] px-1.5 py-0.5 rounded-full font-normal">
                            You
                          </span>
                        )}
                      </p>
                      {user.full_name && (
                        <p className="text-xs text-gray-400 dark:text-white/30">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Provider */}
                <td className="px-5 py-4">
                  {user.provider && PROVIDER_ICONS[user.provider] ? (
                    <div className="flex items-center gap-2">
                      <Image
                        src={PROVIDER_ICONS[user.provider]}
                        alt={user.provider}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span className="capitalize text-gray-600 dark:text-white/60">
                        {user.provider}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-white/30 capitalize">
                      {user.provider ?? "—"}
                    </span>
                  )}
                </td>

                {/* Role Selector */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={currentRole}
                      onChange={(e) =>
                        handleRoleChange(user.user_id, e.target.value as AppRole)
                      }
                      disabled={isLoading}
                      className={`
                        text-xs font-semibold rounded-lg px-3 py-1.5 border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-mosque/30
                        ${
                          currentRole === "admin"
                            ? "bg-mosque/10 text-mosque dark:text-[#4db8a0] border-mosque/20 dark:bg-mosque/20"
                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <option value="user">{d?.roleUser ?? "User"}</option>
                      <option value="admin">{d?.roleAdmin ?? "Admin"}</option>
                    </select>
                    {isLoading && (
                      <span className="material-icons text-mosque text-sm animate-spin">
                        refresh
                      </span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <span className="text-gray-500 dark:text-white/40 text-xs">
                    {formatDate(user.created_at)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-white/30">
          <span className="material-icons text-4xl mb-2 block">group</span>
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
}

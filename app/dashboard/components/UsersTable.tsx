"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { UserWithRole, AppRole } from "@/app/types/user";
import { updateUserRole } from "@/app/actions/users";
import { useTranslation } from "@/app/i18n/I18nProvider";

interface UsersTableProps {
  users: UserWithRole[];
  currentUserId: string;
}

const TABS = ["All Users", "Agents", "Brokers", "Admins"];

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localRoles, setLocalRoles] = useState<Record<string, AppRole>>(
    Object.fromEntries(users.map((u) => [u.user_id, u.role]))
  );
  const [subRoles, setSubRoles] = useState<Record<string, string>>(
    Object.fromEntries(
      users.map((u) => [u.user_id, u.role === "admin" ? "Administrator" : "Agent"])
    )
  );
  const [suspended, setSuspended] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelection = (userId: string, dbRole: AppRole, label: string) => {
    if (userId === currentUserId && dbRole !== "admin") {
      setOpenDropdownId(null);
      setErrorModalMessage(
        "Medida de seguridad: No puedes quitarte ni rebajar tu propio rol de Administrador. Si necesitas modificar tus permisos, debe realizarlo otro administrador del sistema."
      );
      return;
    }

    setSubRoles((prev) => ({ ...prev, [userId]: label }));
    setSuspended((prev) => ({ ...prev, [userId]: false }));
    setLocalRoles((prev) => ({ ...prev, [userId]: dbRole }));
    setLoadingId(userId);
    setOpenDropdownId(null);
    startTransition(async () => {
      const result = await updateUserRole(userId, dbRole);
      if (!result.success) {
        setLocalRoles((prev) => ({
          ...prev,
          [userId]: users.find((u) => u.user_id === userId)?.role ?? "user",
        }));
        if (result.error) {
          setErrorModalMessage(result.error);
        }
      }
      setLoadingId(null);
    });
  };

  const handleSuspendUser = (userId: string) => {
    if (userId === currentUserId) {
      setOpenDropdownId(null);
      setErrorModalMessage(
        "Medida de seguridad: No puedes suspender ni bloquear tu propia cuenta activa mientras te encuentras en sesión."
      );
      return;
    }
    setSuspended((prev) => ({ ...prev, [userId]: true }));
    setOpenDropdownId(null);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const currentRole = localRoles[u.user_id] ?? u.role;
    const matchesSearch =
      (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "Admins") return currentRole === "admin";
    if (activeTab === "Agents" || activeTab === "Brokers") return currentRole === "user";
    return true;
  });

  const generateUsrId = (id: string) => `#USR-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;

  const getRoleLabel = (role: AppRole) => (role === "admin" ? "Administrator" : "Viewer / Agent");

  return (
    <div className="space-y-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            User Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Manage user access and roles for your properties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mosque transition-all"
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-xl border-2 border-mosque/30 text-mosque dark:text-[#4db8a0] bg-mosque/5 hover:bg-mosque hover:text-white dark:hover:bg-[#4db8a0] dark:hover:text-[#0a1a17] font-semibold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-icons text-base">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
              activeTab === tab
                ? "text-mosque dark:text-[#4db8a0]"
                : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-mosque dark:bg-[#4db8a0]" />
            )}
          </button>
        ))}
      </div>

      {/* Directory Columns Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-wider">
        <div className="col-span-4">USER DETAILS</div>
        <div className="col-span-3">ROLE & STATUS</div>
        <div className="col-span-3">PERFORMANCE</div>
        <div className="col-span-2 text-right">ACTIONS</div>
      </div>

      {/* Directory Cards List */}
      <div className="space-y-3.5">
        {filteredUsers.map((user, index) => {
          const isCurrentUser = user.user_id === currentUserId;
          const currentRole = localRoles[user.user_id] ?? user.role;
          const isLoading = isPending && loadingId === user.user_id;
          const isOpen = openDropdownId === user.user_id;
          const isHighlighted = index === 0 || currentRole === "admin";

          return (
            <div
              key={user.user_id}
              className={`grid grid-cols-1 lg:grid-cols-12 items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                isHighlighted
                  ? "bg-[#eef7f3] dark:bg-[#112722] border-mosque/30 dark:border-mosque/40 shadow-sm"
                  : "bg-white dark:bg-[#0e211e] border-gray-200 dark:border-white/10 hover:border-mosque/20"
              }`}
            >
              {/* Col 1: User Details */}
              <div className="col-span-1 lg:col-span-4 flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.email ?? "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-icons text-gray-400 text-2xl">person</span>
                    )}
                  </div>
                  {/* Status green dot */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0e211e]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {user.full_name || user.email?.split("@")[0]}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs bg-mosque text-white px-2 py-0.5 rounded-full font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/50">{user.email}</p>
                  <span className="inline-block mt-1 text-[11px] font-mono font-medium text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                    ID: {generateUsrId(user.user_id)}
                  </span>
                </div>
              </div>

              {/* Col 2: Role & Status */}
              <div className="col-span-1 lg:col-span-3 flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${
                    currentRole === "admin"
                      ? "bg-[#1f4a42] text-white dark:bg-[#4db8a0] dark:text-[#0a1a17]"
                      : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70"
                  }`}
                >
                  {subRoles[user.user_id] ?? (currentRole === "admin" ? "Administrator" : "Agent")}
                </span>

                {suspended[user.user_id] ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                    <span className="material-icons text-base">block</span>
                    <span>Suspended</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="material-icons text-base">check_circle</span>
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Col 3: Performance */}
              <div className="col-span-1 lg:col-span-3 flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-white/40">
                    PROPERTIES
                  </p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">
                    {currentRole === "admin" ? "—" : "12"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-white/40">
                    {currentRole === "admin" ? "ACCESS LEVEL" : "SALES (YTD)"}
                  </p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">
                    {currentRole === "admin" ? "Level 5" : "$2.4M"}
                  </p>
                </div>
              </div>

              {/* Col 4: Actions (Dropdown) */}
              <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-end relative" ref={isOpen ? dropdownRef : null}>
                <button
                  onClick={() => setOpenDropdownId(isOpen ? null : user.user_id)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                    isOpen
                      ? "bg-[#153a33] text-white border-mosque"
                      : "bg-white dark:bg-[#152e2a] text-gray-800 dark:text-white border-gray-200 dark:border-white/10 hover:border-mosque"
                  }`}
                >
                  <span>Change Role</span>
                  {isLoading ? (
                    <span className="material-icons text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-icons text-base">expand_more</span>
                  )}
                </button>

                {/* Styled Dropdown Menu matching screenshot exactly */}
                {isOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-[#0b2823] text-white rounded-2xl shadow-2xl border border-mosque/40 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <button
                      onClick={() => handleRoleSelection(user.user_id, "admin", "Administrator")}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-mosque/40 flex items-center gap-3 transition-colors cursor-pointer ${
                        (subRoles[user.user_id] ?? (currentRole === "admin" ? "Administrator" : "")) === "Administrator" ? "bg-mosque/30 font-bold text-white" : "text-gray-200"
                      }`}
                    >
                      <span className="material-icons text-sm text-[#4db8a0]">security</span>
                      <span>Administrator</span>
                      {(subRoles[user.user_id] ?? (currentRole === "admin" ? "Administrator" : "")) === "Administrator" && (
                        <span className="material-icons text-xs ml-auto text-[#4db8a0]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSelection(user.user_id, "user", "Broker")}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-mosque/40 flex items-center gap-3 transition-colors cursor-pointer ${
                        subRoles[user.user_id] === "Broker" ? "bg-mosque/30 font-bold text-white" : "text-gray-200"
                      }`}
                    >
                      <span className="material-icons text-sm text-[#4db8a0]">work</span>
                      <span>Broker</span>
                      {subRoles[user.user_id] === "Broker" && (
                        <span className="material-icons text-xs ml-auto text-[#4db8a0]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSelection(user.user_id, "user", "Agent")}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-mosque/40 flex items-center gap-3 transition-colors cursor-pointer ${
                        (subRoles[user.user_id] ?? (currentRole === "user" ? "Agent" : "")) === "Agent" ? "bg-mosque/30 font-bold text-white" : "text-gray-200"
                      }`}
                    >
                      <span className="material-icons text-sm text-[#4db8a0]">support_agent</span>
                      <span>Agent</span>
                      {(subRoles[user.user_id] ?? (currentRole === "user" ? "Agent" : "")) === "Agent" && (
                        <span className="material-icons text-xs ml-auto text-[#4db8a0]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSelection(user.user_id, "user", "Viewer")}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-mosque/40 flex items-center gap-3 transition-colors cursor-pointer ${
                        subRoles[user.user_id] === "Viewer" ? "bg-mosque/30 font-bold text-white" : "text-gray-200"
                      }`}
                    >
                      <span className="material-icons text-sm text-[#4db8a0]">visibility</span>
                      <span>Viewer</span>
                      {subRoles[user.user_id] === "Viewer" && (
                        <span className="material-icons text-xs ml-auto text-[#4db8a0]">check</span>
                      )}
                    </button>

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={() => handleSuspendUser(user.user_id)}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/20 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-sm text-red-400">block</span>
                      <span>Suspend User</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-white/40 bg-white dark:bg-[#0a1a17] rounded-2xl border border-gray-200 dark:border-white/10">
            <span className="material-icons text-4xl mb-2 block">person_off</span>
            <p className="text-sm font-medium">No users match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs font-medium text-gray-500 dark:text-white/50 border-t border-gray-200 dark:border-white/10">
        <div>
          Showing <span className="font-bold text-gray-900 dark:text-white">1</span> to{" "}
          <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> of{" "}
          <span className="font-bold text-gray-900 dark:text-white">{users.length}</span> users
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <span className="material-icons text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-[#11302b] text-white font-bold flex items-center justify-center">
            1
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={true}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <span className="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e211e] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-white/50 mb-4">
              Send an invitation email to add a new broker or administrator to LuxeEstate.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-white/60 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="broker@luxuryestates.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-white/60 mb-1">
                  Initial Role
                </label>
                <select className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#152e2a] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque">
                  <option value="user">Senior Broker / Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-mosque text-white hover:bg-mosque/90 cursor-pointer shadow-sm"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Error Modal */}
      {errorModalMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e211e] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-red-500 text-xl">gpp_bad</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Protección y Seguridad
                </h3>
                <p className="text-xs text-red-500 font-medium">Acción restingida por seguridad</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/80 mb-6 leading-relaxed">
              {errorModalMessage}
            </p>
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => setErrorModalMessage(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 cursor-pointer shadow-sm transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

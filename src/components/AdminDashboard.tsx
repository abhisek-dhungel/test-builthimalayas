"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser, CustomOrder, Inquiry, Listing, NewsItem, VisitOrder } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { getDistrictLabel } from "@/lib/locations";
import { formatPrice, formatPriceRange, formatParkingLabel, getPropertyTypeLabel } from "@/lib/property";
import { NewsAdminPanel } from "./NewsAdminPanel";
import { BuiltLogo } from "./BuiltLogo";
import { SiteHeader } from "./SiteHeader";
import "@/app/admin-dashboard.css";
import "@/app/auth-form.css";

type Tab = "listings" | "orders" | "custom-orders" | "inquiries" | "news" | "users";

const TAB_LABELS: Record<Tab, string> = {
  listings: "All Listings",
  orders: "New Orders",
  "custom-orders": "Custom Orders",
  inquiries: "Inquiries",
  news: "News",
  users: "Users",
};

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<VisitOrder[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userListingsLoading, setUserListingsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setActionError("");

    const [listingsRes, ordersRes, customOrdersRes, inquiriesRes, newsRes, usersRes] =
      await Promise.all([
        fetch("/api/admin/listings", { credentials: "same-origin" }),
        fetch("/api/admin/orders?status=new", { credentials: "same-origin" }),
        fetch("/api/admin/custom-orders", {
          credentials: "same-origin",
        }),
        fetch("/api/admin/inquiries?status=new", { credentials: "same-origin" }),
        fetch("/api/admin/news", { credentials: "same-origin" }),
        fetch("/api/admin/users", { credentials: "same-origin" }),
      ]);

    if (listingsRes.status === 401) {
      router.push("/admin/login");
      return;
    }

    setListings(await listingsRes.json());
    setOrders(await ordersRes.json());
    setCustomOrders(await customOrdersRes.json());
    setInquiries(inquiriesRes.ok ? await inquiriesRes.json() : []);
    setNews(newsRes.ok ? await newsRes.json() : []);
    setUsers(usersRes.ok ? await usersRes.json() : []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleListingAction(id: number, action: string) {
    setActionError("");
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error || "Action failed.");
      return;
    }

    loadData();
  }

  async function handleOrderStatus(id: number, status: string) {
    setActionError("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setActionError("Could not update order.");
      return;
    }

    loadData();
  }

  async function handleCustomOrderStatus(id: number, status: string) {
    setActionError("");
    const res = await fetch(`/api/admin/custom-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setActionError("Could not update custom order.");
      return;
    }

    loadData();
  }

  async function handleInquiryStatus(id: number, status: string) {
    setActionError("");
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setActionError("Could not update inquiry.");
      return;
    }

    loadData();
  }

  async function loadUserListings(userId: number) {
    setUserListingsLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/listings`, {
      credentials: "same-origin",
    });
    setUserListings(res.ok ? await res.json() : []);
    setUserListingsLoading(false);
  }

  function selectUser(userId: number) {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setUserListings([]);
      return;
    }
    setSelectedUserId(userId);
    void loadUserListings(userId);
  }

  async function handleUserBlock(userId: number, blocked: boolean) {
    setActionError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ blocked }),
    });

    if (!res.ok) {
      setActionError("Could not update user status.");
      return;
    }

    await loadData();
    if (selectedUserId === userId) {
      void loadUserListings(userId);
    }
  }

  async function handleUserDelete(userId: number) {
    setActionError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (!res.ok) {
      setActionError("Could not delete user.");
      return;
    }

    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setUserListings([]);
    }
    await loadData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const newOrdersCount = orders.length;
  const newCustomOrdersCount = customOrders.filter(
    (order) => order.status === "new",
  ).length;
  const newInquiriesCount = inquiries.length;
  const newsCount = news.length;
  const usersCount = users.length;

  const filteredListings = listings.filter((listing) => {
    const districtOk =
      districtFilter === "all" || listing.district === districtFilter;
    const statusOk =
      statusFilter === "all" || listing.status === statusFilter;
    return districtOk && statusOk;
  });

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h1>Admin Dashboard</h1>
          <p>
            BUILT Himalayas · {pendingCount} pending review
          </p>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          <SidebarLink
            active={tab === "listings"}
            onClick={() => setTab("listings")}
            count={listings.length}
          >
            {TAB_LABELS.listings}
          </SidebarLink>
          <SidebarLink
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            count={newOrdersCount}
          >
            {TAB_LABELS.orders}
          </SidebarLink>
          <SidebarLink
            active={tab === "custom-orders"}
            onClick={() => setTab("custom-orders")}
            count={newCustomOrdersCount}
          >
            {TAB_LABELS["custom-orders"]}
          </SidebarLink>
          <SidebarLink
            active={tab === "inquiries"}
            onClick={() => setTab("inquiries")}
            count={newInquiriesCount}
          >
            {TAB_LABELS.inquiries}
          </SidebarLink>
          <SidebarLink
            active={tab === "users"}
            onClick={() => {
              setTab("users");
              setSelectedUserId(null);
              setUserListings([]);
            }}
            count={usersCount}
          >
            {TAB_LABELS.users}
          </SidebarLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            onClick={() => setTab("news")}
            className={`admin-sidebar-news${tab === "news" ? " is-active" : ""}`}
          >
            <span>{TAB_LABELS.news}</span>
            <span className="admin-sidebar-link-count">{newsCount}</span>
          </button>
          <button type="button" onClick={logout} className="admin-sidebar-logout">
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main-header">
          <h2>{TAB_LABELS[tab]}</h2>
          <p>Manage {TAB_LABELS[tab].toLowerCase()} for BUILT Himalayas</p>
        </div>

        {actionError && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : tab === "listings" ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {["all", "pending", "active", "stopped", "taken"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                    statusFilter === status
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {status === "all" ? "All status" : status}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {["all", "kathmandu"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistrictFilter(d)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                    districtFilter === d
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {d === "all" ? "All districts" : getDistrictLabel(d as never)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  onAction={handleListingAction}
                />
              ))}
              {filteredListings.length === 0 && (
                <p className="text-sm text-[var(--muted)]">No listings found.</p>
              )}
            </div>
          </>
        ) : tab === "orders" ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onStatusChange={handleOrderStatus}
              />
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                No new visit requests right now.
              </p>
            )}
          </div>
        ) : tab === "custom-orders" ? (
          <div className="space-y-3">
            {customOrders.map((order) => (
              <CustomOrderRow
                key={order.id}
                order={order}
                onStatusChange={handleCustomOrderStatus}
              />
            ))}
            {customOrders.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                No custom orders right now.
              </p>
            )}
          </div>
        ) : tab === "inquiries" ? (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                onStatusChange={handleInquiryStatus}
              />
            ))}
            {inquiries.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                No new inquiries right now.
              </p>
            )}
          </div>
        ) : tab === "news" ? (
          <NewsAdminPanel
            items={news}
            onChanged={loadData}
            onError={setActionError}
          />
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                selected={selectedUserId === user.id}
                listings={selectedUserId === user.id ? userListings : []}
                listingsLoading={
                  selectedUserId === user.id && userListingsLoading
                }
                onSelect={() => selectUser(user.id)}
                onBlock={() => handleUserBlock(user.id, true)}
                onUnblock={() => handleUserBlock(user.id, false)}
                onDelete={() => handleUserDelete(user.id)}
                onListingAction={handleListingAction}
              />
            ))}
            {users.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                No signed-up users yet.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function UserRow({
  user,
  selected,
  listings,
  listingsLoading,
  onSelect,
  onBlock,
  onUnblock,
  onDelete,
  onListingAction,
}: {
  user: AppUser;
  selected: boolean;
  listings: Listing[];
  listingsLoading: boolean;
  onSelect: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onDelete: () => void;
  onListingAction: (id: number, action: string) => void;
}) {
  const isBlocked = Boolean(user.blocked);

  return (
    <div
      className={`rounded-2xl border bg-[var(--surface)] transition ${
        selected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/15"
          : "border-[var(--border)]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full p-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
          {isBlocked && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
              Blocked
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--text)]">{user.phone}</p>
        {user.address && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Address: {user.address}
          </p>
        )}
        <p className="mt-1 text-xs text-[var(--muted)]">
          Joined {formatDateTime(user.created_at)}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--primary)]">
          {selected ? "Hide listings" : "View listings"} →
        </p>
      </button>

      {selected && (
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {isBlocked ? (
              <ActionBtn label="Unblock user" primary onClick={onUnblock} />
            ) : (
              <ActionBtn
                label="Block user"
                danger
                onClick={() => {
                  if (
                    confirm(
                      `Block ${user.name}? They will not be able to log in.`,
                    )
                  ) {
                    onBlock();
                  }
                }}
              />
            )}
            <ActionBtn
              label="Delete user"
              danger
              onClick={() => {
                if (
                  confirm(
                    `Delete ${user.name} permanently? Their account and favorites will be removed. Listings stay in the system.`,
                  )
                ) {
                  onDelete();
                }
              }}
            />
          </div>

          <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">
            Listings by this user
          </h3>

          {listingsLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading listings...</p>
          ) : listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  onAction={onListingAction}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No listings found for this phone number.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ListingRow({
  listing,
  onAction,
}: {
  listing: Listing;
  onAction: (id: number, action: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
          {listing.image_path ? (
            <Image
              src={listing.image_path}
              alt={listing.place}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">🏠</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text)]">
              {listing.place}
            </span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
            <StatusBadge status={listing.status} />
            {listing.featured === 1 && (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                Featured
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {getDistrictLabel(listing.district)} · Near {listing.landmark}
          </p>
          {listing.property_details && (
            <p className="mt-1 text-xs text-[var(--text)]">
              {listing.property_details}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--text)]">
            {formatParkingLabel(
              listing.parking_two_wheeler,
              listing.parking_four_wheeler,
            )}
          </p>
          {listing.other_facilities && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Facilities: {listing.other_facilities}
            </p>
          )}
          <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
            {formatPrice(listing.price)}
          </p>
          <p className="mt-1 text-sm text-[var(--text)]">
            {listing.name} · {listing.phone}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Listed by {listing.role === "agent" ? "Agent" : "HouseOwner"} ·{" "}
            {formatDateTime(listing.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {listing.status === "pending" && (
          <>
            <ActionBtn
              label="Approve"
              primary
              onClick={() => onAction(listing.id, "activate")}
            />
            <ActionBtn
              label="Reject"
              danger
              onClick={() => {
                if (confirm("Reject and delete this listing?")) {
                  onAction(listing.id, "reject");
                }
              }}
            />
          </>
        )}
        {listing.status !== "pending" && listing.status !== "active" && (
          <ActionBtn
            label="Activate"
            onClick={() => onAction(listing.id, "activate")}
          />
        )}
        {listing.status === "active" && (
          <ActionBtn
            label="Stop"
            onClick={() => onAction(listing.id, "stop")}
          />
        )}
        {listing.status !== "taken" && listing.status !== "pending" && (
          <ActionBtn
            label="Mark taken"
            onClick={() => onAction(listing.id, "taken")}
          />
        )}
        {listing.status === "active" &&
          (listing.featured === 0 ? (
            <ActionBtn
              label="Feature"
              primary
              onClick={() => onAction(listing.id, "feature")}
            />
          ) : (
            <ActionBtn
              label="Unfeature"
              onClick={() => onAction(listing.id, "unfeature")}
            />
          ))}
        <ActionBtn
          label="Delete"
          danger
          onClick={() => {
            if (confirm("Delete this listing permanently?")) {
              onAction(listing.id, "delete");
            }
          }}
        />
      </div>
    </div>
  );
}

function CustomOrderRow({
  order,
  onStatusChange,
}: {
  order: CustomOrder;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text)]">
              {order.name} · {order.phone}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {getDistrictLabel(order.district)} · {order.place} · Near{" "}
            {order.landmark}
          </p>
          <p className="mt-1 text-xs text-[var(--text)]">
            {getPropertyTypeLabel(order.property_type)}
            {order.property_details ? ` · ${order.property_details}` : ""}
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
            {formatPriceRange(order.price_min, order.price_max)}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {formatDateTime(order.created_at)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {order.status === "new" && (
          <ActionBtn
            label="Mark contacted"
            onClick={() => onStatusChange(order.id, "contacted")}
          />
        )}
        {order.status !== "closed" && (
          <ActionBtn
            label="Close"
            onClick={() => onStatusChange(order.id, "closed")}
          />
        )}
      </div>
    </div>
  );
}

function InquiryRow({
  inquiry,
  onStatusChange,
}: {
  inquiry: Inquiry;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">
            {inquiry.name} · {inquiry.phone}
          </p>
          {inquiry.remarks ? (
            <p className="mt-2 text-sm text-[var(--text)]">{inquiry.remarks}</p>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted)]">No remarks</p>
          )}
          <p className="mt-2 text-xs text-[var(--muted)]">
            {formatDateTime(inquiry.created_at)}
          </p>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionBtn
          label="Mark contacted"
          onClick={() => onStatusChange(inquiry.id, "contacted")}
        />
        <ActionBtn
          label="Close"
          onClick={() => onStatusChange(inquiry.id, "closed")}
        />
        <a
          href={`tel:${inquiry.phone}`}
          className="rounded-full border border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]"
        >
          Call
        </a>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onStatusChange,
}: {
  order: VisitOrder;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex gap-3">
        {order.image_path && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
            <Image
              src={order.image_path}
              alt={order.place ?? "Property"}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">
            {order.name} · {order.phone}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Wants to visit: {order.place} · {order.landmark}
          </p>
          {order.property_type != null && (
            <p className="mt-1 text-xs text-[var(--text)]">
              {getPropertyTypeLabel(order.property_type)}
              {order.property_details ? ` · ${order.property_details}` : ""} ·{" "}
              {formatPrice(order.price)}
            </p>
          )}
          {order.listing_name && (
            <p className="text-xs text-[var(--muted)]">
              Owner contact: {order.listing_name}
            </p>
          )}
          {order.listing_role && (
            <p className="text-xs text-[var(--muted)]">
              Listed by {order.listing_role === "agent" ? "Agent" : "HouseOwner"}
            </p>
          )}
          <p className="text-xs text-[var(--muted)]">
            {order.district ? getDistrictLabel(order.district) : ""} ·{" "}
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionBtn
          label="Mark contacted"
          onClick={() => onStatusChange(order.id, "contacted")}
        />
        <ActionBtn
          label="Close"
          onClick={() => onStatusChange(order.id, "closed")}
        />
      </div>
    </div>
  );
}

function SidebarLink({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-sidebar-link${active ? " is-active" : ""}`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className="admin-sidebar-link-count">{count}</span>
      )}
    </button>
  );
}

function ActionBtn({
  label,
  onClick,
  primary,
  danger,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
        danger
          ? "border border-red-200 bg-red-50 text-red-700"
          : primary
            ? "bg-[var(--accent)] text-white"
            : "border border-[var(--border)] bg-[var(--bg)]"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-800",
    active: "bg-[#e8eef3] text-[#153350]",
    stopped: "bg-yellow-100 text-yellow-800",
    taken: "bg-gray-100 text-gray-700",
    new: "bg-[#e8eef3] text-[#0d2136]",
    contacted: "bg-blue-100 text-blue-700",
    closed: "bg-gray-100 text-gray-600",
    blocked: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center self-start rounded-full px-2.5 py-1 text-[9px] font-bold uppercase leading-none tracking-wide ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <>
      <SiteHeader showBack />
      <main className={`auth-page ${ready ? "is-ready" : ""}`}>
        <div className="auth-shell">
          <form onSubmit={handleSubmit} className="auth-card">
            <div className="auth-brand">
              <BuiltLogo size="md" showTagline />
            </div>

            <span className="auth-kicker">Admin access</span>
            <h1 className="auth-title">Admin login</h1>
            <p className="auth-subtitle">
              Manage listings, orders, and visit requests.
            </p>

            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Username</span>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  placeholder="Username"
                  autoComplete="username"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

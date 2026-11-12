import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Boxes,
  ArrowLeftRight,
  Factory,
  ChevronLeft,
  History,
} from "lucide-react";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "PROCUREMENT",
    items: [
      { name: "Suppliers", path: "/suppliers", icon: Users },
      { name: "Materials", path: "/materials", icon: Package },
      { name: "Purchase Orders", path: "/purchase-orders", icon: ShoppingCart },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Warehouses", path: "/warehouses", icon: Warehouse },
      { name: "Shipments", path: "/shipments", icon: Truck },
      { name: "Inventory", path: "/inventory", icon: Package },
      { name: "Inventory Transactions", path: "/inventory-transactions", icon: History },
    ],
  },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-[#101B33] text-white transition-all duration-300`}
    >
      {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
              {!collapsed && (
                  <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                          <Factory size={23} />
                      </div>

                      <div>
                          <h1 className="text-lg font-bold tracking-wide">
                              ProcureWise
                          </h1>
                          <p className="text-xs text-slate-400">
                              Manufacturing SaaS
                          </p>
                      </div>
                  </div>
              )}

              <button
                  onClick={onToggle}
                  className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:block"
                  aria-label="Toggle sidebar"
              >
                  <ChevronLeft
                      size={18}
                      className={collapsed ? "rotate-180" : ""}
                  />
              </button>
          </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : ""}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-950/30"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={19} className="shrink-0" />

                    {!collapsed && (
                      <span className="whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <p className="text-xs text-slate-500">
            ProcureWise v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
import {
  Users,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import InventoryOverview from "../components/dashboard/InventoryOverview";

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your manufacturing business.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Suppliers"
          value="16"
          description="Registered suppliers"
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Total Materials"
          value="42"
          description="Available raw materials"
          icon={Package}
          color="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="Purchase Orders"
          value="28"
          description="Total purchase orders"
          icon={ShoppingCart}
          color="bg-orange-50 text-orange-600"
        />

        <StatCard
          title="Active Shipments"
          value="12"
          description="Currently in progress"
          icon={Truck}
          color="bg-green-50 text-green-600"
        />

        <StatCard
          title="Inventory Items"
          value="35"
          description="Material and warehouse combinations"
          icon={Boxes}
          color="bg-pink-50 text-pink-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <InventoryOverview />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">
            Recent Activity
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Recent business operations will appear here.
          </p>

          <div className="mt-8 flex min-h-52 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Boxes size={28} className="text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Activity feed coming soon
            </p>
            <p className="mt-1 text-xs text-slate-400">
              We will connect this section to your backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
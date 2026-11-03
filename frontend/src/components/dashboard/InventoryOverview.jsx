import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const inventoryData = [
  { material: "Steel", quantity: 400 },
  { material: "Aluminium", quantity: 300 },
  { material: "Copper", quantity: 200 },
  { material: "Plastic", quantity: 350 },
  { material: "Rubber", quantity: 150 },
];

function InventoryOverview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-800">
          Inventory Overview
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Stock quantity by material
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="material"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar
              dataKey="quantity"
              fill="#2563EB"
              radius={[5, 5, 0, 0]}
              barSize={35}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Demo data — live inventory integration comes later.
      </p>
    </div>
  );
}

export default InventoryOverview;
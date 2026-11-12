
import { Pencil, Trash2, Package } from "lucide-react";

function MaterialTable({ materials, onEdit, onDelete }) {
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
        <div className="rounded-full bg-slate-100 p-4">
          <Package size={28} className="text-slate-400" />
        </div>

        <h3 className="mt-4 font-semibold text-slate-700">
          No materials found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add your first material to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">
                Material
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                SKU
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                Unit
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                Unit Cost
              </th>

              <th className="px-6 py-4 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {materials.map((material) => (
              <tr
                key={material.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">
                    {material.material_name}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    ID: {material.id}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                    {material.sku}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {material.unit}
                </td>

                <td className="px-6 py-4 font-medium text-slate-800">
                  ₹{Number(material.unit_cost).toFixed(2)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(material)}
                      title="Edit material"
                      aria-label={`Edit ${material.material_name}`}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => onDelete(material)}
                      title="Delete material"
                      aria-label={`Delete ${material.material_name}`}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-6 py-3">
        <p className="text-xs text-slate-500">
          Total materials: {materials.length}
        </p>
      </div>
    </div>
  );
}

export default MaterialTable;

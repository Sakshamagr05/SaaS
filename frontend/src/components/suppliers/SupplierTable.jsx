
import { Pencil, Trash2, Users } from "lucide-react";

function SupplierTable({ suppliers, onEdit, onDelete }) {
  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
        <div className="rounded-full bg-slate-100 p-4">
          <Users size={28} className="text-slate-400" />
        </div>

        <h3 className="mt-4 font-semibold text-slate-700">
          No suppliers found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add your first supplier to get started.
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
                Supplier
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                Email
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                Phone
              </th>

              <th className="px-6 py-4 font-semibold text-slate-600">
                Address
              </th>

              <th className="px-6 py-4 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">
                    {supplier.supplier_name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    ID: {supplier.id}
                  </div>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {supplier.email || "-"}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {supplier.phone || "-"}
                </td>

                <td className="max-w-48 truncate px-6 py-4 text-slate-600">
                  {supplier.address || "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(supplier)}
                      title="Edit supplier"
                      aria-label={`Edit ${supplier.supplier_name}`}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => onDelete(supplier)}
                      title="Delete supplier"
                      aria-label={`Delete ${supplier.supplier_name}`}
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
          Total suppliers: {suppliers.length}
        </p>
      </div>
    </div>
  );
}

export default SupplierTable;

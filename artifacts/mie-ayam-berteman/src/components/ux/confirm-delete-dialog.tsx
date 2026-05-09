import React, { useState } from "react";

type Props = {
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
  trigger: React.ReactNode;
};

export default function ConfirmDeleteDialog({
  title = "Hapus data?",
  description = "Aksi ini tidak bisa dibatalkan.",
  itemName,
  onConfirm,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {description} {itemName ? `(${itemName})` : ""}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)} disabled={loading}>
                Batal
              </button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white" onClick={handleConfirm} disabled={loading}>
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

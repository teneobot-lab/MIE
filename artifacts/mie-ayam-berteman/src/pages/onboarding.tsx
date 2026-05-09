import { useState } from "react";

const steps = [
  "Lengkapi profil usaha",
  "Tambahkan produk pertama",
  "Pelajari alur kasir",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Selamat datang</h1>
      <p className="mt-2 text-sm text-gray-600">Ikuti 3 langkah singkat ini untuk mulai menggunakan aplikasi.</p>

      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm font-medium text-gray-500">
          Langkah {step + 1} dari {steps.length}
        </div>
        <h2 className="mt-2 text-lg font-semibold">{steps[step]}</h2>

        <div className="mt-6 flex justify-between">
          <button
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Kembali
          </button>
          <button
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
          >
            {step === steps.length - 1 ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}

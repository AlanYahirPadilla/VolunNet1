import Link from "next/link";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full flex flex-col items-center border border-blue-100">
        <div className="mb-4">
          <Settings className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración</h1>
        <div className="text-gray-500 text-sm mb-6 text-center">Próximamente podrás personalizar tu experiencia aquí.</div>
        <Link href="/dashboard" className="mt-2 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all">Regresar al Dashboard</Link>
      </div>
    </div>
  );
} 
"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileCompletionCardProps {
  completion: number; // 0-100
  checklist: Array<{
    label: string;
    completed: boolean;
    action?: () => void;
    link?: string;
  }>;
}

export default function ProfileCompletionCard({ completion, checklist }: ProfileCompletionCardProps) {
  if (completion >= 100) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl shadow-lg p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-800">¡Completa tu perfil para mejorar tu experiencia!</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mb-2">Perfil completado: <span className="font-bold text-blue-700">{completion}%</span></div>
        <ul className="space-y-1">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className={item.completed ? "text-gray-500 line-through" : "text-gray-800 font-medium"}>{item.label}</span>
              {!item.completed && item.link && (
                <a href={item.link} className="ml-2 text-blue-600 underline text-xs">Completar</a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
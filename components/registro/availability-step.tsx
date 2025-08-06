"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Plus } from "lucide-react";

const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export interface TimeSlot {
  day: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface AvailabilityStepProps {
  timeSlots: TimeSlot[];
  setTimeSlots: (slots: TimeSlot[]) => void;
  hoursPerWeek: string;
  setHoursPerWeek: (hours: string) => void;
}

export default function AvailabilityStep({ timeSlots, setTimeSlots, hoursPerWeek, setHoursPerWeek }: AvailabilityStepProps) {
  const [newSlot, setNewSlot] = useState<TimeSlot>({ day: "Lunes", start: "16:00", end: "18:00" });

  const addSlot = () => {
    if (!newSlot.day || !newSlot.start || !newSlot.end) return;
    setTimeSlots([...timeSlots, { ...newSlot }]);
  };

  const removeSlot = (idx: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Cuándo puedes participar?</h3>
        <p className="text-gray-600">Agrega uno o varios bloques de disponibilidad semanal. Ejemplo: Lunes 16:00-18:00, Sábado 09:00-14:00.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={newSlot.day}
            onChange={e => setNewSlot(s => ({ ...s, day: e.target.value }))}
          >
            {WEEK_DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="time"
            className="border rounded-lg px-3 py-2 w-full"
            value={newSlot.start}
            onChange={e => setNewSlot(s => ({ ...s, start: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="time"
            className="border rounded-lg px-3 py-2 w-full"
            value={newSlot.end}
            onChange={e => setNewSlot(s => ({ ...s, end: e.target.value }))}
          />
        </div>
        <Button type="button" onClick={addSlot} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horas disponibles por semana</label>
        <input
          type="number"
          min={1}
          max={60}
          className="border rounded-lg px-3 py-2 w-32"
          value={hoursPerWeek}
          onChange={e => setHoursPerWeek(e.target.value)}
          placeholder="Ej: 6"
        />
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Disponibilidad agregada</h4>
        {timeSlots.length === 0 ? (
          <div className="text-gray-500 text-sm">No has agregado ningún bloque de disponibilidad.</div>
        ) : (
          <ul className="space-y-2">
            {timeSlots.map((slot, idx) => (
              <li key={idx} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="font-medium text-blue-700">{slot.day}</span>
                <span className="text-gray-700">{slot.start} - {slot.end}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(idx)} title="Eliminar">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
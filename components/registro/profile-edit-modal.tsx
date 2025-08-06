import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Award, Clock, Users, Share2, FileDown, Globe, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Briefcase, Star, AtSign, Link as LinkIcon } from "lucide-react";

const GENDERS = ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"];
const SKILLS = [
  "Programación", "Diseño gráfico", "Comunicación", "Liderazgo", "Enseñanza",
  "Logística", "Fotografía", "Marketing", "Atención al cliente", "Redacción"
];
const LANGUAGES = [
  "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Japonés"
];
const COUNTRIES = ["México", "España", "Argentina", "Colombia", "Estados Unidos", "Chile", "Perú", "Otro"];

const STEP_ICONS = [
  <User className="h-6 w-6 text-blue-500" />,
  <Award className="h-6 w-6 text-purple-500" />,
  <Clock className="h-6 w-6 text-green-500" />,
  <Users className="h-6 w-6 text-yellow-500" />,
  <CheckCircle2 className="h-6 w-6 text-indigo-500" />,
];
const STEP_COLORS = [
  "from-blue-50 to-blue-100",
  "from-purple-50 to-purple-100",
  "from-green-50 to-green-100",
  "from-yellow-50 to-yellow-100",
  "from-indigo-50 to-indigo-100",
];

const SOCIALS = [
  { label: "Facebook", icon: <LinkIcon className="h-4 w-4 text-blue-600" />, key: "facebook" },
  { label: "Instagram", icon: <LinkIcon className="h-4 w-4 text-pink-500" />, key: "instagram" },
  { label: "Twitter", icon: <LinkIcon className="h-4 w-4 text-blue-400" />, key: "twitter" },
];

function validateSocialUrl(label: string, url: string) {
  if (!url) return true;
  if (label === "Facebook") return /^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$/.test(url);
  if (label === "Instagram") return /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+$/.test(url);
  if (label === "Twitter") return /^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_.-]+$/.test(url);
  return false;
}

export default function ProfileEditModal({ open, onClose, initialData, onSave }: any) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [socialErrors, setSocialErrors] = useState<{[key: string]: boolean}>({});
  const steps = [
    "Información básica",
    "Habilidades e idiomas",
    "Disponibilidad",
    "Referencias y redes sociales",
    "Resumen"
  ];
  const handleChange = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));
  const handleMultiSelect = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...(prev[field] || []), value],
    }));
  };
  const handleAddReference = () => setForm((prev: any) => ({ ...prev, references: [...(prev.references || []), ""] }));
  const handleReferenceChange = (idx: number, value: string) => setForm((prev: any) => {
    const refs = [...(prev.references || [])]; refs[idx] = value; return { ...prev, references: refs };
  });
  const handleRemoveReference = (idx: number) => setForm((prev: any) => {
    const refs = [...(prev.references || [])]; refs.splice(idx, 1); return { ...prev, references: refs };
  });
  const handleSubmit = async () => {
    // Validar redes sociales antes de guardar
    const errors: {[key: string]: boolean} = {};
    (form.socialLinks || []).forEach((l: any) => {
      if (!validateSocialUrl(l.label, l.url)) errors[l.label.toLowerCase()] = true;
    });
    setSocialErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    // Combinar socialLinks nuevos con los que ya existen y no son Facebook, Instagram, Twitter
    const existingLinks = (initialData.socialLinks || []).filter((url: string) => {
      return !(
        url.includes('facebook.com') ||
        url.includes('instagram.com') ||
        url.includes('twitter.com')
      );
    });
    const newLinks = (form.socialLinks || []).map((l: any) => l.url).filter(Boolean);
    const formToSave = {
      ...form,
      socialLinks: [...existingLinks, ...newLinks]
    };
    await onSave(formToSave);
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1400);
  };
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));
  // Función para obtener ubicación GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev: any) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        {/* Animación de éxito al guardar */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce-in" />
              <span className="text-2xl font-bold text-green-700 animate-fade-in">¡Perfil actualizado!</span>
            </div>
          </div>
        )}
        {/* Encabezado visual con icono y barra de progreso */}
        <div className={`flex flex-col gap-2 p-6 pb-2 bg-gradient-to-r ${STEP_COLORS[step]} border-b`}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white shadow p-2">{STEP_ICONS[step]}</div>
            <span className="font-bold text-lg text-gray-800">{steps[step]}</span>
            <span className="ml-auto text-xs text-gray-400">Paso {step + 1} de {steps.length}</span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "linear-gradient(to right, #6366f1, #a21caf)" }} />
          </div>
        </div>
        <div className="p-6 pt-4 min-h-[340px] transition-all duration-300">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input className="w-full border rounded-lg p-2" value={form.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Apellido</label>
                <input className="w-full border rounded-lg p-2" value={form.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input className="w-full border rounded-lg p-2 bg-gray-100" value={form.email || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha de nacimiento</label>
                <input type="date" className="w-full border rounded-lg p-2" value={form.birthDate?.split("T")[0] || ""} onChange={e => handleChange("birthDate", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Género</label>
                <select className="w-full border rounded-lg p-2" value={form.gender || ""} onChange={e => handleChange("gender", e.target.value)}>
                  <option value="">Selecciona</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">País</label>
                <select className="w-full border rounded-lg p-2" value={form.country || ""} onChange={e => handleChange("country", e.target.value)}>
                  <option value="">Selecciona</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <input className="w-full border rounded-lg p-2" value={form.state || ""} onChange={e => handleChange("state", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Ciudad</label>
                <input className="w-full border rounded-lg p-2" value={form.city || ""} onChange={e => handleChange("city", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Dirección</label>
                <div className="flex gap-2">
                  <input className="w-full border rounded-lg p-2" value={form.address || ""} onChange={e => handleChange("address", e.target.value)} />
                  <Button type="button" variant="outline" onClick={handleGetLocation} disabled={locating}>
                    {locating ? "Obteniendo..." : "Usar mi ubicación"}
                  </Button>
                </div>
                {form.latitude && form.longitude && (
                  <div className="text-xs text-green-600 mt-1">Ubicación capturada: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Tagline</label>
                <input className="w-full border rounded-lg p-2" value={form.tagline || ""} onChange={e => handleChange("tagline", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Biografía</label>
                <textarea className="w-full border rounded-lg p-2" value={form.bio || ""} onChange={e => handleChange("bio", e.target.value)} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Habilidades</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SKILLS.map(skill => (
                    <button key={skill} type="button" className={`px-3 py-1 rounded-full border ${form.skills?.includes(skill) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300"}`} onClick={() => handleMultiSelect("skills", skill)}>{skill}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Idiomas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {LANGUAGES.map(lang => (
                    <button key={lang} type="button" className={`px-3 py-1 rounded-full border ${form.languages?.includes(lang) ? "bg-green-600 text-white border-green-600" : "bg-white text-green-700 border-green-300"}`} onClick={() => handleMultiSelect("languages", lang)}>{lang}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium">Disponibilidad (próximamente)</label>
              <div className="bg-gray-100 rounded-lg p-2 text-gray-500">Selector avanzado de días y horarios aquí</div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Referencias</label>
                {(form.references || []).map((ref: string, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input className="w-full border rounded-lg p-2" value={ref} onChange={e => handleReferenceChange(idx, e.target.value)} placeholder="Nombre y contacto" />
                    <button type="button" className="text-red-500" onClick={() => handleRemoveReference(idx)}>Eliminar</button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddReference} className="mt-1">Agregar referencia</Button>
              </div>
              <div>
                <label className="block text-sm font-medium">CV (URL)</label>
                <input className="w-full border rounded-lg p-2" value={form.cvUrl || ""} onChange={e => handleChange("cvUrl", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Redes sociales</label>
                <div className="flex flex-col gap-2 mt-1">
                  {SOCIALS.map(social => {
                    const value = form.socialLinks?.find((l: any) => l.label === social.label)?.url || "";
                    const isValid = validateSocialUrl(social.label, value);
                    return (
                      <div key={social.key} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {social.icon}
                          <input
                            className={`flex-1 border rounded-lg p-2 ${value && !isValid ? 'border-red-500' : ''}`}
                            placeholder={`URL de ${social.label}`}
                            value={value}
                            onChange={e => {
                              const v = e.target.value;
                              handleChange("socialLinks",
                                [
                                  ...(form.socialLinks?.filter((l: any) => l.label !== social.label) || []),
                                  v ? { label: social.label, url: v } : null
                                ].filter(Boolean)
                              );
                              setSocialErrors(prev => ({ ...prev, [social.key]: !!(v && !validateSocialUrl(social.label, v)) }));
                            }}
                          />
                        </div>
                        {value && !isValid && (
                          <span className="text-xs text-red-500 ml-7">Ingresa una URL válida de {social.label} (ej: https://facebook.com/usuario)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Resumen</h3>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                  <div><b>Nombre:</b> {form.firstName} {form.lastName}</div>
                  <div><b>Email:</b> {form.email}</div>
                  <div><b>País:</b> {form.country}</div>
                  <div><b>Ciudad:</b> {form.city}</div>
                  <div><b>Tagline:</b> {form.tagline}</div>
                  <div><b>Biografía:</b> {form.bio}</div>
                  <div><b>Habilidades:</b> {(form.skills || []).join(", ")}</div>
                  <div><b>Idiomas:</b> {(form.languages || []).join(", ")}</div>
                  <div><b>Referencias:</b> {(form.references || []).join(", ")}</div>
                  <div><b>Redes sociales:</b> {
                    SOCIALS.map(social => {
                      const value = form.socialLinks?.find((l: any) => l.label === social.label)?.url || "";
                      return value ? `${social.label}: ${value}` : null;
                    }).filter(Boolean).join(", ")
                  }</div>
                  {form.latitude && form.longitude && (
                    <div><b>Ubicación GPS:</b> {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-6 justify-between px-6 pb-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0} className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" />Anterior</Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow font-semibold flex items-center gap-2 px-6"><ChevronRight className="h-4 w-4" />Siguiente</Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow font-semibold flex items-center gap-2 px-6">{saving ? "Guardando..." : <><CheckCircle2 className="h-4 w-4" />Guardar cambios</>}</Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
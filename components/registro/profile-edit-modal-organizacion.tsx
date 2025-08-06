import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Link as LinkIcon, MapPin, Phone, Mail, Globe, Tag, Info, ListChecks, Star as StarIcon, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  initialData: any; 
  onSave: (data: any) => void; 
}

// Define categorías para el dropdown 
const CATEGORY_OPTIONS = [
  { value: "Educación", label: "Educación" },
  { value: "Medio Ambiente", label: "Medio Ambiente" },
  { value: "Salud", label: "Salud" },
  { value: "Alimentación", label: "Alimentación" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "Deporte", label: "Deportes" },
  { value: "Arte y Cultura", label: "Arte y Cultura" },
  { value: "Construcción", label: "Construcción" },
];

// Define las redes sociales que quieres permitir editar
const SOCIALS = [
  { label: "Facebook", icon: <FaFacebook className="h-4 w-4 text-blue-600" />, key: "facebook" },
  { label: "Instagram", icon: <FaInstagram className="h-4 w-4 text-pink-500" />, key: "instagram" },
  { label: "Twitter", icon: <FaTwitter className="h-4 w-4 text-blue-400" />, key: "twitter" },
];

// Helper para validar URLs de redes sociales
function validateSocialUrl(label: string, url: string) {
  if (!url) return true; 
  if (label === "facebook") return /^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$/.test(url);
  if (label === "instagram") return /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+$/.test(url);
  if (label === "twitter") return /^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_.-]+$/.test(url);
  return true; 
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [editedData, setEditedData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [socialErrors, setSocialErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (open && initialData) {
      setEditedData({
        firstName: initialData.firstName || '',
        email: initialData.email || '', 


        name: initialData.nombre || '', 
        description: initialData.descripcion || '', 
        website: initialData.sitioWeb || '', 
        category: Array.isArray(initialData.categoria) ? initialData.categoria : (initialData.categoria ? [initialData.categoria] : []),
        contactEmail: initialData.emailContacto || '', 
        contactPhone: initialData.telefonoContacto || '', 
        tagline: initialData.tagline || '', 
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        latitude: initialData.latitude ?? null, 
        longitude: initialData.longitude ?? null,
        socialLinks: initialData.redesSociales || [], 
        preferences: initialData.preferenciasVoluntario || [], 
        rating: initialData.rating ?? 0,
      });
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' && value === '') {
      newValue = null;
    }

    setEditedData((prev: any) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleMultiSelectCategory = (categoryValue: string) => {
    setEditedData((prev: any) => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : [];
      if (currentCategories.includes(categoryValue)) {
        return { ...prev, category: currentCategories.filter((cat: string) => cat !== categoryValue) };
      } else {
        return { ...prev, category: [...currentCategories, categoryValue] };
      }
    });
  };

  const handleSocialLinkChange = (key: string, url: string) => {
    const currentSocialLinks = Array.isArray(editedData.socialLinks) ? editedData.socialLinks : [];
    
    const newSocialLinks = currentSocialLinks.filter((link: string) => !link.includes(key));
    
    if (url) {
      newSocialLinks.push(url);
    }
    setEditedData((prev: any) => ({
      ...prev,
      socialLinks: newSocialLinks,
    }));
    setSocialErrors(prev => ({ ...prev, [key]: !!(url && !validateSocialUrl(key, url)) }));
  };

  const addToArray = (field: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''], 
    }));
  };

  const removeFromArray = (field: string, index: number) => {
    const newArray = editedData[field].filter((_: any, i: number) => i !== index);
    setEditedData((prev: any) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const handlePreferenceChange = (index: number, value: string) => {
    const newPreferences = [...editedData.preferences];
    newPreferences[index] = value;
    setEditedData((prev: any) => ({ ...prev, preferences: newPreferences }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentSocialErrors: {[key: string]: boolean} = {};
    SOCIALS.forEach(social => {
      const currentUrl = (Array.isArray(editedData.socialLinks) ? 
                          editedData.socialLinks.find((link: string) => link.includes(social.key)) : 
                          '') || '';
      if (currentUrl && !validateSocialUrl(social.key, currentUrl)) {
        currentSocialErrors[social.key] = true;
      }
    });
    setSocialErrors(currentSocialErrors);

    if (Object.values(currentSocialErrors).some(Boolean)) {
      window.alert("Por favor, corrige los errores en las URLs de redes sociales.");
      return;
    }

    setIsSaving(true);
    await onSave(editedData); 
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1400);
  };

  // Función para obtener ubicación GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      window.alert("La geolocalización no es compatible con tu navegador.");
      return;
    }
    setIsSaving(true); 
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditedData((prev: any) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        setIsSaving(false);
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
        window.alert("No se pudo obtener la ubicación. Por favor, asegúrate de haber dado permiso.");
        setIsSaving(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-fade-in-up">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label="Cerrar modal"
          disabled={isSaving}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Editar Perfil de Organización</h2>

        {showSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce-in" />
              <span className="text-2xl font-bold text-green-700 animate-fade-in">¡Perfil actualizado!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información de Contacto Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={editedData.firstName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email del Usuario (No Editable)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedData.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Datos de la Organización</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Info className="h-4 w-4 mr-1 text-blue-500" />Nombre de la Organización</label>
            <input
              type="text"
              id="name"
              name="name" 
              value={editedData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="h-4 w-4 mr-1 text-purple-500" />Lema/Frase Corta</label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={editedData.tagline || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Info className="h-4 w-4 mr-1 text-blue-500" />Descripción</label>
            <textarea
              id="description"
              name="description" 
              value={editedData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ListChecks className="h-4 w-4 mr-1 text-green-500" />Categorías</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-all ${
                    Array.isArray(editedData.category) && editedData.category.includes(option.value)
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => handleMultiSelectCategory(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Globe className="h-4 w-4 mr-1 text-orange-500" />Sitio Web</label>
            <input
              type="url"
              id="website"
              name="website"
              value={editedData.website || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.tuorganizacion.org"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Contacto de la Organización</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Mail className="h-4 w-4 mr-1 text-red-500" />Email de Contacto</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail" 
                value={editedData.contactEmail || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Phone className="h-4 w-4 mr-1 text-green-500" />Teléfono de Contacto</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone" 
                value={editedData.contactPhone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="+52 123 456 7890"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Ubicación de la Organización</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                value={editedData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                id="city"
                name="city"
                value={editedData.city || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={editedData.state || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <input
                type="text"
                id="country"
                name="country"
                value={editedData.country || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={editedData.latitude ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={editedData.longitude ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button type="button" onClick={handleGetLocation} disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {isSaving ? "Obteniendo..." : "Mi Ubicación"}
              </button>
            </div>
            {editedData.latitude && editedData.longitude && (
              <div className="md:col-span-2 text-xs text-green-600 mt-1">Ubicación GPS capturada: {editedData.latitude.toFixed(5)}, {editedData.longitude.toFixed(5)}</div>
            )}
          </div>

          {/* Social Links */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Redes Sociales</h3>
          {SOCIALS.map(social => {
            const currentUrl = (Array.isArray(editedData.socialLinks) ?
                                editedData.socialLinks.find((link: string) => link.includes(social.key)) :
                                '') || '';
            const isValid = validateSocialUrl(social.key, currentUrl);
            return (
              <div key={social.key} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {social.icon}
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => handleSocialLinkChange(social.key, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${currentUrl && !isValid ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={`URL de ${social.label}`}
                  />
                </div>
                {currentUrl && !isValid && (
                  <span className="text-xs text-red-500 ml-7">Ingresa una URL válida de {social.label} (ej: https://{social.key}.com/usuario)</span>
                )}
              </div>
            );
          })}

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Preferencias de Voluntarios</h3>
          {editedData.preferences?.map((pref: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={pref}
                onChange={(e) => handlePreferenceChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 'Habilidades de diseño', 'Edad 18-30'"
              />
              <button
                type="button"
                onClick={() => removeFromArray('preferences', index)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                aria-label="Eliminar preferencia"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addToArray('preferences')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="h-5 w-5" /> Añadir Preferencia
          </button>

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Calificación (Solo lectura)</h3>
          <div className="flex items-center gap-2 text-gray-700">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-lg">{(editedData.rating ?? 0).toFixed(1)}</span>
            <span className="text-sm text-gray-500">(Este valor se actualiza automáticamente)</span>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
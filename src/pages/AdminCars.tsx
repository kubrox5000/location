import React from 'react';
import { Plus, Search, Edit, Trash2, MapPin, DollarSign, Loader2, Calendar as CalendarIcon, XCircle, CheckCircle } from 'lucide-react';
import { Car } from '../types';
import { carService, cityService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const AdminCars = () => {
  const { t } = useTranslation();
  const [cars, setCars] = React.useState<Car[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = React.useState(false);
  const [editingCar, setEditingCar] = React.useState<Car | null>(null);
  const [selectedCarForAvailability, setSelectedCarForAvailability] = React.useState<Car | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [carToDelete, setCarToDelete] = React.useState<Car | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Car>>({
    name: '',
    brand: '',
    pricePerDay: 0,
    cities: [],
    type: 'Economy',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    doors: 4,
    airConditioning: true,
    images: [],
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsData, citiesData] = await Promise.all([
        carService.getAll(),
        cityService.getAll()
      ]);
      setCars(carsData);
      setCities(citiesData);
    } catch (error) {
      toast.error(t('admin.fleet.errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (car: Car) => {
    setCarToDelete(car);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    try {
      await carService.delete(carToDelete.id);
      setCars(cars.filter(c => c.id !== carToDelete.id));
      setCarToDelete(null);
      toast.success(t('admin.fleet.successDelete'));
    } catch (error) {
      toast.error(t('admin.fleet.errorDelete'));
    }
  };

  React.useEffect(() => {
    if (editingCar) {
      setFormData(editingCar);
    } else {
      setFormData({
        name: '',
        brand: '',
        pricePerDay: 0,
        cities: [],
        type: 'Economy',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        doors: 4,
        airConditioning: true,
        images: [],
      });
    }
  }, [editingCar, isModalOpen]);

  const [newImageUrl, setNewImageUrl] = React.useState('');

  const addImage = () => {
    if (newImageUrl && !formData.images?.includes(newImageUrl)) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), newImageUrl]
      });
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images?.filter(img => img !== url)
    });
  };

  const handleSubmit = async () => {
    if (!formData.images || formData.images.length === 0) {
      toast.error(t('admin.fleet.errorImage'));
      return;
    }
    
    if (!formData.cities || formData.cities.length === 0) {
      toast.error(t('admin.fleet.errorCity'));
      return;
    }

    try {
      if (editingCar) {
        const updated = await carService.update(editingCar.id, formData);
        setCars(cars.map(c => c.id === editingCar.id ? updated : c));
        toast.success(t('admin.fleet.successUpdate'));
      } else {
        const created = await carService.create({ ...formData, availability: {} });
        setCars([...cars, created]);
        toast.success(t('admin.fleet.successAdd'));
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(t('admin.fleet.errorOperation'));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const updateAvailabilityStatus = async (status: boolean) => {
    if (!selectedCarForAvailability || !selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newAvailability = { ...(selectedCarForAvailability.availability || {}) };
    
    if (status) {
      // If setting to available, remove from the blocked list
      delete newAvailability[dateStr];
    } else {
      // If setting to unavailable, add to the blocked list
      newAvailability[dateStr] = false;
    }

    setIsUpdatingAvailability(true);
    try {
      const updated = await carService.update(selectedCarForAvailability.id, {
        availability: newAvailability
      });
      setCars(cars.map(c => c.id === selectedCarForAvailability.id ? updated : c));
      setSelectedCarForAvailability(updated);
      toast.success(t('admin.fleet.successUpdate'));
    } catch (error) {
      toast.error(t('admin.fleet.errorAvailability'));
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const clearAllAvailability = async () => {
    if (!selectedCarForAvailability) return;
    
    setIsUpdatingAvailability(true);
    try {
      const updated = await carService.update(selectedCarForAvailability.id, {
        availability: {}
      });
      setCars(cars.map(c => c.id === selectedCarForAvailability.id ? updated : c));
      setSelectedCarForAvailability(updated);
      toast.success(t('admin.fleet.successUpdate'));
      setSelectedDate(null);
    } catch (error) {
      toast.error(t('admin.fleet.errorAvailability'));
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const removeBlockedDate = async (dateStr: string) => {
    if (!selectedCarForAvailability) return;
    
    const newAvailability = { ...(selectedCarForAvailability.availability || {}) };
    delete newAvailability[dateStr];

    setIsUpdatingAvailability(true);
    try {
      const updated = await carService.update(selectedCarForAvailability.id, {
        availability: newAvailability
      });
      setCars(cars.map(c => c.id === selectedCarForAvailability.id ? updated : c));
      setSelectedCarForAvailability(updated);
      toast.success(t('admin.fleet.successUpdate'));
    } catch (error) {
      toast.error(t('admin.fleet.errorAvailability'));
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-primary font-light serif text-2xl">{t('admin.fleet.loading')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.fleet.title')}</h1>
          <p className="text-foreground/60 text-sm font-light">{t('admin.fleet.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setEditingCar(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus size={18} />
          {t('admin.fleet.addNew')}
        </button>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.vehicle')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.brand')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.location')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.priceDay')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.type')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.availability')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={car.images[0]} alt={car.name} className="h-10 w-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        {car.images.length > 1 && (
                          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                            {car.images.length}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-foreground">{car.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60 font-light">{car.brand}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 text-sm text-foreground/60 font-light">
                      <MapPin size={14} className="text-primary" />
                      {car.cities.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">${car.pricePerDay}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t(`admin.fleet.options.types.${car.type.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedCarForAvailability(car);
                        setIsAvailabilityModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      <CalendarIcon size={14} />
                      {t('admin.fleet.manage')}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingCar(car);
                          setIsModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-foreground/30 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(car)}
                        className="rounded-lg p-2 text-foreground/30 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Placeholder */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl border border-primary/10"
            >
              <h2 className="serif text-2xl font-light tracking-tight text-foreground">
                {editingCar ? t('admin.fleet.editVehicle') : t('admin.fleet.addVehicle')}
              </h2>
              <p className="mt-2 text-sm text-foreground/60 font-light">{t('admin.fleet.fillDetails')}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.carName')}</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground" 
                    placeholder="e.g. Model S"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.carBrand')}</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground" 
                    placeholder="e.g. Tesla"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.pricePerDay')}</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground" 
                    placeholder="150"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.availableInCities')}</label>
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4 sm:grid-cols-3">
                    {cities.map((city) => (
                      <label key={city} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/20"
                          checked={formData.cities?.includes(city)}
                          onChange={(e) => {
                            const currentCities = formData.cities || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, cities: [...currentCities, city] });
                            } else {
                              setFormData({ ...formData, cities: currentCities.filter(c => c !== city) });
                            }
                          }}
                        />
                        <span className="text-sm text-foreground/60 group-hover:text-foreground transition-colors">{city}</span>
                      </label>
                    ))}
                    {cities.length === 0 && (
                      <p className="col-span-full text-[10px] text-foreground/30 italic">{t('admin.fleet.noCitiesWarning')}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.type')}</label>
                  <select 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground appearance-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Economy">{t('admin.fleet.options.types.economy')}</option>
                    <option value="Sedan">{t('admin.fleet.options.types.sedan')}</option>
                    <option value="SUV">{t('admin.fleet.options.types.suv')}</option>
                    <option value="Luxury">{t('admin.fleet.options.types.luxury')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.transmission')}</label>
                  <select 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground appearance-none"
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                  >
                    <option value="Automatic">{t('admin.fleet.options.transmissions.automatic')}</option>
                    <option value="Manual">{t('admin.fleet.options.transmissions.manual')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.fuelType')}</label>
                  <select 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground appearance-none"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                  >
                    <option value="Petrol">{t('admin.fleet.options.fuels.petrol')}</option>
                    <option value="Diesel">{t('admin.fleet.options.fuels.diesel')}</option>
                    <option value="Electric">{t('admin.fleet.options.fuels.electric')}</option>
                    <option value="Hybrid">{t('admin.fleet.options.fuels.hybrid')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.seats')}</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.doors')}</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    value={formData.doors}
                    onChange={(e) => setFormData({ ...formData, doors: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2 flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="ac"
                    className="h-5 w-5 rounded border-primary/20 text-primary focus:ring-primary/20"
                    checked={formData.airConditioning}
                    onChange={(e) => setFormData({ ...formData, airConditioning: e.target.checked })}
                  />
                  <label htmlFor="ac" className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.airConditioning')}</label>
                </div>

                <div className="col-span-2 space-y-4 pt-4 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block">{t('admin.fleet.gallery')}</label>
                    {formData.images && formData.images.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, images: [] })}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        {t('admin.fleet.clearAll')}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground" 
                      placeholder={t('admin.fleet.pasteUrl')}
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                    />
                    <button 
                      type="button"
                      onClick={addImage}
                      className="rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      {t('admin.fleet.add')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images?.map((url, idx) => (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-primary/10">
                        <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-primary/10 py-4 font-bold text-foreground/30 transition-all hover:bg-primary/5"
                >
                  {t('admin.fleet.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                  {editingCar ? t('admin.fleet.saveChanges') : t('admin.fleet.addVehicle')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Availability Management Modal */}
      <AnimatePresence>
        {isAvailabilityModalOpen && selectedCarForAvailability && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvailabilityModalOpen(false)}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-primary/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="serif text-xl font-light tracking-tight text-foreground">{t('admin.fleet.manageAvailability')}</h2>
                  <p className="text-sm text-foreground/60 font-light">{selectedCarForAvailability.brand} {selectedCarForAvailability.name}</p>
                </div>
                <button 
                  onClick={() => setIsAvailabilityModalOpen(false)}
                  className="rounded-full p-2 hover:bg-primary/5 transition-colors"
                >
                  <XCircle size={24} className="text-foreground/30" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="availability-picker-container">
                    <DatePicker
                      inline
                      selected={selectedDate}
                      onChange={handleDateSelect}
                      highlightDates={[
                        {
                          "blocked-date": Object.entries(selectedCarForAvailability.availability || {})
                            .filter(([_, isAvailable]) => !isAvailable)
                            .map(([dateStr]) => {
                              const [year, month, day] = dateStr.split('-').map(Number);
                              return new Date(year, month - 1, day);
                            })
                        }
                      ]}
                      minDate={new Date()}
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-sm font-medium text-foreground">
                      {format(selectedDate, 'PPP')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateAvailabilityStatus(true)}
                        disabled={isUpdatingAvailability}
                        className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 py-3 text-xs font-bold text-emerald-600 transition-all hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        {t('admin.fleet.available')}
                      </button>
                      <button
                        onClick={() => updateAvailabilityStatus(false)}
                        disabled={isUpdatingAvailability}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-50 py-3 text-xs font-bold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        {t('admin.fleet.unavailable')}
                      </button>
                    </div>
                  </div>
                )}


                <div className="space-y-4 pt-6 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.fleet.blockedDatesList')}</h3>
                    {selectedCarForAvailability.availability && Object.values(selectedCarForAvailability.availability).some(v => !v) && (
                      <button
                        onClick={clearAllAvailability}
                        disabled={isUpdatingAvailability}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline disabled:opacity-50"
                      >
                        {t('admin.fleet.clearAvailability')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-[200px] overflow-y-auto rounded-2xl border border-primary/10 bg-primary/5 p-4 custom-scrollbar">
                    {selectedCarForAvailability.availability && Object.entries(selectedCarForAvailability.availability)
                      .filter(([_, isAvailable]) => !isAvailable)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([dateStr]) => (
                        <div key={dateStr} className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0">
                          <span className="text-xs font-medium text-foreground">{format(parseISO(dateStr), 'PPP')}</span>
                          <button
                            onClick={() => removeBlockedDate(dateStr)}
                            disabled={isUpdatingAvailability}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    {(!selectedCarForAvailability.availability || !Object.values(selectedCarForAvailability.availability).some(v => !v)) && (
                      <div className="py-4 text-center">
                        <p className="text-[10px] text-foreground/30">{t('admin.fleet.noBlockedDates')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAvailabilityModalOpen(false);
                    setSelectedDate(null);
                  }}
                  className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                  {t('admin.fleet.done')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .availability-picker-container .react-datepicker {
          border: none;
          font-family: inherit;
        }
        .availability-picker-container .react-datepicker__header {
          background: transparent;
          border: none;
        }
        .availability-picker-container .react-datepicker__day {
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          border-radius: 50% !important;
          transition: all 0.2s ease;
          color: white !important;
        }
        /* Default state for all valid days is Green (Available) */
        .availability-picker-container .react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month) {
          background-color: #10b981 !important;
          color: white !important;
          border-radius: 50% !important;
        }

        /* Blocked dates MUST be Red */
        .availability-picker-container .react-datepicker__day--highlighted.blocked-date {
          background-color: #ef4444 !important;
          color: white !important;
        }

        /* Selected date gets a prominent black ring but keeps its status color */
        .availability-picker-container .react-datepicker__day--selected {
          box-shadow: 0 0 0 3px #000 !important;
          transform: scale(1.1);
          z-index: 10;
        }

        /* Explicitly maintain colors for selected state to be safe */
        .availability-picker-container .react-datepicker__day--selected.blocked-date {
          background-color: #ef4444 !important;
        }

        .availability-picker-container .react-datepicker__day--selected:not(.blocked-date) {
          background-color: #10b981 !important;
        }
        .availability-picker-container .react-datepicker__day:hover {
          transform: scale(1.1);
          filter: brightness(1.1);
        }
      `}} />
      <AnimatePresence>
        {carToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-md rounded-3xl bg-white p-8 shadow-2xl border border-primary/10"
            >
              <h3 className="serif text-xl font-light text-foreground">{t('admin.fleet.deleteTitle')}</h3>
              <p className="mt-2 text-foreground/60 font-light">
                {t('admin.fleet.deleteConfirm', { car: `${carToDelete.brand} ${carToDelete.name}` })}
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setCarToDelete(null)}
                  className="flex-1 rounded-xl border border-primary/10 py-3 text-sm font-bold text-foreground/30 transition-all hover:bg-primary/5"
                >
                  {t('admin.fleet.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                >
                  {t('admin.fleet.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

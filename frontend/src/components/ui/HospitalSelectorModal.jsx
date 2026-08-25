/**
 * HospitalSelectorModal.jsx — HealthcareOS Location & Hospital Selection Modal
 * Displays nearby hospitals ranked by GPS proximity or city/pincode search with ratings and capacities.
 */
import React, { useState, useMemo } from 'react';
import {
  MapPin, Star, Navigation, Search, CheckCircle2, Building2,
  PhoneCall, ShieldCheck, Bed, Compass, ChevronRight, Loader2,
  X, AlertCircle, Filter
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';

export const HospitalSelectorModal = ({ isOpen, onClose }) => {
  const {
    selectedHospital,
    hospitalsWithDistance,
    userLocation,
    isLocating,
    detectLocation,
    selectHospital,
  } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Derive unique states and cities dynamically from dataset
  const states = useMemo(() => {
    const s = new Set(hospitalsWithDistance.map((h) => h.state));
    return ['All', ...Array.from(s).sort()];
  }, [hospitalsWithDistance]);

  const cities = useMemo(() => {
    const subset =
      selectedState === 'All'
        ? hospitalsWithDistance
        : hospitalsWithDistance.filter((h) => h.state === selectedState);
    const c = new Set(subset.map((h) => h.city));
    return ['All', ...Array.from(c).sort()];
  }, [hospitalsWithDistance, selectedState]);

  // Filtered hospital list
  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return hospitalsWithDistance.filter((h) => {
      const matchState =
        selectedState === 'All' || h.state.toLowerCase() === selectedState.toLowerCase();
      const matchCity =
        selectedCity === 'All' || h.city.toLowerCase() === selectedCity.toLowerCase();
      const matchSearch =
        !term ||
        h.name.toLowerCase().includes(term) ||
        h.city.toLowerCase().includes(term) ||
        h.state.toLowerCase().includes(term) ||
        h.pincode.includes(term) ||
        h.network.toLowerCase().includes(term) ||
        h.specialties.some((s) => s.toLowerCase().includes(term));
      return matchState && matchCity && matchSearch;
    });
  }, [hospitalsWithDistance, searchTerm, selectedState, selectedCity]);

  const handleSelect = (hosp) => {
    selectHospital(hosp);
    if (onClose) onClose();
  };

  const handleDetectGPS = async () => {
    try {
      await detectLocation();
    } catch {
      // toast already handled in context
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Healthcare Facility & Hospital" size="lg">
      <div className="space-y-5 text-left select-none">
        
        {/* GPS Detection & Search Bar Row */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across all Indian states, cities, pincodes, or hospital names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#112255]/50 border border-white/10 focus:border-brand-cyan/50 rounded-xl text-xs text-white placeholder-text-secondary/40 outline-none transition-colors"
              />
            </div>

            {/* Detect Location Button */}
            <Button
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="py-2.5 px-4 text-xs font-bold bg-brand-cyan/15 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-[#0a1628] flex items-center justify-center space-x-2 flex-shrink-0 transition-all"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Detect GPS Location</span>
                </>
              )}
            </Button>
          </div>

          {/* Location Status Bar */}
          {userLocation?.lat && (
            <div className="px-3 py-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-center justify-between text-[11px]">
              <span className="text-brand-cyan flex items-center space-x-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  Location detected: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </span>
              </span>
              <span className="text-text-secondary text-[10px]">
                Showing closest hospitals in India first
              </span>
            </div>
          )}

          {/* State Selector & City Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* State Dropdown */}
            <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-[10px] text-text-secondary font-bold">State:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('All');
                }}
                className="bg-transparent text-[11px] text-white font-semibold outline-none cursor-pointer"
              >
                {states.map((s) => (
                  <option key={s} value={s} className="bg-[#0d2044] text-white">
                    {s === 'All' ? 'All States (India)' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* City Quick-Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {cities.map((c) => {
                const active = selectedCity === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-brand-cyan text-[#0a1628] shadow'
                        : 'bg-white/5 hover:bg-white/10 text-text-secondary'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-text-secondary px-1">
          <span>
            Found <strong className="text-white">{filteredList.length}</strong> hospital facilities
          </span>
          <span>Sorted by {userLocation?.lat ? 'closest distance (km)' : 'star rating'}</span>
        </div>

        {/* Hospital Card List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-xs bg-white/[0.02] border border-white/5 rounded-2xl">
              No hospitals found matching your criteria. Try searching a different city or state.
            </div>
          ) : (
            filteredList.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              return (
                <div
                  key={hosp.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-brand-cyan/10 border-brand-cyan shadow-[0_0_20px_rgba(0,229,255,0.12)]'
                      : 'bg-[#112255]/30 border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="text-sm font-extrabold text-white tracking-wide truncate">
                        {hosp.name}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-cyan text-[#0a1628] uppercase tracking-wider">
                          Active Facility
                        </span>
                      )}
                      {hosp.distanceKm !== null && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <Navigation className="w-2.5 h-2.5" />
                          <span>{hosp.distanceKm} km away</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-text-secondary flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-brand-cyan shrink-0" />
                      <span className="truncate">{hosp.address}</span>
                    </p>

                    {/* Metadata pill row */}
                    <div className="flex items-center gap-3 text-[10px] text-text-secondary flex-wrap pt-0.5">
                      {/* Rating */}
                      <span className="flex items-center space-x-1 font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>{hosp.rating}</span>
                        <span className="text-text-secondary font-normal">({hosp.reviewsCount})</span>
                      </span>

                      {/* Bed availability */}
                      <span className="flex items-center space-x-1 text-brand-success bg-brand-success/10 px-1.5 py-0.5 rounded font-mono">
                        <Bed className="w-3 h-3" />
                        <span>{hosp.availableBeds} beds free</span>
                      </span>

                      {/* Accreditation */}
                      <span className="flex items-center space-x-1 text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{hosp.accreditation.join(' · ')}</span>
                      </span>

                      {/* Emergency helpline */}
                      <span className="flex items-center space-x-1 text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono">
                        <PhoneCall className="w-3 h-3" />
                        <span>Emergency: {hosp.emergency}</span>
                      </span>
                    </div>

                    {/* Specialties tags */}
                    <div className="flex items-center gap-1 text-[9px] text-text-secondary/70 flex-wrap pt-0.5">
                      {hosp.specialties.slice(0, 4).map((s) => (
                        <span key={s} className="px-1.5 py-0.2 bg-white/5 rounded border border-white/5">
                          {s}
                        </span>
                      ))}
                      {hosp.specialties.length > 4 && (
                        <span className="text-text-secondary/50">+{hosp.specialties.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  {/* Select button */}
                  <Button
                    onClick={() => handleSelect(hosp)}
                    variant={isSelected ? 'primary' : 'outline'}
                    className={`py-2 px-4 text-xs font-bold flex items-center justify-center space-x-1.5 shrink-0 w-full sm:w-auto ${
                      isSelected ? 'bg-brand-cyan text-[#0a1628]' : ''
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <span>Select Hospital</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-text-secondary">
          <span>
            Current Active: <strong className="text-white">{selectedHospital?.name}</strong> ({selectedHospital?.city}, {selectedHospital?.state})
          </span>
          <Button variant="outline" className="py-1 px-3 text-xs" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HospitalSelectorModal;

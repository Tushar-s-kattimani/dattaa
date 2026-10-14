import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import type { Location, Shop } from '../types';
import {
  Store,
  MapPin,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  Search,
  Grid,
  List as ListIcon,
  Sparkles,
  BarChart3,
  Building2,
  Phone,
  Layers,
  SlidersHorizontal,
  RefreshCw,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  translateSynchronous,
  type SupportedLanguage
} from '../lib/translationService';

// Vibrant, curated color palette for area distribution
const AREA_PALETTE = [
  { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500' },
  { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500' },
  { bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50', gradient: 'from-violet-500 to-purple-600', ring: 'ring-violet-500' },
  { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-500' },
  { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600', ring: 'ring-rose-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50', gradient: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500' },
  { bg: 'bg-teal-500', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50', gradient: 'from-teal-500 to-emerald-600', ring: 'ring-teal-500' },
  { bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50', gradient: 'from-indigo-500 to-violet-600', ring: 'ring-indigo-500' },
  { bg: 'bg-fuchsia-500', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50', gradient: 'from-fuchsia-500 to-pink-600', ring: 'ring-fuchsia-500' },
  { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50', gradient: 'from-orange-500 to-red-600', ring: 'ring-orange-500' },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'shops-desc' | 'shops-asc' | 'order' | 'name'>('shops-desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeAreaFilter, setActiveAreaFilter] = useState<string | null>(null);

  // Sync language with existing app preferences (default Kannada)
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('shop_records_language');
    if (saved === 'kn' || saved === 'hi' || saved === 'en') return saved;
    return 'kn';
  });

  const fetchData = async () => {
    try {
      const [locData, shopData] = await Promise.all([
        dataService.getLocations(),
        dataService.getShops()
      ]);
      setLocations(locData);
      setShops(shopData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Helper translation
  const t = (text?: string | null): string => {
    if (!text) return '';
    if (selectedLang === 'en') return text;
    return translateSynchronous(text.trim(), selectedLang);
  };

  // Calculate area stats
  const areaStats = useMemo(() => {
    const totalShopsCount = shops.length;

    // Map location ID to shops
    const locMap = new Map<string, Shop[]>();
    locations.forEach(l => locMap.set(l.id, []));

    const unassignedShops: Shop[] = [];

    shops.forEach(shop => {
      const targetLocId = shop.location_id || (shop.location?.id ? String(shop.location.id) : null);
      if (targetLocId && locMap.has(targetLocId)) {
        locMap.get(targetLocId)!.push(shop);
      } else {
        // Try fallback match by location name
        const matchByName = locations.find(
          l => shop.location?.location_name && l.location_name.trim().toLowerCase() === shop.location.location_name.trim().toLowerCase()
        );
        if (matchByName && locMap.has(matchByName.id)) {
          locMap.get(matchByName.id)!.push(shop);
        } else {
          unassignedShops.push(shop);
        }
      }
    });

    const breakdown = locations.map((loc, idx) => {
      const locShops = locMap.get(loc.id) || [];
      const count = locShops.length;
      const percentage = totalShopsCount > 0 ? (count / totalShopsCount) * 100 : 0;
      const palette = AREA_PALETTE[idx % AREA_PALETTE.length];
      const recentShop = locShops.length > 0 ? locShops[0] : null;

      return {
        location: loc,
        shopCount: count,
        percentage,
        shops: locShops,
        palette,
        recentShop
      };
    });

    return {
      breakdown,
      unassignedCount: unassignedShops.length,
      unassignedShops,
      totalShops: totalShopsCount,
      totalLocations: locations.length
    };
  }, [locations, shops]);

  // Metric summaries
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const shopsAddedToday = useMemo(() => {
    return shops.filter(s => new Date(s.created_at).getTime() >= todayStart).length;
  }, [shops, todayStart]);

  const topArea = useMemo(() => {
    if (areaStats.breakdown.length === 0) return null;
    const sorted = [...areaStats.breakdown].sort((a, b) => b.shopCount - a.shopCount);
    return sorted[0].shopCount > 0 ? sorted[0] : null;
  }, [areaStats]);

  const averageShopsPerArea = useMemo(() => {
    if (locations.length === 0) return 0;
    return (shops.length / locations.length).toFixed(1);
  }, [shops.length, locations.length]);

  // Filter and sort breakdown
  const filteredBreakdown = useMemo(() => {
    return areaStats.breakdown
      .filter(item => {
        if (activeAreaFilter && item.location.id !== activeAreaFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const locName = item.location.location_name.toLowerCase();
        const areaName = (item.location.area || '').toLowerCase();
        const district = (item.location.district || '').toLowerCase();
        const taluk = (item.location.taluk || '').toLowerCase();
        const translatedLoc = t(item.location.location_name).toLowerCase();
        const translatedArea = t(item.location.area).toLowerCase();
        return (
          locName.includes(q) ||
          areaName.includes(q) ||
          district.includes(q) ||
          taluk.includes(q) ||
          translatedLoc.includes(q) ||
          translatedArea.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'shops-desc') return b.shopCount - a.shopCount;
        if (sortBy === 'shops-asc') return a.shopCount - b.shopCount;
        if (sortBy === 'order') return (a.location.order_number ?? 9999) - (b.location.order_number ?? 9999);
        if (sortBy === 'name') return a.location.location_name.localeCompare(b.location.location_name);
        return 0;
      });
  }, [areaStats.breakdown, searchQuery, sortBy, activeAreaFilter, selectedLang]);

  // Recent 5 shops across all areas
  const recentShops = useMemo(() => {
    return [...shops]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [shops]);

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col justify-center items-center gap-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600"></div>
          <Store className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-600 font-medium animate-pulse">
          {selectedLang === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : selectedLang === 'hi' ? 'डैशबोर्ड लोड हो रहा है...' : 'Loading dashboard analytics...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl p-6 sm:p-8 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {selectedLang === 'kn' ? 'ಲೈವ್ ವಿತರಣಾ ಕೇಂದ್ರ' : selectedLang === 'hi' ? 'लाइव वितरण हब' : 'Live Area Operations Hub'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {selectedLang === 'kn'
                ? 'ಅಂಗಡಿ ಮತ್ತು ಪ್ರದೇಶ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'
                : selectedLang === 'hi'
                ? 'दुकान और क्षेत्र डैशबोर्ड'
                : 'Shop & Area Operations Dashboard'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {selectedLang === 'kn'
                ? 'ಪ್ರತಿಯೊಂದು ನಿರ್ದಿಷ್ಟ ಪ್ರದೇಶದಲ್ಲಿರುವ ಅಂಗಡಿಗಳ ಸಂಖ್ಯೆ ಮತ್ತು ಸಂಪರ್ಕಗಳ ನೈಜ ಸಮಯದ ವಿಶ್ಲೇಷಣೆ.'
                : selectedLang === 'hi'
                ? 'प्रत्येक विशिष्ट क्षेत्र में दुकानों की संख्या और संपर्कों का रीयल-टाइम विश्लेषण।'
                : 'Real-time breakdown of registered merchant shops across all locations and business zones.'}
            </p>
          </div>

          {/* Quick Actions & Language Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Language Pill Selector */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    localStorage.setItem('shop_records_language', lang.code);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedLang === lang.code
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title={lang.label}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.nativeLabel}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Add Shop Shortcut */}
            <button
              onClick={() => navigate('/add-shop')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{selectedLang === 'kn' ? '+ ಹೊಸ ಅಂಗಡಿ ಸೇರಿಸಿ' : selectedLang === 'hi' ? '+ नई दुकान जोड़ें' : '+ Add New Shop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Shops */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedLang === 'kn' ? 'ಒಟ್ಟು ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'कुल दुकानें' : 'Total Shops'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {areaStats.totalShops}
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {selectedLang === 'kn' ? 'ದಾಖಲಾಗಿರುವ ಒಟ್ಟು ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'पंजीकृत कुल दुकानें' : 'Registered in database'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Store className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('/records')}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 group-hover:underline"
            >
              {selectedLang === 'kn' ? 'ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : selectedLang === 'hi' ? 'सभी रिकॉर्ड देखें' : 'View all records'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Areas / Locations */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedLang === 'kn' ? 'ಒಟ್ಟು ಪ್ರದೇಶಗಳು / ಸ್ಥಳಗಳು' : selectedLang === 'hi' ? 'कुल क्षेत्र / स्थान' : 'Total Areas / Locations'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {areaStats.totalLocations}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Zones
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {selectedLang === 'kn' ? 'ಕಾರ್ಯಾಚರಣೆಯ ವಲಯಗಳು' : selectedLang === 'hi' ? 'सक्रिय वितरण ज़ोन' : 'Active coverage zones'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('/settings')}
              className="text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 group-hover:underline"
            >
              {selectedLang === 'kn' ? 'ಸ್ಥಳ ನಿರ್ವಹಣೆ' : selectedLang === 'hi' ? 'स्थान प्रबंधन' : 'Manage locations'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Area Hub */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedLang === 'kn' ? 'ಅತಿ ಹೆಚ್ಚು ಅಂಗಡಿಗಳ ಪ್ರದೇಶ' : selectedLang === 'hi' ? 'शीर्ष क्षेत्र (सर्वाधिक दुकानें)' : 'Top Area Hub'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate max-w-[150px]" title={topArea?.location.location_name}>
                  {topArea ? t(topArea.location.location_name) : '-'}
                </span>
              </div>
              <p className="text-xs font-semibold text-violet-600 pt-1">
                {topArea
                  ? `${topArea.shopCount} ${selectedLang === 'kn' ? 'ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'दुकानें' : 'shops'} (${topArea.percentage.toFixed(1)}%)`
                  : 'No shops yet'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {topArea && (
              <button
                onClick={() => navigate(`/records?location=${topArea.location.id}`)}
                className="text-violet-600 hover:text-violet-800 font-semibold inline-flex items-center gap-1 group-hover:underline"
              >
                {selectedLang === 'kn' ? 'ಈ ಪ್ರದೇಶದ ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'इस क्षेत्र की दुकानें' : 'Explore hub shops'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Average Shops per Area */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedLang === 'kn' ? 'ಸರಾಸರಿ ಅಂಗಡಿ / ಪ್ರದೇಶ' : selectedLang === 'hi' ? 'औसत दुकान / क्षेत्र' : 'Avg Shops / Area'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {averageShopsPerArea}
                </span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Ratio
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {selectedLang === 'kn'
                  ? `ಇಂದು ಸೇರಿಸಿದ ಅಂಗಡಿಗಳು: ${shopsAddedToday}`
                  : selectedLang === 'hi'
                  ? `आज जोड़ी गई दुकानें: ${shopsAddedToday}`
                  : `Added today: ${shopsAddedToday} shops`}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {selectedLang === 'kn' ? 'ಸಮತೋಲಿತ ವಿತರಣೆ' : selectedLang === 'hi' ? 'संतुलित वितरण' : 'Balanced coverage indicator'}
            </span>
            <span className="font-semibold text-slate-700">
              {shopsAddedToday > 0 ? `+${shopsAddedToday} Today` : 'Up to date'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Area Market Share Multi-Segment Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {selectedLang === 'kn'
                ? 'ಪ್ರದೇಶವಾರು ಅಂಗಡಿಗಳ ವಿತರಣೆ ಪ್ರಮಾಣ (Area Distribution Share)'
                : selectedLang === 'hi'
                ? 'क्षेत्रवार दुकानों का वितरण शेयर (Area Distribution Share)'
                : 'Area-Wise Shop Distribution Share'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {selectedLang === 'kn'
                ? 'ಪ್ರತಿಯೊಂದು ಪ್ರದೇಶದಲ್ಲಿರುವ ಒಟ್ಟು ಅಂಗಡಿಗಳ ಶೇಕಡಾವಾರು ಪಾಲು'
                : selectedLang === 'hi'
                ? 'प्रत्येक क्षेत्र में कुल दुकानों की प्रतिशत हिस्सेदारी'
                : 'Interactive proportion of shops situated across each territory'}
            </p>
          </div>

          {activeAreaFilter && (
            <button
              onClick={() => setActiveAreaFilter(null)}
              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition-colors"
            >
              {selectedLang === 'kn' ? 'ಎಲ್ಲಾ ಪ್ರದೇಶಗಳನ್ನು ತೋರಿಸಿ' : selectedLang === 'hi' ? 'सभी क्षेत्र दिखाएं' : 'Show All Areas'}
            </button>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-5 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner p-0.5 gap-0.5">
          {areaStats.breakdown.map((item) => {
            if (item.percentage === 0) return null;
            const isSelected = activeAreaFilter === item.location.id;
            return (
              <button
                key={item.location.id}
                onClick={() => setActiveAreaFilter(isSelected ? null : item.location.id)}
                style={{ width: `${Math.max(item.percentage, 2)}%` }}
                className={`h-full rounded-lg transition-all relative group cursor-pointer ${item.palette.bg} ${
                  activeAreaFilter && !isSelected ? 'opacity-30' : 'opacity-100 hover:brightness-110'
                }`}
                title={`${item.location.location_name}: ${item.shopCount} shops (${item.percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Clickable Legend Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {areaStats.breakdown.map((item) => {
            const isSelected = activeAreaFilter === item.location.id;
            return (
              <button
                key={item.location.id}
                onClick={() => setActiveAreaFilter(isSelected ? null : item.location.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? `${item.palette.bg} text-white font-bold shadow-md scale-105 border-transparent`
                    : `bg-slate-50 hover:bg-slate-100 text-slate-700 ${item.palette.border}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : item.palette.bg}`} />
                <span>{t(item.location.location_name)}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {item.shopCount}
                </span>
                <span className="text-[10px] opacity-75">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section: Particular Area Breakdown */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedLang === 'kn'
                  ? 'ಪ್ರತಿಯೊಂದು ಪ್ರದೇಶದಲ್ಲಿರುವ ಅಂಗಡಿಗಳ ಸಂಖ್ಯೆ'
                  : selectedLang === 'hi'
                  ? 'प्रत्येक क्षेत्र में दुकानों की संख्या'
                  : 'Area-Wise Shop Count & Details'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedLang === 'kn'
                ? 'ನಿರ್ದಿಷ್ಟ ಪ್ರದೇಶದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಆ ಪ್ರದೇಶದ ಎಲ್ಲಾ ಅಂಗಡಿಗಳ ಪಟ್ಟಿ ಮತ್ತು ಸಂಪರ್ಕಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
                : selectedLang === 'hi'
                ? 'किसी विशेष क्षेत्र पर क्लिक करके उस क्षेत्र की सभी दुकानों और संपर्कों को देखें।'
                : 'Click any area card or row to jump straight to filtered merchant records.'}
            </p>
          </div>

          {/* Search, Sort, and View Mode controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  selectedLang === 'kn' ? 'ಪ್ರದೇಶವನ್ನು ಹುಡುಕಿ...' : selectedLang === 'hi' ? 'क्षेत्र खोजें...' : 'Search area / location...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="shops-desc">{selectedLang === 'kn' ? 'ಹೆಚ್ಚು ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'सर्वाधिक दुकानें' : 'Most Shops'}</option>
                <option value="shops-asc">{selectedLang === 'kn' ? 'ಕಡಿಮೆ ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'कम दुकानें' : 'Least Shops'}</option>
                <option value="order">{selectedLang === 'kn' ? 'ಸ್ಥಳದ ಕ್ರಮ (#1, #2)' : selectedLang === 'hi' ? 'स्थान क्रम (#1, #2)' : 'Order (#1, #2)'}</option>
                <option value="name">{selectedLang === 'kn' ? 'ಹೆಸರಿನ ಪ್ರಕಾರ (A-Z)' : selectedLang === 'hi' ? 'नाम के अनुसार (A-Z)' : 'Name (A-Z)'}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CARDS VIEW */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredBreakdown.map((item) => {
              const loc = item.location;
              const hasShops = item.shopCount > 0;

              return (
                <div
                  key={loc.id}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Accent Bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${item.palette.gradient}`} />

                  <div className="p-6 space-y-5 flex-1">
                    {/* Header Row: Order Badge & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold text-white bg-gradient-to-br ${item.palette.gradient} shadow-sm`}>
                          #{loc.order_number || 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t(loc.location_name)}
                          </h3>
                          {loc.area && (
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {t(loc.area)}
                              {loc.taluk ? `, ${t(loc.taluk)}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {loc.is_default && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {selectedLang === 'kn' ? 'ಡೀಫಾಲ್ಟ್' : selectedLang === 'hi' ? 'डिफ़ॉल्ट' : 'Default'}
                        </span>
                      )}
                    </div>

                    {/* BIG Shop Count Display */}
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {selectedLang === 'kn' ? 'ಈ ಪ್ರದೇಶದಲ್ಲಿರುವ ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'इस क्षेत्र में दुकानें' : 'Shops in this Area'}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">
                            {item.shopCount}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {selectedLang === 'kn' ? 'ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'दुकानें' : 'shops'}
                          </span>
                        </div>
                      </div>

                      {/* Percentage Badge */}
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${item.palette.light} ${item.palette.text} border ${item.palette.border}`}>
                          {item.percentage.toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {selectedLang === 'kn' ? 'ಒಟ್ಟು ಶೇಕಡಾ' : selectedLang === 'hi' ? 'कुल का' : 'of total network'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{selectedLang === 'kn' ? 'ನೆಟ್‌ವರ್ಕ್ ಪಾಲು' : selectedLang === 'hi' ? 'नेटवर्क शेयर' : 'Coverage Share'}</span>
                        <span className="font-semibold text-slate-700">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${item.palette.gradient}`}
                          style={{ width: `${Math.max(item.percentage, hasShops ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recent Shops Preview Chips in this Area */}
                    {hasShops ? (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {selectedLang === 'kn' ? 'ಇತ್ತೀಚಿನ ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'हालिया दुकानें' : 'Sample Shops Here:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.shops.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium max-w-[140px] truncate"
                              title={s.shop_name}
                            >
                              <Store className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{t(s.shop_name)}</span>
                            </span>
                          ))}
                          {item.shops.length > 3 && (
                            <span className="text-xs font-semibold text-slate-500 self-center">
                              +{item.shops.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-xs text-amber-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>
                          {selectedLang === 'kn'
                            ? 'ಈ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ಅಂಗಡಿಗಳು ಇನ್ನೂ ನೋಂದಣಿಯಾಗಿಲ್ಲ.'
                            : selectedLang === 'hi'
                            ? 'इस क्षेत्र में अभी कोई दुकान पंजीकृत नहीं है।'
                            : 'No shops registered in this area yet.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/records?location=${loc.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {selectedLang === 'kn'
                          ? `ದಾಖಲೆಗಳನ್ನು ನೋಡಿ (${item.shopCount})`
                          : selectedLang === 'hi'
                          ? `दुकानें देखें (${item.shopCount})`
                          : `View Shops (${item.shopCount})`}
                      </span>
                    </button>

                    <button
                      onClick={() => navigate(`/add-shop?location=${loc.id}`)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                      title={selectedLang === 'kn' ? 'ಈ ಪ್ರದೇಶಕ್ಕೆ ಅಂಗಡಿ ಸೇರಿಸಿ' : selectedLang === 'hi' ? 'इस क्षेत्र में दुकान जोड़ें' : 'Add shop in this location'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {selectedLang === 'kn' ? 'ಸೇರಿಸಿ' : selectedLang === 'hi' ? 'जोड़ें' : 'Add'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETAILED TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16">#</th>
                    <th className="py-3.5 px-4">{selectedLang === 'kn' ? 'ಪ್ರದೇಶ / ಸ್ಥಳದ ಹೆಸರು' : selectedLang === 'hi' ? 'स्थान / क्षेत्र का नाम' : 'Location / Area Name'}</th>
                    <th className="py-3.5 px-4">{selectedLang === 'kn' ? 'ಉಪ-ಪ್ರದೇಶ / ತಾಲ್ಲೂಕು' : selectedLang === 'hi' ? 'उप-क्षेत्र / तालुका' : 'Sub-Area / Taluk'}</th>
                    <th className="py-3.5 px-4 text-center">{selectedLang === 'kn' ? 'ಅಂಗಡಿಗಳ ಸಂಖ್ಯೆ' : selectedLang === 'hi' ? 'दुकानों की संख्या' : 'Shop Count'}</th>
                    <th className="py-3.5 px-4">{selectedLang === 'kn' ? 'ಶೇಕಡಾವಾರು ಪಾಲು' : selectedLang === 'hi' ? 'हिस्सेदारी (%)' : 'Market Share'}</th>
                    <th className="py-3.5 px-4 text-right">{selectedLang === 'kn' ? 'ಕ್ರಿಯೆಗಳು' : selectedLang === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBreakdown.map((item) => {
                    const loc = item.location;
                    return (
                      <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-extrabold text-white bg-gradient-to-br ${item.palette.gradient}`}>
                            {loc.order_number || 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {t(loc.location_name)}
                            {loc.is_default && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {loc.area ? t(loc.area) : '-'} {loc.taluk ? `(${t(loc.taluk)})` : ''}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.shopCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${item.palette.gradient}`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/records?location=${loc.id}`)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-400 transition-colors shadow-sm"
                            >
                              {selectedLang === 'kn' ? 'ದಾಖಲೆಗಳು' : selectedLang === 'hi' ? 'रिकॉर्ड्स' : 'View Records'}
                            </button>
                            <button
                              onClick={() => navigate(`/add-shop?location=${loc.id}`)}
                              className="p-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
                              title="Add shop in this location"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State when search matches nothing */}
        {filteredBreakdown.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">
              {selectedLang === 'kn' ? 'ಯಾವುದೇ ಪ್ರದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : selectedLang === 'hi' ? 'कोई क्षेत्र नहीं मिला' : 'No areas found'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {selectedLang === 'kn'
                ? 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಪ್ರಶ್ನೆಗೆ ಸರಿಹೊಂದುವ ಯಾವುದೇ ಪ್ರದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟವನ್ನು ಮರುಹೊಂದಿಸಿ.'
                : selectedLang === 'hi'
                ? 'आपकी खोज के लिए कोई क्षेत्र नहीं मिला। खोज रीसेट करें।'
                : 'No locations matched your filter. Try adjusting your search query.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveAreaFilter(null);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-xs rounded-xl hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Insights Section: Recent Shops & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recently Added Shops */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                {selectedLang === 'kn' ? 'ಇತ್ತೀಚೆಗೆ ಸೇರಿಸಲಾದ ಅಂಗಡಿಗಳು' : selectedLang === 'hi' ? 'हाल ही में जोड़ी गई दुकानें' : 'Recently Added Shops'}
              </h3>
            </div>
            <button
              onClick={() => navigate('/records')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {selectedLang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' : selectedLang === 'hi' ? 'सभी देखें' : 'View all'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentShops.map((shop) => {
              const matchedLoc = locations.find(l => l.id === shop.location_id) || shop.location;
              return (
                <div key={shop.id} className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-blue-100">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate text-sm group-hover:text-blue-600 transition-colors">
                        {t(shop.shop_name)}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {matchedLoc?.location_name ? t(matchedLoc.location_name) : 'Unassigned'}
                        </span>
                        <span>•</span>
                        <span>{new Date(shop.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${shop.mobile_number}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="Call Shop"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">{shop.mobile_number}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Operations Overview & Quick Navigation */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">
                {selectedLang === 'kn' ? 'ಕಾರ್ಯಾಚರಣೆಯ ಸಾರಾಂಶ' : selectedLang === 'hi' ? 'परिचालन सारांश' : 'Territory Insights'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-300">
                  {selectedLang === 'kn' ? 'ಕಾರ್ಯನಿರತ ಪ್ರದೇಶಗಳು' : selectedLang === 'hi' ? 'सक्रिय क्षेत्र' : 'Active Territories'}
                </span>
                <span className="font-extrabold text-white text-sm">
                  {locations.filter(l => (areaStats.breakdown.find(b => b.location.id === l.id)?.shopCount || 0) > 0).length} / {locations.length}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-300">
                  {selectedLang === 'kn' ? 'ಅಗ್ರ ಪ್ರದೇಶದ ಪಾಲು' : selectedLang === 'hi' ? 'शीर्ष क्षेत्र की हिस्सेदारी' : 'Top Hub Share'}
                </span>
                <span className="font-extrabold text-blue-400 text-sm">
                  {topArea ? `${topArea.percentage.toFixed(1)}%` : '0%'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-300">
                  {selectedLang === 'kn' ? 'ಖಾಲಿ ಪ್ರದೇಶಗಳು (0 ಅಂಗಡಿಗಳು)' : selectedLang === 'hi' ? 'शून्य दुकान वाले क्षेत्र' : 'Zero-Shop Areas'}
                </span>
                <span className="font-extrabold text-amber-400 text-sm">
                  {areaStats.breakdown.filter(b => b.shopCount === 0).length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/80 space-y-2">
            <button
              onClick={() => navigate('/settings')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedLang === 'kn' ? 'ಹೊಸ ಪ್ರದೇಶಗಳನ್ನು ಸೇರಿಸಿ / ನಿರ್ವಹಿಸಿ' : selectedLang === 'hi' ? 'नए क्षेत्र जोड़ें / प्रबंधित करें' : 'Add / Reorder Locations'}</span>
            </button>
            <button
              onClick={() => navigate('/records')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>{selectedLang === 'kn' ? 'ದಾಖಲೆಗಳ ಕೋಷ್ಟಕವನ್ನು ತೆರೆಯಿರಿ' : selectedLang === 'hi' ? 'रिकॉर्ड्स तालिका खोलें' : 'Open Full Shop Table'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

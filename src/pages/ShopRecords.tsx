import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import type { Shop, Location } from '../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  Search,
  Download,
  Trash2,
  Phone,
  MessageCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2,
  Check,
  FileText,
  FileDown,
  Edit2
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditShopModal } from '../components/EditShopModal';
import {
  SUPPORTED_LANGUAGES,
  UI_STRINGS,
  translateBatch,
  translateSynchronous,
  hasTargetScript,
  type SupportedLanguage
} from '../lib/translationService';
import { downloadShopRecordsPdf } from '../lib/pdfGenerator';
import { downloadShopRecordsWord, isRawUuidOrId } from '../lib/wordGenerator';
import clsx from 'clsx';

export const ShopRecords = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  // Language state - defaults to Kannada ('kn')
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('shop_records_language');
    if (saved === 'kn' || saved === 'hi' || saved === 'en') return saved;
    return 'kn';
  });

  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortField, setSortField] = useState<'location' | 'shop_name'>('location');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locData, shopData] = await Promise.all([
        dataService.getLocations(),
        dataService.getShops()
      ]);
      setLocations(locData);
      setShops(shopData);
    } catch {
      toast.error('Failed to load shop records');
    } finally {
      setLoading(false);
    }
  };

  // Trigger translation when language, shops, or locations change
  useEffect(() => {
    localStorage.setItem('shop_records_language', selectedLang);

    if (selectedLang === 'en') {
      setTranslationMap({});
      return;
    }

    // Seed immediate synchronous translation for all current shops & locations
    const immediateMap: Record<string, string> = {};
    shops.forEach((s) => {
      if (s.shop_name) immediateMap[s.shop_name.trim()] = translateSynchronous(s.shop_name.trim(), selectedLang);
      if (s.location?.location_name) immediateMap[s.location.location_name.trim()] = translateSynchronous(s.location.location_name.trim(), selectedLang);
      if (s.location?.area) immediateMap[s.location.area.trim()] = translateSynchronous(s.location.area.trim(), selectedLang);
      if (s.contact_person) immediateMap[s.contact_person.trim()] = translateSynchronous(s.contact_person.trim(), selectedLang);
    });
    locations.forEach((l) => {
      if (l.location_name) immediateMap[l.location_name.trim()] = translateSynchronous(l.location_name.trim(), selectedLang);
      if (l.area) immediateMap[l.area.trim()] = translateSynchronous(l.area.trim(), selectedLang);
    });

    setTranslationMap(prev => ({ ...immediateMap, ...prev }));

    const translateData = async () => {
      setIsTranslating(true);
      try {
        const textSet = new Set<string>();
        shops.forEach((s) => {
          if (s.shop_name) textSet.add(s.shop_name.trim());
          if (s.location?.location_name) textSet.add(s.location.location_name.trim());
          if (s.location?.area) textSet.add(s.location.area.trim());
          if (s.contact_person) textSet.add(s.contact_person.trim());
        });
        locations.forEach((l) => {
          if (l.location_name) textSet.add(l.location_name.trim());
          if (l.area) textSet.add(l.area.trim());
        });

        const list = Array.from(textSet).filter(Boolean);
        if (list.length > 0) {
          const map = await translateBatch(list, selectedLang);
          setTranslationMap(prev => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    translateData();
  }, [selectedLang, shops, locations]);

  // Translate helper: guarantees translated output in chosen script
  const t = (text?: string | null): string => {
    if (!text) return '';
    if (selectedLang === 'en') return text;
    const clean = text.trim();
    if (translationMap[clean] && hasTargetScript(translationMap[clean], selectedLang)) {
      return translationMap[clean];
    }
    return translateSynchronous(clean, selectedLang);
  };

  const ui = UI_STRINGS[selectedLang];

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    setSelectedLang(langCode);
    localStorage.setItem('shop_records_language', langCode);

    if (langCode === 'en') {
      setTranslationMap({});
    } else {
      // Instantly generate translations for all shops & locations with zero delay
      const immediateMap: Record<string, string> = {};
      shops.forEach((s) => {
        if (s.shop_name) immediateMap[s.shop_name.trim()] = translateSynchronous(s.shop_name.trim(), langCode);
        if (s.location?.location_name) immediateMap[s.location.location_name.trim()] = translateSynchronous(s.location.location_name.trim(), langCode);
        if (s.location?.area) immediateMap[s.location.area.trim()] = translateSynchronous(s.location.area.trim(), langCode);
      });
      locations.forEach((l) => {
        if (l.location_name) immediateMap[l.location_name.trim()] = translateSynchronous(l.location_name.trim(), langCode);
        if (l.area) immediateMap[l.area.trim()] = translateSynchronous(l.area.trim(), langCode);
      });
      setTranslationMap(immediateMap);
    }

    const langNames: Record<SupportedLanguage, string> = {
      kn: 'ಕನ್ನಡ (Kannada)',
      hi: 'हिंदी (Hindi)',
      en: 'English'
    };
    toast.success(`Language switched to ${langNames[langCode]}`);
  };

  const confirmDeleteShop = async () => {
    if (!deletingShop) return;
    setIsDeleting(true);
    try {
      await dataService.deleteShop(deletingShop.id);
      toast.success(ui.deletedSuccess);
      setDeletingShop(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete shop');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveShop = async (formData: {
    shop_name: string;
    mobile_number: string;
    location_id: string;
    contact_person?: string;
    full_address?: string;
    notes?: string;
  }) => {
    if (!editingShop) return;
    setIsUpdating(true);
    try {
      const updated = await dataService.updateShop(editingShop.id, formData);
      const matchedLoc = locations.find(l => l.id === formData.location_id);
      if (matchedLoc) {
        updated.location = matchedLoc;
      }
      setShops(prev => prev.map(s => (s.id === updated.id ? updated : s)));

      // Pre-translate updated shop name if language is Kannada/Hindi
      if (selectedLang !== 'en') {
        const newTrans = translateSynchronous(updated.shop_name, selectedLang);
        setTranslationMap(prev => ({ ...prev, [updated.shop_name.trim()]: newTrans }));
      }

      toast.success(ui.shopUpdatedSuccess);
      setEditingShop(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shop');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(ui.numberCopied);
  };

  // Helper to accurately find location matching a shop
  const findShopLocation = (s: Shop) => {
    return locations.find(l =>
      (l.id && (l.id === s.location_id || String(l.id) === String(s.location_id))) ||
      (s.location?.location_name && l.location_name.trim().toLowerCase() === s.location.location_name.trim().toLowerCase())
    ) || s.location;
  };

  const exportToExcel = () => {
    const exportData = filteredAndSortedShops.map((shop, index) => {
      const matchedLoc = findShopLocation(shop);
      let locationName = matchedLoc?.location_name || shop.location?.location_name;
      if (!locationName || isRawUuidOrId(locationName)) {
        locationName = 'General';
      }

      let areaName = matchedLoc?.area || shop.location?.area;
      if (!areaName || isRawUuidOrId(areaName)) {
        areaName = '-';
      }

      const cleanShopName = isRawUuidOrId(shop.shop_name) ? `Shop #${index + 1}` : shop.shop_name;

      return {
        [ui.slNo]: index + 1,
        [selectedLang === 'kn' ? 'ಅಂಗಡಿಯ ಹೆಸರು (Shop Name)' : selectedLang === 'hi' ? 'दुकान का नाम (Shop Name)' : 'Shop Name']: t(cleanShopName),
        [ui.mobileNumber]: shop.mobile_number,
        [selectedLang === 'kn' ? 'ಸ್ಥಳ (Location)' : selectedLang === 'hi' ? 'स्थान (Location)' : 'Location']: t(locationName) || '-',
        [selectedLang === 'kn' ? 'ಪ್ರದೇಶ (Area)' : selectedLang === 'hi' ? 'क्षेत्र (Area)' : 'Area']: t(areaName) || '-',
        [selectedLang === 'kn' ? 'ದಿನಾಂಕ' : selectedLang === 'hi' ? 'दिनांक' : 'Added On']: new Date(shop.created_at).toLocaleDateString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shops');
    XLSX.writeFile(wb, `Shop_Contacts_${selectedLang.toUpperCase()}.xlsx`);
  };

  const exportToPdf = async () => {
    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      const rows = filteredAndSortedShops.map((shop, index) => {
        const matchedLoc = findShopLocation(shop);
        let locationName = matchedLoc?.location_name || shop.location?.location_name;
        if (!locationName || isRawUuidOrId(locationName)) {
          locationName = 'General';
        }

        const cleanShopName = isRawUuidOrId(shop.shop_name) ? `Shop #${index + 1}` : shop.shop_name;

        return {
          slNo: index + 1,
          shopName: t(cleanShopName),
          mobileNumber: shop.mobile_number,
          location: t(locationName) || '-'
        };
      });

      const headers = {
        slNo: ui.slNo,
        shopName: selectedLang === 'kn' ? 'ಅಂಗಡಿಯ ಹೆಸರು (Shop Name)' : selectedLang === 'hi' ? 'दुकान का नाम (Shop Name)' : 'Shop Name',
        mobileNumber: selectedLang === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile)' : selectedLang === 'hi' ? 'मोबाइल नंबर (Mobile)' : 'Mobile Number',
        location: selectedLang === 'kn' ? 'ಸ್ಥಳ (Location)' : selectedLang === 'hi' ? 'स्थान (Location)' : 'Location',
        box1: '1',
        box2: '2',
        box3: '3',
        box4: '4',
        box5: '5'
      };

      const title = selectedLang === 'kn'
        ? 'ಅಂಗಡಿ ಸಂಪರ್ಕ ದಾಖಲೆಗಳು (Shop Contact Records)'
        : selectedLang === 'hi'
        ? 'दुकान संपर्क रिकॉर्ड्स (Shop Contact Records)'
        : 'Shop Contact Records';

      const subtitle = selectedLang === 'kn'
        ? `ಒಟ್ಟು ದಾಖಲೆಗಳು: ${rows.length} | ರಚಿಸಿದ ದಿನಾಂಕ: ${new Date().toLocaleDateString()}`
        : selectedLang === 'hi'
        ? `कुल रिकॉर्ड्स: ${rows.length} | दिनांक: ${new Date().toLocaleDateString()}`
        : `Total Shops: ${rows.length} | Date: ${new Date().toLocaleDateString()}`;

      await downloadShopRecordsPdf({
        title,
        subtitle,
        headers,
        rows,
        filename: `Shop_Records_${selectedLang.toUpperCase()}.pdf`
      });

      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const exportToWord = async () => {
    setIsDownloadingWord(true);
    const toastId = toast.loading('Generating Word document...');
    try {
      const rows = filteredAndSortedShops.map((shop, index) => {
        const matchedLoc = findShopLocation(shop);
        let locationName = matchedLoc?.location_name || shop.location?.location_name;
        if (!locationName || isRawUuidOrId(locationName)) {
          locationName = 'General';
        }

        const cleanShopName = isRawUuidOrId(shop.shop_name) ? `Shop #${index + 1}` : shop.shop_name;

        return {
          slNo: index + 1,
          shopName: t(cleanShopName),
          mobileNumber: shop.mobile_number,
          location: t(locationName) || '-'
        };
      });

      const headers = {
        slNo: ui.slNo,
        shopName: selectedLang === 'kn' ? 'ಅಂಗಡಿಯ ಹೆಸರು (Shop Name)' : selectedLang === 'hi' ? 'दुकान का नाम (Shop Name)' : 'Shop Name',
        mobileNumber: selectedLang === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile)' : selectedLang === 'hi' ? 'मोबाइल नंबर (Mobile)' : 'Mobile Number',
        location: selectedLang === 'kn' ? 'ಸ್ಥಳ (Location)' : selectedLang === 'hi' ? 'स्थान (Location)' : 'Location',
        box1: '1',
        box2: '2',
        box3: '3',
        box4: '4',
        box5: '5'
      };

      const title = selectedLang === 'kn'
        ? 'ಅಂಗಡಿ ಸಂಪರ್ಕ ದಾಖಲೆಗಳು (Shop Contact Records)'
        : selectedLang === 'hi'
        ? 'दुकान संपर्क रिकॉर्ड्स (Shop Contact Records)'
        : 'Shop Contact Records';

      const subtitle = selectedLang === 'kn'
        ? `ಒಟ್ಟು ದಾಖಲೆಗಳು: ${rows.length} | ರಚಿಸಿದ ದಿನಾಂಕ: ${new Date().toLocaleDateString()}`
        : selectedLang === 'hi'
        ? `कुल रिकॉर्ड्स: ${rows.length} | दिनांक: ${new Date().toLocaleDateString()}`
        : `Total Shops: ${rows.length} | Date: ${new Date().toLocaleDateString()}`;

      await downloadShopRecordsWord({
        title,
        subtitle,
        headers,
        rows,
        filename: `Shop_Records_${selectedLang.toUpperCase()}.docx`
      });

      toast.success('Word file downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Word generation error:', err);
      toast.error('Failed to generate Word file', { id: toastId });
    } finally {
      setIsDownloadingWord(false);
    }
  };

  // Filter and sort logic with multilingual support
  const filteredAndSortedShops = shops
    .filter((shop) => {
      const originalName = shop.shop_name.toLowerCase();
      const translatedName = t(shop.shop_name).toLowerCase();
      const matchedLoc = findShopLocation(shop);
      const originalLoc = (matchedLoc?.location_name || '').toLowerCase();
      const translatedLoc = t(matchedLoc?.location_name).toLowerCase();
      const originalArea = (matchedLoc?.area || '').toLowerCase();
      const translatedArea = t(matchedLoc?.area).toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        originalName.includes(term) ||
        translatedName.includes(term) ||
        shop.mobile_number.includes(term) ||
        originalLoc.includes(term) ||
        translatedLoc.includes(term) ||
        originalArea.includes(term) ||
        translatedArea.includes(term);

      const matchesLocation = locationFilter ? shop.location_id === locationFilter : true;

      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (sortField === 'location') {
        const locA = findShopLocation(a);
        const locB = findShopLocation(b);
        const orderA = typeof locA?.order_number === 'number' && locA.order_number > 0 ? locA.order_number : 999999;
        const orderB = typeof locB?.order_number === 'number' && locB.order_number > 0 ? locB.order_number : 999999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        const locNameA = t(locA?.location_name || '');
        const locNameB = t(locB?.location_name || '');
        const compLoc = locNameA.localeCompare(locNameB);
        if (compLoc !== 0) return compLoc;

        const nameA = t(a.shop_name);
        const nameB = t(b.shop_name);
        return nameA.localeCompare(nameB);
      } else {
        const nameA = t(a.shop_name);
        const nameB = t(b.shop_name);
        return nameA.localeCompare(nameB);
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage);
  const currentShops = filteredAndSortedShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header and Language Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-900">{ui.shopRecords}</h2>
              {isTranslating ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin text-amber-600" />
                  {ui.translating}
                </span>
              ) : selectedLang === 'kn' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full"></span>
                  ಕನ್ನಡ ಮೋಡ್ (Kannada Active)
                </span>
              ) : selectedLang === 'hi' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="w-2 h-2 mr-1.5 bg-orange-500 rounded-full"></span>
                  हिंदी मोड (Hindi Active)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 mr-1.5 bg-blue-500 rounded-full"></span>
                  English Mode
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {ui.totalShopsDesc(filteredAndSortedShops.length, shops.length)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Interactive Multilingual Selector */}
            <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center pl-2 pr-1 text-xs font-bold text-slate-600">
                <Languages className="w-4 h-4 mr-1.5 text-blue-600" />
                <span className="hidden sm:inline mr-1">{ui.language}:</span>
              </div>
              <div className="flex items-center space-x-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={clsx(
                        'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer',
                        isActive
                          ? 'bg-blue-600 text-white shadow font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                      )}
                      title={`Convert Shop Name and Locations to ${lang.label} (${lang.nativeLabel})`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                      {isActive && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={exportToPdf}
              disabled={isDownloadingPdf}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm text-sm font-semibold cursor-pointer"
              title="Download simple bordered data table as PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {ui.downloadPdf}
            </button>

            {/* Download Word Button */}
            <button
              onClick={exportToWord}
              disabled={isDownloadingWord}
              className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm text-sm font-semibold cursor-pointer"
              title="Download simple bordered data table as Word (.docx)"
            >
              {isDownloadingWord ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              {ui.downloadWord}
            </button>

            {/* Export to Excel */}
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              {ui.exportExcel}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={ui.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border text-sm"
            />
          </div>

          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-white text-sm"
            >
              <option value="">{ui.allLocations}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.order_number ? `#${loc.order_number} ` : ''}{t(loc.location_name)} {loc.area ? `(${t(loc.area)})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-white text-sm"
            >
              <option value="location">
                {selectedLang === 'kn' ? 'ಸ್ಥಳದ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ (ಸ್ಥಳ 1, 2...)' : selectedLang === 'hi' ? 'स्थान के अनुसार क्रमबद्ध करें (स्थान 1, 2...)' : 'Sort by Location (Location 1, 2...)'}
              </option>
              <option value="shop_name">{ui.sortByName}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multilingual Table with Bookman Old Style & Dark Black Font */}
      <div className="overflow-x-auto scrollbar-hide" style={{ fontFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman', serif", color: '#000000' }}>
        <table className="min-w-full divide-y divide-black text-black">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                {ui.slNo}
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                {selectedLang === 'kn' ? 'ಅಂಗಡಿಯ ಹೆಸರು (Shop Name)' : selectedLang === 'hi' ? 'ದुकान का नाम (Shop Name)' : 'Shop Name'}
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                {selectedLang === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile)' : selectedLang === 'hi' ? 'मोबाइल नंबर (Mobile)' : 'Mobile Number'}
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                {selectedLang === 'kn' ? 'ಸ್ಥಳ (Location)' : selectedLang === 'hi' ? 'स्थान (Location)' : 'Location'}
              </th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-black uppercase tracking-wider">
                {ui.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-black">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    <span>{ui.loading}</span>
                  </div>
                </td>
              </tr>
            ) : currentShops.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-black text-sm">
                  {ui.noShopsFound}
                </td>
              </tr>
            ) : (
              currentShops.map((shop, index) => {
                const matchedLoc = findShopLocation(shop);
                const translatedShopName = t(shop.shop_name);
                const translatedLocName = t(matchedLoc?.location_name || shop.location?.location_name);
                const translatedArea = t(matchedLoc?.area || shop.location?.area);
                const locOrderNumber = matchedLoc?.order_number;

                return (
                  <tr key={shop.id} className="hover:bg-slate-100/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Prominent Translated Shop Name in Bookman Old Style & Dark Black */}
                      <div className="font-bold text-black text-base">
                        {translatedShopName}
                      </div>
                      {/* Secondary English subtitle if in Kannada or Hindi */}
                      {selectedLang !== 'en' && translatedShopName !== shop.shop_name && (
                        <div className="text-xs text-black/70 font-normal mt-0.5">
                          {shop.shop_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-black tracking-wider">{shop.mobile_number}</span>
                        <button
                          onClick={() => handleCopy(shop.mobile_number)}
                          className="text-black/60 hover:text-black p-1 hover:bg-slate-200 rounded transition-colors"
                          title={ui.copyNumber}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        {/* Prominent Translated Location Badge with Order # */}
                        <div className="flex items-center space-x-1.5">
                          {locOrderNumber ? (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-black bg-black text-white" title={`Location #${locOrderNumber}`}>
                              #{locOrderNumber}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-black border border-black/30 shadow-xs">
                            {translatedLocName || 'Unknown'}
                          </span>
                        </div>
                        {/* Area in Kannada/Hindi */}
                        {translatedArea && (
                          <span className="text-xs text-black/80 mt-1 pl-1 font-medium">
                            {translatedArea}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingShop(shop)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title={ui.editShop}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`tel:${shop.mobile_number}`}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title={ui.call}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/91${shop.mobile_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={ui.whatsapp}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeletingShop(shop)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={ui.deleteShop}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {ui.pagination(
              (currentPage - 1) * itemsPerPage + 1,
              Math.min(currentPage * itemsPerPage, filteredAndSortedShops.length),
              filteredAndSortedShops.length
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 flex items-center"
            >
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingShop)}
        title={ui.deleteConfirmTitle}
        message={ui.deleteConfirmMsg(t(deletingShop?.shop_name), deletingShop?.mobile_number || '')}
        confirmText={ui.deleteButton}
        cancelText={ui.cancel}
        loadingText={ui.loading}
        isLoading={isDeleting}
        onCancel={() => setDeletingShop(null)}
        onConfirm={confirmDeleteShop}
      />

      <EditShopModal
        isOpen={Boolean(editingShop)}
        shop={editingShop}
        locations={locations}
        isLoading={isUpdating}
        selectedLang={selectedLang}
        onClose={() => setEditingShop(null)}
        onSave={handleSaveShop}
      />
    </div>
  );
};

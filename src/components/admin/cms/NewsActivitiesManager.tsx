import React, { useState, useEffect, useRef } from 'react';
import { NewsActivityItemCMS } from '../../../types';
import { INITIAL_CMS_NEWS_ACTIVITIES } from '../../../data/cmsInitialData';
import { uploadSingleMediaImage, deleteMediaByPath } from '../../../services/mediaApi';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  Newspaper,
  Calendar,
  MapPin,
  Upload,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

interface NewsActivitiesManagerProps {
  items: NewsActivityItemCMS[];
  onSaveItems: (updated: NewsActivityItemCMS[]) => Promise<void>;
}

const CATEGORIES = ['News', 'Activity', 'CSR', 'Event', 'AGM', 'Notice'];

export const NewsActivitiesManager: React.FC<NewsActivitiesManagerProps> = ({
  items,
  onSaveItems,
}) => {
  const [list, setList] = useState<NewsActivityItemCMS[]>(
    items && items.length > 0 ? items : INITIAL_CMS_NEWS_ACTIVITIES
  );
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<NewsActivityItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [highlightsEnText, setHighlightsEnText] = useState('');
  const [highlightsNpText, setHighlightsNpText] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [replacingCardId, setReplacingCardId] = useState<string | null>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items && items.length > 0) {
      setList(items);
    }
  }, [items]);

  const openAddModal = () => {
    const fresh: NewsActivityItemCMS = {
      id: `news-${Date.now()}`,
      titleEn: '',
      titleNp: '',
      category: 'Activity',
      publishDate: '2081 Kartik (November 2024)',
      locationEn: 'Butwal-4, Rupandehi',
      locationNp: 'बुटवल-४, रुपन्देही',
      summaryEn: '',
      summaryNp: '',
      imageUrl: '',
      highlightsEn: [],
      highlightsNp: [],
      status: 'Published',
    };
    setEditingItem(fresh);
    setHighlightsEnText('');
    setHighlightsNpText('');
    setIsNew(true);
  };

  const openEditModal = (item: NewsActivityItemCMS) => {
    setEditingItem({ ...item });
    setHighlightsEnText((item.highlightsEn || []).join('\n'));
    setHighlightsNpText((item.highlightsNp || []).join('\n'));
    setIsNew(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setUploadingImage(true);
    try {
      const oldUrl = editingItem.imageUrl;
      const res = await uploadSingleMediaImage(file, 'general', editingItem.titleEn || 'News Activity Image');
      if (res.success && res.file?.url) {
        if (oldUrl && oldUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(oldUrl);
        }
        setEditingItem({ ...editingItem, imageUrl: res.file.url });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteModalImage = async () => {
    if (!editingItem || !editingItem.imageUrl) return;
    setUploadingImage(true);
    try {
      if (editingItem.imageUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(editingItem.imageUrl);
      }
      setEditingItem({ ...editingItem, imageUrl: '' });
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerCardImageReplace = (id: string) => {
    setReplacingCardId(id);
    if (cardImageInputRef.current) {
      cardImageInputRef.current.value = '';
      cardImageInputRef.current.click();
    }
  };

  const handleCardImageReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingCardId) return;
    setUploadingImage(true);
    try {
      const target = list.find((it) => it.id === replacingCardId);
      const res = await uploadSingleMediaImage(file, 'general', target?.titleEn || 'News Activity Image');
      if (res.success && res.file?.url) {
        if (target?.imageUrl && target.imageUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(target.imageUrl);
        }
        const updated = list.map((it) =>
          it.id === replacingCardId ? { ...it, imageUrl: res.file!.url } : it
        );
        setList(updated);
        await onSaveItems(updated);
      }
    } finally {
      setUploadingImage(false);
      setReplacingCardId(null);
    }
  };

  const handleDeleteCardImage = async (item: NewsActivityItemCMS) => {
    if (!item.imageUrl) return;
    setUploadingImage(true);
    try {
      if (item.imageUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(item.imageUrl);
      }
      const updated = list.map((it) => (it.id === item.id ? { ...it, imageUrl: '' } : it));
      setList(updated);
      await onSaveItems(updated);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.titleEn.trim()) return;
    setSaving(true);
    try {
      const finalItem: NewsActivityItemCMS = {
        ...editingItem,
        highlightsEn: highlightsEnText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        highlightsNp: highlightsNpText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const updated = isNew
        ? [finalItem, ...list]
        : list.map((it) => (it.id === finalItem.id ? finalItem : it));
      setList(updated);
      await onSaveItems(updated);
      setEditingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const target = list.find((it) => it.id === id);
    if (target?.imageUrl && target.imageUrl.startsWith('/uploads/')) {
      await deleteMediaByPath(target.imageUrl);
    }
    const updated = list.filter((it) => it.id !== id);
    setList(updated);
    await onSaveItems(updated);
  };

  const filtered = filterCat === 'ALL' ? list : list.filter((it) => it.category === filterCat);

  return (
    <div className="space-y-6">
      {/* Hidden input for replacing card photo directly */}
      <input
        ref={cardImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleCardImageReplace}
        className="hidden"
      />

      {/* Full Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0981ae]" />
                News / Activity Image Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={previewImageUrl}
                alt="News Activity Preview"
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span className="truncate">{previewImageUrl}</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-sans font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#052636] to-[#065371] p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block mb-1">
            More Menu &bull; News &amp; Activities CRUD Manager
          </span>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-sky-300" />
            News, Community Events &amp; CSR Activities ({list.length})
          </h3>
          <p className="text-xs text-sky-100/80 mt-1">
            Create, edit, publish, or remove news articles, community health camps, workshops, and AGM updates shown under &ldquo;More &rarr; News &amp; Activities&rdquo;.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add News / Activity
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterCat('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterCat === 'ALL'
              ? 'bg-[#0981ae] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({list.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = list.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0981ae]/40 shadow-2xs flex flex-col justify-between gap-4 transition"
          >
            <div>
              {item.imageUrl ? (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-40 group">
                  <img
                    src={item.imageUrl}
                    alt={item.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImageUrl(item.imageUrl!)}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-slate-800 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0981ae]" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerCardImageReplace(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCardImage(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">No banner photo uploaded</span>
                  <button
                    type="button"
                    onClick={() => triggerCardImageReplace(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0981ae] text-[11px] font-bold flex items-center gap-1 border border-sky-200 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Photo
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0981ae] text-[10px] font-black uppercase border border-sky-200">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.publishDate}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Published'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.titleEn}</h4>
              <p className="text-xs font-medium text-sky-800 mt-0.5">{item.titleNp}</p>

              {item.locationEn && (
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0981ae]" />
                  <span>{item.locationEn} ({item.locationNp})</span>
                </p>
              )}

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {item.summaryEn}
              </p>

              {item.highlightsEn && item.highlightsEn.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.highlightsEn.slice(0, 2).map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#0981ae] font-bold">✓</span>
                      <span className="line-clamp-1">{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0981ae] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                  title="Delete News/Activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#0981ae]" />
                {isNew ? 'Add New News / Community Activity' : 'Edit News / Community Activity'}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    placeholder="e.g. Free Health & Blood Donation Camp"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शीर्षक (नेपालीमा) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.titleNp}
                    onChange={(e) => setEditingItem({ ...editingItem, titleNp: e.target.value })}
                    placeholder="उदा: बृहत् निःशुल्क स्वास्थ्य शिविर तथा रक्तदान"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publish Date (B.S. / A.D.)
                  </label>
                  <input
                    type="text"
                    value={editingItem.publishDate}
                    onChange={(e) => setEditingItem({ ...editingItem, publishDate: e.target.value })}
                    placeholder="2081 Kartik 15"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        status: e.target.value as 'Published' | 'Draft',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none bg-white"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Venue / Location (English)
                  </label>
                  <input
                    type="text"
                    value={editingItem.locationEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, locationEn: e.target.value })}
                    placeholder="Head Office Butwal-4, Rupandehi"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    स्थान (नेपालीमा)
                  </label>
                  <input
                    type="text"
                    value={editingItem.locationNp || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, locationNp: e.target.value })}
                    placeholder="केन्द्रीय कार्यालय बुटवल-४, रुपन्देही"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Summary (English) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.summaryEn}
                    onChange={(e) => setEditingItem({ ...editingItem, summaryEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    विस्तृत विवरण (नेपालीमा) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.summaryNp}
                    onChange={(e) => setEditingItem({ ...editingItem, summaryNp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Highlights (English — One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={highlightsEnText}
                    onChange={(e) => setHighlightsEnText(e.target.value)}
                    placeholder="145 pints blood collected&#10;420+ members screened"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मुख्य बुँदाहरू (नेपालीमा — एक लाइनमा एउटा)
                  </label>
                  <textarea
                    rows={3}
                    value={highlightsNpText}
                    onChange={(e) => setHighlightsNpText(e.target.value)}
                    placeholder="१४५ पिन्ट रगत संकलन&#10;४२०+ सदस्यहरूको स्वास्थ्य परीक्षण"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              {/* Banner / Feature Image Upload, Preview, Replace, Delete */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Event / Activity Banner Photo (Server Upload &amp; MySQL Storage)
                </label>

                {editingItem.imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={editingItem.imageUrl}
                        alt="Activity Banner"
                        className="w-20 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Banner Photo Uploaded</p>
                        <p className="text-[10px] font-mono text-slate-500 break-all">
                          {editingItem.imageUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(editingItem.imageUrl!)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <label className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold cursor-pointer flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Replace Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleDeleteModalImage}
                        disabled={uploadingImage}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-[#0981ae] cursor-pointer transition">
                    <Upload className="w-5 h-5 text-[#0981ae] mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {uploadingImage ? 'Uploading Photo to Server...' : 'Click to Upload Event / Activity Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP, SVG — Saved permanently on server &amp; MySQL
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save News / Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

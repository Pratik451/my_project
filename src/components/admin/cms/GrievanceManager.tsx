import React, { useState } from 'react';
import { GrievanceRecordCMS, GrievanceOfficerCMS } from '../../../types';
import {
  MessageSquareWarning,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  Save,
  X,
  ShieldAlert,
  Send
} from 'lucide-react';
import { saveCmsGrievances, saveCmsGrievanceOfficer } from '../../../services/mediaApi';

const DEFAULT_OFFICER: GrievanceOfficerCMS = {
  officerNameEn: 'Mr. Manoj Poudel',
  officerNameNp: 'श्री मनोज पौडेल',
  designationEn: 'Senior Compliance Officer & Member Grievance In-Charge',
  designationNp: 'वरिष्ठ अनुपालन अधिकृत तथा सदस्य गुनासो सुनुवाइ अधिकारी',
  phone: '071-540123 (Ext. 106)',
  directMobile: '9857099445',
  email: 'grievance@ekatacoop.com.np',
  roomNo: 'Room 204, Second Floor, Central Head Office Butwal',
  availabilityEn: 'Sunday to Friday: 11:00 AM - 3:00 PM',
  availabilityNp: 'आइतबार देखि शुक्रबार: बिहान ११:०० देखि दिउँसो ३:०० बजेसम्म',
  redressalCommitmentEn: 'All member grievances registered in person or digitally are acknowledged within 24 hours and formally resolved within 3 to 7 working days.',
  redressalCommitmentNp: 'दर्ता भएका सम्पूर्ण गुनासाहरूको २४ घण्टाभित्र प्रारम्भिक सुनुवाइ तथा ३ देखि ७ कार्यदिनभित्र औपचारिक समाधान गरिनेछ।'
};

const DEFAULT_GRIEVANCES: GrievanceRecordCMS[] = [
  {
    id: 'grv-1',
    ticketNo: 'GRV-2083-018',
    senderName: 'Ramesh Kumar Gurung',
    phone: '9857022145',
    email: 'ramesh.gurung@gmail.com',
    memberCode: 'EK-10482',
    subject: 'SMS Transaction Alert Delay on Counter Deposit',
    category: 'digital',
    message: 'Deposited Rs. 25,000 at Traffic Chowk counter yesterday, receipt received but SMS alert was received after 4 hours. Kindly ensure instant SMS gateway.',
    status: 'Resolved',
    submittedAt: '2083-05-08 02:15 PM',
    resolutionNotes: 'Telecom SMS gateway buffer cleared with Nepal Telecom. Instant push tested and member informed via telephone.',
    officerAssigned: 'Er. Sujan Adhikari (IT Lead)'
  },
  {
    id: 'grv-2',
    ticketNo: 'GRV-2083-024',
    senderName: 'Saraswati KC',
    phone: '9847099321',
    email: 'saraswati.kc@yahoo.com',
    memberCode: 'EK-08941',
    subject: 'Clarification on Agricultural Loan Subsidy Guidelines',
    category: 'loan',
    message: 'Requesting fast-track review of livestock shed inspection schedule for agricultural loan disbursement.',
    status: 'Under Review',
    submittedAt: '2083-05-11 11:30 AM',
    resolutionNotes: 'Field officer Mr. Rajesh Shrestha assigned to conduct physical site appraisal tomorrow morning.',
    officerAssigned: 'Mr. Rajesh Shrestha (Credit In-Charge)'
  },
  {
    id: 'grv-3',
    ticketNo: 'GRV-2083-031',
    senderName: 'Bishnu Maya Thapa',
    phone: '9806912345',
    email: 'bishnu.thapa@gmail.com',
    memberCode: 'EK-04128',
    subject: 'Suggestion for Evening Cash Counter at Amarpath Extension',
    category: 'service',
    message: 'Local retail shopkeepers request counter cash deposit services extended till 5:30 PM for market traders.',
    status: 'Pending',
    submittedAt: '2083-05-13 09:45 AM',
    resolutionNotes: '',
    officerAssigned: 'Mr. Deepak Thapa'
  }
];

interface Props {
  grievances?: GrievanceRecordCMS[] | null;
  officer?: GrievanceOfficerCMS | null;
  onSaveGrievances?: (data: GrievanceRecordCMS[]) => void;
  onSaveOfficer?: (data: GrievanceOfficerCMS) => void;
}

export const GrievanceManager: React.FC<Props> = ({
  grievances,
  officer,
  onSaveGrievances,
  onSaveOfficer
}) => {
  const [list, setList] = useState<GrievanceRecordCMS[]>(grievances || DEFAULT_GRIEVANCES);
  const [officerData, setOfficerData] = useState<GrievanceOfficerCMS>(officer || DEFAULT_OFFICER);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEditingOfficer, setIsEditingOfficer] = useState<boolean>(false);
  const [viewingTicket, setViewingTicket] = useState<GrievanceRecordCMS | null>(null);
  const [editingTicket, setEditingTicket] = useState<GrievanceRecordCMS | null>(null);
  const [isNewTicket, setIsNewTicket] = useState<boolean>(false);
  const [ticketToDelete, setTicketToDelete] = useState<GrievanceRecordCMS | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (grievances) setList(grievances);
  }, [grievances]);

  React.useEffect(() => {
    if (officer) setOfficerData(officer);
  }, [officer]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    const nextNum = Math.floor(Math.random() * 900) + 100;
    setEditingTicket({
      id: `grv-${Date.now()}`,
      ticketNo: `GRV-2083-${nextNum}`,
      senderName: '',
      phone: '',
      email: '',
      memberCode: '',
      subject: '',
      category: 'service',
      message: '',
      status: 'Pending',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      resolutionNotes: '',
      officerAssigned: officerData.officerNameEn
    });
    setIsNewTicket(true);
  };

  const handleOpenEdit = (ticket: GrievanceRecordCMS) => {
    setEditingTicket({ ...ticket });
    setIsNewTicket(false);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    if (!editingTicket.senderName.trim() || !editingTicket.subject.trim()) {
      showToast('Name and Subject are required.', 'error');
      return;
    }

    let updatedList: GrievanceRecordCMS[];
    if (isNewTicket) {
      updatedList = [editingTicket, ...list];
    } else {
      updatedList = list.map((t) => (t.id === editingTicket.id ? editingTicket : t));
    }

    setIsSaving(true);
    try {
      await saveCmsGrievances(updatedList);
      setList(updatedList);
      if (onSaveGrievances) onSaveGrievances(updatedList);
      setEditingTicket(null);
      showToast(isNewTicket ? 'Grievance ticket registered!' : 'Grievance ticket updated in database!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save grievance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    const updatedList = list.filter((t) => t.id !== ticketToDelete.id);
    setIsSaving(true);
    try {
      await saveCmsGrievances(updatedList);
      setList(updatedList);
      if (onSaveGrievances) onSaveGrievances(updatedList);
      setTicketToDelete(null);
      showToast('Grievance ticket deleted from database.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete ticket', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveCmsGrievanceOfficer(officerData);
      if (onSaveOfficer) onSaveOfficer(officerData);
      setIsEditingOfficer(false);
      showToast('Grievance Officer details updated in database!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save officer profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredList = list.filter((item) => {
    const statusMatch = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      item.ticketNo.toLowerCase().includes(q) ||
      item.senderName.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  return (
    <div id="grievance-manager" className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border animate-in fade-in ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-500'
              : 'bg-slate-900 text-white border-sky-500'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-[#0981ae]" />
            Grievance Redressal & Feedback CMS Manager (गुनासो तथा सुझाव व्यवस्थापन)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review member feedback, assign compliance redressal officers, and record formal resolution steps with full database synchronization.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record New Grievance
        </button>
      </div>

      {/* Compliance Officer Info Banner */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-[#0981ae] border border-sky-200 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            👨‍💼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                Compliance Grievance Officer
              </span>
              <strong className="text-sm text-slate-900">{officerData.officerNameEn}</strong>
              <span className="text-xs text-slate-500 font-nepali">({officerData.officerNameNp})</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {officerData.designationEn} • {officerData.roomNo}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#0981ae]" /> {officerData.directMobile}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#0981ae]" /> {officerData.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#0981ae]" /> {officerData.availabilityEn}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingOfficer(true)}
          className="px-4 py-2 bg-white text-[#0981ae] hover:bg-sky-100 text-xs font-bold rounded-xl border border-sky-300 shadow-2xs transition shrink-0 cursor-pointer"
        >
          Configure Officer Profile
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: `All Tickets (${list.length})` },
            { key: 'Pending', label: `Pending (${list.filter((t) => t.status === 'Pending').length})` },
            { key: 'Under Review', label: `Under Review (${list.filter((t) => t.status === 'Under Review').length})` },
            { key: 'Resolved', label: `Resolved (${list.filter((t) => t.status === 'Resolved').length})` },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterStatus(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === cat.key
                  ? 'bg-[#0981ae] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, names, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0981ae]"
          />
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-3">
        {filteredList.map((ticket) => {
          const isPending = ticket.status === 'Pending';
          const isReview = ticket.status === 'Under Review';
          const isResolved = ticket.status === 'Resolved';

          return (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-[#0981ae]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {ticket.ticketNo}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      isPending
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isReview
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-sky-100 text-[#0981ae] border border-sky-200'
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-[11px] text-slate-400">• {ticket.submittedAt}</span>
                  {ticket.memberCode && (
                    <span className="text-[11px] text-sky-700 font-mono">Member: {ticket.memberCode}</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{ticket.message}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span><strong>From:</strong> {ticket.senderName} ({ticket.phone})</span>
                  {ticket.officerAssigned && (
                    <span><strong>Assigned:</strong> {ticket.officerAssigned}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewingTicket(ticket)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(ticket)}
                  className="px-3 py-1.5 text-xs font-bold text-[#0981ae] bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setTicketToDelete(ticket)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No grievance tickets found</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or register a new grievance ticket.</p>
          </div>
        )}
      </div>

      {/* VIEW TICKET MODAL */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0981ae]" />
                Grievance Ticket #{viewingTicket.ticketNo}
              </h3>
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender Info</span>
                  <strong className="text-slate-800 text-sm block">{viewingTicket.senderName}</strong>
                  <span className="text-slate-500">Tel: {viewingTicket.phone} {viewingTicket.email && `• ${viewingTicket.email}`}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-sm text-[#0981ae]">{viewingTicket.status}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-700 block text-xs uppercase font-bold mb-1">Subject:</strong>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-semibold">{viewingTicket.subject}</p>
              </div>

              <div>
                <strong className="text-slate-700 block text-xs uppercase font-bold mb-1">Detailed Grievance Message:</strong>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line leading-relaxed">
                  {viewingTicket.message}
                </p>
              </div>

              {viewingTicket.resolutionNotes && (
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 space-y-1">
                  <strong className="text-sky-800 block font-bold">Resolution & Action Taken:</strong>
                  <p className="text-sky-900 whitespace-pre-line">{viewingTicket.resolutionNotes}</p>
                  <span className="text-[10px] text-sky-700 block pt-1">
                    Resolved by: {viewingTicket.officerAssigned || 'Compliance Unit'}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const t = viewingTicket;
                  setViewingTicket(null);
                  handleOpenEdit(t);
                }}
                className="px-4 py-2 bg-[#0981ae] text-white text-xs font-bold rounded-lg hover:bg-[#07678d] transition cursor-pointer"
              >
                Update Ticket / Add Resolution
              </button>
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD TICKET MODAL */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0981ae]" />
                {isNewTicket ? 'Record New Grievance Ticket' : `Update Ticket #${editingTicket.ticketNo}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTicket.senderName}
                    onChange={(e) => setEditingTicket({ ...editingTicket, senderName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTicket.phone}
                    onChange={(e) => setEditingTicket({ ...editingTicket, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Member Code (optional)
                  </label>
                  <input
                    type="text"
                    value={editingTicket.memberCode || ''}
                    onChange={(e) => setEditingTicket({ ...editingTicket, memberCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                    placeholder="e.g. EK-10482"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editingTicket.category}
                    onChange={(e) => setEditingTicket({ ...editingTicket, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  >
                    <option value="service">Service & Counter</option>
                    <option value="deposit">Deposit & Savings</option>
                    <option value="loan">Loan & Credit</option>
                    <option value="digital">Mobile App / SMS</option>
                    <option value="staff">Staff Conduct</option>
                    <option value="other">Other Inquiries</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Status *
                  </label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-[#0981ae] outline-none focus:border-[#0981ae]"
                  >
                    <option value="Pending">Pending (प्रतीक्षारत)</option>
                    <option value="Under Review">Under Review (छानबिन हुँदै)</option>
                    <option value="Resolved">Resolved (समाधान भइसकेको)</option>
                    <option value="Closed">Closed (बन्द)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={editingTicket.subject}
                  onChange={(e) => setEditingTicket({ ...editingTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  placeholder="Grievance subject summary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Member Grievance / Feedback Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingTicket.message}
                  onChange={(e) => setEditingTicket({ ...editingTicket, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Resolution Notes & Remedial Actions Taken
                </label>
                <textarea
                  rows={3}
                  value={editingTicket.resolutionNotes || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, resolutionNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  placeholder="Record formal hearing result, action taken, and communication with member..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Investigating Officer Assigned
                </label>
                <input
                  type="text"
                  value={editingTicket.officerAssigned || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, officerAssigned: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-lg font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Grievance Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE OFFICER PROFILE MODAL */}
      {isEditingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0981ae]" />
                Configure Grievance Hearing Officer Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingOfficer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOfficer} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Officer Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerData.officerNameEn}
                    onChange={(e) => setOfficerData({ ...officerData, officerNameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    अधिकृतको नाम (नेपाली) *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerData.officerNameNp}
                    onChange={(e) => setOfficerData({ ...officerData, officerNameNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae] font-nepali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Designation (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerData.designationEn}
                    onChange={(e) => setOfficerData({ ...officerData, designationEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    पद / जिम्मेवारी (नेपाली) *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerData.designationNp}
                    onChange={(e) => setOfficerData({ ...officerData, designationNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae] font-nepali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Direct Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerData.directMobile}
                    onChange={(e) => setOfficerData({ ...officerData, directMobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Extension Phone
                  </label>
                  <input
                    type="text"
                    value={officerData.phone}
                    onChange={(e) => setOfficerData({ ...officerData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Grievance Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={officerData.email}
                    onChange={(e) => setOfficerData({ ...officerData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Room / Hearing Location
                  </label>
                  <input
                    type="text"
                    value={officerData.roomNo}
                    onChange={(e) => setOfficerData({ ...officerData, roomNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Hearing Schedule / Availability
                  </label>
                  <input
                    type="text"
                    value={officerData.availabilityEn}
                    onChange={(e) => setOfficerData({ ...officerData, availabilityEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Redressal Charter & Commitment (English)
                </label>
                <textarea
                  rows={2}
                  value={officerData.redressalCommitmentEn}
                  onChange={(e) => setOfficerData({ ...officerData, redressalCommitmentEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#0981ae]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingOfficer(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-lg font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Officer Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Delete Grievance Ticket?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete ticket{' '}
              <strong className="text-slate-900">"{ticketToDelete.ticketNo}"</strong> from {ticketToDelete.senderName}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

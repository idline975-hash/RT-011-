/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, onSnapshot, query } from 'firebase/firestore';
import {
  Home,
  Users,
  FileText,
  Wallet,
  Settings,
  Sun,
  Moon,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Building,
  Menu,
  X,
  Printer,
  Trash2,
  Edit,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  HelpCircle,
  LogOut,
  Bell,
  Camera,
  RefreshCcw,
  BarChart3,
  Package,
  HeartHandshake
} from 'lucide-react';

// Interfaces
interface Resident {
  id: string;
  nik: string;
  no_kk: string;
  nama: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  status_huni: 'Milik Sendiri' | 'Kontrak/Kos' | 'Menumpang' | 'Lainnya';
  perkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai';
  pekerjaan: string;
  telepon: string;
  alamat: string;
  is_kepala_keluarga: boolean;
  // New fields
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: string;
  status_warga?: 'AKTIF' | 'TIDAK AKTIF';
  status_domisili?: 'DALAM' | 'LUAR';
  pendidikan_terakhir?: string;
  asal_pendatang?: string;
  is_mode_bayi?: boolean;
}

interface Transaction {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: 'Pemasukan' | 'Pengeluaran';
  nominal: number;
  pencatat: string;
}

interface Announcement {
  id: string;
  tanggal: string;
  judul: string;
  isi: string;
  kategori: 'Penting' | 'Kegiatan' | 'Keuangan';
}

interface LetterRequest {
  id: string;
  nama: string;
  nik: string;
  jenis_surat: 'Surat Pengantar Domisili' | 'Surat Keterangan Kelahiran' | 'Surat Pengantar SKCK' | 'Surat Keterangan Tidak Mampu';
  keperluan: string;
  tanggal: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
}

interface MutationRecord {
  id: string;
  nama: string;
  nik: string;
  jenis_mutasi: 'Pindah Masuk' | 'Pindah Keluar' | 'Pindah RT';
  tanggal: string;
  keterangan: string;
}

const INITIAL_RESIDENTS: Resident[] = [
  {
    id: '1',
    nik: '3275011001850001',
    no_kk: '3275011001000001',
    nama: 'Budi Santoso',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    telepon: '081234567890',
    alamat: 'Jl. Melati No. 12, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '2',
    nik: '3275014505880002',
    no_kk: '3275011001000001',
    nama: 'Siti Aminah',
    jenis_kelamin: 'Perempuan',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Ibu Rumah Tangga',
    telepon: '081234567891',
    alamat: 'Jl. Melati No. 12, RT 011/RW 04',
    is_kepala_keluarga: false
  },
  {
    id: '3',
    nik: '3275012203900003',
    no_kk: '3275011001000002',
    nama: 'Ahmad Fauzi',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Kontrak/Kos',
    perkawinan: 'Kawin',
    pekerjaan: 'Wiraswasta',
    telepon: '081398765432',
    alamat: 'Jl. Melati No. 15, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '4',
    nik: '3275010507950004',
    no_kk: '3275011001000003',
    nama: 'Dewi Lestari',
    jenis_kelamin: 'Perempuan',
    status_huni: 'Menumpang',
    perkawinan: 'Belum Kawin',
    pekerjaan: 'PNS/TNI/POLRI',
    telepon: '085678901234',
    alamat: 'Jl. Melati No. 18, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '5',
    nik: '3275011212800005',
    no_kk: '3275011001000004',
    nama: 'Rian Hidayat',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    telepon: '081987654321',
    alamat: 'Jl. Mawar No. 8, RT 011/RW 04',
    is_kepala_keluarga: true
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    tanggal: '2026-10-18',
    keterangan: 'Iuran Kas Warga Bulanan Oktober (50 KK)',
    kategori: 'Pemasukan',
    nominal: 2500000,
    pencatat: 'Bendahara RT'
  },
  {
    id: 't2',
    tanggal: '2026-10-15',
    keterangan: 'Pembelian Lampu Jalan LED & Kabel',
    kategori: 'Pengeluaran',
    nominal: 350000,
    pencatat: 'Seksi Keamanan'
  },
  {
    id: 't3',
    tanggal: '2026-10-10',
    keterangan: 'Konsumsi Kerja Bakti Bulanan',
    kategori: 'Pengeluaran',
    nominal: 450000,
    pencatat: 'Ketua RT'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    tanggal: '20 Oct 2026',
    judul: 'Kerja Bakti Massal & Pembersihan Saluran Air',
    isi: 'Diharapkan kehadiran seluruh warga RT 011/RW 04 pada hari Minggu pukul 07.00 WIB membawa alat kebersihan masing-masing.',
    kategori: 'Kegiatan'
  },
  {
    id: 'a2',
    tanggal: '15 Oct 2026',
    judul: 'Pembayaran Iuran Kas Bulanan',
    isi: 'Batas akhir pembayaran iuran kas RT bulan Oktober adalah tanggal 25. Mohon diserahkan kepada bendahara atau via transfer.',
    kategori: 'Keuangan'
  }
];

const getAge = (tanggal_lahir?: string) => {
  if (!tanggal_lahir) return 0;
  let birthDate: Date;
  if (tanggal_lahir.includes('-')) {
    const parts = tanggal_lahir.split('-');
    if (parts[0].length === 4) {
      birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  } else if (tanggal_lahir.includes('/')) {
    const parts = tanggal_lahir.split('/');
    if (parts[2]?.length === 4) {
      birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
  } else {
    birthDate = new Date(tanggal_lahir);
  }
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dash' | 'warga' | 'kk' | 'keuangan' | 'surat' | 'more' | 'mutasi'>('dash');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [rtNumber, setRtNumber] = useState<string>('011');
  const [rwNumber, setRwNumber] = useState<string>('04');
  const [isTrialMode, setIsTrialMode] = useState<boolean>(true);

  // Data states
  const [residents, setResidents] = useState<Resident[]>([]); // Initialize empty
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [letterRequests, setLetterRequests] = useState<LetterRequest[]>([
    {
      id: 'l1',
      nama: 'Ahmad Fauzi',
      nik: '3275012203900003',
      jenis_surat: 'Surat Pengantar Domisili',
      keperluan: 'Keperluan Pembuatan Rekening Bank',
      tanggal: '2026-10-20',
      status: 'Disetujui'
    }
  ]);

  // Load residents from Firestore
  useEffect(() => {
    const q = query(collection(db, 'residents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const residentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resident[];
      setResidents(residentsData);
    });
    return () => unsubscribe();
  }, []);

  // UI state filters
  const [demographicTab, setDemographicTab] = useState<'statusHuni' | 'perkawinan' | 'pekerjaan'>('statusHuni');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [huniFilter, setHuniFilter] = useState<'ALL' | 'TETAP' | 'PENDATANG'>('ALL'); // Separated filter
  const [ktpFilter, setKtpFilter] = useState<'ALL' | 'ADA_KTP' | 'TANPA_KTP'>('ALL'); // Separated filter
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Laki-laki' | 'Perempuan'>('ALL');
  const [kkFilter, setKkFilter] = useState<'ALL' | 'TUNGGAL'>('ALL');
  const [kkSearchQuery, setKkSearchQuery] = useState<string>('');
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showAgeModal, setShowAgeModal] = useState<boolean>(false);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [appliedMinAge, setAppliedMinAge] = useState<string>('');
  const [appliedMaxAge, setAppliedMaxAge] = useState<string>('');
  const [isZeroMode, setIsZeroMode] = useState<boolean>(false); // Allow toggling between 0 data (like screenshot) and demo data!
  const [showKkOptionsModal, setShowKkOptionsModal] = useState<boolean>(false);
  const [kkRtFilter, setKkRtFilter] = useState<string>('Semua RT');
  const [kkSortOrder, setKkSortOrder] = useState<string>('Terbaru');
  const [showMoreLainnyaModal, setShowMoreLainnyaModal] = useState<boolean>(false);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [mutationSearch, setMutationSearch] = useState<string>('');
  const [showAddMutationModal, setShowAddMutationModal] = useState<boolean>(false);
  const [newMutation, setNewMutation] = useState<Partial<MutationRecord>>({
    jenis_mutasi: 'Pindah Masuk',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // Modals
  const [showAddResidentModal, setShowAddResidentModal] = useState<boolean>(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [selectedKK, setSelectedKK] = useState<string | null>(null);

  // New Resident Form
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Belum Kawin',
    pekerjaan: 'Karyawan Swasta',
    is_kepala_keluarga: false
  });

  // New Transaction Form
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    kategori: 'Pemasukan',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // New Letter Request Form
  const [newLetter, setNewLetter] = useState<Partial<LetterRequest>>({
    jenis_surat: 'Surat Pengantar Domisili'
  });

  // Calculations
  const activeResidents = isZeroMode ? [] : residents;
  const totalPenduduk = activeResidents.length;
  const totalKK = isZeroMode ? 0 : new Set(activeResidents.map(r => r.no_kk)).size;
  const totalKontrak = isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Kontrak/Kos').length;
  const totalLaki = isZeroMode ? 0 : activeResidents.filter(r => r.jenis_kelamin === 'Laki-laki').length;
  const totalPerempuan = isZeroMode ? 0 : activeResidents.filter(r => r.jenis_kelamin === 'Perempuan').length;

  const totalPemasukan = transactions.filter(t => t.kategori === 'Pemasukan').reduce((acc, t) => acc + t.nominal, 0);
  const totalPengeluaran = transactions.filter(t => t.kategori === 'Pengeluaran').reduce((acc, t) => acc + t.nominal, 0);
  const saldoKas = isZeroMode ? 0 : (totalPemasukan - totalPengeluaran);

  // Demographic breakdown counts
  const statusHuniCounts = {
    'Milik Sendiri': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Milik Sendiri').length,
    'Kontrak/Kos': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Kontrak/Kos').length,
    'Menumpang': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Menumpang').length,
    'Lainnya': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Lainnya').length,
  };

  const perkawinanCounts = {
    'Belum Kawin': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Belum Kawin').length,
    'Kawin': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Kawin').length,
    'Cerai': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Cerai').length,
  };

  const pekerjaanCounts = activeResidents.reduce((acc: Record<string, number>, r) => {
    const job = r.pekerjaan || 'Lainnya';
    acc[job] = (acc[job] || 0) + 1;
    return acc;
  }, {});

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.nama || !newResident.nik) return;
    const item: Omit<Resident, 'id'> = {
      nik: newResident.nik || '',
      no_kk: newResident.no_kk || '327501' + Math.floor(1000000000 + Math.random() * 9000000000),
      nama: newResident.nama || '',
      jenis_kelamin: newResident.jenis_kelamin as any || 'Laki-laki',
      status_huni: newResident.status_huni as any || 'Milik Sendiri',
      perkawinan: newResident.perkawinan as any || 'Belum Kawin',
      pekerjaan: newResident.pekerjaan || 'Wiraswasta',
      telepon: newResident.telepon || '-',
      alamat: newResident.alamat || `Jl. Melati, RT ${rtNumber}/RW ${rwNumber}`,
      is_kepala_keluarga: !!newResident.is_kepala_keluarga,
      // Add new fields
      tempat_lahir: newResident.tempat_lahir,
      tanggal_lahir: newResident.tanggal_lahir,
      agama: newResident.agama,
      status_warga: newResident.status_warga,
      status_domisili: newResident.status_domisili,
      pendidikan_terakhir: newResident.pendidikan_terakhir,
      asal_pendatang: newResident.asal_pendatang,
      is_mode_bayi: newResident.is_mode_bayi
    };
    
    await addDoc(collection(db, 'residents'), item);
    
    setIsZeroMode(false);
    setShowAddResidentModal(false);
    setNewResident({ jenis_kelamin: 'Laki-laki', status_huni: 'Milik Sendiri', perkawinan: 'Belum Kawin', pekerjaan: 'Karyawan Swasta' });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.keterangan || !newTx.nominal) return;
    const tx: Transaction = {
      id: 't_' + Date.now(),
      tanggal: newTx.tanggal || new Date().toISOString().split('T')[0],
      keterangan: newTx.keterangan || '',
      kategori: newTx.kategori as any || 'Pemasukan',
      nominal: Number(newTx.nominal) || 0,
      pencatat: 'Admin RT'
    };
    setTransactions([tx, ...transactions]);
    setShowAddTransactionModal(false);
    setNewTx({ kategori: 'Pemasukan', tanggal: new Date().toISOString().split('T')[0] });
  };

  const handleRequestLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetter.nama || !newLetter.keperluan) return;
    const req: LetterRequest = {
      id: 'l_' + Date.now(),
      nama: newLetter.nama,
      nik: newLetter.nik || '327501...',
      jenis_surat: newLetter.jenis_surat as any || 'Surat Pengantar Domisili',
      keperluan: newLetter.keperluan,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setLetterRequests([req, ...letterRequests]);
    setShowLetterModal(false);
    setNewLetter({ jenis_surat: 'Surat Pengantar Domisili' });
    alert('Permohonan surat berhasil dikirim ke pengurus RT!');
  };

  const formatDateIndo = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#121212] text-gray-100' : 'bg-gray-50 text-gray-900'} pb-24 transition-colors duration-200`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#18181b]/90 border-gray-800 backdrop-blur-md' : 'bg-white/90 border-gray-200 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-lg">
            RT
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide">RT {rtNumber} / RW {rwNumber}</h1>
            <p className="text-xs text-gray-400">WargaKu Smart Neighborhood</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-fade-in">
            {/* Title block */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Dashboard Statistik</h2>
                <p className="text-xs text-gray-400">Overview data warga lingkungan RT {rtNumber} / RW {rwNumber}</p>
              </div>
            </div>

            {/* Greeting Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-600/20">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs font-medium text-blue-100">{formatDateIndo()}</p>
              <h3 className="text-xl font-bold mt-0.5">Selamat Pagi, Admin!</h3>
              <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                Berikut adalah ringkasan data terkini lingkungan RT {rtNumber} / RW {rwNumber}.
              </p>
            </div>

            {/* Saldo Kas Card */}
            <div className={`p-4 rounded-2xl border transition ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80 shadow-lg' : 'bg-white border-gray-200 shadow-md'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">SALDO KAS</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight">
                Rp {saldoKas.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Status Keuangan Sehat</span>
              </div>
            </div>

            {/* Grid Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Penduduk */}
              <div 
                onClick={() => setActiveTab('warga')}
                className={`p-4 rounded-2xl border cursor-pointer transition hover:border-blue-500/50 relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>PENDUDUK</span>
                </div>
                <div className="text-2xl font-black">{totalPenduduk}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Terdata aktif</div>
                <Users className="absolute -right-4 -bottom-4 w-16 h-16 text-blue-500/5 pointer-events-none" />
              </div>

              {/* Kartu Keluarga */}
              <div 
                onClick={() => setActiveTab('kk')}
                className={`p-4 rounded-2xl border cursor-pointer transition hover:border-purple-500/50 relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>KARTU KELUARGA</span>
                </div>
                <div className="text-2xl font-black">{totalKK}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Kepala Keluarga</div>
                <FileText className="absolute -right-4 -bottom-4 w-16 h-16 text-purple-500/5 pointer-events-none" />
              </div>

              {/* Kontrak / Kos */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>KONTRAK/KOS</span>
                </div>
                <div className="text-2xl font-black">{totalKontrak}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Warga menyewa</div>
                <Building className="absolute -right-4 -bottom-4 w-16 h-16 text-amber-500/5 pointer-events-none" />
              </div>

              {/* Gender ratio card */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1 text-blue-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      <span>Laki-laki</span>
                    </span>
                    <span className="font-bold">{totalLaki}</span>
                  </div>
                  <div className="w-full bg-gray-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalPenduduk > 0 ? (totalLaki / totalPenduduk) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="flex items-center space-x-1 text-pink-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                      <span>Perempuan</span>
                    </span>
                    <span className="font-bold">{totalPerempuan}</span>
                  </div>
                  <div className="w-full bg-gray-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-pink-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalPenduduk > 0 ? (totalPerempuan / totalPenduduk) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistik Demografi Section */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Statistik Demografi</h3>
                  <p className="text-[11px] text-gray-400">Sebaran status huni & perkawinan</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-900/60 rounded-xl">
                <button
                  onClick={() => setDemographicTab('statusHuni')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'statusHuni' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Status Huni
                </button>
                <button
                  onClick={() => setDemographicTab('perkawinan')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'perkawinan' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Perkawinan
                </button>
                <button
                  onClick={() => setDemographicTab('pekerjaan')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'pekerjaan' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Pekerjaan
                </button>
              </div>

              {/* Demographics Content */}
              <div className="space-y-2 pt-1">
                {demographicTab === 'statusHuni' && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-semibold tracking-wide">MILIK SENDIRI</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Milik Sendiri']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-semibold tracking-wide">KONTRAK/KOS</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Kontrak/Kos']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span className="text-xs font-semibold tracking-wide">MENUMPANG</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Menumpang']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                        <span className="text-xs font-semibold tracking-wide">LAINNYA</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Lainnya']} Org</span>
                    </div>
                  </>
                )}

                {demographicTab === 'perkawinan' && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-semibold tracking-wide">BELUM KAWIN</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Belum Kawin']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-semibold tracking-wide">KAWIN</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Kawin']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span className="text-xs font-semibold tracking-wide">CERAI</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Cerai']} Org</span>
                    </div>
                  </>
                )}

                {demographicTab === 'pekerjaan' && (
                  Object.keys(pekerjaanCounts).length > 0 ? (
                    Object.entries(pekerjaanCounts).map(([job, count]) => (
                      <div key={job} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                          <span className="text-xs font-semibold tracking-wide uppercase">{job}</span>
                        </div>
                        <span className="text-xs font-bold">{count} Org</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-4 text-gray-400">Belum ada data pekerjaan</p>
                  )
                )}
              </div>
            </div>

            {/* Aktivitas Terkini */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Aktivitas Terkini</h3>
              </div>

              {announcements.length === 0 && transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-xs">Belum ada aktivitas</p>
                  <p className="text-[10px] italic mt-1">* Lihat log selengkapnya di menu Log Aktivitas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-gray-900/30 border border-gray-800/40 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-400">{item.judul}</span>
                        <span className="text-[10px] text-gray-400">{item.tanggal}</span>
                      </div>
                      <p className="text-gray-300 line-clamp-2">{item.isi}</p>
                    </div>
                  ))}
                  <p className="text-[10px] text-center text-gray-400 italic pt-1">
                    * Lihat log selengkapnya di menu Log Aktivitas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATA WARGA TAB */}
        {activeTab === 'warga' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => setHuniFilter('ALL')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>TOTAL WARGA</span>
                </div>
                <div className="text-2xl font-black">{residents.length}</div>
              </div>
              <div onClick={() => setHuniFilter(huniFilter === 'TETAP' ? 'ALL' : 'TETAP')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'TETAP' ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>WARGA TETAP</span>
                </div>
                <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Milik Sendiri').length}</div>
              </div>
              <div onClick={() => setHuniFilter(huniFilter === 'PENDATANG' ? 'ALL' : 'PENDATANG')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'PENDATANG' ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>PENDATANG</span>
                </div>
                <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang').length}</div>
              </div>
              <div onClick={() => setKtpFilter(ktpFilter === 'ADA_KTP' ? 'TANPA_KTP' : ktpFilter === 'TANPA_KTP' ? 'ALL' : 'ADA_KTP')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${ktpFilter !== 'ALL' ? 'ring-2 ring-purple-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{ktpFilter === 'TANPA_KTP' ? 'TANPA KTP' : 'ADA KTP'}</span>
                </div>
                <div className="text-2xl font-black">{residents.length}</div>
                <div className="text-[10px] text-gray-500 mt-1">Klik: Ganti Status KTP</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex space-x-2 relative">
              <button className={`px-5 py-3 rounded-xl font-bold ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>RT</button>
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white' : 'bg-white shadow'}`}
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}
                >
                  <div className="space-y-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showMoreMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { setShowMoreMenu(false); setShowAgeModal(true); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-purple-400 text-left"
                      >
                        <span className="text-base">🎂</span>
                        <span>Filter Usia</span>
                      </button>

                      <div className="border-t border-gray-700/50 my-1"></div>

                      <button 
                        onClick={() => { setShowMoreMenu(false); setGenderFilter(genderFilter === 'Laki-laki' ? 'ALL' : 'Laki-laki'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-blue-400 text-left"
                      >
                        <span className="text-base">♂</span>
                        <span>Gender: Laki-laki {genderFilter === 'Laki-laki' && '✓'}</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); setGenderFilter(genderFilter === 'Perempuan' ? 'ALL' : 'Perempuan'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-pink-400 text-left"
                      >
                        <span className="text-base">♀</span>
                        <span>Gender: Perempuan {genderFilter === 'Perempuan' && '✓'}</span>
                      </button>

                      <div className="border-t border-gray-700/50 my-1"></div>

                      <button 
                        onClick={() => { setShowMoreMenu(false); alert('Mengunduh template Excel...'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-blue-500 text-left"
                      >
                        <Download className="w-4 h-4" />
                        <span>Template Excel</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); alert('Fitur Import Excel'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-amber-500 text-left"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Import Excel</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); window.print(); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-gray-300 text-left"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddResidentModal(true)}
                className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filter Badge */}
            {(huniFilter !== 'ALL' || ktpFilter !== 'ALL' || genderFilter !== 'ALL' || appliedMinAge !== '' || appliedMaxAge !== '') && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Filter Aktif:</span>
                  <div className="flex flex-wrap gap-2">
                    {huniFilter !== 'ALL' && (
                        <div className="flex items-center bg-amber-900/30 text-amber-500 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Status: {huniFilter === 'TETAP' ? 'Tetap' : 'Pendatang'}</span>
                            <button onClick={() => setHuniFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {ktpFilter !== 'ALL' && (
                        <div className="flex items-center bg-purple-900/30 text-purple-500 px-3 py-1 rounded-full text-xs font-bold">
                            <span>KTP: {ktpFilter === 'ADA_KTP' ? 'Ada' : 'Tanpa'}</span>
                            <button onClick={() => setKtpFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {genderFilter !== 'ALL' && (
                        <div className="flex items-center bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Gender: {genderFilter}</span>
                            <button onClick={() => setGenderFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {(appliedMinAge !== '' || appliedMaxAge !== '') && (
                        <div className="flex items-center bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Usia: {appliedMinAge || '0'} - {appliedMaxAge || '∞'} thn</span>
                            <button onClick={() => { setAppliedMinAge(''); setAppliedMaxAge(''); }} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 italic">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Menampilkan {residents.filter(r => {
                    const age = getAge(r.tanggal_lahir);
                    return (
                      (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                      (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                      (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                      (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                      (appliedMaxAge === '' || age <= Number(appliedMaxAge))
                    );
                  }).length} data sesuai filter</span>
                </div>
              </div>
            )}


            {/* Residents List */}
            {residents.filter(r => {
              const age = getAge(r.tanggal_lahir);
              return (
                (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                (appliedMaxAge === '' || age <= Number(appliedMaxAge)) &&
                r.nama.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }).length === 0 ? (
              <div className={`p-10 rounded-2xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>
                Tidak ada data ditemukan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {residents
                  .filter(r => {
                    const age = getAge(r.tanggal_lahir);
                    return (
                      (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                      (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                      (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                      (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                      (appliedMaxAge === '' || age <= Number(appliedMaxAge)) &&
                      r.nama.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((resident) => (
                    <div key={resident.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'} space-y-2`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm">{resident.nama}</h4>
                            {resident.is_kepala_keluarga && (
                              <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                                KK
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">NIK: {resident.nik}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Hal footer */}
            <div className="flex justify-between items-center pt-4 text-sm font-semibold">
              <span>Hal 1</span>
              <div className="flex space-x-2">
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}

        {/* KARTU KELUARGA TAB */}
        {activeTab === 'kk' && (() => {
          const kkMap = residents.reduce((acc: Record<string, Resident[]>, r) => {
            const kk = r.no_kk || 'TANPA_KK';
            if (!acc[kk]) acc[kk] = [];
            acc[kk].push(r);
            return acc;
          }, {});

          const totalUniqueKK = isZeroMode ? 0 : Object.keys(kkMap).length;
          const totalJiwa = isZeroMode ? 0 : residents.length;
          const kkList = isZeroMode ? [] : Object.entries(kkMap).map(([no_kk, members]) => {
            const kepala = members.find(m => m.is_kepala_keluarga) || members[0];
            return {
              no_kk,
              kepala: kepala?.nama || 'Tidak ada Kepala Keluarga',
              jumlahAnggota: members.length,
              alamat: kepala?.alamat || '-',
              members,
              isTunggal: members.length === 1
            };
          });
          const totalKkTunggal = kkList.filter(k => k.isTunggal).length;

          const filteredKkList = kkList.filter(k => {
            const matchFilter = kkFilter === 'ALL' || (kkFilter === 'TUNGGAL' && k.isTunggal);
            const matchSearch = k.no_kk.toLowerCase().includes(kkSearchQuery.toLowerCase()) || k.kepala.toLowerCase().includes(kkSearchQuery.toLowerCase());
            return matchFilter && matchSearch;
          });

          return (
            <div className="space-y-4 animate-fade-in">
              {/* Top Stat Cards (Clickable) */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => setKkFilter('ALL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${kkFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-[10px] text-blue-400 font-bold mb-1">TOTAL KK</div>
                  <div className="text-xl font-black">{totalUniqueKK}</div>
                </div>

                <div 
                  onClick={() => setKkFilter('ALL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}
                >
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">TOTAL JIWA</div>
                  <div className="text-xl font-black">{totalJiwa}</div>
                </div>

                <div 
                  onClick={() => setKkFilter(kkFilter === 'TUNGGAL' ? 'ALL' : 'TUNGGAL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${kkFilter === 'TUNGGAL' ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="text-[10px] text-amber-400 font-bold mb-1">KK TUNGGAL</div>
                  <div className="text-xl font-black">{totalKkTunggal}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari No. KK / Kepala Keluarga..."
                    value={kkSearchQuery}
                    onChange={(e) => setKkSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white' : 'bg-white shadow'}`}
                  />
                </div>
                <button 
                  onClick={() => setShowKkOptionsModal(true)}
                  className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {/* Filter active badge */}
              {kkFilter !== 'ALL' && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold">
                  <span>Filter Aktif: KK Tunggal</span>
                  <button onClick={() => setKkFilter('ALL')} className="underline">Reset</button>
                </div>
              )}

              {/* KK List */}
              {filteredKkList.length === 0 ? (
                <div className={`p-10 rounded-2xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>
                  Belum ada data Kartu Keluarga.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredKkList.map((kkItem) => (
                    <div key={kkItem.no_kk} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-2`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm">No. KK: {kkItem.no_kk}</h4>
                            {kkItem.isTunggal && (
                              <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded-full font-semibold">
                                KK Tunggal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Kepala Keluarga: <span className="text-gray-200 font-semibold">{kkItem.kepala}</span></p>
                        </div>
                        <span className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-xl font-bold">
                          {kkItem.jumlahAnggota} Jiwa
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Alamat: {kkItem.alamat}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination footer */}
              <div className="flex justify-between items-center pt-4 text-sm font-semibold">
                <span>Halaman 1</span>
                <div className="flex space-x-2">
                  <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                  <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* KEUANGAN TAB */}
        {activeTab === 'keuangan' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Keuangan Kas RT</h2>
                <p className="text-xs text-gray-400">Pemasukan dan pengeluaran kas warga</p>
              </div>
              <button
                onClick={() => setShowAddTransactionModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Kas</span>
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>TOTAL PEMASUKAN</span>
                </div>
                <div className="text-xl font-black text-emerald-400">Rp {totalPemasukan.toLocaleString('id-ID')}</div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-1.5 text-red-400 text-xs font-semibold mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>TOTAL PENGELUARAN</span>
                </div>
                <div className="text-xl font-black text-red-400">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm pt-2">Riwayat Transaksi Kas</h3>
              {transactions.map((tx) => (
                <div key={tx.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'} flex justify-between items-center`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${tx.kategori === 'Pemasukan' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <h4 className="font-bold text-xs">{tx.keterangan}</h4>
                    </div>
                    <p className="text-[10px] text-gray-400">{tx.tanggal} • Oleh: {tx.pencatat}</p>
                  </div>
                  <div className={`text-sm font-black ${tx.kategori === 'Pemasukan' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.kategori === 'Pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SURAT TAB */}
        {activeTab === 'surat' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Layanan Surat Warga</h2>
                <p className="text-xs text-gray-400">Pengajuan surat pengantar RT & administrasi</p>
              </div>
              <button
                onClick={() => setShowLetterModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Surat</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {letterRequests.map((req) => (
                <div key={req.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{req.jenis_surat}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Pemohon: <span className="text-gray-200 font-semibold">{req.nama}</span></p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] rounded-lg font-semibold ${
                      req.status === 'Disetujui' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 bg-gray-900/40 p-2.5 rounded-xl border border-gray-800/40">
                    <span className="text-gray-500">Keperluan:</span> {req.keperluan}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-gray-400">Tanggal: {req.tanggal}</span>
                    <button
                      onClick={() => alert(`Mencetak surat ${req.jenis_surat} untuk ${req.nama}...`)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Surat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MORE / PENGATURAN TAB */}
        {activeTab === 'more' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Menu & Pengaturan</h2>
              <p className="text-xs text-gray-400">Konfigurasi lingkungan RT {rtNumber} / RW {rwNumber}</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold text-sm">Informasi Wilayah RT/RW</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Nomor RT</label>
                  <input
                    type="text"
                    value={rtNumber}
                    onChange={(e) => setRtNumber(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Nomor RW</label>
                  <input
                    type="text"
                    value={rwNumber}
                    onChange={(e) => setRwNumber(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold text-sm">Aksi Cepat</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setResidents(INITIAL_RESIDENTS);
                    setIsZeroMode(false);
                    alert('Data demografi berhasil direset ke default!');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800/50 text-xs font-semibold transition flex justify-between items-center"
                >
                  <span>Reset Data Warga Default</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => {
                    setIsZeroMode(true);
                    alert('Tampilan diset ke Mode 0 Data (seperti screenshot)');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800/50 text-xs font-semibold transition flex justify-between items-center"
                >
                  <span>Aktifkan Tampilan 0 Data (Screenshot Style)</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MUTASI TAB / VIEW */}
        {activeTab === 'mutasi' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight">Riwayat Mutasi</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-blue-400' : 'bg-white shadow text-blue-600'}`}
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAddMutationModal(true)}
                  className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Nama/NIK..."
                value={mutationSearch}
                onChange={(e) => setMutationSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white placeholder-gray-500' : 'bg-white shadow placeholder-gray-400'}`}
              />
            </div>

            {/* Filter row */}
            <div className="flex space-x-2">
              <button className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-gray-300' : 'bg-white shadow text-gray-700'}`}>
                <Calendar className="w-5 h-5" />
              </button>
              <div className={`flex-1 flex items-center justify-between px-4 py-3.5 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-gray-300' : 'bg-white shadow text-gray-700'}`}>
                <span className="text-sm font-medium">Semua</span>
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Content / Empty State */}
            {mutations.filter(m => m.nama.toLowerCase().includes(mutationSearch.toLowerCase()) || m.nik.includes(mutationSearch)).length === 0 ? (
              <div className={`p-16 rounded-3xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]/60' : 'bg-white shadow'}`}>
                <p className="text-sm">Tidak ada data riwayat.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mutations
                  .filter(m => m.nama.toLowerCase().includes(mutationSearch.toLowerCase()) || m.nik.includes(mutationSearch))
                  .map((m) => (
                    <div key={m.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800' : 'bg-white border-gray-200'} space-y-1`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">{m.nama}</h4>
                        <span className="px-2.5 py-1 text-[10px] bg-blue-500/20 text-blue-400 rounded-lg font-semibold">{m.jenis_mutasi}</span>
                      </div>
                      <p className="text-xs text-gray-400">NIK: {m.nik} • {m.tanggal}</p>
                      <p className="text-xs text-gray-300">{m.keterangan}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination footer */}
            <div className="flex justify-between items-center pt-4 text-sm text-gray-400">
              <span>Hal 1</span>
              <div className="flex space-x-2">
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 border-t flex justify-around items-center z-50 ${isDarkMode ? 'bg-[#18181b]/95 border-gray-800 backdrop-blur-lg' : 'bg-white/95 border-gray-200 backdrop-blur-lg'}`}>
        <button
          onClick={() => setActiveTab('dash')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'dash' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Dash</span>
        </button>

        <button
          onClick={() => setActiveTab('warga')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'warga' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <div className="w-12 h-12 -mt-6 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-[#121212]">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Warga</span>
        </button>

        <button
          onClick={() => setActiveTab('kk')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'kk' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">KK</span>
        </button>

        <button
          onClick={() => setActiveTab('keuangan')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'keuangan' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Kas</span>
        </button>

        <button
          onClick={() => {
            setShowMoreLainnyaModal(true);
          }}
          className={`flex flex-col items-center space-y-1 transition text-gray-400 hover:text-gray-200`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* MODAL: Tambah Warga */}
      {showAddResidentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center sticky top-0 bg-[#1e1e24] z-10 pb-2 space-x-4">
              <button onClick={() => setShowAddResidentModal(false)}><X className="w-5 h-5" /></button>
              <h3 className="font-bold text-lg">Tambah Warga Baru</h3>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Aktifkan Mode Bayi</span>
                <span className="text-[10px] text-gray-400">NIK akan di-generate otomatis dan status disesuaikan</span>
              </div>
              <input type="checkbox" checked={!!newResident.is_mode_bayi} onChange={(e) => setNewResident({...newResident, is_mode_bayi: e.target.checked})} className="w-8 h-4 rounded-full"/>
            </div>

            <form onSubmit={handleAddResident} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 text-[10px] uppercase font-bold">Data Pribadi</label>
                <input type="text" placeholder="NIK" value={newResident.nik || ''} onChange={(e) => setNewResident({...newResident, nik: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              </div>
              
              <div className={`p-6 border-2 border-dashed rounded-xl ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300'} text-center`}>
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <span className="text-gray-400">Ketuk untuk memilih Foto KTP</span>
              </div>

              <input type="text" placeholder="Nama Lengkap" value={newResident.nama || ''} onChange={(e) => setNewResident({...newResident, nama: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Tempat Lahir</label><input type="text" placeholder="Tempat Lahir" value={newResident.tempat_lahir || ''} onChange={(e) => setNewResident({...newResident, tempat_lahir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" /></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Tanggal Lahir</label><input type="date" value={newResident.tanggal_lahir || ''} onChange={(e) => setNewResident({...newResident, tanggal_lahir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" /></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Jenis Kelamin</label><select value={newResident.jenis_kelamin} onChange={(e) => setNewResident({ ...newResident, jenis_kelamin: e.target.value as any })} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Laki-laki">L</option><option value="Perempuan">P</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Agama</label><select value={newResident.agama || 'Islam'} onChange={(e) => setNewResident({ ...newResident, agama: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Budha">Budha</option><option value="Konghucu">Konghucu</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Status Kawin</label><select value={newResident.perkawinan} onChange={(e) => setNewResident({ ...newResident, perkawinan: e.target.value as any })} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Belum Kawin">Belum Kawin</option><option value="Kawin">Kawin</option><option value="Cerai">Cerai</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Status Warga</label><select value={newResident.status_warga || 'AKTIF'} onChange={(e) => setNewResident({...newResident, status_warga: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="AKTIF">AKTIF</option><option value="TIDAK AKTIF">TIDAK AKTIF</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Status Domisili</label><select value={newResident.status_domisili || 'DALAM'} onChange={(e) => setNewResident({...newResident, status_domisili: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="DALAM">DALAM</option><option value="LUAR">LUAR</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Status Tinggal</label><select value={newResident.status_huni} onChange={(e) => setNewResident({...newResident, status_huni: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Milik Sendiri">Milik Sendiri</option><option value="Kontrak/Kos">Kontrak/Kos</option><option value="Menumpang">Menumpang</option></select></div>
              </div>

              <div><label className="text-gray-400 text-[10px] font-bold">Pendidikan Terakhir</label><select value={newResident.pendidikan_terakhir || 'SMA/SMK/MA Sederajat'} onChange={(e) => setNewResident({...newResident, pendidikan_terakhir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="SMA/SMK/MA Sederajat">SMA/SMK/MA Sederajat</option><option value="SMP/MTs Sederajat">SMP/MTs Sederajat</option><option value="SD/MI Sederajat">SD/MI Sederajat</option></select></div>
              <div><label className="text-gray-400 text-[10px] font-bold">Asal Pendatang</label><select value={newResident.asal_pendatang || 'Asal Warga Sini'} onChange={(e) => setNewResident({...newResident, asal_pendatang: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Asal Warga Sini">Asal Warga Sini</option><option value="Pendatang">Pendatang</option></select></div>

              <input type="text" placeholder="Pekerjaan" className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              <input type="text" placeholder="Nomor HP / WhatsApp" className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Alamat Lengkap (Ta..." className="col-span-2 w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
                <input type="text" value={rtNumber} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" disabled />
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-700 text-white font-bold text-sm">Simpan Data Warga</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Transaksi Kas */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Keuangan Kas RT</h3>
              <button onClick={() => setShowAddTransactionModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Kategori</label>
                <select
                  value={newTx.kategori}
                  onChange={(e) => setNewTx({ ...newTx, kategori: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Pemasukan">Pemasukan (Iuran / Sumbangan)</option>
                  <option value="Pengeluaran">Pengeluaran (Operasional / Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran Warga Blok A Oktober"
                  value={newTx.keterangan || ''}
                  onChange={(e) => setNewTx({ ...newTx, keterangan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newTx.nominal || ''}
                  onChange={(e) => setNewTx({ ...newTx, nominal: Number(e.target.value) })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newTx.tanggal}
                  onChange={(e) => setNewTx({ ...newTx, tanggal: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Surat */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Buat Pengajuan Surat</h3>
              <button onClick={() => setShowLetterModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLetter} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Jenis Surat</label>
                <select
                  value={newLetter.jenis_surat}
                  onChange={(e) => setNewLetter({ ...newLetter, jenis_surat: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Surat Pengantar Domisili">Surat Pengantar Domisili</option>
                  <option value="Surat Keterangan Kelahiran">Surat Keterangan Kelahiran</option>
                  <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                  <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Warga"
                  value={newLetter.nama || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nama: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NIK Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="327501..."
                  value={newLetter.nik || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nik: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keperluan Pembuatan Surat</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Untuk persyaratan melamar pekerjaan / pembukaan rekening bank..."
                  value={newLetter.keperluan || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, keperluan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLetterModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Filter Usia Manual */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white shadow-2xl' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'} space-y-6 animate-fade-in`}>
            <h3 className="font-bold text-lg tracking-tight">Filter Usia Manual</h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl text-center font-medium border-0 outline-none ${isDarkMode ? 'bg-[#2a2a32] text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <span className="text-gray-400 font-bold">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl text-center font-medium border-0 outline-none ${isDarkMode ? 'bg-[#2a2a32] text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMinAge('');
                  setMaxAge('');
                  setShowAgeModal(false);
                }}
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm px-3 py-2"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedMinAge(minAge);
                  setAppliedMaxAge(maxAge);
                  setShowAgeModal(false);
                }}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfigurasi & Aksi KK */}
      {showKkOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white shadow-2xl' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'} space-y-5 animate-fade-in`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base tracking-tight">Konfigurasi & Aksi KK</h3>
              <button onClick={() => setShowKkOptionsModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Filter & Urutan</div>
              <div className="space-y-2">
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Wilayah RT</label>
                  <select
                    value={kkRtFilter}
                    onChange={(e) => setKkRtFilter(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="Semua RT">Semua RT</option>
                    <option value="RT 011">RT {rtNumber}</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Urutkan Data</label>
                  <select
                    value={kkSortOrder}
                    onChange={(e) => setKkSortOrder(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="Terbaru">Terbaru</option>
                    <option value="Terlama">Terlama</option>
                    <option value="Jumlah Anggota Terbanyak">Jumlah Anggota Terbanyak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Aksi Data</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowKkOptionsModal(false);
                    setShowAddResidentModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input KK Baru</span>
                </button>
                <button
                  onClick={() => {
                    setShowKkOptionsModal(false);
                    window.print();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Menu Lainnya */}
      {showMoreLainnyaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-md bg-[#1e1e24] text-white rounded-t-[32px] p-6 space-y-6 shadow-2xl border-t border-gray-800 animate-slide-up">
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto"></div>

            {/* Header Title & Logout Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">Menu Lainnya</h3>
              <button
                onClick={() => {
                  if (confirm('Keluar dari sesi Admin RT?')) {
                    setShowMoreLainnyaModal(false);
                    alert('Berhasil keluar (Admin).');
                  }
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/25 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Admin)</span>
              </button>
            </div>

            {/* 2x4 Grid of Menu Items */}
            <div className="grid grid-cols-4 gap-4 pt-2">
              {/* 1. Mutasi */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('mutasi');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Mutasi</span>
              </button>

              {/* 2. Keuangan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('keuangan');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Keuangan</span>
              </button>

              {/* 3. Cetak Surat */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('surat');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Printer className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Cetak Surat</span>
              </button>

              {/* 4. Laporan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('dash');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Laporan</span>
              </button>

              {/* 5. Inventaris */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  alert('Modul Inventaris & Aset RT 011');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Inventaris</span>
              </button>

              {/* 6. Bantuan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  alert('Modul Bantuan Sosial (Bansos) Warga');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Bantuan</span>
              </button>

              {/* 7. Log Aktivitas */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  alert('Log Aktivitas Sistem WargaKu');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-gray-200 text-center leading-tight">Log Aktivitas</span>
              </button>

              {/* 8. Pengaturan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('more');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-500/20 text-slate-300 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Pengaturan</span>
              </button>
            </div>

            <div className="pt-2 pb-4 text-center">
              <button
                onClick={() => setShowMoreLainnyaModal(false)}
                className="w-full py-3 rounded-2xl bg-gray-800 text-gray-300 font-bold text-sm hover:bg-gray-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Tambah Mutasi */}
      {showAddMutationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Mutasi Warga</h3>
              <button onClick={() => setShowAddMutationModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newMutation.nama) return;
              const item: MutationRecord = {
                id: 'mut_' + Date.now(),
                nama: newMutation.nama || '',
                nik: newMutation.nik || '327501...',
                jenis_mutasi: newMutation.jenis_mutasi as any || 'Pindah Masuk',
                tanggal: newMutation.tanggal || new Date().toISOString().split('T')[0],
                keterangan: newMutation.keterangan || '-'
              };
              setMutations([item, ...mutations]);
              setShowAddMutationModal(false);
              setNewMutation({ jenis_mutasi: 'Pindah Masuk', tanggal: new Date().toISOString().split('T')[0] });
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Jenis Mutasi</label>
                <select
                  value={newMutation.jenis_mutasi || 'Pindah Masuk'}
                  onChange={(e) => setNewMutation({ ...newMutation, jenis_mutasi: e.target.value as any })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Pindah Masuk">Pindah Masuk</option>
                  <option value="Pindah Keluar">Pindah Keluar</option>
                  <option value="Pindah RT">Pindah RT</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nama Warga</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Warga"
                  value={newMutation.nama || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nama: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NIK</label>
                <input
                  type="text"
                  placeholder="NIK Warga"
                  value={newMutation.nik || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nik: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan mutasi..."
                  value={newMutation.keterangan || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, keterangan: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMutationModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

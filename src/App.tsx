/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
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
  HeartHandshake,
  Grid,
  List,
  Eye,
  ChevronDown,
  Layers,
  Check,
  Share2,
  UserPlus,
  Clock,
  Briefcase
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
    is_kepala_keluarga: true,
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1985-01-10',
    agama: 'Islam',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'S1/Sarjana'
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
    is_kepala_keluarga: false,
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1988-05-05',
    agama: 'Islam',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'SMA/SMK Sederajat'
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
    is_kepala_keluarga: true,
    tempat_lahir: 'Semarang',
    tanggal_lahir: '1990-03-22',
    agama: 'Islam',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'D3/Diploma'
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
    is_kepala_keluarga: true,
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1995-07-05',
    agama: 'Islam',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'S1/Sarjana'
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
    is_kepala_keluarga: true,
    tempat_lahir: 'Yogyakarta',
    tanggal_lahir: '1980-12-12',
    agama: 'Islam',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'SMA/SMK Sederajat'
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
    tanggal: '20 Okt 2026',
    judul: 'Kerja Bakti Massal & Pembersihan Saluran Air',
    isi: 'Diharapkan kehadiran seluruh warga RT 011/RW 04 pada hari Minggu pukul 07.00 WIB membawa alat kebersihan masing-masing.',
    kategori: 'Kegiatan'
  },
  {
    id: 'a2',
    tanggal: '15 Okt 2026',
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
  const [wargaViewMode, setWargaViewMode] = useState<'card' | 'table'>('card');

  // Data states
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
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
    },
    {
      id: 'l2',
      nama: 'Budi Santoso',
      nik: '3275011001850001',
      jenis_surat: 'Surat Pengantar SKCK',
      keperluan: 'Pembaruan Dokumen Lamaran Kerja BUMN',
      tanggal: '2026-10-21',
      status: 'Pending'
    }
  ]);
  const [mutations, setMutations] = useState<MutationRecord[]>([
    {
      id: 'm1',
      nama: 'Ahmad Fauzi',
      nik: '3275012203900003',
      jenis_mutasi: 'Pindah Masuk',
      tanggal: '2026-10-01',
      keterangan: 'Pindah domisili dari Semarang menempati rumah kontrakan'
    }
  ]);

  // Load residents from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'residents'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const residentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Resident[];
          setResidents(residentsData);
        }
      }, (error) => {
        console.warn('Firestore offline or fallback to initial data:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore listener error:', e);
    }
  }, []);

  // UI state filters
  const [demographicTab, setDemographicTab] = useState<'statusHuni' | 'perkawinan' | 'pekerjaan'>('statusHuni');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [huniFilter, setHuniFilter] = useState<'ALL' | 'TETAP' | 'PENDATANG'>('ALL');
  const [ktpFilter, setKtpFilter] = useState<'ALL' | 'ADA_KTP' | 'TANPA_KTP'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Laki-laki' | 'Perempuan'>('ALL');
  const [kkFilter, setKkFilter] = useState<'ALL' | 'TUNGGAL'>('ALL');
  const [kkSearchQuery, setKkSearchQuery] = useState<string>('');
  const [showAgeModal, setShowAgeModal] = useState<boolean>(false);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [appliedMinAge, setAppliedMinAge] = useState<string>('');
  const [appliedMaxAge, setAppliedMaxAge] = useState<string>('');
  const [isZeroMode, setIsZeroMode] = useState<boolean>(false);
  const [showKkOptionsModal, setShowKkOptionsModal] = useState<boolean>(false);
  const [kkRtFilter, setKkRtFilter] = useState<string>('Semua RT');
  const [kkSortOrder, setKkSortOrder] = useState<string>('Terbaru');
  const [showMoreLainnyaModal, setShowMoreLainnyaModal] = useState<boolean>(false);
  const [mutationSearch, setMutationSearch] = useState<string>('');
  const [showAddMutationModal, setShowAddMutationModal] = useState<boolean>(false);
  const [selectedResidentDetail, setSelectedResidentDetail] = useState<Resident | null>(null);
  const [expandedKk, setExpandedKk] = useState<string | null>(null);
  const [previewLetter, setPreviewLetter] = useState<LetterRequest | null>(null);

  const [newMutation, setNewMutation] = useState<Partial<MutationRecord>>({
    jenis_mutasi: 'Pindah Masuk',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // Modals
  const [showAddResidentModal, setShowAddResidentModal] = useState<boolean>(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);

  // New Resident Form
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Belum Kawin',
    pekerjaan: 'Karyawan Swasta',
    status_warga: 'AKTIF',
    status_domisili: 'DALAM',
    pendidikan_terakhir: 'SMA/SMK/MA Sederajat',
    asal_pendatang: 'Asal Warga Sini',
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
    if (!newResident.nama) return;

    let generatedNik = newResident.nik;
    if (newResident.is_mode_bayi && !generatedNik) {
      generatedNik = '327501' + Math.floor(1000000000 + Math.random() * 9000000000);
    }
    if (!generatedNik) {
      generatedNik = '327501' + Math.floor(1000000000 + Math.random() * 9000000000);
    }

    const item: Omit<Resident, 'id'> = {
      nik: generatedNik,
      no_kk: newResident.no_kk || '327501' + Math.floor(1000000000 + Math.random() * 9000000000),
      nama: newResident.nama || '',
      jenis_kelamin: (newResident.jenis_kelamin as any) || 'Laki-laki',
      status_huni: (newResident.status_huni as any) || 'Milik Sendiri',
      perkawinan: (newResident.perkawinan as any) || 'Belum Kawin',
      pekerjaan: newResident.pekerjaan || 'Wiraswasta',
      telepon: newResident.telepon || '-',
      alamat: newResident.alamat || `Jl. Melati, RT ${rtNumber}/RW ${rwNumber}`,
      is_kepala_keluarga: !!newResident.is_kepala_keluarga,
      tempat_lahir: newResident.tempat_lahir || 'Bekasi',
      tanggal_lahir: newResident.tanggal_lahir || new Date().toISOString().split('T')[0],
      agama: newResident.agama || 'Islam',
      status_warga: (newResident.status_warga as any) || 'AKTIF',
      status_domisili: (newResident.status_domisili as any) || 'DALAM',
      pendidikan_terakhir: newResident.pendidikan_terakhir || 'SMA/SMK/MA Sederajat',
      asal_pendatang: newResident.asal_pendatang || 'Asal Warga Sini',
      is_mode_bayi: !!newResident.is_mode_bayi
    };

    try {
      const docRef = await addDoc(collection(db, 'residents'), item);
      setResidents(prev => [{ id: docRef.id, ...item }, ...prev]);
    } catch {
      const localItem: Resident = { id: 'r_' + Date.now(), ...item };
      setResidents(prev => [localItem, ...prev]);
    }

    setIsZeroMode(false);
    setShowAddResidentModal(false);
    setNewResident({
      jenis_kelamin: 'Laki-laki',
      status_huni: 'Milik Sendiri',
      perkawinan: 'Belum Kawin',
      pekerjaan: 'Karyawan Swasta',
      status_warga: 'AKTIF',
      status_domisili: 'DALAM',
      pendidikan_terakhir: 'SMA/SMK/MA Sederajat',
      asal_pendatang: 'Asal Warga Sini',
      is_kepala_keluarga: false
    });
  };

  const handleDeleteResident = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data warga ini?')) return;
    try {
      await deleteDoc(doc(db, 'residents', id));
    } catch (e) {
      console.warn('Delete in firestore failed, updating local state:', e);
    }
    setResidents(prev => prev.filter(r => r.id !== id));
    if (selectedResidentDetail?.id === id) {
      setSelectedResidentDetail(null);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.keterangan || !newTx.nominal) return;
    const tx: Transaction = {
      id: 't_' + Date.now(),
      tanggal: newTx.tanggal || new Date().toISOString().split('T')[0],
      keterangan: newTx.keterangan || '',
      kategori: (newTx.kategori as any) || 'Pemasukan',
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
      nik: newLetter.nik || '327501' + Math.floor(1000000000 + Math.random() * 9000000000),
      jenis_surat: (newLetter.jenis_surat as any) || 'Surat Pengantar Domisili',
      keperluan: newLetter.keperluan,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setLetterRequests([req, ...letterRequests]);
    setShowLetterModal(false);
    setNewLetter({ jenis_surat: 'Surat Pengantar Domisili' });
  };

  const formatDateIndo = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  // Filtered residents list
  const filteredResidents = activeResidents.filter(r => {
    const age = getAge(r.tanggal_lahir);
    const matchesHuni =
      huniFilter === 'ALL' ||
      (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') ||
      (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'));
    const matchesKtp =
      ktpFilter === 'ALL' ||
      (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') ||
      (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF');
    const matchesGender = genderFilter === 'ALL' || r.jenis_kelamin === genderFilter;
    const matchesAgeMin = appliedMinAge === '' || age >= Number(appliedMinAge);
    const matchesAgeMax = appliedMaxAge === '' || age <= Number(appliedMaxAge);
    const matchesSearch =
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nik.includes(searchQuery) ||
      (r.alamat && r.alamat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.pekerjaan && r.pekerjaan.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesHuni && matchesKtp && matchesGender && matchesAgeMin && matchesAgeMax && matchesSearch;
  });

  // KK grouped data
  const kkMap = activeResidents.reduce((acc: Record<string, Resident[]>, r) => {
    const kk = r.no_kk || 'TANPA_KK';
    if (!acc[kk]) acc[kk] = [];
    acc[kk].push(r);
    return acc;
  }, {});

  const totalUniqueKK = isZeroMode ? 0 : Object.keys(kkMap).length;
  const totalJiwa = isZeroMode ? 0 : activeResidents.length;
  const kkList = isZeroMode
    ? []
    : Object.entries(kkMap).map(([no_kk, members]) => {
        const kepala = members.find(m => m.is_kepala_keluarga) || members[0];
        return {
          no_kk,
          kepala: kepala?.nama || 'Kepala Keluarga Belum Ditentukan',
          jumlahAnggota: members.length,
          alamat: kepala?.alamat || `Jl. Melati, RT ${rtNumber}/RW ${rwNumber}`,
          members,
          isTunggal: members.length === 1
        };
      });
  const totalKkTunggal = kkList.filter(k => k.isTunggal).length;

  const filteredKkList = kkList.filter(k => {
    const matchFilter = kkFilter === 'ALL' || (kkFilter === 'TUNGGAL' && k.isTunggal);
    const matchSearch =
      k.no_kk.toLowerCase().includes(kkSearchQuery.toLowerCase()) ||
      k.kepala.toLowerCase().includes(kkSearchQuery.toLowerCase()) ||
      k.alamat.toLowerCase().includes(kkSearchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Navigation Items definition
  const navItems = [
    { id: 'dash', label: 'Dashboard', icon: Home, badge: null },
    { id: 'warga', label: 'Data Warga', icon: Users, badge: totalPenduduk },
    { id: 'kk', label: 'Kartu Keluarga', icon: FileText, badge: totalUniqueKK },
    { id: 'keuangan', label: 'Kas Keuangan', icon: Wallet, badge: null },
    { id: 'surat', label: 'Layanan Surat', icon: Printer, badge: letterRequests.filter(l => l.status === 'Pending').length || null },
    { id: 'mutasi', label: 'Riwayat Mutasi', icon: RefreshCcw, badge: mutations.length || null },
    { id: 'more', label: 'Pengaturan RT', icon: Settings, badge: null }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${isDarkMode ? 'bg-[#121214] text-gray-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* ========================================================= */}
      {/* 1. DESKTOP & TABLET SIDEBAR (Tersusun rapih otomatis di PC/Laptop) */}
      {/* ========================================================= */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r sticky top-0 h-screen z-30 transition-colors duration-200 select-none ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Brand header */}
        <div className={`p-5 flex items-center space-x-3.5 border-b ${isDarkMode ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-black text-lg tracking-wider">
            RT
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-base tracking-tight leading-tight">RT {rtNumber} / RW {rwNumber}</h1>
            </div>
            <p className="text-xs text-blue-500 font-medium">WargaKu Dashboard</p>
          </div>
        </div>

        {/* RT Status Pill */}
        <div className="px-5 py-3">
          <div className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between ${isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-[11px] uppercase tracking-wider">Status RT Aktif</span>
            </span>
            <span className="font-bold text-blue-500 text-[11px]">Online</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t space-y-3 ${isDarkMode ? 'border-gray-800 bg-[#16161a]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Tema Tampilan</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Gelap' : 'Terang'}</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Sistem Administrasi RT</span>
            <span className="font-mono">v2.4</span>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Flex-1, Responsive di HP & Laptop) */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 px-4 sm:px-6 py-3.5 border-b backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#18181c]/90 border-gray-800' : 'bg-white/90 border-slate-200 shadow-xs'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left title / Mobile Brand */}
            <div className="flex items-center space-x-3">
              {/* Mobile only RT icon */}
              <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                RT
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-base sm:text-lg tracking-tight">
                    {activeTab === 'dash' && 'Dashboard Lingkungan'}
                    {activeTab === 'warga' && 'Data Warga & Kependudukan'}
                    {activeTab === 'kk' && 'Daftar Kartu Keluarga (KK)'}
                    {activeTab === 'keuangan' && 'Keuangan Kas RT'}
                    {activeTab === 'surat' && 'Layanan Pengantar Surat'}
                    {activeTab === 'mutasi' && 'Riwayat Mutasi Warga'}
                    {activeTab === 'more' && 'Pengaturan Wilayah & Sistem'}
                  </h2>
                </div>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Wilayah RT {rtNumber} / RW {rwNumber} • {formatDateIndo()}
                </p>
                <p className="text-[11px] text-gray-400 sm:hidden">
                  RT {rtNumber} / RW {rwNumber}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-2">
              {/* Quick action button based on tab */}
              {activeTab === 'warga' && (
                <button
                  onClick={() => setShowAddResidentModal(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah Warga</span>
                  <span className="sm:hidden">Warga</span>
                </button>
              )}

              {activeTab === 'keuangan' && (
                <button
                  onClick={() => setShowAddTransactionModal(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Catat Kas</span>
                  <span className="sm:hidden">Kas</span>
                </button>
              )}

              {activeTab === 'surat' && (
                <button
                  onClick={() => setShowLetterModal(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Buat Surat</span>
                  <span className="sm:hidden">Surat</span>
                </button>
              )}

              {activeTab === 'mutasi' && (
                <button
                  onClick={() => setShowAddMutationModal(true)}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Catat Mutasi</span>
                  <span className="sm:hidden">Mutasi</span>
                </button>
              )}

              {/* Print report button */}
              <button
                onClick={() => window.print()}
                title="Cetak Laporan / Halaman"
                className={`p-2 rounded-xl transition ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Mobile theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl md:hidden transition ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-slate-100 text-slate-700'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-28 md:pb-12 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD (STATISTIK LINGKUNGAN) */}
          {/* ========================================================= */}
          {activeTab === 'dash' && (
            <div className="space-y-6">
              {/* Banner Salam */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 sm:p-7 text-white shadow-xl shadow-blue-600/15">
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                  <div>
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-white/20 text-white mb-2">
                      {formatDateIndo()}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black">Selamat Datang di Sistem RT {rtNumber}!</h3>
                    <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                      Aplikasi otomatis tersusun rapih di HP Android maupun Laptop/PC untuk mempermudah pelayanan warga, keuangan kas, dan administrasi kependudukan.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setShowAddResidentModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition"
                    >
                      + Data Warga
                    </button>
                    <button
                      onClick={() => setShowAddTransactionModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                    >
                      + Catat Kas
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 KPI Metrics Card Grid (Responsive: 1 col on mobile, 2 on tablet, 4 on PC) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Saldo Kas RT */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition duration-200 ${isDarkMode ? 'bg-[#18181c] border-gray-800 shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SALDO KAS RT</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-500">
                    Rp {saldoKas.toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center space-x-1 mt-2 text-gray-400 text-[11px]">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Masuk: Rp {(totalPemasukan/1000).toFixed(0)}k</span>
                  </div>
                </div>

                {/* Total Penduduk */}
                <div
                  onClick={() => setActiveTab('warga')}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition duration-200 hover:border-blue-500/50 ${isDarkMode ? 'bg-[#18181c] border-gray-800 shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">TOTAL WARGA</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight">
                    {totalPenduduk} <span className="text-xs font-normal text-gray-400">Jiwa</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2 flex items-center space-x-2">
                    <span className="text-blue-400 font-semibold">{totalLaki} L</span>
                    <span>•</span>
                    <span className="text-pink-400 font-semibold">{totalPerempuan} P</span>
                  </div>
                </div>

                {/* Kartu Keluarga */}
                <div
                  onClick={() => setActiveTab('kk')}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition duration-200 hover:border-purple-500/50 ${isDarkMode ? 'bg-[#18181c] border-gray-800 shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">KARTU KELUARGA</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight">
                    {totalKK} <span className="text-xs font-normal text-gray-400">KK</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    <span>{totalKkTunggal} KK Tunggal</span>
                  </div>
                </div>

                {/* Status Kontrak / Kos */}
                <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">KONTRAK / KOS</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight">
                    {totalKontrak} <span className="text-xs font-normal text-gray-400">Warga</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    <span>{statusHuniCounts['Milik Sendiri']} Rumah Sendiri</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Responsive Section: Demografi + Aktivitas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left/Center Widget: Statistik Demografi (8 cols on desktop) */}
                <div className={`lg:col-span-8 p-5 sm:p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base">Statistik Demografi Lingkungan</h3>
                      <p className="text-xs text-gray-400">Distribusi status tempat tinggal, status perkawinan, dan pekerjaan</p>
                    </div>

                    {/* Segmented controls tabs */}
                    <div className="flex p-1 bg-gray-900/60 dark:bg-gray-900 rounded-xl border border-gray-800">
                      <button
                        onClick={() => setDemographicTab('statusHuni')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'statusHuni' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Status Huni
                      </button>
                      <button
                        onClick={() => setDemographicTab('perkawinan')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'perkawinan' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Perkawinan
                      </button>
                      <button
                        onClick={() => setDemographicTab('pekerjaan')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'pekerjaan' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Pekerjaan
                      </button>
                    </div>
                  </div>

                  {/* Demographic Tab Content */}
                  <div className="space-y-3 pt-2">
                    {demographicTab === 'statusHuni' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">Milik Sendiri</p>
                              <p className="text-[11px] text-gray-400">Rumah hak milik pribadi</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-blue-500">{statusHuniCounts['Milik Sendiri']} Org</span>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">Kontrak / Kos</p>
                              <p className="text-[11px] text-gray-400">Warga sewa bulanan / tahunan</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-amber-500">{statusHuniCounts['Kontrak/Kos']} Org</span>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">Menumpang</p>
                              <p className="text-[11px] text-gray-400">Famili / keluarga lain</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-pink-500">{statusHuniCounts['Menumpang']} Org</span>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">Lainnya</p>
                              <p className="text-[11px] text-gray-400">Dinas / asrama</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-gray-400">{statusHuniCounts['Lainnya']} Org</span>
                        </div>
                      </div>
                    )}

                    {demographicTab === 'perkawinan' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-xs font-bold">Belum Kawin</span>
                          </div>
                          <span className="text-sm font-black text-blue-500">{perkawinanCounts['Belum Kawin']} Org</span>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold">Kawin</span>
                          </div>
                          <span className="text-sm font-black text-emerald-500">{perkawinanCounts['Kawin']} Org</span>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-xs font-bold">Cerai</span>
                          </div>
                          <span className="text-sm font-black text-red-500">{perkawinanCounts['Cerai']} Org</span>
                        </div>
                      </div>
                    )}

                    {demographicTab === 'pekerjaan' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(pekerjaanCounts).map(([job, count]) => (
                          <div key={job} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center space-x-2 truncate pr-2">
                              <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="text-xs font-medium truncate">{job}</span>
                            </div>
                            <span className="text-xs font-bold text-purple-400 shrink-0">{count} Org</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gender Ratio Bar */}
                  <div className="pt-3 border-t border-gray-800/60 dark:border-gray-800">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-semibold text-gray-400">Rasio Gender Penduduk</span>
                      <span className="text-xs text-gray-400">
                        {totalPenduduk > 0 ? Math.round((totalLaki / totalPenduduk) * 100) : 0}% Laki-laki / {totalPenduduk > 0 ? Math.round((totalPerempuan / totalPenduduk) * 100) : 0}% Perempuan
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/30 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${totalPenduduk > 0 ? (totalLaki / totalPenduduk) * 100 : 0}%` }}
                      ></div>
                      <div
                        className="bg-pink-500 h-full transition-all duration-500"
                        style={{ width: `${totalPenduduk > 0 ? (totalPerempuan / totalPenduduk) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right Widget: Pengumuman & Akses Cepat (4 cols on desktop) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Pengumuman RT */}
                  <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <h4 className="font-bold text-sm">Pengumuman RT</h4>
                      </div>
                      <span className="text-[11px] text-gray-400 font-semibold">{announcements.length} Info</span>
                    </div>

                    <div className="space-y-2.5">
                      {announcements.map((item) => (
                        <div key={item.id} className={`p-3.5 rounded-xl border text-xs space-y-1 ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-500">{item.judul}</span>
                            <span className="text-[10px] text-gray-400">{item.tanggal}</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-[11px]">{item.isi}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Box */}
                  <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <h4 className="font-bold text-sm">Menu Cepat Warga</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveTab('surat')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition text-xs font-semibold ${isDarkMode ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <Printer className="w-5 h-5 text-purple-400" />
                        <span>Cetak Surat</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('mutasi')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition text-xs font-semibold ${isDarkMode ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <RefreshCcw className="w-5 h-5 text-emerald-400" />
                        <span>Mutasi Warga</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DATA WARGA (Tersusun rapih tabel/grid di PC & kartu di HP) */}
          {/* ========================================================= */}
          {activeTab === 'warga' && (
            <div className="space-y-4">
              {/* Stat filters bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setHuniFilter('ALL')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${huniFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>SEMUA WARGA</span>
                  </div>
                  <div className="text-2xl font-black">{residents.length}</div>
                </div>

                <div
                  onClick={() => setHuniFilter(huniFilter === 'TETAP' ? 'ALL' : 'TETAP')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${huniFilter === 'TETAP' ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>WARGA TETAP</span>
                  </div>
                  <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Milik Sendiri').length}</div>
                </div>

                <div
                  onClick={() => setHuniFilter(huniFilter === 'PENDATANG' ? 'ALL' : 'PENDATANG')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${huniFilter === 'PENDATANG' ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>PENDATANG / KOS</span>
                  </div>
                  <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang').length}</div>
                </div>

                <div
                  onClick={() => setKtpFilter(ktpFilter === 'ADA_KTP' ? 'TANPA_KTP' : ktpFilter === 'TANPA_KTP' ? 'ALL' : 'ADA_KTP')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${ktpFilter !== 'ALL' ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>STATUS KTP</span>
                  </div>
                  <div className="text-2xl font-black">{ktpFilter === 'TANPA_KTP' ? 'TANPA KTP' : 'ADA KTP'}</div>
                  <div className="text-[10px] text-gray-500">Klik ubah filter</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                {/* Search input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIK, alamat, atau pekerjaan warga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                  />
                </div>

                {/* Filter and View toggles */}
                <div className="flex items-center space-x-2 flex-wrap">
                  {/* Gender filter */}
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value as any)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="ALL">Semua Gender</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>

                  {/* Usia Filter Button */}
                  <button
                    onClick={() => setShowAgeModal(true)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 ${appliedMinAge || appliedMaxAge ? 'bg-purple-600 text-white border-purple-600' : isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{appliedMinAge || appliedMaxAge ? `${appliedMinAge || 0}-${appliedMaxAge || '∞'} Thn` : 'Filter Usia'}</span>
                  </button>

                  {/* Desktop view switcher (Card vs Table) */}
                  <div className="hidden sm:flex p-1 rounded-xl border bg-gray-900/40 border-gray-700">
                    <button
                      onClick={() => setWargaViewMode('card')}
                      className={`p-1.5 rounded-lg transition ${wargaViewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      title="Tampilan Grid Kartu"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWargaViewMode('table')}
                      className={`p-1.5 rounded-lg transition ${wargaViewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      title="Tampilan Tabel Rapi"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tambah Warga button */}
                  <button
                    onClick={() => setShowAddResidentModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Warga</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Badges */}
              {(huniFilter !== 'ALL' || ktpFilter !== 'ALL' || genderFilter !== 'ALL' || appliedMinAge !== '' || appliedMaxAge !== '') && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Filter Aktif:</span>
                  {huniFilter !== 'ALL' && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-semibold flex items-center space-x-1">
                      <span>Status: {huniFilter}</span>
                      <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setHuniFilter('ALL')} />
                    </span>
                  )}
                  {genderFilter !== 'ALL' && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-semibold flex items-center space-x-1">
                      <span>Gender: {genderFilter}</span>
                      <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setGenderFilter('ALL')} />
                    </span>
                  )}
                  {(appliedMinAge !== '' || appliedMaxAge !== '') && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 font-semibold flex items-center space-x-1">
                      <span>Usia: {appliedMinAge || 0} - {appliedMaxAge || '∞'} Thn</span>
                      <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => { setAppliedMinAge(''); setAppliedMaxAge(''); }} />
                    </span>
                  )}
                  <button
                    onClick={() => { setHuniFilter('ALL'); setKtpFilter('ALL'); setGenderFilter('ALL'); setAppliedMinAge(''); setAppliedMaxAge(''); }}
                    className="text-xs text-blue-500 underline ml-2"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {/* List of Residents */}
              {filteredResidents.length === 0 ? (
                <div className={`p-12 rounded-2xl border text-center text-gray-400 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200'}`}>
                  <Users className="w-10 h-10 mx-auto text-gray-500 mb-2 opacity-50" />
                  <p className="font-semibold text-sm">Tidak ada data warga ditemukan</p>
                  <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter di atas</p>
                </div>
              ) : wargaViewMode === 'table' ? (
                /* ================= TABLE VIEW (DESKTOP RAPI) ================= */
                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <th className="p-3.5 font-bold">Nama Warga</th>
                          <th className="p-3.5 font-bold">NIK / No. KK</th>
                          <th className="p-3.5 font-bold">Gender & Usia</th>
                          <th className="p-3.5 font-bold">Status Tinggal</th>
                          <th className="p-3.5 font-bold">Pekerjaan</th>
                          <th className="p-3.5 font-bold">Alamat</th>
                          <th className="p-3.5 font-bold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40 dark:divide-gray-800">
                        {filteredResidents.map((r) => {
                          const age = getAge(r.tanggal_lahir);
                          return (
                            <tr key={r.id} className={`hover:bg-blue-500/5 transition ${isDarkMode ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50'}`}>
                              <td className="p-3.5">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold">{r.nama}</span>
                                  {r.is_kepala_keluarga && (
                                    <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 font-bold rounded">
                                      KK
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400">{r.telepon || '-'}</span>
                              </td>
                              <td className="p-3.5 font-mono text-[11px]">
                                <div>{r.nik}</div>
                                <div className="text-[10px] text-gray-400">KK: {r.no_kk}</div>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.jenis_kelamin === 'Laki-laki' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                                  {r.jenis_kelamin}
                                </span>
                                <div className="text-[10px] text-gray-400 mt-0.5">{age > 0 ? `${age} tahun` : '-'}</div>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  r.status_huni === 'Milik Sendiri' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {r.status_huni}
                                </span>
                              </td>
                              <td className="p-3.5 text-gray-300">{r.pekerjaan || '-'}</td>
                              <td className="p-3.5 text-gray-300 max-w-xs truncate">{r.alamat}</td>
                              <td className="p-3.5 text-right space-x-1">
                                <button
                                  onClick={() => setSelectedResidentDetail(r)}
                                  className="p-1.5 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/30 transition"
                                  title="Lihat Detail Warga"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResident(r.id)}
                                  className="p-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/30 transition"
                                  title="Hapus Data Warga"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ================= CARD GRID VIEW (RESPONSIVE HP & LAPTOP) ================= */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredResidents.map((resident) => {
                    const age = getAge(resident.tanggal_lahir);
                    return (
                      <div
                        key={resident.id}
                        className={`p-4 rounded-2xl border transition duration-150 space-y-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800 hover:border-gray-700' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm">{resident.nama}</h4>
                              {resident.is_kepala_keluarga && (
                                <span className="px-2 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded-md font-bold uppercase">
                                  Kepala Keluarga
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">NIK: {resident.nik}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                            resident.status_huni === 'Milik Sendiri' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {resident.status_huni}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-800/40 dark:border-gray-800 text-gray-400">
                          <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Gender / Usia</span>
                            <span className="font-medium text-gray-200">{resident.jenis_kelamin} {age > 0 ? `(${age} th)` : ''}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Pekerjaan</span>
                            <span className="font-medium text-gray-200 truncate block">{resident.pekerjaan || '-'}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-400 truncate">
                          <span className="text-gray-500">Alamat:</span> {resident.alamat}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-800/40 dark:border-gray-800 text-xs">
                          <button
                            onClick={() => setSelectedResidentDetail(resident)}
                            className="flex items-center space-x-1 text-blue-500 font-semibold hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>

                          <button
                            onClick={() => handleDeleteResident(resident.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: KARTU KELUARGA (KK) */}
          {/* ========================================================= */}
          {activeTab === 'kk' && (
            <div className="space-y-4">
              {/* KK Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setKkFilter('ALL')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${kkFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-wider">TOTAL KK</div>
                  <div className="text-2xl font-black">{totalUniqueKK}</div>
                  <div className="text-[11px] text-gray-400">Keluarga terdaftar</div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}
                >
                  <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider">TOTAL JIWA</div>
                  <div className="text-2xl font-black">{totalJiwa}</div>
                  <div className="text-[11px] text-gray-400">Total warga terikat KK</div>
                </div>

                <div
                  onClick={() => setKkFilter(kkFilter === 'TUNGGAL' ? 'ALL' : 'TUNGGAL')}
                  className={`p-4 rounded-2xl cursor-pointer border transition ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'} ${kkFilter === 'TUNGGAL' ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase tracking-wider">KK TUNGGAL</div>
                  <div className="text-2xl font-black">{totalKkTunggal}</div>
                  <div className="text-[11px] text-gray-400">Hanya 1 orang</div>
                </div>
              </div>

              {/* Toolbar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="w-full sm:flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari Nomor KK, Kepala Keluarga, atau alamat..."
                    value={kkSearchQuery}
                    onChange={(e) => setKkSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddResidentModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Input KK Baru</span>
                  </button>
                  <button
                    onClick={() => setShowKkOptionsModal(true)}
                    className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KK List (Responsive 1 col on mobile, 2 cols on PC) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredKkList.map((kkItem) => {
                  const isExpanded = expandedKk === kkItem.no_kk;
                  return (
                    <div
                      key={kkItem.no_kk}
                      className={`p-5 rounded-2xl border space-y-3 transition duration-150 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-mono font-bold text-sm tracking-wide">KK {kkItem.no_kk}</h4>
                            {kkItem.isTunggal && (
                              <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-400 font-bold rounded">
                                Tunggal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Kepala: <span className="font-bold text-blue-400">{kkItem.kepala}</span>
                          </p>
                        </div>
                        <span className="px-3 py-1 text-xs bg-blue-500/15 text-blue-400 rounded-xl font-black">
                          {kkItem.jumlahAnggota} Jiwa
                        </span>
                      </div>

                      <p className="text-xs text-gray-400">
                        <span className="text-gray-500">Alamat:</span> {kkItem.alamat}
                      </p>

                      {/* Expand members list toggle */}
                      <button
                        onClick={() => setExpandedKk(isExpanded ? null : kkItem.no_kk)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition ${isDarkMode ? 'bg-gray-900/60 hover:bg-gray-900 text-gray-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                      >
                        <span>{isExpanded ? 'Sembunyikan Anggota' : 'Lihat Anggota Keluarga'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="pt-2 space-y-2 border-t border-gray-800/40 dark:border-gray-800">
                          {kkItem.members.map((m, idx) => (
                            <div key={m.id || idx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${isDarkMode ? 'bg-gray-900/40 border-gray-800/60' : 'bg-slate-50 border-slate-100'}`}>
                              <div>
                                <span className="font-semibold">{m.nama}</span>
                                <span className="text-[10px] text-gray-400 block font-mono">NIK: {m.nik}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                                {m.is_kepala_keluarga ? 'Kepala' : m.jenis_kelamin === 'Perempuan' ? 'Istri/Anak' : 'Anggota'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: KEUANGAN KAS RT */}
          {/* ========================================================= */}
          {activeTab === 'keuangan' && (
            <div className="space-y-4">
              {/* Financial summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>TOTAL PEMASUKAN</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">Rp {totalPemasukan.toLocaleString('id-ID')}</div>
                  <p className="text-[11px] text-gray-400 mt-1">Iuran warga & donasi</p>
                </div>

                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center space-x-1.5 text-red-400 text-xs font-semibold mb-1">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>TOTAL PENGELUARAN</span>
                  </div>
                  <div className="text-2xl font-black text-red-400">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
                  <p className="text-[11px] text-gray-400 mt-1">Operasional & kegiatan</p>
                </div>

                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-1">
                    <Wallet className="w-4 h-4" />
                    <span>SISA SALDO KAS BERSIH</span>
                  </div>
                  <div className="text-2xl font-black text-blue-500">Rp {saldoKas.toLocaleString('id-ID')}</div>
                  <p className="text-[11px] text-gray-400 mt-1">Status kas sehat & siap pakai</p>
                </div>
              </div>

              {/* Transactions Log */}
              <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base">Buku Kas & Riwayat Transaksi</h3>
                    <p className="text-xs text-gray-400">Pencatatan mutasi keuangan lingkungan RT {rtNumber} / RW {rwNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowAddTransactionModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
                  >
                    + Catat Transaksi
                  </button>
                </div>

                <div className="space-y-2.5">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.kategori === 'Pemasukan' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.kategori === 'Pemasukan' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{tx.keterangan}</h4>
                          <p className="text-[11px] text-gray-400">{tx.tanggal} • Dicatat oleh: {tx.pencatat}</p>
                        </div>
                      </div>

                      <div className={`text-base font-black sm:text-right ${tx.kategori === 'Pemasukan' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.kategori === 'Pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: LAYANAN SURAT */}
          {/* ========================================================= */}
          {activeTab === 'surat' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">Pelayanan Surat Pengantar RT</h3>
                  <p className="text-xs text-gray-400">Pengurusan permohonan surat domisili, SKCK, kelahiran, dan SKTM</p>
                </div>
                <button
                  onClick={() => setShowLetterModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Surat Pengantar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {letterRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{req.jenis_surat}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Pemohon: <span className="font-bold text-gray-200">{req.nama}</span></p>
                        <p className="text-[11px] font-mono text-gray-400">NIK: {req.nik}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold ${
                        req.status === 'Disetujui' ? 'bg-emerald-500/15 text-emerald-400' :
                        req.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl text-xs ${isDarkMode ? 'bg-gray-900/60 border border-gray-800 text-gray-300' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                      <span className="font-semibold text-gray-400 block mb-0.5">Keperluan:</span>
                      {req.keperluan}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-800/40 dark:border-gray-800 text-xs">
                      <span className="text-[11px] text-gray-400">Tanggal: {req.tanggal}</span>
                      <button
                        onClick={() => setPreviewLetter(req)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-semibold flex items-center space-x-1.5 transition"
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

          {/* ========================================================= */}
          {/* TAB 6: MUTASI WARGA */}
          {/* ========================================================= */}
          {activeTab === 'mutasi' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari riwayat nama atau NIK mutasi..."
                    value={mutationSearch}
                    onChange={(e) => setMutationSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <button
                  onClick={() => setShowAddMutationModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Mutasi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mutations
                  .filter(m => m.nama.toLowerCase().includes(mutationSearch.toLowerCase()) || m.nik.includes(mutationSearch))
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`p-5 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{m.nama}</h4>
                          <p className="text-xs text-gray-400 font-mono">NIK: {m.nik}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold ${
                          m.jenis_mutasi === 'Pindah Masuk' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {m.jenis_mutasi}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{m.keterangan}</p>
                      <div className="text-[10px] text-gray-400 pt-1">Tanggal: {m.tanggal}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: PENGATURAN RT */}
          {/* ========================================================= */}
          {activeTab === 'more' && (
            <div className="max-w-2xl space-y-4">
              <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <h3 className="font-bold text-base">Identitas Lingkungan RT / RW</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1 font-semibold">Nomor RT</label>
                    <input
                      type="text"
                      value={rtNumber}
                      onChange={(e) => setRtNumber(e.target.value)}
                      className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-semibold">Nomor RW</label>
                    <input
                      type="text"
                      value={rwNumber}
                      onChange={(e) => setRwNumber(e.target.value)}
                      className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#18181c] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <h3 className="font-bold text-base">Pengaturan Data & Reset</h3>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => {
                      setResidents(INITIAL_RESIDENTS);
                      setIsZeroMode(false);
                      alert('Data telah dimuat ulang dengan data contoh default!');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border font-semibold flex justify-between items-center transition ${isDarkMode ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span>Muat Ulang Data Contoh Warga</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => {
                      setIsZeroMode(!isZeroMode);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border font-semibold flex justify-between items-center transition ${isDarkMode ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span>Mode Tampilan 0 Data ({isZeroMode ? 'Aktif' : 'Non-Aktif'})</span>
                    <span className="text-xs text-blue-500 font-bold">{isZeroMode ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* 3. MOBILE BOTTOM NAVIGATION (Tampil rapi di layar HP) */}
        {/* ========================================================= */}
        <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex justify-around items-center py-2 px-2 backdrop-blur-lg transition-colors ${isDarkMode ? 'bg-[#18181c]/95 border-gray-800' : 'bg-white/95 border-slate-200 shadow-lg'}`}>
          <button
            onClick={() => setActiveTab('dash')}
            className={`flex flex-col items-center space-y-1 transition p-1.5 ${activeTab === 'dash' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Dash</span>
          </button>

          <button
            onClick={() => setActiveTab('warga')}
            className={`flex flex-col items-center space-y-1 transition p-1.5 ${activeTab === 'warga' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Warga</span>
          </button>

          <button
            onClick={() => setActiveTab('kk')}
            className={`flex flex-col items-center space-y-1 transition p-1.5 ${activeTab === 'kk' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">KK</span>
          </button>

          <button
            onClick={() => setActiveTab('keuangan')}
            className={`flex flex-col items-center space-y-1 transition p-1.5 ${activeTab === 'keuangan' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Kas</span>
          </button>

          <button
            onClick={() => setShowMoreLainnyaModal(true)}
            className="flex flex-col items-center space-y-1 transition p-1.5 text-gray-400 hover:text-gray-200"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Lainnya</span>
          </button>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* 4. MODALS (Responsive di HP & PC) */}
      {/* ========================================================= */}

      {/* MODAL: Tambah Data Warga */}
      {showAddResidentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-xl p-6 sm:p-7 rounded-2xl border my-8 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800/60 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-lg">Input Data Warga Baru</h3>
                <p className="text-xs text-gray-400">Pendaftaran warga ke data kependudukan RT {rtNumber}</p>
              </div>
              <button onClick={() => setShowAddResidentModal(false)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Bayi Toggle */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className="text-xs font-bold block">Mode Bayi Baru Lahir</span>
                <span className="text-[11px] text-gray-400">NIK akan dibuat otomatis jika belum memiliki akta/KTP</span>
              </div>
              <input
                type="checkbox"
                checked={!!newResident.is_mode_bayi}
                onChange={(e) => setNewResident({ ...newResident, is_mode_bayi: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
            </div>

            <form onSubmit={handleAddResident} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai identitas"
                    value={newResident.nama || ''}
                    onChange={(e) => setNewResident({ ...newResident, nama: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">NIK (16 Digit)</label>
                  <input
                    type="text"
                    placeholder={newResident.is_mode_bayi ? 'Otomatis di-generate' : '327501...'}
                    value={newResident.nik || ''}
                    onChange={(e) => setNewResident({ ...newResident, nik: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    placeholder="Nomor KK"
                    value={newResident.no_kk || ''}
                    onChange={(e) => setNewResident({ ...newResident, no_kk: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Posisi di Keluarga</label>
                  <select
                    value={newResident.is_kepala_keluarga ? 'ya' : 'tidak'}
                    onChange={(e) => setNewResident({ ...newResident, is_kepala_keluarga: e.target.value === 'ya' })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="tidak">Anggota Keluarga</option>
                    <option value="ya">Kepala Keluarga (KK)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Jenis Kelamin</label>
                  <select
                    value={newResident.jenis_kelamin}
                    onChange={(e) => setNewResident({ ...newResident, jenis_kelamin: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newResident.tanggal_lahir || ''}
                    onChange={(e) => setNewResident({ ...newResident, tanggal_lahir: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Status Tempat Tinggal</label>
                  <select
                    value={newResident.status_huni}
                    onChange={(e) => setNewResident({ ...newResident, status_huni: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Milik Sendiri">Milik Sendiri</option>
                    <option value="Kontrak/Kos">Kontrak / Kos</option>
                    <option value="Menumpang">Menumpang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Status Pernikahan</label>
                  <select
                    value={newResident.perkawinan}
                    onChange={(e) => setNewResident({ ...newResident, perkawinan: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai">Cerai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Karyawan Swasta"
                    value={newResident.pekerjaan || ''}
                    onChange={(e) => setNewResident({ ...newResident, pekerjaan: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={newResident.telepon || ''}
                    onChange={(e) => setNewResident({ ...newResident, telepon: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder={`Jl. Melati No..., RT ${rtNumber}/RW ${rwNumber}`}
                  value={newResident.alamat || ''}
                  onChange={(e) => setNewResident({ ...newResident, alamat: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddResidentModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Simpan Data Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Warga Lengkap */}
      {selectedResidentDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800/60 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-lg">{selectedResidentDetail.nama}</h3>
                <p className="text-xs text-gray-400 font-mono">NIK: {selectedResidentDetail.nik}</p>
              </div>
              <button onClick={() => setSelectedResidentDetail(null)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">No. Kartu Keluarga</span>
                <span className="font-mono font-semibold">{selectedResidentDetail.no_kk}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Status Hubungan</span>
                <span className="font-semibold">{selectedResidentDetail.is_kepala_keluarga ? 'Kepala Keluarga' : 'Anggota'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Jenis Kelamin</span>
                <span className="font-semibold">{selectedResidentDetail.jenis_kelamin}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Status Tempat Tinggal</span>
                <span className="font-semibold">{selectedResidentDetail.status_huni}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Pekerjaan</span>
                <span className="font-semibold">{selectedResidentDetail.pekerjaan || '-'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Nomor HP / WA</span>
                <span className="font-semibold">{selectedResidentDetail.telepon || '-'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Alamat Terdaftar</span>
              <span className="font-semibold">{selectedResidentDetail.alamat}</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setSelectedResidentDetail(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Transaksi Kas */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800/60 dark:border-gray-800">
              <h3 className="font-bold text-lg">Catat Transaksi Kas RT</h3>
              <button onClick={() => setShowAddTransactionModal(false)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Kategori Transaksi</label>
                <select
                  value={newTx.kategori}
                  onChange={(e) => setNewTx({ ...newTx, kategori: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Pemasukan">Pemasukan (Iuran / Donasi Warga)</option>
                  <option value="Pengeluaran">Pengeluaran (Operasional / Perbaikan Lingkungan)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran Kas Warga Blok A"
                  value={newTx.keterangan || ''}
                  onChange={(e) => setNewTx({ ...newTx, keterangan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Nominal (Rupiah)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newTx.nominal || ''}
                  onChange={(e) => setNewTx({ ...newTx, nominal: Number(e.target.value) })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Tanggal</label>
                <input
                  type="date"
                  value={newTx.tanggal}
                  onChange={(e) => setNewTx({ ...newTx, tanggal: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Surat Permohonan */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800/60 dark:border-gray-800">
              <h3 className="font-bold text-lg">Buat Pengajuan Surat</h3>
              <button onClick={() => setShowLetterModal(false)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLetter} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Jenis Surat</label>
                <select
                  value={newLetter.jenis_surat}
                  onChange={(e) => setNewLetter({ ...newLetter, jenis_surat: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Surat Pengantar Domisili">Surat Pengantar Domisili</option>
                  <option value="Surat Keterangan Kelahiran">Surat Keterangan Kelahiran</option>
                  <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                  <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu (SKTM)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Nama Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Warga"
                  value={newLetter.nama || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nama: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">NIK Pemohon</label>
                <input
                  type="text"
                  placeholder="327501..."
                  value={newLetter.nik || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nik: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Keperluan Pembuatan Surat</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Untuk persyaratan pendaftaran pekerjaan / perpanjangan domisili..."
                  value={newLetter.keperluan || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, keperluan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowLetterModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview Cetak Surat Pengantar Resmi */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white text-black p-8 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Kop Surat RT */}
            <div className="border-b-2 border-black pb-4 text-center space-y-1">
              <h3 className="font-bold text-lg uppercase tracking-wider">RUKUN TETANGGA {rtNumber} / RUKUN WARGA {rwNumber}</h3>
              <p className="text-xs uppercase font-medium">KELURAHAN KOTA BEKASI • KECAMATAN PONDOK GEDE</p>
              <p className="text-[11px] text-gray-600">Sekretariat: Jl. Melati No. 10, RT {rtNumber}/RW {rwNumber}</p>
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-base underline uppercase">{previewLetter.jenis_surat}</h4>
              <p className="text-xs text-gray-600">Nomor: 470 / {Math.floor(100 + Math.random() * 900)} / RT.{rtNumber} / {new Date().getFullYear()}</p>
            </div>

            <div className="text-xs leading-relaxed space-y-3">
              <p>Yang bertanda tangan di bawah ini Ketua RT {rtNumber} / RW {rwNumber}, menerangkan bahwa:</p>
              <div className="grid grid-cols-3 gap-2 pl-4 py-2 font-medium">
                <span className="text-gray-600">Nama Lengkap</span>
                <span className="col-span-2 font-bold">: {previewLetter.nama}</span>
                <span className="text-gray-600">NIK</span>
                <span className="col-span-2">: {previewLetter.nik}</span>
                <span className="text-gray-600">Keperluan</span>
                <span className="col-span-2">: {previewLetter.keperluan}</span>
              </div>
              <p>
                Adalah benar warga yang bertempat tinggal di lingkungan kami dan berkelakuan baik. Surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.
              </p>
            </div>

            <div className="flex justify-between pt-8 text-xs text-center">
              <div>
                <p>Pemohon,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{previewLetter.nama}</p>
              </div>
              <div>
                <p>Bekasi, {formatDateIndo()}</p>
                <p>Ketua RT {rtNumber} / RW {rwNumber}</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Budi Santoso</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 no-print">
              <button
                onClick={() => setPreviewLetter(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Filter Usia Manual */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <h3 className="font-bold text-base">Filter Rentang Usia Warga</h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Usia Min (Tahun)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-center font-bold border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <span className="text-gray-400 font-bold mt-4">-</span>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Usia Max (Tahun)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-center font-bold border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setMinAge('');
                  setMaxAge('');
                  setAppliedMinAge('');
                  setAppliedMaxAge('');
                  setShowAgeModal(false);
                }}
                className="text-gray-400 hover:text-white text-xs px-3 py-2 font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedMinAge(minAge);
                  setAppliedMaxAge(maxAge);
                  setShowAgeModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Mutasi */}
      {showAddMutationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800/60 dark:border-gray-800">
              <h3 className="font-bold text-lg">Catat Mutasi Warga</h3>
              <button onClick={() => setShowAddMutationModal(false)} className="p-1 rounded-lg hover:bg-gray-800">
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
                jenis_mutasi: (newMutation.jenis_mutasi as any) || 'Pindah Masuk',
                tanggal: newMutation.tanggal || new Date().toISOString().split('T')[0],
                keterangan: newMutation.keterangan || '-'
              };
              setMutations([item, ...mutations]);
              setShowAddMutationModal(false);
              setNewMutation({ jenis_mutasi: 'Pindah Masuk', tanggal: new Date().toISOString().split('T')[0] });
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Jenis Mutasi</label>
                <select
                  value={newMutation.jenis_mutasi || 'Pindah Masuk'}
                  onChange={(e) => setNewMutation({ ...newMutation, jenis_mutasi: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Pindah Masuk">Pindah Masuk (Warga Baru)</option>
                  <option value="Pindah Keluar">Pindah Keluar (Pindah Domisili)</option>
                  <option value="Pindah RT">Pindah RT (Antar Lingkungan)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Nama Warga</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Warga"
                  value={newMutation.nama || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nama: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">NIK Warga</label>
                <input
                  type="text"
                  placeholder="NIK Warga"
                  value={newMutation.nik || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nik: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kepindahan / asal daerah..."
                  value={newMutation.keterangan || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, keterangan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddMutationModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Menu Lainnya (Mobile Slide-Up Sheet) */}
      {showMoreLainnyaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#18181c] text-white rounded-t-3xl sm:rounded-2xl p-6 space-y-5 border-t sm:border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 border-gray-800">
              <h3 className="font-bold text-base">Menu Administrasi Lainnya</h3>
              <button onClick={() => setShowMoreLainnyaModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <button
                onClick={() => { setShowMoreLainnyaModal(false); setActiveTab('surat'); }}
                className="flex flex-col items-center space-y-1.5 p-2 rounded-xl hover:bg-gray-800/60"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">Surat</span>
              </button>

              <button
                onClick={() => { setShowMoreLainnyaModal(false); setActiveTab('mutasi'); }}
                className="flex flex-col items-center space-y-1.5 p-2 rounded-xl hover:bg-gray-800/60"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">Mutasi</span>
              </button>

              <button
                onClick={() => { setShowMoreLainnyaModal(false); setActiveTab('more'); }}
                className="flex flex-col items-center space-y-1.5 p-2 rounded-xl hover:bg-gray-800/60"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">Pengaturan</span>
              </button>

              <button
                onClick={() => { setShowMoreLainnyaModal(false); window.print(); }}
                className="flex flex-col items-center space-y-1.5 p-2 rounded-xl hover:bg-gray-800/60"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">Cetak PDF</span>
              </button>
            </div>

            <button
              onClick={() => setShowMoreLainnyaModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Konfigurasi KK */}
      {showKkOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border ${isDarkMode ? 'bg-[#18181c] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'} space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-800">
              <h3 className="font-bold text-base">Filter & Opsi KK</h3>
              <button onClick={() => setShowKkOptionsModal(false)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Pilih Wilayah RT</label>
                <select
                  value={kkRtFilter}
                  onChange={(e) => setKkRtFilter(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Semua RT">Semua RT</option>
                  <option value="RT 011">RT {rtNumber}</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Urutkan Data</label>
                <select
                  value={kkSortOrder}
                  onChange={(e) => setKkSortOrder(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Terbaru">Terbaru</option>
                  <option value="Terlama">Terlama</option>
                  <option value="Jumlah Anggota Terbanyak">Jumlah Anggota Terbanyak</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowKkOptionsModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Lead, Client, Project, Package, ViewType, NavigationAction } from '../types';
import PageHeader from './PageHeader';
import StatCard from './StatCard';
import Modal from './Modal';
import { UsersIcon, DollarSignIcon, PackageIcon, Share2Icon, DownloadIcon, EyeIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const downloadCSV = (headers: string[], data: (string | number)[][], filename: string) => {
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            row.map(field => {
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

interface BookingProps {
    leads: Lead[];
    clients: Client[];
    projects: Project[];
    packages: Package[];
    handleNavigation: (view: ViewType, action?: NavigationAction) => void;
    showNotification: (message: string) => void;
}

const Booking: React.FC<BookingProps> = ({ leads, clients, projects, packages, handleNavigation, showNotification }) => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const bookingFormUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}#/public-booking`;
    }, []);
    
    useEffect(() => {
        if (isShareModalOpen) {
            const qrCodeContainer = document.getElementById('booking-page-qrcode');
            if (qrCodeContainer && typeof (window as any).QRCode !== 'undefined') {
                qrCodeContainer.innerHTML = '';
                new (window as any).QRCode(qrCodeContainer, {
                    text: bookingFormUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#020617",
                    colorLight: "#ffffff",
                    correctLevel: 2 // H
                });
            }
        }
    }, [isShareModalOpen, bookingFormUrl]);

    const allBookings = useMemo(() => {
        const bookingLeads = leads.filter(lead => lead.notes?.includes('Dikonversi secara otomatis dari formulir pemesanan publik'));

        return bookingLeads.map(lead => {
            const clientIdMatch = lead.notes?.match(/Klien ID: ([\w-]+)/);
            const clientId = clientIdMatch ? clientIdMatch[1] : null;

            const client = clients.find(c => c.id === clientId);
            
            // This logic assumes the first project associated with a client from a booking form is the correct one.
            const project = projects.find(p => p.clientId === clientId);

            if (client && project) {
                return { lead, client, project };
            }
            return null;
        }).filter((booking): booking is { lead: Lead; client: Client; project: Project } => booking !== null);
    }, [leads, clients, projects]);

    const filteredBookings = useMemo(() => {
        return allBookings.filter(booking => {
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setHours(0, 0, 0, 0);
            if (to) to.setHours(23, 59, 59, 999);
            const bookingDate = new Date(booking.lead.date);
            return (!from || bookingDate >= from) && (!to || bookingDate <= to);
        });
    }, [allBookings, dateFrom, dateTo]);

    const bookingStats = useMemo(() => {
        const totalBooking = filteredBookings.length;
        const totalValue = filteredBookings.reduce((sum, b) => sum + b.project.totalCost, 0);
        const totalDP = filteredBookings.reduce((sum, b) => sum + b.project.amountPaid, 0);

        const packageCounts = filteredBookings.reduce((acc, b) => {
            acc[b.project.packageName] = (acc[b.project.packageName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topPackage = Object.keys(packageCounts).length > 0
            ? Object.entries(packageCounts).sort(([, a], [, b]) => b - a)[0][0]
            : 'N/A';

        return { totalBooking, totalValue, totalDP, topPackage };
    }, [filteredBookings]);

    const handleDownload = () => {
        const headers = ['Tanggal Booking', 'Nama Klien', 'Nama Proyek', 'Jenis Acara', 'Lokasi', 'Paket', 'Total Biaya', 'DP Dibayar', 'Bukti Bayar (URL)'];
        const data = filteredBookings.map(b => [
            new Date(b.lead.date).toLocaleDateString('id-ID'),
            b.client.name,
            b.project.projectName,
            b.project.projectType,
            b.project.location,
            b.project.packageName,
            b.project.totalCost,
            b.project.amountPaid,
            b.project.dpProofUrl || ''
        ]);
        downloadCSV(headers, data, `data-booking-${new Date().toISOString().split('T')[0]}.csv`);
    };
    
    const copyBookingLink = () => {
        navigator.clipboard.writeText(bookingFormUrl).then(() => {
            showNotification('Tautan formulir booking berhasil disalin!');
            setIsShareModalOpen(false);
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Daftar Booking" subtitle="Lihat semua pemesanan yang masuk dari formulir booking publik.">
                <div className="flex items-center gap-2">
                    <button onClick={handleDownload} className="button-secondary inline-flex items-center gap-2 text-sm font-semibold"><DownloadIcon className="w-4 h-4"/>Unduh Data</button>
                    <button onClick={() => setIsShareModalOpen(true)} className="button-primary inline-flex items-center gap-2 text-sm font-semibold"><Share2Icon className="w-4 h-4"/>Bagikan Form Booking</button>
                </div>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Booking" value={bookingStats.totalBooking.toString()} />
                <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Total Nilai Booking" value={formatCurrency(bookingStats.totalValue)} />
                <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Total DP Terkumpul" value={formatCurrency(bookingStats.totalDP)} />
                <StatCard icon={<PackageIcon className="w-6 h-6"/>} title="Paket Terpopuler" value={bookingStats.topPackage} />
            </div>

            <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border flex items-center gap-4">
                <div className="input-group flex-1 !mt-0">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field !bg-brand-bg !rounded-lg" placeholder=" "/>
                    <label className="input-label">Dari Tanggal</label>
                </div>
                <div className="input-group flex-1 !mt-0">
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field !bg-brand-bg !rounded-lg" placeholder=" "/>
                    <label className="input-label">Sampai Tanggal</label>
                </div>
            </div>
            
            <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-brand-text-secondary uppercase">
                            <tr>
                                <th className="px-4 py-3">Tanggal Booking</th>
                                <th className="px-4 py-3">Nama Klien</th>
                                <th className="px-4 py-3">Nama Proyek</th>
                                <th className="px-4 py-3">Jenis Acara</th>
                                <th className="px-4 py-3">Lokasi</th>
                                <th className="px-4 py-3">Paket</th>
                                <th className="px-4 py-3 text-right">Total Biaya</th>
                                <th className="px-4 py-3 text-right">DP Dibayar</th>
                                <th className="px-4 py-3 text-center">Bukti Bayar</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                                <tr key={booking.lead.id} className="hover:bg-brand-bg">
                                    <td className="px-4 py-3">{new Date(booking.lead.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-3 font-semibold text-brand-text-light">{booking.client.name}</td>
                                    <td className="px-4 py-3">{booking.project.projectName}</td>
                                    <td className="px-4 py-3">{booking.project.projectType}</td>
                                    <td className="px-4 py-3">{booking.project.location}</td>
                                    <td className="px-4 py-3">{booking.project.packageName}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(booking.project.totalCost)}</td>
                                    <td className="px-4 py-3 text-right text-brand-success font-semibold">{formatCurrency(booking.project.amountPaid)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {booking.project.dpProofUrl ? (
                                            <a href={booking.project.dpProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-400 hover:underline inline-flex items-center gap-1.5">
                                                <EyeIcon className="w-4 h-4" /> Lihat Bukti
                                            </a>
                                        ) : (
                                            <span className="text-brand-text-secondary">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleNavigation(ViewType.CLIENTS, { type: 'VIEW_CLIENT_DETAILS', id: booking.client.id })} className="text-sm font-semibold text-brand-accent hover:underline">
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={10} className="text-center py-10 text-brand-text-secondary">
                                        <p>Belum ada booking masuk.</p>
                                        <p className="text-xs mt-1">Data dari formulir booking publik akan ditampilkan di sini.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Bagikan Formulir Booking Publik" size="sm">
                <div className="text-center p-4">
                    <div id="booking-page-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div>
                    <p className="text-xs text-brand-text-secondary mt-4 break-all">{bookingFormUrl}</p>
                    <div className="flex items-center gap-2 mt-6">
                        <button onClick={copyBookingLink} className="button-secondary w-full">Salin Tautan</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Booking;

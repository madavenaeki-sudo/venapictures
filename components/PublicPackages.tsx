import React, { useState, useMemo } from 'react';
import { Package, Profile } from '../types';
import Modal from './Modal';
import { MessageSquareIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const PackageCard: React.FC<{ pkg: Package, onSelect: () => void }> = ({ pkg, onSelect }) => (
    <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border p-6 flex flex-col transition-transform duration-200 hover:-translate-y-1">
        <h3 className="text-xl font-bold text-gradient">{pkg.name}</h3>
        <p className="text-3xl font-bold text-brand-text-light my-4">{formatCurrency(pkg.price)}</p>
        <div className="flex-grow space-y-4 text-sm text-brand-text-secondary">
             <div>
                <h4 className="font-semibold text-brand-text-primary mb-2">Tim:</h4>
                <ul className="space-y-1 list-disc list-inside">
                    {pkg.photographers && <li>{pkg.photographers}</li>}
                    {pkg.videographers && <li>{pkg.videographers}</li>}
                    {(!pkg.photographers && !pkg.videographers) && <li>-</li>}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-brand-text-primary mb-2">Output Fisik:</h4>
                <ul className="space-y-1 list-disc list-inside">
                    {pkg.physicalItems.length > 0 ? pkg.physicalItems.map((item, index) => <li key={index}>{item.name}</li>) : <li>Tidak ada.</li>}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-brand-text-primary mb-2">Output Digital:</h4>
                <ul className="space-y-1 list-disc list-inside">
                    {pkg.digitalItems.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        </div>
        <p className="text-xs text-brand-text-secondary mt-4">Estimasi Pengerjaan: {pkg.processingTime}</p>
        <button onClick={onSelect} className="mt-6 button-primary w-full">Pilih Paket Ini</button>
    </div>
);

interface PublicPackagesProps {
    packages: Package[];
    userProfile: Profile;
    showNotification: (message: string) => void;
}

const PublicPackages: React.FC<PublicPackagesProps> = ({ packages, userProfile, showNotification }) => {
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);

    const formattedTerms = useMemo(() => {
        if (!userProfile.termsAndConditions) return null;
        return userProfile.termsAndConditions.split('\n').map((line, index) => {
            if (line.trim() === '') return <div key={index} className="h-4"></div>;
            const emojiRegex = /^(📜|📅|💰|📦|⏱|➕)\s/;
            if (emojiRegex.test(line)) {
                return <h3 key={index} className="text-lg font-semibold text-gradient mt-4 mb-2">{line}</h3>;
            }
            if (line.trim().startsWith('- ')) {
                 return <p key={index} className="ml-4 text-brand-text-primary">{line.trim().substring(2)}</p>;
            }
            return <p key={index} className="text-brand-text-primary">{line}</p>;
        });
    }, [userProfile.termsAndConditions]);

    const renderSampleContract = () => {
        const today = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        return (
            <div className="printable-content bg-white text-black p-8 font-serif leading-relaxed text-sm max-h-[70vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-center mb-1">CONTOH SURAT PERJANJIAN KERJA SAMA</h2>
                <h3 className="text-lg font-bold text-center mb-6">JASA FOTOGRAFI & VIDEOGRAFI</h3>
                <p>Pada hari ini, {today}, telah dibuat dan disepakati perjanjian kerja sama antara:</p>

                <div className="my-4">
                    <p className="font-bold">PIHAK PERTAMA</p>
                    <table>
                        <tbody>
                            <tr><td className="pr-4 align-top">Nama</td><td>: {userProfile.fullName}</td></tr>
                            <tr><td className="pr-4 align-top">Jabatan</td><td>: Pemilik Usaha</td></tr>
                            <tr><td className="pr-4 align-top">Alamat</td><td>: {userProfile.address}</td></tr>
                            <tr><td className="pr-4 align-top">Nomor Telepon</td><td>: {userProfile.phone}</td></tr>
                        </tbody>
                    </table>
                    <p className="mt-1">Dalam hal ini bertindak atas nama perusahaannya, {userProfile.companyName}, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</p>
                </div>

                <div className="my-4">
                    <p className="font-bold">PIHAK KEDUA</p>
                     <table>
                        <tbody>
                            <tr><td className="pr-4 align-top">Nama</td><td>: [Nama Klien]</td></tr>
                            <tr><td className="pr-4 align-top">Alamat</td><td>: [Alamat Klien]</td></tr>
                            <tr><td className="pr-4 align-top">Nomor Telepon</td><td>: [Nomor Telepon Klien]</td></tr>
                        </tbody>
                    </table>
                    <p className="mt-1">Dalam hal ini bertindak atas nama pribadi, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</p>
                </div>
                
                <p>Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian ini dengan syarat dan ketentuan sebagai berikut:</p>

                <div className="space-y-4 mt-6">
                    <div><h4 className="font-bold text-center">PASAL 1: RUANG LINGKUP PEKERJAAN</h4><p>PIHAK PERTAMA akan memberikan jasa fotografi dan/atau videografi sesuai dengan paket layanan yang dipilih oleh PIHAK KEDUA untuk acara pada tanggal [Tanggal Acara] di lokasi [Lokasi Acara].</p></div>
                    <div><h4 className="font-bold text-center">PASAL 2: BIAYA DAN PEMBAYARAN</h4><p>Total biaya jasa adalah sebesar [Total Biaya Paket]. Pembayaran dilakukan dengan sistem: Uang Muka (DP) sebesar 30-50% saat penandatanganan kontrak, dan pelunasan paling lambat H-3 sebelum Hari Pelaksanaan. Pembayaran ditransfer ke rekening: {userProfile.bankAccount}.</p></div>
                    <div><h4 className="font-bold text-center">PASAL 3: PENYERAHAN HASIL</h4><p>PIHAK PERTAMA akan menyerahkan seluruh hasil pekerjaan dalam jangka waktu yang telah ditentukan dalam detail paket, terhitung setelah Hari Pelaksanaan.</p></div>
                    <div><h4 className="font-bold text-center">PASAL 4: PEMBATALAN</h4><p>Jika terjadi pembatalan oleh PIHAK KEDUA, maka Uang Muka (DP) yang telah dibayarkan tidak dapat dikembalikan. Ketentuan lebih lanjut diatur dalam Syarat & Ketentuan Umum.</p></div>
                    <div><h4 className="font-bold text-center">PASAL 5: LAIN-LAIN</h4><p>Hal-hal lain yang belum diatur dalam perjanjian ini akan dibicarakan dan diselesaikan secara musyawarah oleh kedua belah pihak.</p></div>
                </div>

                 <div className="flex justify-between items-end mt-16">
                    <div className="text-center w-2/5">
                        <p>PIHAK PERTAMA</p>
                        <div className="h-28 my-1 flex flex-col items-center justify-center text-gray-400 text-xs">
                            <span className="italic">(Tanda Tangan & Nama)</span>
                        </div>
                        <p className="border-t-2 border-dotted w-4/5 mx-auto pt-1">({userProfile.fullName})</p>
                    </div>
                     <div className="text-center w-2/5">
                        <p>PIHAK KEDUA</p>
                        <div className="h-28 border-b-2 border-dotted w-4/5 mx-auto my-1 flex items-center justify-center text-gray-400 text-xs italic">(Tanda Tangan & Nama)</div>
                        <p>([Nama Klien])</p>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-12 italic">Ini adalah contoh. Kontrak asli akan disesuaikan dengan detail proyek dan paket yang Anda pilih.</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-brand-bg p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <div className="mb-12">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-extrabold text-gradient">Paket Layanan Kami</h2>
                        <p className="text-brand-text-secondary mt-3 max-w-2xl mx-auto">Pilih paket yang paling sesuai dengan kebutuhan acara Anda. Lihat detailnya dan pilih untuk memulai pemesanan.</p>
                         <div className="mt-4 flex justify-center items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsTermsModalOpen(true)}
                                className="text-sm font-semibold text-brand-accent hover:underline"
                            >
                                Lihat Syarat & Ketentuan Umum
                            </button>
                            <span className="text-brand-text-secondary">|</span>
                            <button
                                type="button"
                                onClick={() => setIsContractModalOpen(true)}
                                className="text-sm font-semibold text-brand-accent hover:underline"
                            >
                                Lihat Contoh Kontrak Kerja
                            </button>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto mb-10 bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-shrink-0">
                            <MessageSquareIcon className="w-10 h-10 text-brand-accent" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="font-bold text-brand-text-light">Butuh Bantuan?</h4>
                            <p className="text-sm text-brand-text-secondary mt-1">Jika ada pertanyaan atau butuh bantuan dalam pengisian formulir, jangan ragu untuk menghubungi admin kami melalui WhatsApp.</p>
                        </div>
                        <a 
                            href="https://wa.me/62895406181407" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="button-primary whitespace-nowrap mt-4 sm:mt-0 sm:ml-auto"
                        >
                            Hubungi Admin
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map(pkg => (
                            <PackageCard key={pkg.id} pkg={pkg} onSelect={() => {
                                window.location.hash = '#/public-booking';
                            }} />
                        ))}
                    </div>
                </div>

                <div className="text-center py-12 my-8 bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                    <h3 className="text-2xl font-bold text-gradient mb-2">Siap untuk Memesan?</h3>
                    <p className="text-brand-text-secondary mb-6 max-w-lg mx-auto">
                        Klik tombol di bawah ini untuk mengisi formulir dan mengamankan tanggal acara Anda bersama kami.
                    </p>
                    <a href="#/public-booking" className="button-primary">
                        Booking Sekarang
                    </a>
                </div>

                 <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title="Syarat & Ketentuan Umum">
                    <div className="max-h-[70vh] overflow-y-auto pr-4">
                        {formattedTerms ? (
                            <div>{formattedTerms}</div>
                        ) : (
                            <p className="text-brand-text-secondary text-center py-8">Syarat dan ketentuan belum diatur oleh vendor.</p>
                        )}
                    </div>
                </Modal>
                <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} title="Contoh Kontrak Kerja" size="3xl">
                    {renderSampleContract()}
                </Modal>
            </div>
        </div>
    );
};

export default PublicPackages;

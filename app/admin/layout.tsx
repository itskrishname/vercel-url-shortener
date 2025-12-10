import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-slate-100 font-sans">
        <AdminSidebar />
        <main className="flex-1 w-full relative">
             {/* Gradient Background */}
             <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

             <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto relative z-10 pt-20 lg:pt-10">
                {children}
             </div>
        </main>
    </div>
  );
}

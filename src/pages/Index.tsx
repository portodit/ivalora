import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Penjualan Hari Ini",
    value: "Rp 12.450.000",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    desc: "vs kemarin",
  },
  {
    label: "Transaksi",
    value: "34",
    change: "+5",
    trend: "up",
    icon: TrendingUp,
    desc: "transaksi hari ini",
  },
  {
    label: "Produk Terjual",
    value: "47 unit",
    change: "-3",
    trend: "down",
    icon: Package,
    desc: "vs kemarin",
  },
  {
    label: "Pelanggan Aktif",
    value: "128",
    change: "+12",
    trend: "up",
    icon: Users,
    desc: "bulan ini",
  },
];

const recentTransactions = [
  { id: "TRX-001", item: "iPhone 15 Pro 256GB", imei: "351234567890123", kondisi: "Baru", harga: "Rp 18.500.000", waktu: "10:23", kasir: "Budi" },
  { id: "TRX-002", item: "iPhone 14 128GB", imei: "351234567890456", kondisi: "Bekas", harga: "Rp 10.200.000", waktu: "09:55", kasir: "Sari" },
  { id: "TRX-003", item: "iPhone 13 Mini 64GB", imei: "351234567890789", kondisi: "Bekas", harga: "Rp 7.800.000", waktu: "09:12", kasir: "Budi" },
  { id: "TRX-004", item: "iPhone 15 128GB", imei: "351234567891012", kondisi: "Baru", harga: "Rp 15.700.000", waktu: "08:44", kasir: "Andi" },
];

export default function Index() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Selamat Datang, Ahmad 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Berikut ringkasan aktivitas toko hari ini, Rabu 18 Februari 2026.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Transaksi Terkini</h3>
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </div>
          <button className="text-xs text-primary hover:underline font-medium">
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Produk</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">IMEI</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Kondisi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Harga</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Waktu</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Kasir</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx, i) => (
                <tr
                  key={trx.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-100 ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-6 py-3.5 text-xs font-mono text-primary">{trx.id}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-foreground">{trx.item}</td>
                  <td className="px-6 py-3.5 text-xs font-mono text-muted-foreground">{trx.imei}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        trx.kondisi === "Baru"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {trx.kondisi}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-foreground">{trx.harga}</td>
                  <td className="px-6 py-3.5 text-xs text-muted-foreground">{trx.waktu}</td>
                  <td className="px-6 py-3.5 text-sm text-foreground">{trx.kasir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

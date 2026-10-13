import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layers, UserCheck, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAnalytics } from "../../features/users/userSlice";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { humanize } from "../../util/utils";

const COLORS = ["#1A237E", "#5C6BC0", "#9FA8DA", "#C5CAE9", "#D4AF37", "#2E7D32"];
const MAX_BARS = 12;

const toChartData = (breakdown: Record<string, number> | undefined, limit?: number) => {
  const data = Object.entries(breakdown ?? {})
    .map(([name, value]) => ({ name: humanize(name), value }))
    .sort((a, b) => b.value - a.value);
  if (!limit || data.length <= limit) return data;
  const rest = data.slice(limit).reduce((sum, d) => sum + d.value, 0);
  return [...data.slice(0, limit), { name: "Other", value: rest }];
};

const ChartCard = ({
  title,
  delay,
  empty,
  children,
}: {
  title: string;
  delay: number;
  empty: boolean;
  children: React.ReactElement;
}) => (
  <motion.div
    className="bg-white rounded-lg shadow-md p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-80">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  </motion.div>
);

const Analytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { analytics, analyticsLoading, analyticsError } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const activityData = useMemo(
    () => toChartData(analytics?.activityBreakdown),
    [analytics],
  );
  const departmentData = useMemo(
    () => toChartData(analytics?.departmentBreakdown, MAX_BARS),
    [analytics],
  );
  const participationData = useMemo(
    () => toChartData(analytics?.participationBreakdown),
    [analytics],
  );
  const batchData = useMemo(
    () =>
      Object.entries(analytics?.batchBreakdown ?? {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Number(a.name) - Number(b.name)),
    [analytics],
  );

  if (analyticsLoading && !analytics) return <LoadingScreen />;

  const stats = [
    {
      icon: <Users size={24} />,
      label: t("admin.analytics.total"),
      value: analytics?.total ?? 0,
      border: "border-liturgical-blue",
      badge: "bg-liturgical-blue/10 text-liturgical-blue",
    },
    {
      icon: <UserCheck size={24} />,
      label: t("admin.analytics.active"),
      value: analytics?.activeUsers ?? 0,
      border: "border-green-500",
      badge: "bg-green-500/10 text-green-600",
    },
    {
      icon: <Layers size={24} />,
      label: "Participation Rate",
      value: `${analytics?.participationRate ?? 0}%`,
      border: "border-gold",
      badge: "bg-gold/10 text-gold",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.analytics.title")}</h2>

      {analyticsError && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{analyticsError}</span>
          <button
            onClick={() => dispatch(fetchAnalytics())}
            className="rounded-md border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(({ icon, label, value, border, badge }, index) => (
          <motion.div
            key={label}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${border}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 font-medium">{label}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
              </div>
              <div className={`p-3 rounded-full ${badge}`}>{icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("admin.analytics.participation")}
          delay={0.2}
          empty={activityData.length === 0}
        >
          <PieChart>
            <Pie
              data={activityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {activityData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard
          title={t("admin.analytics.distribution")}
          delay={0.3}
          empty={departmentData.length === 0}
        >
          <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Users" fill="#1A237E" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Section Participation"
          delay={0.4}
          empty={participationData.length === 0}
        >
          <BarChart data={participationData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" name="Users" fill="#5C6BC0" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Users by Batch" delay={0.5} empty={batchData.length === 0}>
          <BarChart data={batchData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Users" fill="#D4AF37" />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;

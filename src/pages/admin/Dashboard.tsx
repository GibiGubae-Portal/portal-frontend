import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAnalytics } from "../../features/users/userSlice";
import LoadingScreen from "../../components/ui/LoadingScreen";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.5 },
  }),
};

const percent = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "0%";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { analytics, analyticsLoading, analyticsError } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (analyticsLoading && !analytics) return <LoadingScreen />;

  const total = analytics?.total ?? 0;
  const activeUsers = analytics?.activeUsers ?? 0;
  const participating = analytics?.participating ?? 0;

  const cards = [
    {
      label: "Total Users",
      value: total,
      hint: "View all users",
      to: "/admin/users",
      icon: <Users size={24} />,
      border: "border-liturgical-blue",
      badge: "bg-liturgical-blue/10 text-liturgical-blue",
      link: "text-liturgical-blue",
    },
    {
      label: "Active Users",
      value: activeUsers,
      hint: `${percent(activeUsers, total)} of total users`,
      icon: <UserCog size={24} />,
      border: "border-gold",
      badge: "bg-gold/10 text-gold",
      link: "text-gray-600",
    },
    {
      label: "Participation Rate",
      value: `${analytics?.participationRate ?? 0}%`,
      hint: `${participating} serving in a section`,
      to: "/admin/analytics",
      icon: <BarChart2 size={24} />,
      border: "border-green-500",
      badge: "bg-green-500/10 text-green-600",
      link: "text-green-600",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

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
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${card.border}`}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 font-medium">{card.label}</p>
                <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${card.badge}`}>{card.icon}</div>
            </div>
            {card.to ? (
              <Link
                to={card.to}
                className={`text-sm mt-4 inline-block hover:underline ${card.link}`}
              >
                {card.hint}
              </Link>
            ) : (
              <p className={`text-sm mt-4 ${card.link}`}>{card.hint}</p>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-white rounded-lg shadow-md p-6"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: "/admin/users", label: "Manage Users" },
            { to: "/admin/analytics", label: "View Analytics" },
            { to: "/", label: "Visit Public Site" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block px-4 py-3 rounded-md bg-liturgical-blue/5 hover:bg-liturgical-blue/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

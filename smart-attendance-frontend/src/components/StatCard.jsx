const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h3 className="text-2xl font-bold mt-1">
          {value}
        </h3>

        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>

    </div>
  );
};

export default StatCard;
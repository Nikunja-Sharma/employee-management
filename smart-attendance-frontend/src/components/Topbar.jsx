const Topbar = () => {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
          A
        </div>

        <span className="text-sm font-medium">
          Admin User
        </span>
      </div>

    </header>
  );
};

export default Topbar;
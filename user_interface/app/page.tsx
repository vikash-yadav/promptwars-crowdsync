export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

      <div className="z-10 text-center mb-12">
        <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          CrowdSync <span className="text-blue-500">Attendee</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl">
          Your AI-powered stadium companion. Beat the lines, find your seat, and never miss a moment of the game.
        </p>
      </div>

      <div className="z-10 w-full flex justify-center">
        {/* Chat removed as per request */}
      </div>

      <div className="z-10 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h4 className="text-white font-bold mb-2">Live Navigation</h4>
          <p className="text-white/40 text-sm">Dynamic routing avoids congestion hotspots.</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h4 className="text-white font-bold mb-2">Smart Queues</h4>
          <p className="text-white/40 text-sm">Real-time wait times for every stand.</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h4 className="text-white font-bold mb-2">Mobile Ordering</h4>
          <p className="text-white/40 text-sm">Order food directly to your seat.</p>
        </div>
      </div>
    </main>
  );
}

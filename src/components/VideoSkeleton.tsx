export default function VideoSkeleton() {
  return (
    <section className="mt-16 w-full max-w-7xl mx-auto border-t-2 border-ink pt-8 animate-pulse">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1.5 h-6 bg-gray-300 rounded-full"></div>
        <div className="h-8 bg-gray-300 rounded w-48"></div>
      </div>

      <div className="flex flex-col gap-6">
        {/* HERO SKELETON */}
        <div className="flex flex-col md:flex-row bg-gray-200 rounded-xl overflow-hidden shadow-sm h-[380px] lg:h-[420px]">
          <div className="w-full md:w-[60%] lg:w-[65%] h-full bg-gray-300"></div>
          <div className="w-full md:w-[40%] lg:w-[35%] p-8 flex flex-col justify-center gap-4">
            <div className="h-4 bg-gray-300 w-16 rounded"></div>
            <div className="h-8 bg-gray-300 w-full rounded"></div>
            <div className="h-8 bg-gray-300 w-3/4 rounded"></div>
            <div className="h-10 bg-gray-300 w-40 rounded-full mt-4"></div>
          </div>
        </div>

        {/* CAROUSEL SKELETON */}
        <div className="flex overflow-x-hidden gap-4 pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-none w-[160px] md:w-[220px] aspect-[9/16] rounded-xl bg-gray-200 shadow-sm relative">
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                <div className="h-3 bg-gray-300 w-12 rounded"></div>
                <div className="h-4 bg-gray-300 w-full rounded"></div>
                <div className="h-4 bg-gray-300 w-2/3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

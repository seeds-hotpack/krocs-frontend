export function PhoneMockup({ imageSrc }: { imageSrc: string }) {
  return (
    <div className="relative w-[280px] h-[570px] mx-auto">
      {/* Phone frame */}
      <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl p-3">
        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />

          {/* App screenshot */}
          <img
            src={imageSrc || "/landing/placeholder.svg"}
            alt="App screenshot"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute right-0 top-24 w-1 h-12 bg-gray-800 rounded-l" />
      <div className="absolute right-0 top-40 w-1 h-16 bg-gray-800 rounded-l" />
      <div className="absolute left-0 top-32 w-1 h-8 bg-gray-800 rounded-r" />
    </div>
  )
}

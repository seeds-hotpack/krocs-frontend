import Image from "next/image"

export function PhoneMockup({ imageSrc }: { imageSrc: string }) {
  return (
    <div className="relative mx-auto w-[600px] h-[340px] sm:w-[780px] sm:h-[400px] lg:w-[1000px] lg:h-[500px] xl:w-[1100px] xl:h-[560px]">
      {/* Tablet frame */}
      <div className="absolute inset-0 rounded-[1.1rem] bg-neutral-950 shadow-[0_30px_80px_rgba(10,10,10,0.45)] p-1 sm:p-1.5 lg:p-2 border border-white/15">
        {/* Screen */}
        <div className="relative h-full w-full rounded-[0.75rem] bg-[#f4f7fb] overflow-hidden">
          {/* Camera */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-800/70" />
            <span className="h-px w-12 rounded-full bg-neutral-700/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-800/70" />
          </div>

          {/* App screenshot */}
          <Image
            src={imageSrc || "/landing/placeholder.svg"}
            alt="App screenshot"
            fill
            sizes="1100px"
            className="object-cover object-left"
          />
        </div>
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-4 left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-full bg-black/15 blur-lg" />
    </div>
  )
}

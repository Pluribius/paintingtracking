"use client";

import { motion } from "framer-motion";
import Scene from "@/components/Scene";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent text-foreground selection:bg-accent selection:text-white overflow-hidden">
      <Scene />

      {/* Global UI Overlays */}
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-8 sm:p-12">
        {/* Header */}
        <header className="flex items-center justify-between pointer-events-auto">
          <div className="text-xl font-bold">+</div>
          <div className="font-script text-4xl mt-2 tracking-widest opacity-80">Knm</div>
          <div className="text-sm font-bold tracking-widest uppercase">TICKETS</div>
        </header>

        {/* Footer UI */}
        <footer className="grid grid-cols-2 md:grid-cols-3 items-end gap-x-12 pointer-events-auto">
          <div className="flex items-center justify-start">
          </div>
          <div className="hidden md:block" />

          {/* Time Details */}
          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-widest mb-1">Open Daily</div>
            <div className="text-2xl font-serif">10:00 AM</div>
            <div className="flex items-center justify-end gap-2 text-2xl font-serif">
              <div className="w-12 h-0.5 bg-black" />
              06:00 PM
            </div>
          </div>
        </footer>
      </div>

      {/* Main Typography Layout - Now using independent relative container for absolute blocks */}
      <section className="h-screen w-full relative pointer-events-none p-8 md:p-24 overflow-visible">

        {/* BLOCK TWO: A Story (Remaining as HTML overlay) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="absolute top-[45%] left-[15%] md:left-[40%] z-30"
        >
          <div className="font-script text-accent text-8xl md:text-[12rem] drop-shadow-sm rotate-[-5deg] whitespace-nowrap">
            A Story
          </div>
        </motion.div>

      </section>
    </main>
  );
}

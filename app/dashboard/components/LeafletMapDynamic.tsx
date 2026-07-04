"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
      <span className="material-icons animate-spin text-mosque text-3xl">sync</span>
    </div>
  ),
});

export default LeafletMap;

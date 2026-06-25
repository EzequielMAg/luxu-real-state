"use client";

import dynamic from "next/dynamic";

const DynamicPropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-nordic-dark/40 rounded-lg animate-pulse flex items-center justify-center">
      <span className="material-icons text-nordic-muted text-3xl">map</span>
    </div>
  ),
});

interface PropertyMapClientProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
}

export default function PropertyMapClient(props: PropertyMapClientProps) {
  return <DynamicPropertyMap {...props} />;
}

import React from "react";
import { notFound } from "next/navigation";
import PropertyForm from "@/app/dashboard/components/PropertyForm";
import { getPropertyById } from "@/app/actions/properties";

export const metadata = {
  title: "Edit Property — LuxeEstate Admin",
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return <PropertyForm initialData={property} />;
}

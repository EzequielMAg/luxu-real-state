import React from "react";
import PropertyForm from "@/app/dashboard/components/PropertyForm";

export const metadata = {
  title: "Add New Property — LuxeEstate Admin",
};

export default function CreatePropertyPage() {
  return <PropertyForm initialData={null} />;
}

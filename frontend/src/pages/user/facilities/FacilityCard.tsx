import type { Facility } from "./types";

import { memo } from "react";
import { Card, Chip, Button } from "@heroui/react";
import { Users, ArrowRight, Building2 } from "lucide-react";

import { getFacilityImageSrc, getPublicFacilityImage } from "./helpers";

import api from "@/config/api";

interface FacilityCardProps {
  facility: Facility;
  isAdmin: boolean;
  showInactive: boolean;
  onBook: (facility: Facility) => void;
  onEdit: (facility: Facility) => void;
  fetchFacilities: (showInactive: boolean) => void;
}

function FacilityCard({
  facility,
  isAdmin,
  showInactive,
  onBook,
  onEdit,
  fetchFacilities,
}: FacilityCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border bg-background transition-all duration-300 ${
        facility.isActive
          ? "border-default-200 hover:border-primary/30 hover:-translate-y-0.5"
          : "opacity-60 border-danger/20"
      }`}
    >
      {facility.isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      )}

      <div className="h-44 bg-gradient-to-b from-default-100 to-default-50 flex items-center justify-center relative overflow-hidden">
        {getFacilityImageSrc(facility) ? (
          <img
            alt={facility.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            decoding="async"
            loading="lazy"
            src={getFacilityImageSrc(facility)}
            onError={(event) => {
              const fallback = getPublicFacilityImage(facility.name);

              if (fallback && !event.currentTarget.dataset.fallback) {
                event.currentTarget.dataset.fallback = "true";
                event.currentTarget.src = fallback;
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-default-300">
            <Building2 size={48} strokeWidth={1} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              No Image
            </span>
          </div>
        )}
        <Chip
          className="absolute top-3 right-3 capitalize font-black text-[11px] px-2.5 h-6"
          color={facility.isActive ? "success" : "danger"}
          variant="soft"
        >
          {facility.isActive ? "Available" : "Maintenance"}
        </Chip>
      </div>

      <Card.Header className="flex flex-col items-start px-5 pt-5 pb-0">
        <div className="flex items-start justify-between w-full gap-2">
          <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {facility.name}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-default-100 text-default-500 text-[11px] font-bold">
            <Users size={11} />
            {facility.capacity}
          </div>
        </div>
      </Card.Header>

      <Card.Content className="px-5 py-3">
        <p className="text-default-400 text-sm leading-relaxed font-medium line-clamp-2">
          {facility.description ||
            "Premium collaborative environment for your team."}
        </p>
      </Card.Content>

      <Card.Footer className="px-5 pb-5 pt-1 flex flex-col gap-1.5">
        <Button
          className="w-full h-11 text-sm font-black rounded-lg transition-all active:scale-[0.98]"
          isDisabled={!facility.isActive}
          variant="primary"
          onPress={() => onBook(facility)}
        >
          <span>Book Space</span>
          <ArrowRight
            className="group-hover:translate-x-0.5 transition-transform"
            size={16}
          />
        </Button>

        {isAdmin && facility.isActive && (
          <Button
            className="w-full h-8 text-[11px] font-bold rounded-lg border-default-200 text-default-500"
            variant="ghost"
            onPress={() => onEdit(facility)}
          >
            Edit Facility
          </Button>
        )}

        {isAdmin && !facility.isActive && (
          <Button
            className="w-full h-8 text-[11px] font-bold rounded-lg border-success/20 bg-success/5 text-success"
            variant="secondary"
            onPress={async () => {
              try {
                await api.patch(`/facilities/${facility.id}/reactivate`);
                fetchFacilities(showInactive);
              } catch {
                /* silent */
              }
            }}
          >
            Reactivate Facility
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
}

export default memo(FacilityCard);

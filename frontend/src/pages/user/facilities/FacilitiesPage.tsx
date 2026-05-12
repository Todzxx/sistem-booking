import type { Facility } from "./types";

import { useState } from "react";
import { Card, Button, InputGroup } from "@heroui/react";
import { Search, Building2, AlertCircle, RotateCcw } from "lucide-react";

import { useFacilities } from "./use-facilities";
import FacilityCard from "./FacilityCard";
import BookingModal from "./BookingModal";

type ModalMode = "booking" | "edit" | "create";

export default function FacilitiesPage() {
  const {
    facilities,
    loading,
    fetchError,
    isAdmin,
    showInactive,
    setShowInactive,
    searchQuery,
    setSearchQuery,
    fetchFacilities,
    mountedRef,
  } = useFacilities();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<ModalMode>("booking");

  const handleOpenBooking = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalMode("booking");
    setIsOpen(true);
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleCreate = () => {
    setSelectedFacility(null);
    setModalMode("create");
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedFacility(null);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Facilities
            </h1>
            <p className="text-default-400 text-sm font-medium">
              Browse and book premium spaces for your team.
            </p>
          </div>
        </div>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-primary/20" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <InputGroup
              aria-label="Search facilities"
              className="rounded-lg border-default-200"
            >
              <InputGroup.Prefix className="pl-3">
                <Search className="text-default-400" size={15} />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </div>
          <Button
            isIconOnly
            aria-label="Refresh facilities"
            className="rounded-lg h-10 w-10 border-default-200"
            variant="ghost"
            onPress={() => fetchFacilities(showInactive)}
          >
            <RotateCcw className="text-default-400" size={15} />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdmin && (
            <>
              <Button
                className="font-bold rounded-lg h-10 px-4 text-sm"
                variant="primary"
                onPress={handleCreate}
              >
                Add Facility
              </Button>
              <Button
                className={`font-bold rounded-lg h-10 px-4 text-sm ${showInactive ? "bg-warning/10 text-warning border-warning/30" : "border-default-200 text-default-500"}`}
                variant={showInactive ? "secondary" : "ghost"}
                onPress={() => setShowInactive((prev) => !prev)}
              >
                {showInactive ? "All" : "Active"}
              </Button>
            </>
          )}
        </div>
      </div>

      {fetchError && (
        <div
          className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg flex items-center gap-2 text-sm font-bold"
          role="alert"
        >
          <AlertCircle size={16} />
          {fetchError}
          <Button
            className="ml-auto h-7 text-xs font-bold rounded-lg"
            variant="ghost"
            onPress={() => fetchFacilities(showInactive)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[320px] bg-default-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <Card
          className="py-16 flex flex-col items-center justify-center text-center bg-default-50/50 border-dashed border-2 border-default-200 rounded-xl"
          role="status"
        >
          <div className="w-14 h-14 rounded-xl bg-default-100 flex items-center justify-center mb-4">
            <Building2 className="text-default-300" size={28} />
          </div>
          <p className="text-default-500 text-lg font-black">
            {searchQuery
              ? "No facilities match your search"
              : "No facilities yet"}
          </p>
          <p className="text-default-400 text-sm font-medium mt-1 max-w-sm">
            {searchQuery
              ? "Try adjusting your search terms or browse all facilities."
              : "Create your first facility to get started."}
          </p>
          {!searchQuery && isAdmin && (
            <Button
              className="mt-5 h-10 px-5 font-bold rounded-lg text-sm"
              variant="primary"
              onPress={handleCreate}
            >
              Add Facility
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((facility, idx) => (
            <div
              key={facility.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${idx * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <FacilityCard
                facility={facility}
                fetchFacilities={fetchFacilities}
                isAdmin={isAdmin}
                showInactive={showInactive}
                onBook={handleOpenBooking}
                onEdit={handleEdit}
              />
            </div>
          ))}
        </div>
      )}

      <BookingModal
        facility={selectedFacility}
        isOpen={isOpen}
        mode={modalMode}
        mountedRef={mountedRef}
        onClose={handleClose}
        onSuccess={() => fetchFacilities(showInactive)}
      />
    </div>
  );
}

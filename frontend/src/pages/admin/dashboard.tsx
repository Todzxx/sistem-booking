import {
  AdminHeader,
  AdminNotifications,
  AdminStats,
  FacilityUsageChart,
  AdminFilterBar,
  AdminBookingList,
  AdminNoteModal,
} from "@/components/admin";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export default function AdminDashboard() {
  const {
    bookings,
    loading,
    actionLoading,
    search,
    statusFilter,
    facilityFilter,
    dateFilter,
    stats,
    filteredBookings,
    hasFilters,
    chartColors,
    notifications,
    notes,
    modalError,
    pendingAction,
    noteModal,
    setSearch,
    setStatusFilter,
    setFacilityFilter,
    setDateFilter,
    setNotes,
    setModalError,
    clearFilters,
    dismissNotification,
    handleUpdateStatusInit,
    handleModalConfirm,
  } = useAdminDashboard();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
      <AdminHeader filteredBookings={filteredBookings} />

      <AdminNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {!loading && bookings.length > 0 && (
        <AdminStats
          approvalRate={stats.approvalRate}
          approved={stats.approved}
          pending={stats.pending}
          total={stats.total}
        />
      )}

      {!loading && stats.facilityStats.length > 0 && (
        <FacilityUsageChart
          chartColors={chartColors}
          facilityStats={stats.facilityStats}
          peakHours={stats.peakHours}
          total={stats.total}
        />
      )}

      {!loading && bookings.length > 0 && (
        <AdminFilterBar
          bookings={bookings}
          dateFilter={dateFilter}
          facilityFilter={facilityFilter}
          search={search}
          statusFilter={statusFilter}
          onDateFilterChange={setDateFilter}
          onFacilityFilterChange={setFacilityFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
        />
      )}

      <AdminBookingList
        actionLoading={actionLoading}
        bookings={bookings}
        filteredBookings={filteredBookings}
        hasFilters={hasFilters}
        loading={loading}
        onClearFilters={clearFilters}
        onUpdateStatus={handleUpdateStatusInit}
      />

      <AdminNoteModal
        actionLoading={!!actionLoading}
        modalError={modalError}
        modalState={noteModal}
        notes={notes}
        pendingAction={pendingAction}
        onConfirm={handleModalConfirm}
        onNotesChange={(value) => {
          setNotes(value);
          setModalError("");
        }}
      />
    </div>
  );
}

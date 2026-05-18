import {
  Button,
  Modal,
  Label,
  TextArea,
  UseOverlayStateReturn,
} from "@heroui/react";
import { MessageSquare } from "lucide-react";

import { BookingStatus } from "@/types";

interface AdminNoteModalProps {
  pendingAction: { id: string; status: BookingStatus } | null;
  notes: string;
  modalError: string;
  actionLoading: boolean;
  onNotesChange: (notes: string) => void;
  onConfirm: (id: string, status: BookingStatus, notes: string) => void;
  modalState: UseOverlayStateReturn;
}

export default function AdminNoteModal({
  pendingAction,
  notes,
  modalError,
  actionLoading,
  onNotesChange,
  onConfirm,
  modalState,
}: AdminNoteModalProps) {
  return (
    <Modal state={modalState}>
      <Modal.Trigger>
        <button aria-hidden className="sr-only" tabIndex={-1} />
      </Modal.Trigger>
      <Modal.Backdrop variant="blur">
        <Modal.Container scroll="inside">
          <Modal.Dialog className="max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-default-200 bg-surface/90 backdrop-blur-xl p-2">
            {({ close }) => (
              <div className="p-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
                <Modal.Header className="flex flex-col gap-1 items-center text-center px-4 pt-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                      pendingAction?.status === "APPROVED"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    <MessageSquare size={32} />
                  </div>
                  <Modal.Heading className="text-3xl font-black tracking-tight">
                    Add a Note
                  </Modal.Heading>
                  <p className="text-muted font-medium">
                    Provide a reason for this{" "}
                    {pendingAction?.status?.toLowerCase()} action.
                  </p>
                </Modal.Header>
                <Modal.Body className="py-8">
                  <div className="flex flex-col gap-4">
                    {modalError && (
                      <div className="bg-danger/10 text-danger text-sm p-4 rounded-2xl border border-danger/20 font-bold">
                        {modalError}
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-black text-default-700 ml-1">
                        {pendingAction?.status === "REJECTED"
                          ? "Admin Note (Required)"
                          : "Admin Note (Optional)"}
                      </Label>
                      <TextArea
                        aria-label="Admin note"
                        className="rounded-2xl"
                        placeholder="Write your message here..."
                        value={notes}
                        onChange={(e) => {
                          onNotesChange(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer className="px-0 pb-2 gap-3 flex flex-col sm:flex-row">
                  <Button
                    className="flex-1 h-14 rounded-2xl font-bold border-default-200"
                    variant="ghost"
                    onPress={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-14 rounded-2xl font-bold shadow-xl shadow-primary/30"
                    isPending={actionLoading}
                    variant={
                      pendingAction?.status === "APPROVED"
                        ? "primary"
                        : "danger"
                    }
                    onPress={() =>
                      onConfirm(pendingAction!.id, pendingAction!.status, notes)
                    }
                  >
                    Confirm {pendingAction?.status}
                  </Button>
                </Modal.Footer>
              </div>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

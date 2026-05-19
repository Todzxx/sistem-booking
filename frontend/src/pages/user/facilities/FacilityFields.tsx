import { TextField, Label, InputGroup, TextArea } from "@heroui/react";

interface FacilityFieldsProps {
  name: string;
  description: string;
  capacity: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCapacityChange: (value: number) => void;
  onFileSelect: (file: File | null) => void;
}

export function FacilityFields({
  name,
  description,
  capacity,
  onNameChange,
  onDescriptionChange,
  onCapacityChange,
  onFileSelect,
}: FacilityFieldsProps) {
  return (
    <div className="space-y-4">
      <TextField isRequired name="name" type="text">
        <Label className="text-sm font-black text-default-700 ml-1">
          Facility Name
        </Label>
        <InputGroup.Input
          className="rounded-lg"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </TextField>

      <div className="space-y-4">
        <Label className="text-sm font-black text-default-700 ml-1">
          Description
        </Label>
        <TextArea
          aria-label="Room description"
          className="rounded-lg w-full text-left"
          placeholder="Room description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <TextField isRequired name="capacity" type="number">
        <Label className="text-sm font-black text-default-700 ml-1">
          Capacity (People)
        </Label>
        <InputGroup.Input
          className="rounded-lg"
          min={1}
          type="number"
          value={capacity.toString()}
          onChange={(e) => onCapacityChange(parseInt(e.target.value) || 1)}
        />
      </TextField>

      <div className="flex flex-col gap-2">
        <Label
          className="text-sm font-black text-default-700 ml-1"
          htmlFor="facility-image"
        >
          Facility Image
        </Label>
        <input
          accept="image/*"
          aria-label="Facility image upload"
          className="text-xs text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          id="facility-image"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;

            if (file && file.size > 5 * 1024 * 1024) {
              alert("File too large. Maximum size is 5MB.");
              e.target.value = "";

              return;
            }
            if (file && !file.type.startsWith("image/")) {
              alert("Only image files are allowed.");
              e.target.value = "";

              return;
            }
            onFileSelect(file);
          }}
        />
      </div>
    </div>
  );
}

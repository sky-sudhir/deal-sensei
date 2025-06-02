import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";

const TransferDealModal = ({ isOpen, onClose, dealId, onTransferComplete }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users for dropdown
  const { data: usersData, loading: loadingUsers } = useQuery("api/v1/users");
  const users = usersData?.data?.data || [];

  // Reset selected user when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
    }
  }, [isOpen]);

  const { mutate } = useMutation();

  const handleTransfer = async () => {
    if (!selectedUserId) {
      console.error("Please select a user to transfer to");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mutate({
        url: `api/v1/deals/${dealId}/transfer`,
        method: "PUT",
        data: { new_owner_id: selectedUserId },
      });

      if (response.success) {
        onClose();
        if (onTransferComplete) {
          onTransferComplete();
        }
      }
    } catch (error) {
      console.error(error.message || "Failed to transfer deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] pt-0 p-4" onClose={onClose}>
        <DialogHeader className="pt-0">
          <DialogTitle>Transfer Deal Ownership</DialogTitle>
          <DialogDescription>
            Select a new owner for this deal. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="space-y-2">
            <label htmlFor="new-owner" className="text-sm font-medium">
              New Owner
            </label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={loadingUsers || isSubmitting}
            >
              <SelectTrigger id="new-owner" className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedUserId || isSubmitting}
            loading={isSubmitting}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDealModal;
